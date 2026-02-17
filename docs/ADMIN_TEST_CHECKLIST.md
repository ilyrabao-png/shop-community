# Admin Dashboard Test Checklist

## Access

- Login as **admin@bmarket.local** / **admin123**
- Navbar shows "Admin" link when logged in as admin
- `/admin` redirects to login if not authenticated
- Non-admin users get "Không có quyền truy cập" when visiting `/admin`

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
