# Admin Dashboard Test Checklist

## Access & auth separation

- **User login** (`/auth/login`): heading "Đăng nhập", subtitle "Đăng nhập để mua bán và quản lý tài khoản". No mention of admin.
- **Admin login** (`/admin/login`): heading "ADMIN – Đăng nhập", visible "Admin" badge. For admins only; non-admin users see "Không có quyền truy cập" after submitting.
- Visiting **/admin** (or any /admin/*) while **logged out** → redirects to **/admin/login** (not /auth/login).
- Visiting **/sell** or **/feed/new** while **logged out** → redirects to **/auth/login**.
- Navbar "Đăng nhập" always goes to `/auth/login`. Admin link (to `/admin`) only visible when current user is admin. No /admin/login link in navbar.
- Login as **admin@bmarket.local** / **admin123** on `/admin/login` to access dashboard.
- Non-admin users visiting `/admin` get "Không có quyền truy cập" with link to home.

## User persistence & storage

- **localStorage theo domain**: localhost ≠ server IP. Xem [docs/AUTH_STORAGE.md](AUTH_STORAGE.md).
- Đăng ký user mới → đăng nhập lại sau refresh → vẫn còn.
- Admin seeding không xóa users có sẵn.
- User không tìm thấy: "Tài khoản chưa tồn tại trên thiết bị/đường dẫn hiện tại. Vui lòng đăng ký lại hoặc import dữ liệu."
- `/dev/storage` (dev only): Export/Import users để phục hồi khi đổi domain.

## Dashboard (`/admin`)

- Summary cards: Total users, products, posts, reviews, open reports count
- Recent activity list (last 10 items)
- Links to each management section work

## Users (`/admin/users`)

- Table: avatar, displayName, email, isAdmin badge, status, createdAt
- Search/filter: by name/email, status (active/suspended/deleted), admin (yes/no)
- View user: link to `/u/[id]`
- Toggle admin: "Làm admin" / "Bỏ admin" (only if current user is admin)
- Suspend/unsuspend: "Khóa" / "Mở khóa"
- Reset avatar: "Xóa avatar"
- Delete: soft delete (status=deleted)
- Changes persist after refresh

## Products (`/admin/products`)

- Table: image, name, category, seller, price, avgRating, status
- Filters: category, status (active/hidden/deleted)
- View product: link to `/shop/[id]`
- Hide/unhide product
- Soft delete product
- Edit product modal: name, category, tags (with suggestions)
- Hide product → product disappears from `/shop`
- Changes persist after refresh

## Posts (`/admin/posts`)

- Table: author, content snippet, likes, comments, status
- Filters: author, status
- View post: link to `/feed/[postId]`
- Hide/unhide post
- Delete post (admin override)
- "Bình luận" opens modal with comments; can hide individual comments
- Hide post → post disappears from `/feed`
- Changes persist after refresh

## Reviews (`/admin/reviews`)

- Table: product, reviewer, rating, body snippet, status
- Filters: status, min rating
- View product: link to `/shop/[productId]`
- Hide/unhide review
- Delete review (admin override)
- Hide review → review removed from product detail reviews list
- Changes persist after refresh

## Reports (`/admin/reports`)

- Moderation queue: list of reports (product, post, comment, review, user)
- Seed reports: at least 2 demo reports when empty
- Resolve: status → resolved, optional resolution note, optional "Ẩn nội dung"
- Dismiss: status → dismissed
- When resolved with "hide target": target item is hidden
- Changes persist after refresh

## Settings (`/admin/settings`)

- Marketplace name (default: "B Market")
- Fee percentage (0–100)
- Max upload size (MB)
- Enable/disable new post creation
- Enable/disable new product listing
- Save persists to localStorage
- When posting disabled: `/feed/new` shows "Đăng bài mới đang tạm khóa"; "Tạo bài đăng mới" button hidden on `/feed`
- When listing disabled: `/sell` shows "Đăng bán sản phẩm mới đang tạm khóa"

## Dev Toggle

- Top bar "Chuyển user (dev)" dropdown: switch to another user for testing
- "Xóa override" clears override and restores session user
