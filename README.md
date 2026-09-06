# Smart Parking IoT System

Dashboard web thời gian thực cho mô hình bãi đỗ xe thông minh. ESP32 gửi dữ liệu cảm biến tới REST API; Node.js giữ trạng thái trong RAM và phát mọi thay đổi tới trình duyệt bằng Socket.IO.

Hệ thống mặc định quản lý 4 vị trí đỗ: P1, P2, P3 và P4. Giao diện được render động nên có thể tiếp tục mở rộng số lượng vị trí từ payload parking.

## Yêu cầu

- Node.js 18 trở lên
- npm

## Cài đặt và chạy

```bash
npm install
npm run dev
```

Chạy thông thường:

```bash
npm start
```

Mở <http://localhost:3000>. Server lắng nghe trên mọi interface mạng (`0.0.0.0`) và dùng `process.env.PORT` nếu được khai báo, nếu không mặc định là `3000`.

## Kiến trúc

```text
ESP32 <-- HTTP REST --> Express + state.service <-- Socket.IO --> Dashboard
```

- `server.js`: khởi tạo Express, HTTP server, Socket.IO và watchdog.
- `services/state.service.js`: nguồn trạng thái duy nhất trong RAM, threshold gas và timeout ESP32.
- `routes/`: ánh xạ endpoint.
- `controllers/`: validate request và gọi state service.
- `public/`: dashboard HTML/CSS/JavaScript vanilla.
- `docs/`: tài liệu API và tích hợp ESP32.

Trạng thái sẽ trở về mặc định mỗi lần Node.js khởi động lại vì phiên bản này không dùng database.

## API chính

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/system/state` | Lấy toàn bộ trạng thái |
| POST | `/api/system/update` | ESP32 gửi sensor và heartbeat |
| POST | `/api/system/demo` | Cập nhật dữ liệu mô phỏng |
| POST | `/api/gate/open` | Yêu cầu mở cổng |
| POST | `/api/gate/close` | Yêu cầu đóng cổng |
| GET | `/api/gate/command` | ESP32 lấy lệnh đang chờ |
| POST | `/api/gate/status` | ESP32 xác nhận trạng thái cổng |

Chi tiết body/response nằm trong [docs/api.md](docs/api.md).

## Demo Mode

Mở **Demo panel**, bật **Enable demo mode**, sau đó thay đổi slot, gas, vibration, ESP32 và gate. Nút **Apply simulation** gửi dữ liệu tới `/api/system/demo`; server cập nhật cùng state service và broadcast `system:update`, vì vậy mọi tab đang mở đều đổi theo thời gian thực.

Demo Mode chỉ mở khóa control ở giao diện, không tạo state thứ hai. Khi dùng phần cứng thật, tắt toggle và để ESP32 gọi `/api/system/update`.

## Kết nối ESP32

1. Cho ESP32 và máy chạy Node.js vào cùng mạng LAN.
2. Lấy địa chỉ IPv4 của máy, ví dụ `192.168.1.20`.
3. Trong firmware đặt base URL thành `http://192.168.1.20:3000`.
4. Gửi sensor định kỳ đến `/api/system/update` (ngắn hơn 10 giây).
5. Poll `/api/gate/command`, điều khiển servo, rồi POST kết quả đến `/api/gate/status`.
6. Cho phép port 3000 trong firewall của máy nếu thiết bị không kết nối được.

Xem flow đầy đủ trong [docs/esp32-integration.md](docs/esp32-integration.md).
