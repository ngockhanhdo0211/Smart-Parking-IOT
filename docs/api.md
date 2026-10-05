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
  "gate": {
    "in": { "status": "closed", "command": "none" },
    "out": { "status": "closed", "command": "none" }
  },
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

## POST /api/gate/in/open

Không cần body. Đặt riêng command cổng vào thành `open`, status tạm thời thành `opening`.

```json
{ "success": true, "gate": "in", "command": "open" }
```

## POST /api/gate/in/close

Không cần body. Đặt riêng command cổng vào thành `close`, status tạm thời thành `closing`.

```json
{ "success": true, "gate": "in", "command": "close" }
```

Hai endpoint cũ `POST /api/gate/open` và `POST /api/gate/close` vẫn hoạt động như alias cho cổng vào.

## POST /api/gate/out/open

Không cần body. Đặt riêng command cổng ra thành `open`.

```json
{ "success": true, "gate": "out", "command": "open" }
```

## POST /api/gate/out/close

Không cần body. Đặt riêng command cổng ra thành `close`.

```json
{ "success": true, "gate": "out", "command": "close" }
```

## GET /api/gate/command

ESP32 poll endpoint này.

```json
{
  "gate": "in",
  "command": "open",
  "commands": {
    "in": "open",
    "out": "none"
  }
}
```

`gate` là `in`, `out` hoặc `null`; `command` là lệnh ưu tiên tiếp theo. `commands` luôn chứa lệnh hiện tại của cả hai cổng, cho phép ESP32 xử lý hai lệnh độc lập. Nếu không có lệnh, response là `{"gate":null,"command":"none","commands":{"in":"none","out":"none"}}`.

## POST /api/gate/status

ESP32 báo trạng thái sau khi servo thực thi. Giá trị hợp lệ: `open`, `closed`, `opening`, `closing`.

```json
{ "gate": "in", "status": "open" }
```

Response:

```json
{ "success": true, "gate": "in", "status": "open" }
```

`gate` phải là `in` hoặc `out`. Server chỉ reset command của đúng cổng đó về `none`. Body cũ chỉ có `status` vẫn được hiểu là cổng vào.

## POST /api/system/demo

Endpoint dùng bởi Developer / Demo Panel.

```json
{
  "parking": { "p1": false, "p2": true, "p3": false, "p4": false },
  "gas": 250,
  "vibration": false,
  "esp32Online": true,
  "gateInStatus": "closed",
  "gateOutStatus": "closed"
}
```

Response: `{ "success": true }`.

## Lỗi

- `400`: JSON sai cú pháp hoặc dữ liệu không hợp lệ.
- `404`: endpoint API không tồn tại.
- `413`: body vượt giới hạn.
- `500`: lỗi nội bộ; server không trả stack trace cho client.
