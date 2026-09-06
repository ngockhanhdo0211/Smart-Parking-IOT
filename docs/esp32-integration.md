# Tích hợp ESP32

## Luồng sensor và heartbeat

```text
IR + gas + vibration
        ↓
ESP32 tạo JSON
        ↓ HTTP POST /api/system/update
Node.js validate và cập nhật state + lastSeen
        ↓ Socket.IO event system:update
Dashboard render lại không reload
```

Nên gửi dữ liệu mỗi 2–5 giây. Watchdog chạy mỗi 3 giây và đánh dấu offline khi không nhận heartbeat quá 10 giây.

Ví dụ request:

```http
POST /api/system/update HTTP/1.1
Host: 192.168.1.20:3000
Content-Type: application/json

{"parking":{"p1":false,"p2":true,"p3":false,"p4":false},"gas":350,"vibration":false}
```

## Luồng điều khiển cổng

```text
Website POST /api/gate/open
        ↓
Server giữ command = open
        ↓ ESP32 GET /api/gate/command
Servo mở thanh chắn
        ↓ ESP32 POST /api/gate/status {"status":"open"}
Server đặt status = open, command = none và broadcast dashboard
```

ESP32 nên poll command khoảng mỗi 500–1000 ms. Chỉ thực hiện khi command khác `none`. Sau khi servo tới vị trí mong muốn, luôn gửi status để server xóa lệnh; nếu không, ESP32 có thể thực hiện lại cùng command.

## Cấu hình mạng

- Thay `localhost` bằng IPv4 LAN của máy chạy backend.
- ESP32 và máy chủ phải truy cập được nhau trong cùng mạng.
- Server đã bind `0.0.0.0`; có thể cần mở TCP port 3000 trên firewall.
- Dùng IP tĩnh hoặc DHCP reservation để base URL không đổi.

## Gợi ý firmware

- Dùng `WiFi.h` và `HTTPClient.h`.
- Serialize JSON bằng ArduinoJson hoặc chuỗi JSON được kiểm soát.
- Đặt timeout HTTP và retry có khoảng nghỉ; không block vòng đọc sensor quá lâu.
- Chỉ coi update thành công khi HTTP status là 2xx.
- Lọc nhiễu IR/vibration và giới hạn tần suất update trước khi gửi.

Phiên bản local demo chưa có authentication. Khi triển khai ngoài LAN, nên thêm API key, HTTPS/reverse proxy, rate limiting và persistent storage.
