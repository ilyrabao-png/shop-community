/**
 * Ecommerce + Social data models
 * Strict TypeScript, production-ready. No `any`.
 */

// =============================================================================
// Utility types
// =============================================================================

/** Vietnamese Dong amount (integer, no decimals) */
export type MoneyVnd = number;

/** ISO 8601 date string, e.g. "2025-02-15T10:30:00.000Z" */
export type ISODateString = string;

// =============================================================================
// Branded ID types
// =============================================================================

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type VariantId = Brand<string, 'VariantId'>;
export type ReviewId = Brand<string, 'ReviewId'>;
export type PostId = Brand<string, 'PostId'>;
export type CommentId = Brand<string, 'CommentId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type CartItemId = Brand<string, 'CartItemId'>;
export type NotificationId = string;

// =============================================================================
// Order status
// =============================================================================

export enum OrderStatus {
  Draft = 'draft',
  Pending = 'pending',
  Paid = 'paid',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export type OrderStatusEntry = {
  status: OrderStatus;
  at: ISODateString;
};

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  note?: string;
}

// =============================================================================
// Entities
// =============================================================================

export type UserRole = 'user' | 'seller' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'deleted';
export type ContentStatus = 'active' | 'hidden' | 'deleted';

export type ReportTargetType = 'product' | 'post' | 'comment' | 'review' | 'user';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  type: ReportTargetType;
  targetId: string;
  reason: string;
  reporterId: UserId;
  status: ReportStatus;
  resolutionNote?: string;
  resolvedAt?: string;
  createdAt: ISODateString;
}

export type AdminSettings = {
  marketplaceName: string;
  feePercentage: number;
  maxUploadSizeMb: number;
  enableNewPost: boolean;
  enableNewProductListing: boolean;
};

export type SocialLinks = {
  facebook?: string;
  zalo?: string;
  website?: string;
};

export interface User {
  id: UserId;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status?: UserStatus;
  bio?: string;
  location?: string;
  phone?: string;
  socialLinks?: SocialLinks;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Logged-in user; same shape as User for session payload */
export type AuthUser = Pick<User, 'id' | 'email' | 'displayName' | 'avatarUrl' | 'role'>;

/** Convenience: user is admin if role === 'admin' */
export function isAdminUser(user: AuthUser | null): boolean {
  return user?.role === 'admin';
}

/** Public profile (no email) */
export type PublicUser = Pick<
  User,
  'id' | 'displayName' | 'avatarUrl' | 'bio' | 'location' | 'phone' | 'socialLinks' | 'createdAt'
>;

export interface ProductVariant {
  id: VariantId;
  sku?: string;
  /** e.g. "Blue", "M", "Large" */
  name: string;
  /** e.g. { size: "M", color: "Blue" } */
  attributes?: Record<string, string>;
  unitPrice: MoneyVnd;
  stock: number;
}

/**
 * Product embeds variants for frontend.
 * Cleaner than id list: single fetch, no N+1, simpler state.
 * Variants are needed when rendering product detail (price, options).
 */
export interface Product {
  id: ProductId;
  name: string;
  description: string;
  imageUrls: string[];
  variants: ProductVariant[];
  category?: string;
  tags?: string[];
  /** Seller listing unit: kg, box, bag, item */
  unit?: string;
  avgRating?: number;
  reviewCount?: number;
  sellerId?: UserId;
  status?: ContentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Review {
  id: ReviewId;
  productId: ProductId;
  userId: UserId;
  rating: number;
  title?: string;
  body?: string;
  status?: ContentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ProductTag {
  productId: ProductId;
  variantId?: VariantId;
}

export interface Post {
  id: PostId;
  userId: UserId;
  content: string;
  imageUrls?: string[];
  productTags?: ProductTag[];
  productIds?: ProductId[];
  likeCount: number;
  commentCount: number;
  likedByMe?: boolean;
  status?: ContentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Comment {
  id: CommentId;
  postId: PostId;
  userId: UserId;
  content: string;
  /** Optional parent for nested replies */
  parentId?: CommentId;
  status?: ContentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CartItem {
  id: CartItemId;
  userId: UserId;
  variantId: VariantId;
  productId: ProductId;
  quantity: number;
  addedAt: ISODateString;
}

export interface OrderItem {
  variantId: VariantId;
  productId: ProductId;
  /** Snapshot at order time; immutable */
  productName: string;
  variantName: string;
  sku?: string;
  unitPrice: MoneyVnd;
  quantity: number;
}

export type NotificationType =
  | 'POST_LIKED'
  | 'POST_COMMENTED'
  | 'PRODUCT_REVIEWED';

export interface Notification {
  id: NotificationId;
  userId: UserId;
  actorId: UserId;
  type: NotificationType;
  createdAt: string;
  readAt: string | null;
  postId?: PostId;
  productId?: ProductId;
  commentId?: CommentId;
  title: string;
  body: string;
}

export interface Order {
  id: OrderId;
  userId: UserId;
  items: OrderItem[];
  subtotal: MoneyVnd;
  shippingFee?: MoneyVnd;
  total: MoneyVnd;
  status: OrderStatus;
  statusHistory?: OrderStatusEntry[];
  shippingAddress?: ShippingAddress;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
