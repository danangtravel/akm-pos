# AKM POS - Functional verification report

Ngày kiểm thử: 31/08/2026. Môi trường: PHP 8.4.24, MariaDB 11.4, trình duyệt Chromium; viewport 360x800, 390x844 và 1440x900.

## Kết quả

| Nhóm | Kiểm thử | Kết quả |
|---|---|---|
| Cài đặt | Tạo schema và Admin từ `install.php` trên database trống | PASS |
| Xác thực | Login Admin, logout, login Employee, phiên hết hạn | PASS |
| Mobile | Drawer, bottom navigation, bottom-sheet form, touch target 44px | PASS |
| Responsive | Không tràn ngang ở 360px, 390px và desktop 1440px | PASS |
| PWA | Manifest, service worker, app shell tải khi local server offline | PASS |
| Sản phẩm | Tạo sản phẩm; import CSV và tạo tồn đầu kỳ | PASS |
| Tồn kho | Điều chỉnh 0 → 10; ledger/audit được tạo | PASS |
| POS | Bán 1 sản phẩm; tồn 10 → 9; payment và order được tạo atomic | PASS |
| Trả hàng | Tìm bằng mã hóa đơn; trả 1; tồn 9 → 10 | PASS |
| Chuyển kho | CH02 5 → 3 và CH01 10 → 12 trong một transaction | PASS |
| Hủy hóa đơn | Hủy đơn mới, tồn 11 → 12; chặn hủy đơn đã có phiếu trả | PASS |
| Sửa chữa | Tạo repair case, technician và status mặc định | PASS |
| Phân quyền | Employee chỉ thấy CH01; không có chỉnh tồn/hủy/quản trị | PASS |
| Dashboard | KPI doanh thu, đơn, item, tồn, trả, repair | PASS |
| Báo cáo | Lọc ngày; tải CSV UTF-8 | PASS |
| Audit | LOGIN, SALE, RETURN, TRANSFER, CANCEL, ADJUST, IMPORT | PASS |
| Cron | Slow-moving, daily-report disabled, repair reminder rỗng | PASS |
| Static QA | PHP lint toàn bộ; JavaScript syntax check | PASS |

## Đối chiếu ledger chính

```text
MANUAL_ADJUSTMENT  +10   0 -> 10
SALE                -1  10 -> 9
RETURN              +1   9 -> 10
TRANSFER_OUT        -2   5 -> 3
TRANSFER_IN         +2  10 -> 12
SALE                -1  12 -> 11
CANCEL_REVERSAL     +1  11 -> 12
INITIAL_IMPORT     +20   0 -> 20
```

Database và tài khoản dùng trong kiểm thử là dữ liệu tạm, không nằm trong ZIP phát hành. Production vẫn bắt đầu bằng `/install.php`.

## Kiểm thử bản tối ưu UI và dữ liệu demo v2 (01/09/2026)

- `node --check assets/app.js`: đạt, không có lỗi cú pháp JavaScript.
- PHP lint toàn bộ mã nguồn trên PHP 8.4: đạt, không có lỗi cú pháp.
- Trình duyệt desktop: trang đăng nhập tải đủ `app.css`, `ui.css`, `mobile.css`, không có lỗi console.
- Responsive 390 × 844: nội dung không tràn ngang; card đăng nhập rộng 358,4 px; tiếng Việt hiển thị đúng Unicode.
- PWA cache nâng lên `akm-pos-shell-v3`, bao gồm đầy đủ stylesheet mới.
- Demo v2: 4 chi nhánh, 44 sản phẩm, 20 hóa đơn; đã rà soát tồn kho theo chi nhánh trước giao dịch và điều chuyển mẫu.
- Tìm kiếm POS/Sản phẩm dùng debounce 180 ms, request im lặng và chống kết quả cũ ghi đè; không reload toàn trang.
- Bảng dữ liệu hỗ trợ con lăn ngang, kéo chuột và vuốt cảm ứng; chỉ chặn cuộn dọc khi bảng thực sự tràn ngang.
