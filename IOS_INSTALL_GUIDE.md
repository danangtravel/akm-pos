# 🍏 Hướng Dẫn Cài Đặt & Xem Thử AKM POS Trên iOS (iPhone / iPad)

Dự án **AKM POS** đã được cấu hình sẵn cả 2 phương thức: **Native iOS App (Capacitor)** và **Progressive Web App (PWA)**. Bạn có thể chọn cách phù hợp và tiện lợi nhất dưới đây:

---

## ⚡ Cách 1: Cài đặt tức thì qua PWA (Khuyên dùng nhất – 0 giây chờ đợi)

Đây là cách nhanh nhất, mượt nhất và không bao giờ bị hết hạn chứng chỉ Apple.

1. Đưa mã nguồn lên hosting có HTTPS (hoặc mở live server / ngrok).
2. Dùng trình duyệt **Safari** trên iPhone/iPad mở đường dẫn hệ thống.
3. Bấm vào nút **Chia sẻ (Share)** ⎋ ở dưới cùng trình duyệt.
4. Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)** ➔ Nhấn **Thêm (Add)**.
5. Biểu tượng **AKM POS** sẽ xuất hiện trên màn hình chính:
   * Chạy toàn màn hình (không có thanh địa chỉ Safari).
   * Tự động lưu đăng nhập & nhận thông báo đẩy Web Push.

---

## 📦 Cách 2: Cài đặt file `.ipa` vào iPhone từ máy tính Windows / Mac (Sideload)

Nếu bạn cần chạy app dưới dạng file cài đặt `.ipa`:

### Bước 1: Lấy file `AKM_POS.ipa`
* **Cách tự động (Khuyên dùng)**: Đẩy mã nguồn lên kho lưu trữ **GitHub**.
  * Vào tab **Actions** trên GitHub ➔ Chọn workflow **🍏 Build iOS Native IPA** ➔ Nhấn **Run workflow**.
  * Sau khoảng 2-3 phút, vào mục **Artifacts** tải file `AKM_POS_iOS_IPA.zip` về máy tính (giải nén sẽ có file `AKM_POS.ipa`).
* **Cách biên dịch thủ công trên macOS**:
  ```bash
  npx cap sync ios
  npx cap open ios
  ```
  *(Trong Xcode, chọn Product > Archive hoặc Export IPA)*.

### Bước 2: Cài đặt vào iPhone bằng Sideloadly (Miễn phí trên Windows)
1. Tải và cài đặt công cụ **[Sideloadly](https://sideloadly.io)** trên máy tính.
2. Cắm iPhone vào máy tính bằng cáp USB/Type-C (chọn **Tin cậy máy tính này** trên iPhone nếu có thông báo).
3. Mở **Sideloadly**:
   * Kéo thả file `AKM_POS.ipa` vào khung IPA của Sideloadly.
   * Nhập tài khoản **Apple ID** của bạn vào ô *Apple ID*.
   * Nhấn nút **Start**.
4. Chờ 30 giây đến khi Sideloadly báo **Done**.
5. Trên iPhone:
   * Vào **Cài đặt (Settings)** ➔ **Cài đặt chung (General)** ➔ **Quản lý VPN & Thiết bị (VPN & Device Management)**.
   * Nhấn vào Apple ID của bạn và chọn **Tin cậy (Trust)**.
   * Mở ứng dụng **AKM POS** trên màn hình chính để sử dụng!

---

## 🛠️ Cấu hình địa chỉ máy chủ trong App iOS

Khi mở app lần đầu trên iPhone, app sẽ hiển thị màn hình kết nối:
1. Nhập địa chỉ máy chủ POS của bạn (Ví dụ: `https://pos.anhkhoamobile.com` hoặc IP mạng LAN như `http://192.168.1.100/akm_pos`).
2. Nhấn **"Kết nối hệ thống"**.
3. App sẽ ghi nhớ địa chỉ này và tự động đăng nhập thẳng vào hệ thống trong các lần mở tiếp theo.

---

## 📋 Quyền hệ thống đã tích hợp trong App iOS:
* 📷 **Camera**: Quét mã vạch sản phẩm & chụp ảnh thiết bị sửa chữa.
* 🖼️ **Thư viện ảnh**: Đính kèm ảnh biên nhận, linh kiện thay thế.
* 🔔 **Thông báo đẩy (Push Notifications)**: Báo đơn hàng và cảnh báo tồn kho tức thì.
