# Test Checklist

## Demo Accounts (Step 1)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bmarket.local | admin123 |
| Seller | seller@bmarket.local | seller123 |
| User | demo@bmarket.local | demo123 |

(Seed runs on first login/register if no users exist.)

## Routes & Expected Behavior

| URL | Expected |
|-----|----------|
| `/shop` | Category hub, search bar, "Hàng mới đăng" grid with product cards (name, min price, category badge, tags, stars with avgRating + reviewCount), category cards. Empty state: "Chưa có sản phẩm nào" |
| `/shop/[id]` | Product detail: gallery, name, category, stars, price range, variants, tags, add-to-cart stub, reviews list, review form (login required). Delete product button only for owner |
| `/feed` | Post list; new post visible after create; delete button only on own posts; "Chưa có bài đăng nào" when empty |
| `/feed/new` | Post composer (login required): content, images, tag autocomplete. Submit → redirect to /feed with new post at top |
| `/feed/[postId]` | Post detail, comments; delete post/comment only if current user is owner |
| `/auth/login` | Login form; redirect to next or / on success |
| `/auth/register` | Register form; auto-login and redirect to / on success |
| `/orders` | My orders (placeholder); requires login |
| `/profile` | Profile settings: displayName, bio, location, phone, social links (facebook/zalo/website), avatar upload (PNG/JPG/WebP ≤2MB), preview, remove. Save persists to localStorage; refresh page keeps avatar |
| `/u/[userId]` | Public profile: header (avatar, displayName, bio, join date), tabs "Bán hàng" (products), "Bài viết" (posts), "Đánh giá" (reviews on their products), Follow/Unfollow, follower/following counts. Own profile shows "Chỉnh sửa hồ sơ" → /profile. Invalid userId → "Không tìm thấy" |

## Profile & Avatar

1. **Profile settings** (`/profile`): Change displayName, bio, location, phone, social links; upload avatar (file picker, ≤2MB, png/jpg/webp); preview shows instantly; "Xóa" removes avatar (fallback to initials). Submit "Lưu thay đổi" → "Đã lưu."; refresh page → avatar and fields persist.
2. **Avatar validation**: Try upload >2MB or wrong type → friendly error shown.

## Public Profile & Navigation

1. **Public profile** (`/u/<userId>`): From Feed or Shop, click avatar or user name → navigates to `/u/[userId]`. Page shows header, tabs (Products/Posts/Reviews), Follow/Unfollow.
2. **Feed**: Click avatar or name on post card → `/u/[postUserId]`.
3. **Shop product detail**: Seller section with avatar + "Xem hồ sơ" → `/u/[sellerId]`.
4. **Reviews list**: Reviewer name/avatar links to `/u/[reviewerId]`.
5. **Follow/Unfollow**: On another user's profile, click "Theo dõi" → count updates; click "Đã theo dõi" → unfollow, count updates. Not logged in → redirect to login.

## Test Flow

1. **Register/Login**: Create account at `/auth/register`, then login at `/auth/login`.
2. **Product detail**: Go to `/shop`, click any product → `/shop/[id]` → see gallery, stars, reviews section, review form.
3. **Add review**: On product page (logged in), rate 1–5 stars, enter text, submit → new review appears immediately; product stars/count update.
4. **Create product**: Go to `/sell`, fill form, add images → submit → product appears in shop with stars (0) and (0) reviews.
5. **Create post**: Go to `/feed/new`, add content/images, submit → redirect to `/feed` with new post at top.
6. **Delete post**: On `/feed`, find your post, click "Xóa" → post disappears.
7. **Delete comment**: On post detail, find your comment, click "Xóa" → comment disappears.
8. **Delete product**: On product detail (own product), click "Xóa sản phẩm" → redirect to shop.
