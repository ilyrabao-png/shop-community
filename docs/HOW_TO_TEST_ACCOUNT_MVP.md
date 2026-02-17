# How to test – B Market account MVP

## Routes

| Route | Purpose |
|-------|--------|
| `/` | Home; buttons to Shop / Feed |
| `/auth/login` | Login form |
| `/auth/register` | Registration form |
| `/shop` | Category hub + “Hàng mới đăng” + category grid |
| `/shop?category=fruits` | Products in category (e.g. fruits) |
| `/shop/[id]` | Product detail (e.g. `/shop/p1`) |
| `/profile` | Profile (requires login) |
| `/sell` | Create listing (requires login) |
| `/feed` | Feed |

## What to click

1. **Register**
   - Go to `/auth/register` (or click “Đăng ký” from login).
   - Enter email, display name, password (≥6 chars). Submit.
   - You should be logged in and see avatar/menu in navbar.

2. **Logout / Login**
   - Click avatar → “Đăng xuất”. Navbar shows “Đăng nhập”.
   - Go to `/auth/login`, enter same email/password. Submit.
   - Optionally use `?next=/sell` (e.g. `/auth/login?next=/sell`) and confirm redirect after login.

3. **Profile**
   - Logged in: click avatar → “Hồ sơ”, or go to `/profile`.
   - Change display name or avatar URL, click “Lưu thay đổi”. See “Đã lưu.” and session persists after refresh.

4. **Sell a product**
   - Logged in: click avatar → “Đăng bán”, or go to `/sell`.
   - Fill: name, description, category (e.g. Trái cây), price (VND), unit (kg/hộp/bao/cái), quantity.
   - Add tags (type + “Thêm”). Add images (file input; previews; base64 stored in memory).
   - Submit “Đăng bán”. You should see success and redirect to profile. “Sản phẩm đang bán” lists the new product.

5. **Shop**
   - Go to `/shop`. See “Hàng mới đăng” (newest products, including yours) and category cards.
   - Click a category card (e.g. Trái cây) → `/shop?category=fruits`. See products in that category (mock + yours if category matches).
   - Click a product → `/shop/[id]` for detail.

6. **Protected routes**
   - Logout. Open `/profile` or `/sell`. You should be redirected to `/auth/login?next=/profile` or `?next=/sell`. Login and confirm redirect back.

## Notes

- Data is in-memory + localStorage: users/session in localStorage; products in API memory (resets on server restart).
- Images in listings are base64 in memory; they appear in “Hàng mới đăng” and category results.
