# AKM POS

## System Architecture + Database ERD + UI Design Specification

**Version:** 1.0\
**Scope:** POS · Inventory · Repair · Multi-store\
**Reference architecture:** ICWealth CRM

------------------------------------------------------------------------

## 1. Executive Summary

AKM POS là hệ thống quản lý bán hàng cho chuỗi cửa hàng điện thoại, linh
kiện, phụ kiện và dịch vụ sửa chữa. Hệ thống được thiết kế cho mô hình
nhiều cửa hàng, mỗi cửa hàng đồng thời là một kho độc lập; dữ liệu được
quản lý tập trung để Admin theo dõi toàn chuỗi.

Kiến trúc v1 kế thừa các nguyên tắc đã vận hành trong ICWealth CRM:

-   Frontend React.
-   Backend PHP dạng module.
-   MySQL / MariaDB.
-   Session authentication.
-   Hybrid RBAC: Role + Permission Override.
-   Local file storage.
-   SMTP / Brevo.
-   Linux Cron.
-   Audit Log.
-   Backup định kỳ.

AKM POS bổ sung các lớp nghiệp vụ đặc thù POS:

-   Store Partitioning.
-   Stock Engine.
-   Stock Ledger.
-   POS / Sale.
-   Return / Exchange.
-   Inter-store Stock Transfer.
-   Repair Case.
-   Repair Image Processing.
-   Reporting & Notification.

### 1.1 Phạm vi MVP

1.  Quản lý cửa hàng và nhân viên.
2.  Quản lý sản phẩm và danh mục.
3.  Quản lý tồn kho theo cửa hàng.
4.  POS / bán hàng.
5.  Đổi / trả hàng.
6.  Xin hàng / chuyển hàng giữa cửa hàng.
7.  Phiếu sửa chữa.
8.  Báo cáo.
9.  Email tự động.
10. Audit Log.
11. Import dữ liệu KiotViet / Excel.
12. Manual Stock Adjustment.

### 1.2 Các quyết định nghiệp vụ đã chốt

  -----------------------------------------------------------------------
  Hạng mục                            Quyết định
  ----------------------------------- -----------------------------------
  Tên hệ thống                        AKM POS

  Mô hình                             Nhiều cửa hàng; hiện tại 4 cửa hàng
                                      nhưng không hard-code

  Kho                                 Mỗi cửa hàng là một kho độc lập

  User / Store                        Admin chỉ định nhân viên được truy
                                      cập 1 hoặc nhiều cửa hàng

  Nhà cung cấp                        Không quản lý

  Giá vốn                             Không quản lý

  Serial / IMEI                       Có thể nhập hoặc bỏ trống

  Tồn kho                             Theo số lượng; không cho phép bán
                                      âm

  Đổi / trả                           Employee tự thực hiện, không cần
                                      Admin duyệt

  Return visibility                   Admin xem được toàn bộ sản phẩm đổi
                                      / trả

  Discount                            Optional, có thể bật / tắt

  Hủy hóa đơn                         Chỉ Admin

  Thanh toán                          Cash / Bank Transfer / Card

  Đối soát cuối ngày                  Không

  Ca làm việc                         Không

  Store Manager                       Không có role riêng

  Xin hàng                            Employee tạo, Admin duyệt

  Chuyển kho                          Kho gửi -N, kho nhận +N khi hoàn
                                      tất; không In Transit

  Kiểm kho                            Chưa phát triển trong v1

  Manual Stock Adjustment             Chỉ Admin, bắt buộc Audit Log

  Repair parts                        Không tự động trừ tồn; nhân viên tự
                                      thao tác

  Repair images                       Tối đa 5 ảnh/case; JPG \<400 KB/ảnh

  Reminder                            SMTP nội bộ

  Daily Report                        SMTP

  KiotViet                            Không sync liên tục;
                                      migration/import khi cần
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 2. User Roles & Permission Model

### 2.1 Roles

AKM POS v1 sử dụng hai role chính:

-   `ADMIN`
-   `EMPLOYEE`

Hệ thống giữ cơ chế permission override để có thể mở rộng quyền theo
từng user.

### 2.2 Permission Matrix

  Chức năng                    Admin           Employee
  ---------------------------- --------------- --------------------------
  Quản lý user                 Toàn quyền      Không
  Chỉ định user vào cửa hàng   Có              Không
  Bán hàng                     Có              Có tại cửa hàng được cấp
  Hủy hóa đơn                  Có              Không
  Đổi / trả hàng               Có              Có
  Xem return toàn hệ thống     Có              Chỉ phạm vi được cấp
  Xem tồn kho                  Toàn hệ thống   Có
  Điều chỉnh tồn               Có              Không
  Tạo phiếu xin hàng           Có              Có
  Duyệt phiếu xin hàng         Có              Không
  Repair case                  Toàn hệ thống   Cửa hàng được cấp
  Báo cáo                      Toàn hệ thống   Cửa hàng được cấp
  Export Excel                 Có              Không
  Settings                     Có              Không

### 2.3 Multi-store Assignment

Quan hệ User và Store là many-to-many:

``` text
users
  |
  +-- user_stores -- stores
```

Một nhân viên có thể được Admin cấp:

``` text
Nguyễn Văn A
- CH01: Allowed
- CH02: Not allowed
- CH03: Allowed
- CH04: Not allowed
```

Nếu user có nhiều cửa hàng, giao diện hiển thị Store Selector.

Mọi nghiệp vụ phải gắn `store_id`.

**Security rule:** permission phải được enforce tại backend. Không được
chỉ ẩn button trên frontend.

------------------------------------------------------------------------

## 3. System Architecture

``` mermaid
flowchart TB
    USER[Admin / Employee]
    BROWSER[Browser]
    CF[Cloudflare / HTTPS]
    WEB[Nginx / Apache]
    FE[React + TypeScript + Vite<br/>Tailwind + Inter + Lucide]
    API[api.php<br/>Unified API Gateway]
    ROUTER[api/core/router_map.php]

    AUTH[auth.php]
    USERS[users.php]
    STORES[stores.php]
    PRODUCTS[products.php]
    INVENTORY[inventory.php]
    SALES[sales.php]
    RETURNS[returns.php]
    TRANSFERS[transfers.php]
    REPAIRS[repairs.php]
    REPORTS[reports.php]
    FILES[files.php]
    SYSTEM[system.php]

    STOCK[Core Stock Engine]
    DB[(MySQL / MariaDB)]
    STORAGE[(uploads/YYYY/MM)]
    SMTP[SMTP / Brevo]
    CRON[Linux Cron]
    BACKUP[(Backup Storage)]

    USER --> BROWSER --> CF --> WEB --> FE --> API --> ROUTER

    ROUTER --> AUTH
    ROUTER --> USERS
    ROUTER --> STORES
    ROUTER --> PRODUCTS
    ROUTER --> INVENTORY
    ROUTER --> SALES
    ROUTER --> RETURNS
    ROUTER --> TRANSFERS
    ROUTER --> REPAIRS
    ROUTER --> REPORTS
    ROUTER --> FILES
    ROUTER --> SYSTEM

    SALES --> STOCK
    RETURNS --> STOCK
    TRANSFERS --> STOCK
    INVENTORY --> STOCK

    STOCK --> DB
    AUTH --> DB
    USERS --> DB
    STORES --> DB
    PRODUCTS --> DB
    REPAIRS --> DB
    REPORTS --> DB
    FILES --> DB
    SYSTEM --> DB

    FILES --> STORAGE
    CRON --> REPORTS
    CRON --> REPAIRS
    CRON --> SYSTEM
    REPORTS --> SMTP
    REPAIRS --> SMTP
    SYSTEM --> SMTP
    SYSTEM --> BACKUP
```

### 3.1 Frontend

Recommended stack:

``` text
React
TypeScript
Vite
Tailwind CSS
Inter
Lucide Icons
Chart.js
SheetJS
```

Suggested structure:

``` text
src/
├── components/
│   ├── Button
│   ├── Modal
│   ├── Table
│   ├── Search
│   ├── StoreSelector
│   ├── ProductSearch
│   └── PermissionGuard
├── screens/
│   ├── Dashboard
│   ├── POS
│   ├── Orders
│   ├── Products
│   ├── Inventory
│   ├── Transfers
│   ├── Returns
│   ├── Repairs
│   ├── Reports
│   ├── Users
│   └── Settings
├── services/
├── utils/
├── types/
└── App.tsx
```

### 3.2 Backend

Giữ pattern:

``` text
api.php
  ↓
router_map.php
  ↓
PHP Module
  ↓
Core Business Helpers / Stock Engine
  ↓
PDO
  ↓
MySQL / MariaDB
```

Suggested structure:

``` text
api/
├── core/
│   ├── boot.php
│   ├── database.php
│   ├── auth.php
│   ├── permissions.php
│   ├── stock_engine.php
│   ├── audit.php
│   ├── image_processor.php
│   ├── helpers.php
│   └── router_map.php
└── modules/
    ├── auth.php
    ├── users.php
    ├── stores.php
    ├── products.php
    ├── inventory.php
    ├── sales.php
    ├── returns.php
    ├── transfers.php
    ├── repairs.php
    ├── reports.php
    ├── files.php
    └── system.php
```

### 3.3 Stock Engine

Tất cả biến động tồn phải đi qua Stock Engine:

``` text
Sale
Return
Transfer
Manual Adjustment
      ↓
 Stock Engine
      ↓
Inventory
      ↓
Stock Ledger
      ↓
Audit Log
```

Business rules:

-   Không bán âm kho.
-   Không chuyển nhiều hơn tồn hiện có.
-   Manual Adjustment không được tạo tồn \< 0.
-   Transaction phải atomic.
-   Không module nào được tự cập nhật tồn mà bỏ qua Stock Ledger.

------------------------------------------------------------------------

## 4. Database ERD v1

``` mermaid
erDiagram
    USERS {
        bigint id PK
        varchar full_name
        varchar email UK
        varchar phone
        varchar password
        varchar role
        longtext permissions
        tinyint is_active
        datetime created_at
    }

    STORES {
        bigint id PK
        varchar code UK
        varchar name
        varchar address
        varchar phone
        tinyint is_active
        datetime created_at
    }

    USER_STORES {
        bigint id PK
        bigint user_id FK
        bigint store_id FK
        datetime created_at
    }

    CATEGORIES {
        bigint id PK
        bigint parent_id FK
        varchar name
        int sort_order
        tinyint is_active
    }

    PRODUCTS {
        bigint id PK
        bigint category_id FK
        varchar sku UK
        varchar barcode
        varchar name
        decimal selling_price
        text description
        tinyint allow_discount
        tinyint is_active
        datetime created_at
    }

    INVENTORIES {
        bigint id PK
        bigint store_id FK
        bigint product_id FK
        int quantity
        datetime updated_at
    }

    STOCK_LEDGER {
        bigint id PK
        bigint store_id FK
        bigint product_id FK
        varchar movement_type
        int quantity_change
        int quantity_before
        int quantity_after
        varchar reference_type
        bigint reference_id
        bigint created_by FK
        text reason
        datetime created_at
    }

    ORDERS {
        bigint id PK
        varchar order_code UK
        bigint store_id FK
        bigint user_id FK
        decimal subtotal
        decimal discount_amount
        decimal total_amount
        varchar status
        text cancel_reason
        bigint cancelled_by FK
        datetime cancelled_at
        datetime created_at
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        varchar sku_snapshot
        varchar product_name_snapshot
        decimal unit_price
        int quantity
        decimal discount_amount
        varchar serial_number
        varchar imei
        decimal total_amount
    }

    PAYMENTS {
        bigint id PK
        bigint order_id FK
        varchar method
        decimal amount
        datetime created_at
    }

    RETURNS {
        bigint id PK
        varchar return_code UK
        bigint order_id FK
        bigint store_id FK
        bigint created_by FK
        varchar status
        text reason
        decimal total_amount
        datetime created_at
    }

    RETURN_ITEMS {
        bigint id PK
        bigint return_id FK
        bigint order_item_id FK
        bigint product_id FK
        int quantity
        decimal amount
        varchar serial_number
        varchar imei
    }

    STOCK_TRANSFERS {
        bigint id PK
        varchar transfer_code UK
        bigint from_store_id FK
        bigint to_store_id FK
        bigint requested_by FK
        bigint approved_by FK
        varchar status
        text request_note
        text reject_reason
        datetime requested_at
        datetime approved_at
    }

    STOCK_TRANSFER_ITEMS {
        bigint id PK
        bigint transfer_id FK
        bigint product_id FK
        int quantity
    }

    REPAIR_CASES {
        bigint id PK
        varchar repair_code UK
        bigint store_id FK
        bigint technician_id FK
        varchar customer_name
        varchar customer_phone
        varchar device_name
        varchar imei
        text device_condition
        text repair_request
        varchar status
        datetime received_at
        datetime expected_return_at
        datetime completed_at
        datetime returned_at
        datetime created_at
    }

    ATTACHMENTS {
        bigint id PK
        varchar entity_type
        bigint entity_id
        varchar file_path
        varchar original_name
        int file_size
        varchar mime_type
        bigint created_by FK
        datetime created_at
    }

    AUDIT_LOGS {
        bigint id PK
        bigint user_id FK
        varchar entity_type
        bigint entity_id
        varchar action
        longtext old_data
        longtext new_data
        varchar ip_address
        text description
        datetime created_at
    }

    SETTINGS {
        bigint id PK
        varchar config_key UK
        longtext config_value
        datetime updated_at
    }

    USERS ||--o{ USER_STORES : assigned
    STORES ||--o{ USER_STORES : contains

    CATEGORIES ||--o{ CATEGORIES : parent
    CATEGORIES ||--o{ PRODUCTS : contains

    STORES ||--o{ INVENTORIES : has
    PRODUCTS ||--o{ INVENTORIES : stocked

    STORES ||--o{ STOCK_LEDGER : records
    PRODUCTS ||--o{ STOCK_LEDGER : moves
    USERS ||--o{ STOCK_LEDGER : creates

    STORES ||--o{ ORDERS : creates
    USERS ||--o{ ORDERS : sells
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : sold
    ORDERS ||--o{ PAYMENTS : paid_by

    ORDERS ||--o{ RETURNS : has
    RETURNS ||--|{ RETURN_ITEMS : contains
    PRODUCTS ||--o{ RETURN_ITEMS : returned

    STORES ||--o{ STOCK_TRANSFERS : participates
    STOCK_TRANSFERS ||--|{ STOCK_TRANSFER_ITEMS : contains
    PRODUCTS ||--o{ STOCK_TRANSFER_ITEMS : transferred

    STORES ||--o{ REPAIR_CASES : receives
    USERS ||--o{ REPAIR_CASES : technician

    USERS ||--o{ AUDIT_LOGS : creates
```

### 4.1 Core Tables

  Table                  Vai trò
  ---------------------- ------------------------------
  users                  User, role, permission
  stores                 Cửa hàng / kho
  user_stores            User được truy cập store nào
  categories             Category tree
  products               SKU / barcode / giá bán
  inventories            Tồn hiện tại
  stock_ledger           Lịch sử biến động tồn
  orders                 Hóa đơn
  order_items            Chi tiết hóa đơn
  payments               Thanh toán
  returns                Phiếu đổi / trả
  return_items           Chi tiết đổi / trả
  stock_transfers        Phiếu xin / chuyển hàng
  stock_transfer_items   Chi tiết chuyển
  repair_cases           Phiếu sửa chữa
  attachments            File / repair images
  audit_logs             Audit trail
  settings               Cấu hình hệ thống

### 4.2 Inventory Constraints

-   `UNIQUE(store_id, product_id)` trên `inventories`.
-   `quantity >= 0`.
-   SKU unique toàn hệ thống.
-   Serial / IMEI nullable.
-   Không hard-delete sales transaction.

### 4.3 Stock Ledger Movement Types

``` text
INITIAL_IMPORT
SALE
RETURN
TRANSFER_OUT
TRANSFER_IN
MANUAL_ADJUSTMENT
CANCEL_ORDER_REVERSAL
```

------------------------------------------------------------------------

## 5. Product & Category

### 5.1 Category Tree

Hỗ trợ nhiều cấp bằng `parent_id`.

``` text
Phụ kiện
├── Cường lực
│   ├── iPhone
│   ├── Samsung
│   └── Oppo
├── Ốp lưng
└── Cáp sạc

Linh kiện
├── Màn hình
├── Pin
├── Camera
└── Loa
```

### 5.2 Product Fields

``` text
SKU
Barcode
Name
Category
Selling Price
Description
Allow Discount
Active
```

Không có:

``` text
Supplier
Cost Price
```

Serial / IMEI là metadata optional trong giao dịch, không phải cơ chế
quản lý tồn chính.

------------------------------------------------------------------------

## 6. POS / Sales Workflow

``` mermaid
flowchart LR
    SEARCH[Search / Barcode] --> PRODUCT[Select Product]
    PRODUCT --> CART[Cart]
    CART --> CHECK{Enough stock?}
    CHECK -->|No| ERROR[Reject]
    CHECK -->|Yes| PAYMENT[Payment Method]
    PAYMENT --> ORDER[Create Order]
    ORDER --> STOCK[Decrease Inventory]
    STOCK --> LEDGER[Stock Ledger]
    LEDGER --> AUDIT[Audit Log]
```

### 6.1 Sale Flow

1.  Employee chọn Store hiện tại.
2.  Search bằng tên / SKU / barcode.
3.  Search `"cường lực"` phải trả về tất cả SKU phù hợp.
4.  Hiển thị tồn tại cửa hàng hiện tại.
5.  Add to cart.
6.  Optional discount nếu feature bật.
7.  Check stock.
8.  Chọn:
    -   CASH
    -   BANK_TRANSFER
    -   CARD
9.  Create order.
10. Trừ inventory.
11. Create stock ledger.
12. Complete.

Không bắt buộc thông tin khách hàng.

------------------------------------------------------------------------

## 7. Cancel Invoice

Chỉ Admin.

Không delete invoice.

Flow:

``` text
COMPLETED
   ↓
Admin Cancel
   ↓
CANCELLED
   ↓
Inventory Reversal
   ↓
Stock Ledger
   ↓
Audit Log
```

Admin bắt buộc nhập `cancel_reason`.

------------------------------------------------------------------------

## 8. Return / Exchange

Employee được tự thực hiện, không cần Admin approval.

Return phải liên kết hóa đơn gốc.

``` text
Original Order
      ↓
Select Item
      ↓
Return / Exchange
      ↓
Return Transaction
      ↓
Inventory +
      ↓
Stock Ledger
```

Admin phải xem được:

-   Product nào bị đổi / trả.
-   SKU.
-   Quantity.
-   Store.
-   Employee.
-   Original order.
-   Reason.
-   Date/time.

Không sửa trực tiếp hóa đơn cũ.

------------------------------------------------------------------------

## 9. Stock Request / Inter-store Transfer

Employee xem tồn ở cửa hàng khác và tạo phiếu xin hàng.

Flow:

``` mermaid
flowchart LR
    EMP[Employee] --> REQUEST[REQUESTED]
    REQUEST --> ADMIN{Admin}
    ADMIN -->|Reject| REJECTED[REJECTED]
    ADMIN -->|Approve| CHECK{Stock enough?}
    CHECK -->|No| FAIL[Reject / Error]
    CHECK -->|Yes| TRANSFER[Atomic Transfer]
    TRANSFER --> OUT[Source Store -N]
    TRANSFER --> IN[Destination Store +N]
    OUT --> DONE[COMPLETED]
    IN --> DONE
```

Ví dụ:

``` text
Before:
CH2 = 20
CH1 = 3

Transfer = 5

After:
CH2 = 15
CH1 = 8
```

Không sử dụng:

``` text
Reserved
In Transit
```

Hai cập nhật phải trong cùng DB transaction.

------------------------------------------------------------------------

## 10. Inventory Management

### 10.1 Current Inventory

``` text
Store + Product = Quantity
```

Ví dụ:

``` text
CH01
SKU: CL-IP15
Quantity: 27
```

### 10.2 Manual Stock Adjustment

Chỉ Admin.

Form:

``` text
Store
Product
Current Quantity
New Quantity
Difference
Reason
```

Ví dụ:

``` text
Before: 20
After: 17
Difference: -3
Reason: Hàng hư hỏng
```

System tạo:

``` text
inventory update
+
MANUAL_ADJUSTMENT stock ledger
+
Audit Log
```

------------------------------------------------------------------------

## 11. Repair Management

### 11.1 Repair Case Fields

``` text
Repair Code
Store
Customer Name
Customer Phone
Device Name / Model
IMEI
Device Condition
Repair Request
Technician
Received Date
Expected Return Date/Time
Status
Images
```

### 11.2 Suggested Status

``` text
RECEIVED
  ↓
INSPECTING
  ↓
REPAIRING
  ↓
WAITING_PARTS (optional)
  ↓
COMPLETED
  ↓
WAITING_PICKUP
  ↓
RETURNED
```

### 11.3 Repair Parts Rule

**Không tự động trừ linh kiện khỏi inventory khi cập nhật Repair Case.**

Ví dụ:

``` text
Repair Case:
Thay màn hình iPhone 13
```

không có nghĩa hệ thống tự:

``` text
Màn hình iPhone 13 -1
```

Mọi thay đổi tồn phải do nhân viên chủ động thực hiện.

Repair module và Inventory module không tự động liên kết theo hướng tiêu
hao linh kiện.

------------------------------------------------------------------------

## 12. Repair Image Processing

Maximum:

``` text
5 images / repair case
```

Pipeline:

``` mermaid
flowchart LR
    UPLOAD[Upload] --> VALIDATE[Validate MIME]
    VALIDATE --> EXIF[Auto Rotate EXIF]
    EXIF --> RESIZE[Resize]
    RESIZE --> JPG[Convert JPG]
    JPG --> COMPRESS[Compress <400 KB]
    COMPRESS --> STORAGE[uploads/YYYY/MM]
    STORAGE --> DB[Attachment Metadata]
```

Rules:

-   Validate MIME thực tế.
-   Extension whitelist.
-   Auto rotate EXIF.
-   Resize ảnh quá lớn.
-   Output JPG.
-   Target `<400 KB/image`.
-   Max 5 images/case.
-   Database chỉ lưu path + metadata.
-   Không lưu binary trực tiếp trong MySQL.

------------------------------------------------------------------------

## 13. Dashboard

### 13.1 KPI

-   Revenue.
-   Orders.
-   Items Sold.
-   Inventory.
-   Repair Cases.
-   Pending Transfer Requests.
-   Returns.
-   Slow-moving Products.

### 13.2 Filters

``` text
Today
Yesterday
This Week
Custom Date
Store
```

### 13.3 Drill-down

``` text
Whole System
  ↓
Store
  ↓
Employee
  ↓
Order
  ↓
Product
```

------------------------------------------------------------------------

## 14. Reports

Các report chính:

1.  Sales Report.
2.  Inventory Report.
3.  Sold Products.
4.  Return / Exchange Report.
5.  Transfer Report.
6.  Repair Report.
7.  Slow-moving Report.
8.  Daily Report.

Admin:

``` text
View All
Export Excel
```

Employee:

``` text
View assigned store data
No Excel export
```

Backend phải reject export request của Employee.

------------------------------------------------------------------------

## 15. Slow-moving Alert

Rule v1:

``` text
Inventory > 0
AND
No SALE >= 7 days
```

Ví dụ:

``` text
SKU: CL-S22
Stock: 18
Last Sale: 21/08/2026
Today: 31/08/2026

=> Slow Moving
```

Đây chỉ là cảnh báo, không tự thay đổi inventory.

------------------------------------------------------------------------

## 16. Daily Report & SMTP

Admin cấu hình:

``` text
Enabled
Send Time
Recipient Emails
Report Sections
```

Ví dụ:

``` text
Enabled: ON
Time: 21:30
```

Report có thể gồm:

-   Total revenue.
-   Revenue by store.
-   Order count.
-   Items sold.
-   Top selling.
-   Return products.
-   Slow-moving products.
-   Repair statistics.
-   Upcoming pickup appointments.

------------------------------------------------------------------------

## 17. Cron Jobs

``` text
cron_daily_report.php
cron_repair_reminders.php
cron_slow_moving.php
cron_autobackup.php
```

### 17.1 Repair Reminder

Recipient hiện tại là nội bộ:

-   Assigned technician.
-   Có thể mở rộng store staff / admin bằng Settings.

V1 dùng SMTP.

### 17.2 Backup

Recommended:

``` text
03:00 daily
```

Backup:

``` text
Database dump
+
Source
+
Optional uploads
```

Retention:

``` text
Keep latest 7 backups
```

------------------------------------------------------------------------

## 18. KiotViet / Excel Migration

Không realtime sync.

Flow:

``` text
Admin
 ↓
Upload Excel
 ↓
Column Mapping
 ↓
Validate
 ↓
Preview
 ↓
Import
```

Minimum data:

``` text
Category
Product
SKU
Barcode
Selling Price
Inventory by Store
Serial / IMEI if applicable
```

Opening stock tạo:

``` text
movement_type = INITIAL_IMPORT
```

------------------------------------------------------------------------

# 19. UI / UX Design Specification

## 19.1 Design Direction

Phong cách:

-   Clean Admin Dashboard.
-   Gọn, hiện đại.
-   Tối ưu tốc độ thao tác.
-   Không trang trí thừa.
-   Ưu tiên search, table và data readability.
-   Giữ DNA UI của ICWealth CRM.
-   Font Inter.
-   Lucide Icons.
-   Tailwind CSS.
-   Light background.
-   Neutral borders.
-   Status badges rõ ràng.

### Design System

  Thành phần      Quy chuẩn
  --------------- ----------------------------------------------
  Font            Inter
  Body            14--15px
  Table           13--14px
  Heading         20--28px
  Grid            8px
  Card Padding    16--20px
  Border Radius   8--12px
  Border          Neutral 1px
  Buttons         Primary / Secondary / Danger / Ghost
  Tables          Sticky header + search + filter + pagination
  Forms           Label trên input + inline validation
  Status          Badge + text
  Feedback        Toast + confirm modal

------------------------------------------------------------------------

## 19.2 Main App Layout

``` text
┌────────────────────────────────────────────────────────────┐
│ Logo / AKM POS       Store Selector       User / Notify   │
├───────────────┬────────────────────────────────────────────┤
│ Dashboard     │                                            │
│ POS           │                                            │
│ Orders        │              Main Content                  │
│ Products      │                                            │
│ Inventory     │                                            │
│ Transfers     │                                            │
│ Returns       │                                            │
│ Repairs       │                                            │
│ Reports       │                                            │
│ Users         │                                            │
│ Stores        │                                            │
│ Audit Log     │                                            │
│ Settings      │                                            │
└───────────────┴────────────────────────────────────────────┘
```

Topbar:

-   Store Selector.
-   Global Search.
-   Notification.
-   User menu.

------------------------------------------------------------------------

## 19.3 Dashboard UI

Layout:

``` text
[ Today ] [ Yesterday ] [ This Week ] [ Custom ]   [ Store ▼ ]

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Revenue     │ │ Orders      │ │ Items Sold  │ │ Inventory   │
│ 42.5M       │ │ 128         │ │ 294         │ │ 4,218       │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

┌─────────────────────────────────────┐
│ Revenue Chart                       │
└─────────────────────────────────────┘

┌────────────────────┐ ┌────────────────────┐
│ Top Products       │ │ Slow Moving        │
└────────────────────┘ └────────────────────┘

┌────────────────────┐ ┌────────────────────┐
│ Repair Due         │ │ Transfer Requests  │
└────────────────────┘ └────────────────────┘
```

Admin có thể chọn:

``` text
All Stores
CH01
CH02
CH03
CH04
```

Employee chỉ thấy store được cấp.

------------------------------------------------------------------------

## 19.4 POS Screen UI

POS là màn hình cần tối ưu thao tác nhất.

``` text
┌───────────────────────────────────────────────────────────────┐
│ 🔎 Search product / SKU / Barcode                            │
├───────────────────────────────────────┬───────────────────────┤
│ Search Results                        │ CART                  │
│                                       │                       │
│ Cường lực iPhone 15                   │ Cường lực IP15   x2   │
│ SKU CL-IP15                           │ 100,000               │
│ Stock: 18                             │                       │
│ 50,000                                │ Cable USB-C      x1   │
│                                       │ 150,000               │
│ Cường lực iPhone 15 Pro               │                       │
│ Stock: 12                             │ --------------------  │
│ 60,000                                │ Subtotal: 250,000     │
│                                       │ Discount: 0           │
│ ...                                   │ Total: 250,000        │
│                                       │                       │
│                                       │ [Cash] [Bank] [Card]  │
│                                       │                       │
│                                       │ [ COMPLETE ORDER ]    │
└───────────────────────────────────────┴───────────────────────┘
```

Search result hiển thị:

-   Product name.
-   SKU.
-   Price.
-   Current store stock.

Search `"cường lực"` phải hiển thị tất cả SKU liên quan.

Không yêu cầu customer info.

------------------------------------------------------------------------

## 19.5 Product Management UI

``` text
┌───────────────────┬───────────────────────────────────────────┐
│ CATEGORY TREE     │ Search product...                         │
│                   │                                           │
│ Phụ kiện          │ SKU       Product          Price    Stock │
│ ├─ Cường lực      │ CL-IP15   Cường lực IP15   50K      ...   │
│ │  ├─ iPhone      │ ...                                       │
│ │  ├─ Samsung     │                                           │
│ │  └─ Oppo        │                                           │
│ ├─ Ốp lưng        │                                           │
│ └─ Cáp sạc        │                                           │
│                   │                                           │
│ Linh kiện         │                                           │
│ ├─ Màn hình       │                                           │
│ ├─ Pin            │                                           │
│ └─ Camera         │                                           │
└───────────────────┴───────────────────────────────────────────┘
```

Product form:

``` text
Product Name
SKU
Barcode
Category
Selling Price
Allow Discount
Active
```

Không có Supplier / Cost Price.

------------------------------------------------------------------------

## 19.6 Inventory UI

Filter:

``` text
Store
Category
SKU
Keyword
```

Table:

  -------------------------------------------------------------------------
  Product   SKU       Category   Store            Stock Last Sale Status
  --------- --------- ---------- --------- ------------ --------- ---------
  Cường lực CL-IP15   Cường lực  CH01                18 Today     Active
  IP15                                                            

  Ốp lưng   OL-S22    Ốp lưng    CH01                25 9 days    Slow
  S22                                                   ago       Moving
  -------------------------------------------------------------------------

Admin có:

``` text
[ Adjust Stock ]
```

Employee không có action này.

------------------------------------------------------------------------

## 19.7 Manual Stock Adjustment UI

Modal:

``` text
MANUAL STOCK ADJUSTMENT

Store:
[ CH01 ▼ ]

Product:
[ Cường lực iPhone 15 ]

Current:
18

New Quantity:
[ 15 ]

Difference:
-3

Reason:
[ Hàng hư hỏng                  ]

[ Cancel ]     [ Confirm Adjustment ]
```

Confirm cần cảnh báo vì tác động trực tiếp tồn.

------------------------------------------------------------------------

## 19.8 Transfer / Xin hàng UI

Employee:

``` text
REQUEST STOCK

Destination:
CH01

Search:
Cường lực

Product             CH01   CH02   CH03   CH04
------------------------------------------------
Cường lực IP15       2      20     12     5
Cường lực IP15 Pro   0      10     18     4
```

Employee chọn source + quantity rồi gửi request.

Admin Pending Requests:

``` text
REQ-00021
CH01 requests from CH02
Cường lực IP15
Qty: 5
Requested by: Nguyen Van A

[ Reject ] [ Approve ]
```

Khi complete:

``` text
CH02: 20 → 15
CH01: 2  → 7
```

------------------------------------------------------------------------

## 19.9 Return / Exchange UI

Flow:

``` text
Search Original Order
        ↓
Order Detail
        ↓
Select Product
        ↓
Quantity
        ↓
Reason
        ↓
Confirm Return
```

Employee tự thực hiện.

Admin Return Dashboard:

  Product          SKU         Returns Store   Employee   Reason
  ---------------- --------- --------- ------- ---------- ---------
  Cường lực IP15   CL-IP15           4 CH01    A          Lỗi
  Cable USB-C      CB-USBC           2 CH03    B          Đổi mẫu

Có thể filter:

``` text
Today
Yesterday
Week
Store
Product
Employee
```

------------------------------------------------------------------------

## 19.10 Repair List UI

Columns:

``` text
Repair Code
Customer
Phone
Device
Technician
Status
Received
Expected Return
```

Status badges:

``` text
Received
Inspecting
Repairing
Waiting Parts
Completed
Waiting Pickup
Returned
```

------------------------------------------------------------------------

## 19.11 Repair Form UI

``` text
NEW REPAIR CASE

Customer Information
---------------------------------
Name
Phone

Device Information
---------------------------------
Device / Model
IMEI
Device Condition
Repair Request

Assignment
---------------------------------
Store
Technician
Received Date
Expected Return

Images
---------------------------------
[ + ] [ + ] [ + ] [ + ] [ + ]

Maximum 5 images
Images automatically optimized to JPG <400KB

[ Save Repair Case ]
```

Upload UI cần:

-   Thumbnail preview.
-   Upload progress.
-   Compression status.
-   Remove image.
-   Camera upload trên mobile.

------------------------------------------------------------------------

## 19.12 Repair Detail UI

``` text
REPAIR #RP000128

Customer: ...
Phone: ...
Device: ...
IMEI: ...

Status:
[ REPAIRING ▼ ]

Technician:
...

Expected Return:
...

DEVICE PHOTOS
[img] [img] [img]

TIMELINE
---------------------------------
09:15 Received
10:20 Inspecting
11:10 Repairing
...
```

Không có automatic repair-part deduction.

------------------------------------------------------------------------

## 19.13 Reports UI

Top filters:

``` text
[Today] [Yesterday] [This Week] [Custom]
Store: [All Stores ▼]
```

KPI:

``` text
Revenue
Orders
Items Sold
Returns
```

Sections:

-   Revenue chart.
-   Store performance.
-   Employee performance.
-   Product sales.
-   Inventory.
-   Returns.
-   Slow-moving.
-   Repair statistics.

Admin:

``` text
[ Export Excel ]
```

Employee:

``` text
No export button
```

------------------------------------------------------------------------

## 20. Audit Log

Suggested structure:

``` text
audit_logs

id
user_id
entity_type
entity_id
action
old_data
new_data
ip_address
description
created_at
```

Required actions:

``` text
LOGIN
CREATE_ORDER
CANCEL_ORDER
RETURN
STOCK_TRANSFER_APPROVE
STOCK_TRANSFER_COMPLETE
STOCK_ADJUST
PRODUCT_CREATE
PRODUCT_UPDATE
USER_UPDATE
PERMISSION_CHANGE
REPAIR_CREATE
REPAIR_UPDATE
EXPORT_EXCEL
```

Example:

``` json
{
  "entity_type": "INVENTORY",
  "action": "STOCK_ADJUST",
  "old_data": {
    "quantity": 20
  },
  "new_data": {
    "quantity": 17
  },
  "reason": "Hàng hư hỏng"
}
```

------------------------------------------------------------------------

## 21. Security

-   Session-based authentication.
-   Secure / HttpOnly / SameSite cookies.
-   CSRF protection.
-   Backend RBAC enforcement.
-   Password bcrypt / `password_hash`.
-   File extension whitelist.
-   MIME inspection.
-   Block script execution in uploads.
-   Database transaction for inventory operations.
-   Audit Log.
-   No hard-delete sales.
-   Daily backup.

------------------------------------------------------------------------

## 22. Non-functional Requirements

  Nhóm              Yêu cầu
  ----------------- ----------------------------------------------
  Performance       Product/SKU search nhanh, POS phản hồi nhanh
  Consistency       Không âm kho, transaction atomic
  Scalability       Không hard-code 4 stores
  Storage           Repair images \<=5/case, JPG \<400KB
  Maintainability   Module-based + shared Stock Engine
  Traceability      Stock Ledger + Audit Log
  Deployment        VPS/cloud + Nginx/Apache + PHP-FPM
  Database          MySQL / MariaDB
  Backup            Daily, giữ 7 bản gần nhất

------------------------------------------------------------------------

## 23. Out of Scope v1

-   Supplier Management.
-   Cost Price.
-   Profit based on cost.
-   Shift Management.
-   Store Manager role.
-   End-of-day reconciliation.
-   Full Stocktaking.
-   Realtime KiotViet Sync.
-   Automatic Repair Parts Deduction.
-   In Transit Inventory.
-   Heavy CRM/customer management.

------------------------------------------------------------------------

## 24. Suggested API Groups

  Group       Responsibilities
  ----------- ------------------------------------------
  Auth        Login, logout, current user, CSRF
  Users       CRUD, permissions, store assignment
  Stores      CRUD stores
  Products    Search, CRUD, categories
  Inventory   Current stock, ledger, adjustment
  Sales       Create/list/detail/cancel
  Returns     Create/list/detail
  Transfers   Request/approve/reject/complete
  Repairs     CRUD/status/images
  Reports     Dashboard/sales/inventory/returns/repair
  Export      Admin-only Excel
  Settings    SMTP/report/reminder/features

------------------------------------------------------------------------

## 25. Recommended Development Order

1.  Auth + Users + Stores + Permissions + Audit.
2.  Categories + Products + Search.
3.  Inventory + Stock Ledger + Stock Engine.
4.  Manual Stock Adjustment.
5.  POS + Orders + Payments.
6.  Admin Cancel Invoice.
7.  Return / Exchange.
8.  Stock Request / Transfer.
9.  Repair Cases.
10. Repair Image Processing.
11. Dashboard + Reports.
12. Excel Export.
13. SMTP + Cron.
14. Daily Report.
15. Repair Reminder.
16. Slow-moving Alert.
17. KiotViet / Excel Migration.
18. Backup + Security QA + Transaction Tests.

------------------------------------------------------------------------

## 26. Core Acceptance Criteria

### POS

-   Không hoàn tất order nếu quantity \> inventory của store.
-   Không yêu cầu customer info.
-   Hỗ trợ Cash / Bank Transfer / Card.

### Multi-store

-   User chỉ truy cập store được Admin cấp.
-   User nhiều store có Store Selector.

### Transfer

-   Source `-N` và destination `+N` trong cùng transaction.
-   Không In Transit.

### Return

-   Employee tự tạo return.
-   Không cần Admin approval.
-   Admin xem được toàn bộ return data.

### Cancel Invoice

-   Employee không được hủy.
-   Admin phải nhập reason.
-   Inventory được reversal.

### Manual Stock Adjustment

-   Chỉ Admin.
-   Có before / after / difference / reason.
-   Có Audit Log.

### Repair

-   Không tự động trừ repair parts.
-   Tối đa 5 ảnh/case.
-   Output JPG.
-   Target \<400 KB/ảnh.

### Excel

-   Employee không có UI export.
-   Backend từ chối export request của Employee.

### Reports

-   Today.
-   Yesterday.
-   This Week.
-   Custom.
-   Daily Report qua SMTP.

### Slow-moving

-   Inventory \>0.
-   Không có SALE \>=7 ngày.

------------------------------------------------------------------------

## 27. Final Architecture Summary

``` text
AKM POS
│
├── Authentication / RBAC
│
├── Users
│   └── User ↔ Stores
│
├── Stores
│
├── Products
│   └── Categories
│
├── Inventory
│   ├── Current Inventory
│   ├── Stock Engine
│   ├── Stock Ledger
│   └── Manual Adjustment
│
├── POS
│   ├── Orders
│   ├── Order Items
│   ├── Payments
│   └── Cancel / Reversal
│
├── Returns
│
├── Stock Transfers
│
├── Repair
│   ├── Repair Cases
│   ├── Repair Images
│   └── SMTP Reminders
│
├── Reports
│   ├── Sales
│   ├── Inventory
│   ├── Returns
│   ├── Slow Moving
│   └── Repair
│
├── Notifications
│
├── Audit Log
│
├── Settings
│
└── Backup
```

### Technology Summary

``` text
Frontend:
React + TypeScript + Vite
Tailwind CSS
Inter
Lucide
Chart.js
SheetJS

Backend:
PHP module-based API
PDO

Database:
MySQL / MariaDB

Infrastructure:
Nginx / Apache
PHP-FPM
Cloudflare / HTTPS
Local File Storage
Linux Cron
SMTP / Brevo
Daily Backup
```

------------------------------------------------------------------------

## 28. Development Principle

Ba thành phần phải được xem là nền móng của AKM POS:

1.  **Store Partitioning** --- mọi nghiệp vụ phải biết đang thuộc cửa
    hàng nào.
2.  **Stock Engine + Stock Ledger** --- mọi biến động tồn phải có một
    nguồn xử lý thống nhất và truy vết được.
3.  **Audit Log** --- mọi thao tác nhạy cảm phải biết ai thực hiện, khi
    nào và thay đổi gì.

AKM POS v1 được thiết kế theo hướng đơn giản, dễ triển khai và dễ bảo
trì tương tự ICWealth CRM, nhưng bổ sung các nguyên tắc transaction và
inventory integrity cần thiết cho một hệ thống POS nhiều cửa hàng.
