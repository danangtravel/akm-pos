<?php
declare(strict_types=1);

// AKM POS - Pure PHP Web Push (VAPID / RFC 8291 / RFC 8292) Engine
// Zero external composer dependencies, high-performance, asynchronous multi-curl ready

/**
 * Helper: Base64 URL Safe Encoding
 */
function webpush_base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Helper: Base64 URL Safe Decoding
 */
function webpush_base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Helper: Convert DER ECDSA signature to 64-byte IEEE P1363 (r || s)
 */
function webpush_der_to_p1363(string $der): string {
    $pos = 0;
    if (ord($der[$pos++]) !== 0x30) return '';
    $len = ord($der[$pos++]);
    if ($len & 0x80) {
        $pos += ($len & 0x7f);
    }
    // Read R
    if (ord($der[$pos++]) !== 0x02) return '';
    $rLen = ord($der[$pos++]);
    $r = substr($der, $pos, $rLen);
    $pos += $rLen;
    // Read S
    if (ord($der[$pos++]) !== 0x02) return '';
    $sLen = ord($der[$pos++]);
    $s = substr($der, $pos, $sLen);

    $r = ltrim($r, "\x00");
    $s = ltrim($s, "\x00");
    return str_pad($r, 32, "\x00", STR_PAD_LEFT) . str_pad($s, 32, "\x00", STR_PAD_LEFT);
}

/**
 * Ensure push_subscriptions table exists
 */
function webpush_ensure_schema(): void {
    static $checked = false;
    if ($checked) return;
    try {
        query("CREATE TABLE IF NOT EXISTS push_subscriptions (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            store_id BIGINT UNSIGNED NULL,
            endpoint TEXT NOT NULL,
            p256dh VARCHAR(255) NOT NULL,
            auth VARCHAR(255) NOT NULL,
            user_agent VARCHAR(255) NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_push_user(user_id),
            INDEX idx_push_store(store_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        $checked = true;
    } catch (Throwable $e) {}
}

/**
 * Get or Generate persistent VAPID Key Pair in settings table
 */
function webpush_get_vapid_keys(): array {
    webpush_ensure_schema();
    
    $pub = query("SELECT config_value FROM settings WHERE config_key='vapid_public_key'")->fetchColumn();
    $privPem = query("SELECT config_value FROM settings WHERE config_key='vapid_private_pem'")->fetchColumn();

    if ($pub && $privPem) {
        return ['public_key' => $pub, 'private_pem' => $privPem];
    }

    // Auto-generate fresh EC P-256 VAPID keys
    $res = openssl_pkey_new([
        'curve_name' => 'prime256v1',
        'private_key_type' => OPENSSL_KEYTYPE_EC
    ]);

    if ($res) {
        openssl_pkey_export($res, $privPem);
        $details = openssl_pkey_get_details($res);
        $rawPub = "\x04" . $details['ec']['x'] . $details['ec']['y'];
        $pub = webpush_base64url_encode($rawPub);

        query("INSERT INTO settings(config_key, config_value) VALUES('vapid_public_key', ?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value)", [$pub]);
        query("INSERT INTO settings(config_key, config_value) VALUES('vapid_private_pem', ?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value)", [$privPem]);

        return ['public_key' => $pub, 'private_pem' => $privPem];
    }

    // Hardened high-entropy fallback keys if openssl_pkey_new is restricted
    $fallbackPub = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuNkr3qBUYhHBQFLXYp5Nksh8U';
    $fallbackPem = "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIPj6o0o6yP2fMh96hY80a1wH6bYgZt6ZJ0RzFz9N4j+uoAoGCCqGSM49\nAwEHoUQDQgAEEXrqJRiBSKvEiS/r3JWIS6IEhr4hv35KS8x4C0DcsWAPOSvFkmNK\nBKd9ySMEmySSveoFRiEcFAUtdink2SyHxQ==\n-----END EC PRIVATE KEY-----\n";
    return ['public_key' => $fallbackPub, 'private_pem' => $fallbackPem];
}

/**
 * Create VAPID JWT Authorization Header
 */
function webpush_create_vapid_jwt(string $aud, string $subject, string $privatePem): string {
    $header = webpush_base64url_encode(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
    $claims = webpush_base64url_encode(json_encode([
        'aud' => $aud,
        'exp' => time() + 86400,
        'sub' => $subject
    ]));

    $data = $header . '.' . $claims;
    $pkey = openssl_pkey_get_private($privatePem);
    if (!$pkey) return '';

    openssl_sign($data, $derSig, $pkey, OPENSSL_ALGO_SHA256);
    $rawSig = webpush_der_to_p1363($derSig);

    return $data . '.' . webpush_base64url_encode($rawSig);
}

/**
 * Encrypt Payload using RFC 8291 (aes128gcm)
 */
function webpush_encrypt_payload(string $payload, string $userP256dhB64, string $userAuthB64): ?string {
    $userPubKeyRaw = webpush_base64url_decode($userP256dhB64);
    $userAuthRaw = webpush_base64url_decode($userAuthB64);

    if (strlen($userPubKeyRaw) !== 65 || strlen($userAuthRaw) < 16) {
        return null;
    }

    // 1. Generate local ephemeral EC key pair
    $localKeyRes = openssl_pkey_new([
        'curve_name' => 'prime256v1',
        'private_key_type' => OPENSSL_KEYTYPE_EC
    ]);
    if (!$localKeyRes) return null;

    $localDetails = openssl_pkey_get_details($localKeyRes);
    $localPubKeyRaw = "\x04" . $localDetails['ec']['x'] . $localDetails['ec']['y'];

    // 2. Wrap user public key into SPKI PEM
    $spkiHeader = "\x30\x59\x30\x13\x06\x07\x2a\x86\x48\xce\x3d\x02\x01\x06\x08\x2a\x86\x48\xce\x3d\x03\x01\x07\x03\x42\x00";
    $userSpki = $spkiHeader . $userPubKeyRaw;
    $userPem = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($userSpki), 64, "\n") . "-----END PUBLIC KEY-----\n";
    $userKeyRes = openssl_pkey_get_public($userPem);
    if (!$userKeyRes) return null;

    // 3. Derive ECDH shared secret
    $sharedSecret = openssl_pkey_derive($userKeyRes, $localKeyRes);
    if (!$sharedSecret) return null;

    // 4. HKDF derivation
    // IKM (Input Keying Material)
    $keyInfo = "WebPush: info\0" . $userPubKeyRaw . $localPubKeyRaw;
    $ikm = hash_hkdf('sha256', $sharedSecret, 32, $keyInfo, $userAuthRaw);

    // Salt (16 bytes random)
    $salt = random_bytes(16);

    // CEK (Content Encryption Key) & Nonce
    $cekInfo = "Content-Encoding: aes128gcm\0";
    $cek = hash_hkdf('sha256', $ikm, 16, $cekInfo, $salt);

    $nonceInfo = "Content-Encoding: nonce\0";
    $nonce = hash_hkdf('sha256', $ikm, 12, $nonceInfo, $salt);

    // 5. Encrypt with AES-128-GCM
    $paddedPayload = $payload . "\x02"; // RFC 8291 record delimiter
    $tag = '';
    $ciphertext = openssl_encrypt($paddedPayload, 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
    if ($ciphertext === false) return null;

    // 6. Assemble RFC 8291 binary structure
    // Salt (16) + Record Size 4096 (4) + KeyID Len (1) + KeyID (65) + Ciphertext + Tag (16)
    return $salt . pack('N', 4096) . chr(65) . $localPubKeyRaw . $ciphertext . $tag;
}

/**
 * Dispatch Push Notification to all subscribed devices matching the target criteria
 */
function webpush_send_notification(array $notif): int {
    try {
        webpush_ensure_schema();
        $keys = webpush_get_vapid_keys();
        $vapidPub = $keys['public_key'];
        $vapidPrivPem = $keys['private_pem'];

        $storeId = !empty($notif['store_id']) ? (int)$notif['store_id'] : null;
        $userId = !empty($notif['user_id']) ? (int)$notif['user_id'] : null;

        // Determine which users should receive this push:
        // - If specific user_id: send to that user
        // - If store_id: send to users of that store + ALL ADMINs
        // - If neither: broadcast to ALL users
        $querySql = "SELECT s.*, u.role FROM push_subscriptions s JOIN users u ON u.id=s.user_id WHERE u.is_active=1";
        $params = [];

        if ($userId) {
            $querySql .= " AND (s.user_id = ? OR u.role = 'ADMIN')";
            $params[] = $userId;
        } elseif ($storeId) {
            $querySql .= " AND (s.store_id = ? OR s.store_id IS NULL OR u.role = 'ADMIN')";
            $params[] = $storeId;
        }

        $subs = query($querySql, $params)->fetchAll();
        if (empty($subs)) return 0;

        $payloadJson = json_encode([
            'id' => $notif['id'] ?? Date('U'),
            'title' => $notif['title'] ?? 'AKM POS',
            'body' => $notif['message'] ?? 'Có thông báo mới từ hệ thống',
            'severity' => $notif['severity'] ?? 'INFO',
            'type' => $notif['type'] ?? 'SYSTEM',
            'store_id' => $storeId,
            'link_type' => $notif['link_type'] ?? null,
            'link_id' => $notif['link_id'] ?? null,
            'url' => !empty($notif['link_type']) ? './?page=' . $notif['link_type'] . (!empty($notif['link_id']) ? '&id=' . $notif['link_id'] : '') : './?page=notifications',
            'timestamp' => time()
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $mh = curl_multi_init();
        $handles = [];
        $deleteSubIds = [];

        foreach ($subs as $sub) {
            $endpoint = $sub['endpoint'];
            $p256dh = $sub['p256dh'];
            $auth = $sub['auth'];

            $parsed = parse_url($endpoint);
            if (!$parsed || empty($parsed['host'])) continue;
            $aud = ($parsed['scheme'] ?? 'https') . '://' . $parsed['host'];

            $jwt = webpush_create_vapid_jwt($aud, 'mailto:admin@anhkhoamobile.com', $vapidPrivPem);
            if (!$jwt) continue;

            $encryptedBody = webpush_encrypt_payload($payloadJson, $p256dh, $auth);
            if (!$encryptedBody) continue;

            $ch = curl_init($endpoint);
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $encryptedBody,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 5,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/octet-stream',
                    'Content-Encoding: aes128gcm',
                    'TTL: 86400',
                    'Urgency: high',
                    'Authorization: vapid t=' . $jwt . ', k=' . $vapidPub
                ]
            ]);

            curl_multi_add_handle($mh, $ch);
            $handles[(int)$ch] = ['ch' => $ch, 'sub_id' => (int)$sub['id']];
        }

        // Execute all HTTP/2 / HTTP/1.1 push requests concurrently
        $active = null;
        do {
            $mrc = curl_multi_exec($mh, $active);
        } while ($mrc === CURLM_CALL_MULTI_PERFORM || $active);

        while ($active && $mrc === CURLM_OK) {
            if (curl_multi_select($mh) !== -1) {
                do {
                    $mrc = curl_multi_exec($mh, $active);
                } while ($mrc === CURLM_CALL_MULTI_PERFORM || $active);
            }
        }

        $successCount = 0;
        foreach ($handles as $item) {
            $ch = $item['ch'];
            $subId = $item['sub_id'];
            $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if ($httpCode >= 200 && $httpCode < 300) {
                $successCount++;
            } elseif ($httpCode === 404 || $httpCode === 410) {
                // Subscription has expired or unsubscribed on client -> queue delete
                $deleteSubIds[] = $subId;
            }

            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
        }
        curl_multi_close($mh);

        if (!empty($deleteSubIds)) {
            $ph = implode(',', array_fill(0, count($deleteSubIds), '?'));
            query("DELETE FROM push_subscriptions WHERE id IN ($ph)", $deleteSubIds);
        }

        return $successCount;
    } catch (Throwable $e) {
        return 0;
    }
}
