# Step 0 — Inspection & Plan

## Current Route Tree (src/app)

```
/
├── layout.tsx (root)
├── page.tsx (home)
├── globals.css
└── (main)/
    ├── layout.tsx
    ├── auth/
    │   ├── login/page.tsx
    │   └── register/page.tsx
    ├── shop/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── feed/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [postId]/page.tsx
    ├── sell/page.tsx
    ├── profile/page.tsx
    ├── cart/page.tsx
    ├── notifications/page.tsx
    └── (future: orders, u/[userId], trending, search, admin)
```

## Existing Models (src/types/models.ts)

- **User**: id, email, displayName, avatarUrl, createdAt, updatedAt
- **AuthUser**: Pick<User, 'id' | 'email' | 'displayName' | 'avatarUrl'>
- **Product**, **ProductVariant**, **Review**, **Post**, **Comment**
- **CartItem**, **Order**, **OrderItem**, **ShippingAddress**
- **Notification**, **NotificationType**
- **OrderStatus** enum

## Existing API Functions (src/services/api.ts)

**Auth**: registerUser, loginUser, getUserById, updateUserProfile

**Products**: searchProducts, getProductById, getMyListings, listProductsByCategory, getNewestProducts, createProductForSeller, deleteProduct

**Reviews**: getReviewsByProduct, addReview

**Community**: getPosts, getPostById, getIsPostLikedByUser, togglePostLike, addComment, deletePost, deleteComment, createPost

**Notifications**: createNotification, listNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead, clearNotification

**Orders**: createOrder

**Tags**: getTagSuggestions, getSuggestionsWithProductIds

## UI Components (src/components/ui)

- Button, Input, Badge
- Card, CardImage, CardBody
- Stars

## Proposed Folder Structure

```
src/features/
├── auth/           # session, AuthGuard, login/register forms
├── shop/           # ProductGrid, ProductDetail, ProductReviews, SellForm, categories
├── cart/           # CartProvider, CartPage, useCart
├── orders/         # OrdersList, OrderDetail, Checkout
├── community/      # FeedPostList, PostDetail, PostComposer
├── notifications/  # NotificationItem, useNotifications
└── admin/          # AdminDashboard, moderation tools
```

Existing features already under `src/features/shop` and `src/features/community`.
