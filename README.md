# APP ĐẶT PHÒNG HỌC / PHÒNG LAB VÀ QUẢN LÝ LỊCH HỌC (EXPO & SUPABASE)

## 1. THÔNG TIN CHUNG & DELIVERABLE LINKS
- Sinh viên thực hiện: Trần Thu Phương
- Mã sinh viên: 23IT.B172
- Vai trò: Mobile App Developer (React Native / Expo + Supabase Backend)
- Đóng góp: 100%
- Ngày hoàn thành: 06/10/2026
- GitHub Repository: https://github.com/thuphuong030405/AppBookingRoom.git

---

## 2. GIỚI THIỆU SẢN PHẨM
App Đặt Phòng Học / Phòng Lab và Quản Lý Lịch Học là ứng dụng di động đa nền tảng (iOS & Android) được xây dựng trên nền tảng React Native (Expo) kết hợp với hệ thống Backend Cloud Supabase.

Ứng dụng hỗ trợ sinh viên và giảng viên dễ dàng tra cứu, tìm kiếm và đặt phòng học, phòng thực hành (Lab) và phòng máy tính. Hệ thống hỗ trợ quản lý trạng thái phòng học theo thời gian thực (Realtime), phân quyền người dùng và tích hợp quản lý hồ sơ cá nhân đồng bộ trực tiếp với Supabase Database và Supabase Auth.

---

## 3. TÍNH NĂNG NỔI BẬT
- Xác Thực & Quản Lý Tài Khoản (Authentication & Roles):
  + Đăng ký / Đăng nhập: Tích hợp Supabase Auth với cơ chế lưu phiên đăng nhập tự động.
  + Phân quyền người dùng (Role-Based Access Control): Sinh viên (Student) và Giảng viên (Teacher).
  + Hồ sơ cá nhân (Profile Screen):
    * Xem thông tin tài khoản, email, Mã SV/GV, Khoa/Bộ môn và Avatar.
    * Chỉnh sửa hồ sơ: Cho phép cập nhật trực tiếp Họ tên, Mã SV/GV, Khoa và đường dẫn Avatar (Live Preview avatar ngay trên modal).
    * Thống kê lượt đặt phòng nhanh (Tổng số lượt, Lượt hiệu lực, Lượt đã hủy).
- Tìm Kiếm và Đặt Phòng:
  + Lọc và tìm kiếm thông minh: Tìm phòng theo tên phòng, loại phòng (Phòng lý thuyết, Lab máy tính, Phòng họp, Hội trường,...) hoặc theo sức chứa.
  + Trạng thái Realtime:
    * Sẵn sàng (Available)
    * Đã được đặt (Booked / Occupied)
  + Đặt phòng chi tiết: Chọn ngày đặt, khung giờ bắt đầu/kết thúc, chọn tên phòng và sức chứa.
- Quản Lý Lịch Đặt Phòng:
  + Danh sách đặt phòng cá nhân: Xem tất cả các yêu cầu đặt phòng đã thực hiện.
  + Lọc theo trạng thái: Phân loại theo Sắp tới, Hoàn thành hoặc Đã hủy.
  + Hủy lịch nhanh: Cho phép hủy lịch đặt phòng trực tiếp trước giờ hẹn với thông báo xác nhận an toàn.
  + Đồng bộ thời gian thực: Cập nhật trạng thái phòng và lịch trình ngay lập tức khi có thay đổi.

---

## 4. KIẾN TRÚC KỸ THUẬT & HƯỚNG DẪN CÀI ĐẶT

Tech Stack:
- Framework: React Native / Expo (Node.js >= 18)
- Backend & Database: Supabase (Supabase Auth, Realtime Database, Storage)
- State Management & Navigation: React Navigation / Expo Router

Hướng Dẫn Cài Đặt và Chạy Ứng Dụng:
1. Yêu cầu môi trường:
   - Đã cài đặt Node.js (Phiên bản 18 trở lên).
   - Cài đặt ứng dụng Expo Go trên điện thoại (iOS App Store / Android Google Play Store).

2. Cài đặt Phụ thuộc (Dependencies):
   Mở Terminal tại thư mục gốc của dự án và chạy lệnh:
   npm install

3. Cấu hình Biến Môi Trường (Supabase Keys):
   Cập nhật thông tin Supabase URL & Anon Key trong file .env hoặc app.json:
   EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

4. Khởi chạy Ứng dụng:
   npx expo start

   - Trên điện thoại thật: Quét mã QR Code hiển thị ở Terminal bằng ứng dụng Expo Go (Android) hoặc Camera mặc định (iOS).
   - Trên Giả lập Android: Ấn phím a trên Terminal.
   - Trên Giả lập iOS: Ấn phím i trên Terminal.