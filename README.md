# AKM POS - cPanel package

AKM POS là ứng dụng POS đa cửa hàng chạy trực tiếp trên PHP 8.1+ và MySQL/MariaDB. Gói không cần Node.js, Composer hoặc tiến trình nền riêng trên hosting.

Giao diện được tối ưu mobile-first và hoạt động như PWA: có manifest, service worker, app shell offline, safe-area cho iPhone, bottom navigation và nút cài ứng dụng khi trình duyệt hỗ trợ. Dữ liệu nghiệp vụ vẫn yêu cầu kết nối mạng để bảo đảm tính nhất quán tồn kho.

## Cài đặt trên cPanel

1. Tạo MySQL Database và MySQL User trong cPanel, cấp `ALL PRIVILEGES` cho user trên database.
2. Upload và giải nén toàn bộ ZIP vào `public_html` hoặc một subdomain.
3. Mở `https://ten-mien/install.php`, nhập database và tài khoản Admin.
4. Đăng nhập, tạo các cửa hàng, nhân viên, danh mục và sản phẩm. Dùng **Tồn kho > Điều chỉnh tồn** để nhập số dư đầu kỳ.
5. Sau khi cài xong, đổi tên hoặc xóa `install.php`. File `config/config.php` được tạo tự động.
6. Mở bằng HTTPS trên Chrome/Edge/Android hoặc Safari iOS, chọn **Cài ứng dụng / Add to Home Screen** để chạy dạng standalone.

Yêu cầu PHP: 8.1+, extensions `pdo_mysql`, `mbstring`, `fileinfo`, `gd`, `json`, `session`. Bật HTTPS. Document root phải cho phép `.htaccess` (`AllowOverride All`).

Nếu trình cài đặt không ghi được cấu hình, tạm đặt quyền ghi cho thư mục `config`, chạy cài đặt, sau đó trả về 0755 (file cấu hình 0640/0644 tùy hosting).

## Cron cPanel

Thay `/home/USER/public_html` bằng đường dẫn thật:

```text
30 21 * * * /usr/local/bin/php /home/USER/public_html/cron/cron_daily_report.php
0 * * * * /usr/local/bin/php /home/USER/public_html/cron/cron_repair_reminders.php
15 8 * * * /usr/local/bin/php /home/USER/public_html/cron/cron_slow_moving.php
0 3 * * * /usr/local/bin/php /home/USER/public_html/cron/cron_autobackup.php
```

Cron backup cần binary `mysqldump`; đây là tiện ích chuẩn trên đa số cPanel. Hệ thống giữ 7 bản mới nhất trong thư mục được chặn truy cập web.

## Bảo mật và vận hành

- Session HttpOnly/SameSite, CSRF cho mọi request ghi, bcrypt cho mật khẩu.
- Backend kiểm tra role và phạm vi cửa hàng; Employee không thể hủy hóa đơn, chỉnh tồn, export hay quản trị.
- Giao dịch bán/hủy/trả/chuyển kho dùng database transaction và row lock; tồn không thể âm.
- Ảnh sửa chữa được kiểm tra MIME, resize, chuyển JPG và nén mục tiêu dưới 400 KB; tối đa 5 ảnh/phiếu.
- Không hard-delete giao dịch. Biến động tồn lưu trong `stock_ledger`; hành động nhạy cảm lưu `audit_logs`.

## Sửa lỗi tiếng Việt và tạo dữ liệu demo

Đăng nhập bằng Admin, mở **Cài đặt → Công cụ hệ thống**:

1. Chọn **Chuẩn hóa UTF-8 database** để chuyển toàn bộ bảng hiện có sang `utf8mb4_unicode_ci`. Thao tác này sửa các lỗi encode/collation và hỗ trợ đầy đủ dấu tiếng Việt, Unicode và emoji.
2. Chọn **Tạo dữ liệu demo** (hoặc **Nâng cấp dữ liệu demo**) để thêm 4 chi nhánh AKM Mobile, 44 sản phẩm, kho hàng và số lượng khác nhau theo từng chi nhánh, 20 hóa đơn, một điều chuyển hoàn tất và 4 phiếu sửa chữa.

## Tìm kiếm, dashboard và cảnh báo

- Ô tìm kiếm POS và danh sách sản phẩm lọc tức thời qua API, không tải lại trang nên không mất giỏ hàng hoặc vị trí nhập liệu.
- Bảng rộng có thể cuộn ngang bằng con lăn ở ngay vùng nội dung, kéo chuột trực tiếp hoặc vuốt trên mobile.
- **Tổng quan** có biểu đồ doanh thu 14 ngày, sản phẩm bán chạy, cơ cấu thanh toán, doanh thu theo chi nhánh, cảnh báo sắp hết hàng và hàng chậm luân chuyển. Các khối thống kê được cô lập lỗi để dashboard vẫn hoạt động trên nhiều phiên bản MySQL/MariaDB.
- Admin cấu hình **Ngưỡng cảnh báo sắp hết** và **Số ngày chưa bán để cảnh báo** tại **Cài đặt → Cấu hình vận hành**.
- Admin quản lý **Nhóm sản phẩm** bằng chức năng thêm, sửa, ẩn và xóa an toàn. Demo v3 có các nhóm chuyên biệt như Sạc dự phòng, Củ sạc và Cáp sạc, mỗi nhóm chứa các model tương ứng.
- Sản phẩm và nhóm sản phẩm hỗ trợ ảnh đại diện JPG/PNG/WebP; ảnh được chuẩn hóa sang JPG và lưu trong `uploads/YYYY/MM`.
- Admin có thể sửa/ngừng sản phẩm, sửa/ngừng cửa hàng và thêm/sửa/khóa tài khoản nhân viên. Tài khoản nhân viên hỗ trợ phân quyền theo chức năng và phạm vi chi nhánh.
- Màn hình **Đổi / trả** hiển thị danh sách hóa đơn, tìm tức thời và sắp xếp theo ngày hoặc giá trị trước khi chọn hóa đơn trả hàng.

Dữ liệu demo chỉ được tạo một lần, sử dụng SKU/mã giao dịch có prefix `DEMO-`, không xóa dữ liệu hiện có. Nên tạo backup database trước khi chạy công cụ chuẩn hóa trên hệ thống đã có dữ liệu thật.

`database/demo_data.sql` là dữ liệu mẫu tùy chọn. Không import file này trên hệ thống đang có dữ liệu thật.
