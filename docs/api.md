# REST API

Base URL khi chạy local: `http://localhost:3000`. Tất cả body dùng `Content-Type: application/json`. JSON body được giới hạn 16 KB.

## GET /api/system/state

Lấy snapshot đầy đủ.

```json
{
  "parking": {
    "p1": { "occupied": false },
    "p2": { "occupied": true },
    "p3": { "occupied": false },
    "p4": { "occupied": false }
  },
  "sensors": { "gas": { "value": 350, "warning": false }, "vibration": { "detected": false } },
  "gate": { "status": "closed", "command": "none" },
  "system": { "esp32Online": true, "lastSeen": 1770000000000 }
}
```

## POST /api/system/update

ESP32 gửi toàn bộ sensor state. Tên slot có thể mở rộng; mỗi giá trị parking và vibration phải là boolean, gas phải nằm trong 0–10000.

```json
{
  "parking": { "p1": false, "p2": true, "p3": false, "p4": false },
  "gas": 350,
  "vibration": false
}
```

Response `200`:

```json
{ "success": true }
```

Request hợp lệ đồng thời đặt ESP32 online và cập nhật `lastSeen` bằng timestamp của server.

## POST /api/gate/open

Không cần body. Đặt command thành `open`, status tạm thời thành `opening`.

```json
{ "success": true, "command": "open" }
```

## POST /api/gate/close

Không cần body. Đặt command thành `close`, status tạm thời thành `closing`.

```json
{ "success": true, "command": "close" }
```

## GET /api/gate/command

ESP32 poll endpoint này.

```json
{ "command": "open" }
```

Command có thể là `open`, `close` hoặc `none`.

## POST /api/gate/status

ESP32 báo trạng thái sau khi servo thực thi. Giá trị hợp lệ: `open`, `closed`, `opening`, `closing`.

```json
{ "status": "open" }
```

Response:

```json
{ "success": true, "status": "open" }
```

Server reset command về `none` sau request hợp lệ.

## POST /api/system/demo

Endpoint dùng bởi Developer / Demo Panel.

```json
{
  "parking": { "p1": false, "p2": true, "p3": false, "p4": false },
  "gas": 250,
  "vibration": false,
  "esp32Online": true,
  "gateStatus": "closed"
}
```

Response: `{ "success": true }`.

## Lỗi

- `400`: JSON sai cú pháp hoặc dữ liệu không hợp lệ.
- `404`: endpoint API không tồn tại.
- `413`: body vượt giới hạn.
- `500`: lỗi nội bộ; server không trả stack trace cho client.
