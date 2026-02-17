# Auth & Storage (localStorage)

## localStorage là theo domain

Dữ liệu (users, session, avatar) được lưu trong **localStorage** của trình duyệt. localStorage **phân tách theo origin** (protocol + host + port):

- `http://localhost:3000` ≠ `http://192.168.1.5:3000` ≠ `https://your-domain.com`
- Khi chuyển từ localhost sang server IP hoặc domain mới, dữ liệu cũ **không có sẵn**.

## Keys (v2)

| Key | Mô tả |
|-----|-------|
| `bmarket:v2:users` | Danh sách users (JSON array) |
| `bmarket:v2:session` | Session hiện tại (AuthUser) |
| `bmarket:v2:currentUserId` | ID user hiện tại (dev) |
| `bmarket:user:{id}` | Profile mở rộng (avatar, bio, …) |

## Migration

Khi load lần đầu, `migrateStorageIfNeeded()` tự động chép dữ liệu từ keys cũ sang v2:

- `bmarket_users` / `users` → `bmarket:v2:users`
- `bmarket_session` / `session` → `bmarket:v2:session`
- `bmarket:currentUserId` → `bmarket:v2:currentUserId`

Keys cũ **không bị xóa** (để phục hồi nếu cần).

## Import / Phục hồi users

### Cách 1: Dev tool (chỉ khi `NODE_ENV !== 'production'`)

1. Mở `/dev/storage`
2. Trên máy cũ (localhost): **Export users** → copy JSON vào clipboard
3. Trên máy mới (server IP): **Import users** → dán JSON → Import (merge)
4. **Refresh trang** để API load lại users

### Cách 2: Console

```js
// Export
copy(JSON.stringify(JSON.parse(localStorage.getItem('bmarket:v2:users') || '[]'), null, 2))

// Import (dán vào sau khi có JSON)
const data = [ /* paste JSON here */ ];
localStorage.setItem('bmarket:v2:users', JSON.stringify(data));
location.reload();
```

## Admin seeding

- Admin/seller/demo chỉ được **thêm** khi chưa tồn tại (theo email)
- **Không bao giờ** ghi đè hoặc xóa users có sẵn
- Seeding chạy mỗi lần load app (idempotent)

## Đăng nhập user vs admin

| Trang | Dùng cho |
|-------|----------|
| `/auth/login` | User thường (mua bán, quản lý tài khoản) |
| `/admin/login` | Admin (quản trị) |

Cả hai dùng chung danh sách users; admin login chỉ chấp nhận user có `role === 'admin'`.
