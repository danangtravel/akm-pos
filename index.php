<?php
header('Content-Type: text/html; charset=UTF-8');
if (!is_file(__DIR__ . '/config/config.php')) {
    header('Location: install.php');
    exit;
}
?><!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#0f766e">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="AKM POS">
  <meta name="description" content="AKM POS - Hệ thống quản lý bán hàng, tồn kho và sửa chữa đa chi nhánh">
  
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" href="assets/favicon.png" type="image/png">
  <link rel="icon" href="assets/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
  <title>AKM POS · Quản lý bán hàng & Sửa chữa</title>
  
  <!-- Tailwind CSS Play CDN with custom theme -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontWeight: {
            thin: '100',
            extralight: '200',
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '500',
            bold: '500',
            extrabold: '500',
            black: '500',
          },
          colors: {
            brand: {
              50: '#f0fdfa',
              100: '#ccfbf1',
              200: '#99f6e4',
              300: '#5eead4',
              400: '#2dd4bf',
              500: '#14b8a6',
              600: '#0d9488',
              700: '#0f766e',
              800: '#115e59',
              900: '#134e4a',
            }
          }
        }
      }
    }
  </script>
  
  <link rel="stylesheet" href="assets/app.css">
  <link rel="stylesheet" href="assets/ui.css">
  <link rel="stylesheet" href="assets/mobile.css">
  <script defer src="assets/admin-ui.js"></script>
</head>
<body>
  <!-- In-App Mobile Push Heads-Up Notification Container -->
  <div id="mobilePushContainer" class="mobile-push-container" aria-live="assertive"></div>

  <!-- Toast notifications -->
  <div id="toast"></div>

  <!-- Login Screen -->
  <div id="login" class="login-shell">
    <form id="loginForm" class="login-card">
      <!-- Brand Header -->
      <div class="login-header">
        <div class="brand-mark">A</div>
        <div class="login-brand-text">
          <h1 class="login-title">AKM POS</h1>
          <span class="login-subtitle">Retail & Repair Chain</span>
        </div>
      </div>
      
      <p class="login-desc">Đăng nhập tài khoản nhân viên hoặc quản trị viên</p>
      
      <div class="login-fields">
        <div class="input-group">
          <label for="loginEmail" class="input-label">Email tài khoản</label>
          <div class="input-wrap">
            <span class="input-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </span>
            <input id="loginEmail" name="email" type="email" placeholder="ten@anhkhamobile.com" autocomplete="username" required autofocus>
          </div>
        </div>
        
        <div class="input-group">
          <label for="loginPass" class="input-label">Mật khẩu</label>
          <div class="input-wrap">
            <span class="input-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <input id="loginPass" name="password" type="password" placeholder="••••••••" autocomplete="current-password" required>
            <button type="button" class="input-toggle-btn" onclick="toggleLoginPassword()" aria-label="Hiện mật khẩu">
              <svg id="eyeIcon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
        
        <button class="login-submit-btn" type="submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
          <span>Đăng nhập hệ thống</span>
        </button>
      </div>
      
      <div class="login-footer">
        <span class="login-footer-domain">
          <span class="status-dot"></span>
          pos.anhkhamobile.com
        </span>
        <span class="login-footer-security">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Bảo mật SSL 256-bit
        </span>
      </div>
    </form>
  </div>

  <!-- Main App Shell -->
  <div id="app" class="app hidden">
    <!-- Desktop & Mobile Drawer Aside -->
    <aside>
      <div class="brand">
        <span class="brand-mark small">A</span>
        <div>
          <b>AKM POS</b>
          <small>Bán lẻ & Sửa chữa</small>
        </div>
      </div>

      <nav id="nav"></nav>

      <div class="aside-foot">
        <div id="userBox" class="user-profile-card"></div>
        <button class="btn secondary sm wide" id="installBtn" hidden>
          Cài đặt ứng dụng (PWA)
        </button>
        <button class="btn ghost sm wide" id="logoutBtn">
          Đăng xuất
        </button>
      </div>
    </aside>

    <div id="drawerBackdrop" class="drawer-backdrop hidden"></div>

    <!-- Main Viewport -->
    <main class="main-viewport">
      <header class="top-header">
        <button id="menuBtn" class="icon-btn-menu hidden" aria-label="Mở menu điều hướng">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div class="header-store-pill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f766e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path></svg>
          <select id="storeSelect" aria-label="Chọn chi nhánh hoạt động"></select>
        </div>

        <div class="header-spacer"></div>

        <div class="header-meta">
          <!-- Bell Notification Wrapper & Popover -->
          <div id="notifBellWrap" class="notif-bell-wrap">
            <button id="notifBellBtn" class="notif-bell-btn" type="button" aria-label="Xem thông báo hệ thống" onclick="toggleNotifFlyout(event)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bell-icon">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
              <span id="notifBadge" class="notif-badge hidden">0</span>
            </button>

            <!-- Quick Flyout Popover -->
            <div id="notifFlyout" class="notif-flyout hidden" role="region" aria-label="Hộp thông báo nhanh">
              <div class="notif-flyout-header">
                <div class="notif-flyout-title">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0f766e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                  <span>Thông báo hệ thống</span>
                  <span id="flyoutUnreadCount" class="notif-tag-unread hidden">0 mới</span>
                </div>
                <div class="notif-flyout-actions">
                  <button type="button" class="notif-link-btn" onclick="window.testLocalNotification(event)" title="Gửi thử thông báo Native">
                    🔔 Thử chuông
                  </button>
                  <button type="button" class="notif-link-btn" onclick="window.markAllNotificationsRead(event)" title="Đánh dấu tất cả đã đọc">
                    Đọc tất cả
                  </button>
                </div>
              </div>

              <!-- Filter tabs in flyout -->
              <div class="notif-flyout-tabs">
                <button type="button" class="notif-tab-btn active" data-tab="all" onclick="filterFlyoutTab('all', this)">Tất cả</button>
                <button type="button" class="notif-tab-btn" data-tab="sales" onclick="filterFlyoutTab('sales', this)">Bán hàng</button>
                <button type="button" class="notif-tab-btn" data-tab="unread" onclick="filterFlyoutTab('unread', this)">Chưa đọc</button>
                <button type="button" class="notif-tab-btn" data-tab="alerts" onclick="filterFlyoutTab('alerts', this)">Cảnh báo</button>
              </div>

              <!-- Notifications Scrollable List -->
              <div id="notifFlyoutList" class="notif-flyout-list">
                <div class="notif-empty">
                  <span class="spinner" style="width:18px;height:18px;border-width:2px;"></span>
                  <span>Đang tải thông báo...</span>
                </div>
              </div>

              <!-- Footer -->
              <div class="notif-flyout-footer">
                <button type="button" class="btn secondary sm wide" onclick="closeNotifFlyout(); go('notifications');">
                  <span>Mở Trung tâm Thông báo toàn diện</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>

          <span id="clock" class="live-clock"></span>
        </div>
      </header>

      <!-- Content Page Section -->
      <section id="content" aria-live="polite"></section>

      <!-- Floating Cart Bottom Bar (Appears on Mobile POS) -->
      <div id="floatingCart" class="floating-cart-bar hidden" onclick="openMobileCart()">
        <div class="floating-cart-info">
          <div class="floating-cart-badge" id="floatingCartQty">0</div>
          <div class="floating-cart-price">
            <small>Tạm tính giỏ hàng</small>
            <b id="floatingCartTotal">0 ₫</b>
          </div>
        </div>
        <div class="floating-cart-cta">
          <span>Xem giỏ & Thanh toán</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </div>
      </div>

      <!-- Mobile Bottom Navigation Bar -->
      <nav id="mobileNav" class="mobile-nav" aria-label="Điều hướng nhanh"></nav>
    </main>
  </div>

  <!-- Reusable Modal / Mobile Bottom Sheet -->
  <div id="modal" class="modal hidden" role="dialog" aria-modal="true">
    <div class="modal-card">
      <button class="modal-close" aria-label="Đóng hộp thoại" onclick="closeModal()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div id="modalBody"></div>
    </div>
  </div>

  <!-- Thermal Print Container (Hidden on Screen, Visible on Print) -->
  <div id="thermalReceipt" class="hidden"></div>

  <!-- Global Loading Indicator -->
  <div id="loading" class="loading hidden" aria-live="assertive">
    <span class="spinner"></span>
    <b class="text-sm font-semibold text-slate-700">Đang xử lý dữ liệu...</b>
  </div>

  <!-- In-App Floating Push Notification Banner Container -->
  <div id="mobilePushContainer" class="mobile-push-container"></div>

  <script src="assets/app.js"></script>
</body>
</html>
