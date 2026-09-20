# DEPLOYMENT CHECKLIST · pos.anhkhoamobile.com

Hệ thống AKM POS đã sẵn sàng 100% để triển khai lên cPanel hosting cho domain **pos.anhkhoamobile.com**:

### 1. Môi trường Hosting
- [x] PHP: Khuyến nghị PHP 8.1 / 8.2 / 8.3
- [x] PHP Extensions: `pdo_mysql`, `mbstring`, `fileinfo`, `gd`, `json`, `session` (chuẩn có sẵn trên cPanel)
- [x] MySQL / MariaDB Database: Tạo 1 database và 1 database user, cấp toàn quyền `ALL PRIVILEGES`
- [x] SSL Certificate (HTTPS): Kích hoạt Let's Encrypt / AutoSSL miễn phí trên cPanel cho `pos.anhkhoamobile.com`
- [x] Web Server: Hỗ trợ file `.htaccess` (Apache / LiteSpeed)

### 2. Các bước triển khai cực kỳ đơn giản
1. **Upload File Zip**: Tải file `AKM_POS_cPanel_Ready.zip` lên thư mục root của subdomain `pos.anhkhoamobile.com` (thường là `public_html/pos` hoặc `public_html`).
2. **Giải nén (Extract)**: Nhấp chuột phải vào file zip trên cPanel File Manager và chọn **Extract**.
3. **Khởi tạo dữ liệu**: Mở trình duyệt truy cập:
   ```
   https://pos.anhkhoamobile.com/install.php
   ```
   - Nhập Database Host (`localhost`), Database Name, Database User, Database Password.
   - Nhập Họ tên, Email và Mật khẩu Quản trị viên (Admin).
   - Nhấn **Cài đặt & Khởi tạo dữ liệu**. Hệ thống sẽ tự động tạo cấu trúc bảng, kích hoạt các cấu hình mặc định và tạo tài khoản Admin.
4. **Bảo mật**: Sau khi cài xong, xóa hoặc đổi tên tệp `install.php` trên hosting.
5. **Đăng nhập & Trải nghiệm**: Mở `https://pos.anhkhoamobile.com`, đăng nhập với tài khoản Admin.

### 3. Cấu hình Cron Job (Tự động hóa)
Trong cPanel → **Cron Jobs**, thêm các tác vụ (thay `USER` bằng tên cPanel user):
- Báo cáo doanh số cuối ngày (21:30 hàng ngày):
  `30 21 * * * /usr/local/bin/php /home/USER/public_html/cron/cron_daily_report.php`
- Nhắc lịch sửa chữa thiết bị (mỗi giờ):
  `0 * * * * /usr/local/bin/php /home/USER/public_html/cron/cron_repair_reminders.php`
- Cảnh báo hàng tồn kho chậm luân chuyển (8:15 sáng):
  `15 8 * * * /usr/local/bin/php /home/USER/public_html/cron/cron_slow_moving.php`
- Sao lưu database tự động (3:00 sáng):
  `0 3 * * * /usr/local/bin/php /home/USER/public_html/cron/cron_autobackup.php`
