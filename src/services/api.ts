/**
 * In-memory API with localStorage persistence (client-only).
 * No demo/mock data. Users, products, posts are created by logged-in users only.
 */

import type {
  Product,
  ProductId,
  ProductVariant,
  VariantId,
  Post,
  PostId,
  Comment,
  CommentId,
  UserId,
  Order,
  OrderId,
  OrderItem,
  OrderStatus,
  ShippingAddress,
  ISODateString,
  Review,
  ReviewId,
  CartItem,
  CartItemId,
  AuthUser,
  PublicUser,
  UserRole,
  UserStatus,
  SocialLinks,
  ContentStatus,
  Notification,
  NotificationId,
  NotificationType,
  Report,
  ReportTargetType,
  ReportStatus,
  AdminSettings,
} from '../types/models';
import { OrderStatus as OrderStatusEnum } from '../types/models';

const asOrderId = (id: string): OrderId => id as OrderId;
const asCartItemId = (id: string): CartItemId => id as CartItemId;
const asCommentId = (id: string): CommentId => id as CommentId;
const asProductId = (id: string): ProductId => id as ProductId;
const asVariantId = (id: string): VariantId => id as VariantId;
const asReviewId = (id: string): ReviewId => id as ReviewId;
const asPostId = (id: string): PostId => id as PostId;
const asUserId = (id: string): UserId => id as UserId;

const KEY = 'bmarket_';

// Storage helpers for robust per-user persistence (v2 keys)
import {
  getUsers as storageGetUsers,
  saveUsers as storageSaveUsers,
  upsertUser as storageUpsertUser,
  migrateStorageIfNeeded,
  loadUser as storageLoadUser,
  saveUser as storageSaveUser,
  loadCurrentUserId,
  saveCurrentUserId,
  clearCurrentUserId,
} from './storage';

export interface StoredUser extends AuthUser {
  role: UserRole;
  password: string;
  status?: UserStatus;
  bio?: string;
  location?: string;
  phone?: string;
  socialLinks?: SocialLinks;
  createdAt: string;
  updatedAt: string;
}

function load<T>(k: string, def: T): T {
  if (typeof window === 'undefined') return def;
  try {
    const raw = localStorage.getItem(KEY + k);
    return (raw ? JSON.parse(raw) : def) as T;
  } catch {
    return def;
  }
}

function save<K extends string>(k: K, val: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY + k, JSON.stringify(val));
  } catch {
    // ignore
  }
}

// In-memory users (v2 storage - never overwrite entire list when seeding)
migrateStorageIfNeeded();
let users: StoredUser[] = (typeof window !== 'undefined' ? storageGetUsers() : []) as StoredUser[];

let products: Product[] = load('products', []);
let posts: Post[] = load('posts', []);
let comments: Comment[] = load('comments', []);
let reviews: Review[] = load('reviews', []);
type LikeEntry = { postId: string; userId: string };
const likeEntries: LikeEntry[] = load('postLikes', []);
const postLikes = new Map<string, Set<string>>();
for (const e of likeEntries) {
  let set = postLikes.get(e.postId);
  if (!set) {
    set = new Set<string>();
    postLikes.set(e.postId, set);
  }
  set.add(e.userId);
}
type FollowEntry = { followerId: string; followingId: string };
const followEntries: FollowEntry[] = load('follows', []);
const followMap = new Map<string, Set<string>>();
for (const e of followEntries) {
  let set = followMap.get(e.followerId);
  if (!set) {
    set = new Set<string>();
    followMap.set(e.followerId, set);
  }
  set.add(e.followingId);
}
let reports: Report[] = load('reports', []);

export type Counters = {
  orderCounter: number;
  commentCounter: number;
  productCounter: number;
  variantCounter: number;
  reviewCounter: number;
  postCounter: number;
  userCounter: number;
};

function loadCounters(): Counters {
  return {
    orderCounter: load('orderCounter', 1),
    commentCounter: Math.max(comments.length + 1, load('commentCounter', 1)),
    productCounter: Math.max(products.length + 1, load('productCounter', 1)),
    variantCounter: load('variantCounter', 1000),
    reviewCounter: Math.max(reviews.length + 1, load('reviewCounter', 1)),
    postCounter: Math.max(posts.length + 1, load('postCounter', 100)),
    userCounter: Math.max(users.length + 1, load('userCounter', 1)),
  };
}

function saveCounters(c: Counters): void {
  save('orderCounter', c.orderCounter);
  save('commentCounter', c.commentCounter);
  save('productCounter', c.productCounter);
  save('variantCounter', c.variantCounter);
  save('reviewCounter', c.reviewCounter);
  save('postCounter', c.postCounter);
  save('userCounter', c.userCounter);
}

let orderCounter: number;
let commentCounter: number;
let productCounter: number;
let variantCounter: number;
let reviewCounter: number;
let postCounter: number;
let userCounter: number;
(function initCounters() {
  const c = loadCounters();
  orderCounter = c.orderCounter;
  commentCounter = c.commentCounter;
  productCounter = c.productCounter;
  variantCounter = c.variantCounter;
  reviewCounter = c.reviewCounter;
  postCounter = c.postCounter;
  userCounter = c.userCounter;
})();

function persistCounters(): void {
  saveCounters({
    orderCounter,
    commentCounter,
    productCounter,
    reviewCounter,
    postCounter,
    userCounter,
    variantCounter,
  });
}

// Hydrate per-user profile from storage (avatar, bio, etc) - single source of truth
function hydrateUserProfiles(): void {
  if (typeof window === 'undefined') return;
  for (const u of users) {
    const stored = storageLoadUser(u.id);
    if (!stored) continue;
    if (stored.avatarUrl !== undefined) u.avatarUrl = stored.avatarUrl;
    if (stored.bio !== undefined) u.bio = stored.bio;
    if (stored.location !== undefined) u.location = stored.location;
    if (stored.phone !== undefined) u.phone = stored.phone;
    if (stored.socialLinks !== undefined) u.socialLinks = stored.socialLinks;
    if (stored.displayName !== undefined) u.displayName = stored.displayName;
  }
}
hydrateUserProfiles();
seedAdminAndDemoIfNeeded();

/** Seed admin/demo users only if missing. NEVER overwrite existing users. */
function persistUserToStorage(u: StoredUser): void {
  if (typeof window === 'undefined') return;
  const profile = {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    role: u.role,
    bio: u.bio,
    location: u.location,
    phone: u.phone,
    socialLinks: u.socialLinks,
  };
  storageSaveUser(profile);
}

// Migrate existing users: ensure role exists
for (const u of users) {
  if (!('role' in u) || !u.role) {
    (u as StoredUser & { role?: UserRole }).role = 'user';
  }
}

/** Seed admin/demo users only if missing. NEVER overwrite existing users. */
function seedAdminAndDemoIfNeeded(): void {
  if (typeof window === 'undefined') return;
  const now = new Date().toISOString();
  const seeds: Array<{ id: UserId; email: string; displayName: string; role: UserRole; password: string }> = [
    { id: asUserId('u-admin'), email: 'admin@bmarket.local', displayName: 'Admin', role: 'admin', password: 'admin123' },
    { id: asUserId('u-seller'), email: 'seller@bmarket.local', displayName: 'Người bán', role: 'seller', password: 'seller123' },
    { id: asUserId('u-demo'), email: 'demo@bmarket.local', displayName: 'Người dùng demo', role: 'user', password: 'demo123' },
  ];
  for (const s of seeds) {
    const exists = users.some((u) => u.email.toLowerCase() === s.email.toLowerCase());
    if (!exists) {
      const full: StoredUser = {
        ...s,
        avatarUrl: undefined,
        createdAt: now,
        updatedAt: now,
      };
      storageUpsertUser(full);
    }
  }
  users = storageGetUsers() as StoredUser[];
  const c = loadCounters();
  c.userCounter = Math.max(c.userCounter ?? 1, users.length + 1);
  saveCounters(c);
  userCounter = c.userCounter;
}

function savePostLikes(): void {
  const entries: LikeEntry[] = [];
  postLikes.forEach((set, postId) => {
    set.forEach((userId) => entries.push({ postId, userId }));
  });
  save('postLikes', entries);
}

function saveFollows(): void {
  const entries: FollowEntry[] = [];
  followMap.forEach((set, followerId) => {
    set.forEach((followingId) => entries.push({ followerId, followingId }));
  });
  save('follows', entries);
}

// Admin settings
const defaultAdminSettings: AdminSettings = {
  marketplaceName: 'B Market',
  feePercentage: 0,
  maxUploadSizeMb: 2,
  enableNewPost: true,
  enableNewProductListing: true,
};
let adminSettings: AdminSettings = load('adminSettings', defaultAdminSettings);

// Dev: override current user for admin testing (stored in sessionStorage)
const ADMIN_OVERRIDE_KEY = 'bmarket_adminOverride';

export function getAdminOverrideUserId(): UserId | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_OVERRIDE_KEY);
    return raw ? (raw as UserId) : null;
  } catch {
    return null;
  }
}

export function setAdminOverrideUserId(userId: UserId | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (userId) sessionStorage.setItem(ADMIN_OVERRIDE_KEY, userId);
    else sessionStorage.removeItem(ADMIN_OVERRIDE_KEY);
  } catch {
    // ignore
  }
}

let notifications: Notification[] = [];
let notificationCounter = 0;

// =============================================================================
// Auth (called from client; uses in-memory users + localStorage)
// =============================================================================

export function registerUser(
  email: string,
  password: string,
  displayName: string
): { ok: true; user: AuthUser } | { ok: false; error: string } {
  const trimmed = displayName.trim();
  if (!trimmed) return { ok: false, error: 'Vui lòng nhập tên hiển thị.' };
  if (password.length < 6) return { ok: false, error: 'Mật khẩu tối thiểu 6 ký tự.' };
  const normalized = email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    return { ok: false, error: 'Email đã được đăng ký.' };
  }
  const now = new Date().toISOString();
  const id = asUserId(`u-${userCounter++}`);
  const newUser: StoredUser = {
    id,
    email: normalized,
    displayName: trimmed,
    avatarUrl: undefined,
    role: 'user',
    password,
    createdAt: now,
    updatedAt: now,
  };
  storageUpsertUser(newUser);
  users = storageGetUsers() as StoredUser[];
  persistCounters();
  return {
    ok: true,
    user: { id: newUser.id, email: newUser.email, displayName: newUser.displayName, avatarUrl: newUser.avatarUrl, role: newUser.role },
  };
}

export function loginUser(
  email: string,
  password: string
): { ok: true; user: AuthUser } | { ok: false; error: string } {
  seedAdminAndDemoIfNeeded();
  const normalized = email.trim().toLowerCase();
  const u = users.find((x) => x.email.toLowerCase() === normalized);
  if (!u)
    return {
      ok: false,
      error:
        'Tài khoản chưa tồn tại trên thiết bị/đường dẫn hiện tại. Vui lòng đăng ký lại hoặc import dữ liệu.',
    };
  if (u.password !== password) return { ok: false, error: 'Mật khẩu không đúng.' };
  const status = u.status ?? 'active';
  if (status === 'deleted') return { ok: false, error: 'Tài khoản đã bị xóa.' };
  if (status === 'suspended') return { ok: false, error: 'Tài khoản đã bị khóa.' };
  return {
    ok: true,
    user: { id: u.id, email: u.email, displayName: u.displayName, avatarUrl: u.avatarUrl, role: u.role },
  };
}

export function getCurrentUser(userId: UserId | null): AuthUser | null {
  if (!userId) return null;
  // Dev override: if sessionStorage has override, use that userId (client-only)
  if (typeof window !== 'undefined') {
    const override = getAdminOverrideUserId();
    if (override) userId = override;
  }
  const u = users.find((x) => x.id === userId);
  if (!u) return null;
  const status = u.status ?? 'active';
  if (status === 'deleted') return null;
  return { id: u.id, email: u.email, displayName: u.displayName, avatarUrl: u.avatarUrl, role: u.role };
}

export function isAdmin(userId: UserId | null): boolean {
  const u = getCurrentUser(userId);
  return u?.role === 'admin';
}

export function getUserById(userId: UserId): AuthUser | null {
  const u = users.find((x) => x.id === userId);
  if (!u || !isUserVisible(u)) return null;
  return { id: u.id, email: u.email, displayName: u.displayName, avatarUrl: u.avatarUrl, role: u.role };
}

export type UpdateUserProfilePayload = {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  phone?: string;
  socialLinks?: SocialLinks;
};

export function updateUserProfile(
  userId: UserId,
  updates: UpdateUserProfilePayload
): AuthUser | null {
  const u = users.find((x) => x.id === userId);
  if (!u) return null;
  if (updates.displayName !== undefined) u.displayName = updates.displayName.trim();
  if (updates.avatarUrl !== undefined) u.avatarUrl = updates.avatarUrl || undefined;
  if (updates.bio !== undefined) u.bio = updates.bio.trim() || undefined;
  if (updates.location !== undefined) u.location = updates.location.trim() || undefined;
  if (updates.phone !== undefined) u.phone = updates.phone.trim() || undefined;
  if (updates.socialLinks !== undefined) u.socialLinks = updates.socialLinks;
  u.updatedAt = new Date().toISOString();
  storageSaveUsers(users);
  persistUserToStorage(u);
  return { id: u.id, email: u.email, displayName: u.displayName, avatarUrl: u.avatarUrl, role: u.role };
}

export function updateUserAvatar(userId: UserId, dataUrl: string | null): AuthUser | null {
  const u = users.find((x) => x.id === userId);
  if (!u) return null;
  u.avatarUrl = dataUrl || undefined;
  u.updatedAt = new Date().toISOString();
  storageSaveUsers(users);
  persistUserToStorage(u);
  return { id: u.id, email: u.email, displayName: u.displayName, avatarUrl: u.avatarUrl, role: u.role };
}

export function getPublicUserById(userId: UserId): PublicUser | null {
  const u = users.find((x) => x.id === userId);
  if (!u || !isUserVisible(u)) return null;
  return {
    id: u.id,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    location: u.location,
    phone: u.phone,
    socialLinks: u.socialLinks,
    createdAt: u.createdAt,
  };
}

export function followUser(followerId: UserId, targetUserId: UserId): void {
  if (followerId === targetUserId) return;
  const fid = String(followerId);
  let set = followMap.get(fid);
  if (!set) {
    set = new Set<string>();
    followMap.set(fid, set);
  }
  set.add(String(targetUserId));
  saveFollows();
}

export function unfollowUser(followerId: UserId, targetUserId: UserId): void {
  const set = followMap.get(String(followerId));
  if (set) {
    set.delete(String(targetUserId));
    saveFollows();
  }
}

export function getFollowers(userId: UserId): UserId[] {
  const uid = String(userId);
  const result: UserId[] = [];
  followMap.forEach((set, followerId) => {
    if (set.has(uid)) result.push(followerId as UserId);
  });
  return result;
}

export function getFollowing(userId: UserId): UserId[] {
  const set = followMap.get(String(userId));
  return set ? Array.from(set).map((id) => id as UserId) : [];
}

export function isFollowing(followerId: UserId, targetUserId: UserId): boolean {
  return followMap.get(String(followerId))?.has(String(targetUserId)) ?? false;
}

export async function listProductsByUser(userId: UserId): Promise<Product[]> {
  await randomDelay();
  return products.filter((p) => p.sellerId === userId && isContentVisible(p));
}

export async function listPostsByUser(userId: UserId): Promise<Post[]> {
  await randomDelay();
  return posts.filter((p) => p.userId === userId && isContentVisible(p));
}

/** Reviews received on products sold by this user (for seller profile) */
export async function getReviewsForProductsByUser(sellerId: UserId): Promise<Review[]> {
  await randomDelay();
  const productIds = products.filter((p) => p.sellerId === sellerId).map((p) => p.id);
  return reviews.filter((r) => productIds.includes(r.productId) && isContentVisible(r));
}

// =============================================================================
// Utilities
// =============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  return delay(100 + Math.floor(Math.random() * 150));
}

function safeNotFound(resource: string, id: string): never {
  throw new Error(`${resource} not found: ${id}`);
}

function isContentVisible<T extends { status?: ContentStatus }>(item: T): boolean {
  const s = item.status ?? 'active';
  return s === 'active';
}

function isUserVisible(u: StoredUser): boolean {
  const s = u.status ?? 'active';
  return s !== 'deleted';
}

// =============================================================================
// Products
// =============================================================================

export type SearchProductsParams = {
  q?: string;
  category?: string;
  sort?: 'priceAsc' | 'priceDesc' | 'ratingDesc';
};

function getMinVariantPrice(p: Product): number {
  return Math.min(...p.variants.map((v) => v.unitPrice));
}

export async function searchProducts(
  params: SearchProductsParams = {}
): Promise<Product[]> {
  await randomDelay();
  let result = products.filter(isContentVisible);
  if (params.category) {
    result = result.filter((p) => p.category?.toLowerCase() === params.category!.toLowerCase());
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }
  switch (params.sort) {
    case 'priceAsc':
      result.sort((a, b) => getMinVariantPrice(a) - getMinVariantPrice(b));
      break;
    case 'priceDesc':
      result.sort((a, b) => getMinVariantPrice(b) - getMinVariantPrice(a));
      break;
    case 'ratingDesc':
      result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
      break;
  }
  return result;
}

export async function getProductById(id: ProductId): Promise<Product | null> {
  await randomDelay();
  const p = products.find((x) => x.id === id);
  return p && isContentVisible(p) ? p : null;
}

export async function getMyListings(userId: UserId): Promise<Product[]> {
  await randomDelay();
  return products.filter((p) => p.sellerId === userId && isContentVisible(p));
}

export async function listProductsByCategory(category: string): Promise<Product[]> {
  await randomDelay();
  return products.filter(
    (p) => isContentVisible(p) && p.category?.toLowerCase() === category.toLowerCase()
  );
}

export async function getNewestProducts(limit: number = 8): Promise<Product[]> {
  await randomDelay();
  return [...products]
    .filter(isContentVisible)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export type CreateProductForSellerParams = {
  userId: UserId;
  name: string;
  description: string;
  imageUrls: string[];
  category: string;
  tags: string[];
  unit: string;
  unitPrice: number;
  stock: number;
};

export async function createProductForSeller(params: CreateProductForSellerParams): Promise<Product> {
  await randomDelay();
  if (!getAdminSettings().enableNewProductListing) {
    throw new Error('Đăng bán sản phẩm mới đang tạm khóa.');
  }
  if (!users.some((u) => u.id === params.userId)) {
    throw new Error('User not found. Must be logged in.');
  }
  const now = new Date().toISOString() as ISODateString;
  const productId = asProductId(`p-${productCounter++}`);
  const variantId = asVariantId(`v-${variantCounter++}`);
  const variant: ProductVariant = {
    id: variantId,
    name: params.unit,
    attributes: { unit: params.unit },
    unitPrice: params.unitPrice,
    stock: params.stock,
  };
  const product: Product = {
    id: productId,
    name: params.name,
    description: params.description,
    imageUrls: params.imageUrls.length ? params.imageUrls : [],
    variants: [variant],
    category: params.category,
    tags: params.tags,
    unit: params.unit,
    sellerId: params.userId,
    avgRating: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  products.push(product);
  save('products', products);
  persistCounters();
  return product;
}

export async function deleteProduct(productId: ProductId, userId: UserId): Promise<void> {
  await randomDelay();
  const p = products.find((x) => x.id === productId);
  if (!p) safeNotFound('Product', productId);
  if (p.sellerId !== userId) throw new Error('Not authorized to delete this product');
  const idx = products.indexOf(p);
  products.splice(idx, 1);
  const toRemove = reviews.filter((r) => r.productId === productId);
  for (const r of toRemove) {
    const ri = reviews.indexOf(r);
    if (ri >= 0) reviews.splice(ri, 1);
  }
  save('products', products);
  save('reviews', reviews);
}

// =============================================================================
// Reviews
// =============================================================================

export async function getReviewsByProduct(productId: ProductId): Promise<Review[]> {
  await randomDelay();
  return reviews.filter((r) => r.productId === productId && isContentVisible(r));
}

export type AddReviewParams = {
  productId: ProductId;
  userId: UserId;
  rating: number;
  body?: string;
};

function recomputeProductRating(product: Product): void {
  const productReviews = reviews.filter(
    (r) => r.productId === product.id && isContentVisible(r)
  );
  const n = productReviews.length;
  if (n === 0) {
    product.avgRating = 0;
    product.reviewCount = 0;
    return;
  }
  const sum = productReviews.reduce((a, r) => a + r.rating, 0);
  product.avgRating = Math.round((sum / n) * 10) / 10;
  product.reviewCount = n;
}

export async function addReview(params: AddReviewParams): Promise<Review> {
  await randomDelay();
  const now = new Date().toISOString() as ISODateString;
  const rating = Math.min(5, Math.max(1, Math.round(params.rating)));
  const review: Review = {
    id: asReviewId(`r-${reviewCounter++}`),
    productId: params.productId,
    userId: params.userId,
    rating,
    body: params.body?.trim(),
    createdAt: now,
    updatedAt: now,
  };
  reviews.push(review);
  const product = products.find((p) => p.id === params.productId);
  if (product) {
    recomputeProductRating(product);
    if (product.sellerId && product.sellerId !== params.userId) {
      const actor = users.find((u) => u.id === params.userId);
      const actorName = actor?.displayName ?? 'Someone';
      createNotification({
        userId: product.sellerId,
        actorId: params.userId,
        type: 'PRODUCT_REVIEWED',
        productId: params.productId,
        title: 'New review',
        body: `${actorName} reviewed your product: ${product.name} (${rating}★)`,
      });
    }
  }
  save('reviews', reviews);
  save('products', products);
  persistCounters();
  return review;
}

// =============================================================================
// Tag suggestions
// =============================================================================

export function getTagSuggestions(): { tags: string[]; categories: string[] } {
  const tagSet = new Set<string>();
  const categorySet = new Set<string>();
  for (const p of products) {
    if (p.category) categorySet.add(p.category);
    for (const t of p.tags ?? []) tagSet.add(t);
  }
  return { tags: [...tagSet].sort(), categories: [...categorySet].sort() };
}

export type SuggestionItem = { type: 'tag' | 'category'; value: string; productIds: ProductId[] };

export function getSuggestionsWithProductIds(): SuggestionItem[] {
  const items: SuggestionItem[] = [];
  const seen = new Set<string>();
  for (const p of products) {
    for (const t of p.tags ?? []) {
      if (!seen.has(`tag:${t}`)) {
        seen.add(`tag:${t}`);
        const ids = products.filter((x) => x.tags?.includes(t)).map((x) => x.id);
        items.push({ type: 'tag', value: t, productIds: ids });
      }
    }
    if (p.category && !seen.has(`cat:${p.category}`)) {
      seen.add(`cat:${p.category}`);
      const ids = products.filter((x) => x.category === p.category).map((x) => x.id);
      items.push({ type: 'category', value: p.category, productIds: ids });
    }
  }
  return items.sort((a, b) => a.value.localeCompare(b.value));
}

// =============================================================================
// Notifications (in-memory, runtime only)
// =============================================================================

export function createNotification(
  input: Omit<Notification, 'id' | 'createdAt' | 'readAt'>
): void {
  const now = new Date().toISOString();
  const n: Notification = {
    ...input,
    id: `n-${++notificationCounter}` as NotificationId,
    createdAt: now,
    readAt: null,
  };
  notifications.push(n);
}

export async function listNotifications(userId: UserId): Promise<Notification[]> {
  await randomDelay();
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getUnreadNotificationCount(userId: UserId): Promise<number> {
  await randomDelay();
  return notifications.filter((n) => n.userId === userId && !n.readAt).length;
}

export async function markNotificationRead(
  notificationId: NotificationId,
  userId: UserId
): Promise<void> {
  await randomDelay();
  const n = notifications.find(
    (x) => x.id === notificationId && x.userId === userId
  );
  if (n) {
    n.readAt = new Date().toISOString();
  }
}

export async function markAllNotificationsRead(userId: UserId): Promise<void> {
  await randomDelay();
  const now = new Date().toISOString();
  notifications.forEach((n) => {
    if (n.userId === userId && !n.readAt) n.readAt = now;
  });
}

export async function clearNotification(
  notificationId: NotificationId,
  userId: UserId
): Promise<void> {
  await randomDelay();
  notifications = notifications.filter(
    (n) => !(n.id === notificationId && n.userId === userId)
  );
}

// =============================================================================
// Community
// =============================================================================

export type GetPostsParams = { cursor?: string; limit?: number; userId?: UserId };
export type GetPostsResult = { items: Post[]; nextCursor?: string };

function enrichPostWithLike(post: Post, userId?: UserId | null): Post {
  if (!userId) return post;
  const liked = postLikes.get(String(post.id))?.has(String(userId)) ?? false;
  const likeCount = postLikes.get(String(post.id))?.size ?? post.likeCount;
  return { ...post, likedByMe: liked, likeCount };
}

export async function getPosts(params: GetPostsParams = {}): Promise<GetPostsResult> {
  await randomDelay();
  const visiblePosts = posts.filter(isContentVisible);
  const limit = params.limit ?? 25;
  const start = params.cursor ? parseInt(params.cursor, 10) : 0;
  if (isNaN(start) || start < 0) return { items: [] };
  const slice = visiblePosts.slice(start, start + limit);
  const items = params.userId
    ? slice.map((p) => enrichPostWithLike(p, params.userId))
    : slice;
  const nextCursor = start + limit < visiblePosts.length ? String(start + limit) : undefined;
  return { items, nextCursor };
}

export async function getPostById(
  id: PostId,
  userId?: UserId | null
): Promise<{ post: Post; comments: Comment[] } | null> {
  await randomDelay();
  const post = posts.find((p) => p.id === id);
  if (!post || !isContentVisible(post)) return null;
  const enriched = enrichPostWithLike(post, userId);
  const postComments = comments.filter((c) => c.postId === id && isContentVisible(c));
  return { post: enriched, comments: postComments };
}

export function getIsPostLikedByUser(postId: PostId, userId: UserId): boolean {
  return postLikes.get(String(postId))?.has(String(userId)) ?? false;
}

export async function togglePostLike(
  postId: PostId,
  userId: UserId
): Promise<{ liked: boolean; likeCount: number }> {
  await randomDelay();
  const key = String(postId);
  const uid = String(userId);
  let set = postLikes.get(key);
  if (!set) {
    set = new Set<string>();
    postLikes.set(key, set);
  }
  const currentlyLiked = set.has(uid);
  let likeCount: number;
  if (currentlyLiked) {
    set.delete(uid);
    likeCount = set.size;
  } else {
    set.add(uid);
    likeCount = set.size;
    const post = posts.find((p) => p.id === postId);
    if (post && post.userId !== userId) {
      const actor = users.find((u) => u.id === userId);
      const actorName = actor?.displayName ?? 'Someone';
      createNotification({
        userId: post.userId,
        actorId: userId,
        type: 'POST_LIKED',
        postId,
        title: 'New like',
        body: `${actorName} liked your post`,
      });
    }
  }
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.likeCount = likeCount;
    save('posts', posts);
  }
  savePostLikes();
  return { liked: !currentlyLiked, likeCount };
}

export async function addComment(params: {
  postId: PostId;
  userId: UserId;
  content: string;
}): Promise<Comment> {
  await randomDelay();
  const post = posts.find((p) => p.id === params.postId);
  if (!post) safeNotFound('Post', params.postId);
  const now = new Date().toISOString() as ISODateString;
  const c: Comment = {
    id: asCommentId(`c-${commentCounter++}`),
    postId: params.postId,
    userId: params.userId,
    content: params.content,
    createdAt: now,
    updatedAt: now,
  };
  comments.push(c);
  post.commentCount += 1;
  if (post.userId !== params.userId) {
    const actor = users.find((u) => u.id === params.userId);
    const actorName = actor?.displayName ?? 'Someone';
    createNotification({
      userId: post.userId,
      actorId: params.userId,
      type: 'POST_COMMENTED',
      postId: params.postId,
      commentId: c.id,
      title: 'New comment',
      body: `${actorName} commented on your post`,
    });
  }
  save('comments', comments);
  save('posts', posts);
  persistCounters();
  return c;
}

export async function deletePost(postId: PostId, userId: UserId): Promise<void> {
  await randomDelay();
  const post = posts.find((p) => p.id === postId);
  if (!post) safeNotFound('Post', postId);
  if (post.userId !== userId) throw new Error('Not authorized to delete this post');
  const pi = posts.indexOf(post);
  posts.splice(pi, 1);
  const toRemove = comments.filter((c) => c.postId === postId);
  for (const c of toRemove) {
    const ci = comments.indexOf(c);
    if (ci >= 0) comments.splice(ci, 1);
  }
  save('posts', posts);
  save('comments', comments);
}

export async function deleteComment(commentId: CommentId, userId: UserId): Promise<void> {
  await randomDelay();
  const comment = comments.find((c) => c.id === commentId);
  if (!comment) safeNotFound('Comment', commentId);
  if (comment.userId !== userId) throw new Error('Not authorized to delete this comment');
  const post = posts.find((p) => p.id === comment.postId);
  if (post) post.commentCount = Math.max(0, post.commentCount - 1);
  const ci = comments.indexOf(comment);
  comments.splice(ci, 1);
  save('comments', comments);
  save('posts', posts);
}

export type CreatePostParams = {
  userId: UserId;
  content: string;
  imageUrls?: string[];
  productIds?: ProductId[];
};

export async function createPost(params: CreatePostParams): Promise<Post> {
  await randomDelay();
  if (!getAdminSettings().enableNewPost) {
    throw new Error('Đăng bài mới đang tạm khóa.');
  }
  if (!users.some((u) => u.id === params.userId)) {
    throw new Error('User not found. Must be logged in.');
  }
  const now = new Date().toISOString() as ISODateString;
  const id = asPostId(`post-${postCounter++}`);
  const post: Post = {
    id,
    userId: params.userId,
    content: params.content,
    imageUrls: params.imageUrls,
    productIds: params.productIds?.length ? params.productIds : undefined,
    likeCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  posts.push(post);
  save('posts', posts);
  persistCounters();
  return post;
}

// =============================================================================
// Cart (per-user, localStorage: cart:${userId})
// =============================================================================

const CART_KEY_PREFIX = KEY + 'cart:';

function loadCartForUser(userId: UserId): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY_PREFIX + userId);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    // Ensure all items have id (migrate legacy format)
    const now = new Date().toISOString();
    return parsed.map((i, idx) =>
      i.id
        ? i
        : {
            id: asCartItemId(`ci-m${idx}-${Date.now()}`),
            userId,
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            addedAt: (i as CartItem & { addedAt?: string }).addedAt ?? now,
          }
    );
  } catch {
    return [];
  }
}

function saveCartForUser(userId: UserId, items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY_PREFIX + userId, JSON.stringify(items));
  } catch {
    // ignore
  }
}

let cartItemCounter = 1;

export async function getCart(userId: UserId): Promise<CartItem[]> {
  await randomDelay();
  const items = loadCartForUser(userId);
  return items;
}

export type AddToCartParams = {
  userId: UserId;
  productId: ProductId;
  variantId: VariantId;
  quantity?: number;
};

export async function addToCart(params: AddToCartParams): Promise<CartItem[]> {
  await randomDelay();
  const { userId, productId, variantId, quantity = 1 } = params;
  const items = loadCartForUser(userId);
  const pid = String(productId);
  const vid = String(variantId);
  const existing = items.find(
    (i) => String(i.productId) === pid && String(i.variantId) === vid
  );
  const now = new Date().toISOString() as ISODateString;
  let next: CartItem[];
  if (existing) {
    next = items.map((i) =>
      String(i.productId) === pid && String(i.variantId) === vid
        ? { ...i, quantity: i.quantity + quantity }
        : i
    );
  } else {
    const newItem: CartItem = {
      id: asCartItemId(`ci-${cartItemCounter++}`),
      userId,
      productId,
      variantId,
      quantity,
      addedAt: now,
    };
    next = [...items, newItem];
  }
  saveCartForUser(userId, next);
  return next;
}

export type UpdateCartItemQtyParams = {
  userId: UserId;
  itemId: CartItemId;
  quantity: number;
};

export async function updateCartItemQty(
  params: UpdateCartItemQtyParams
): Promise<CartItem[]> {
  await randomDelay();
  const { userId, itemId, quantity } = params;
  const items = loadCartForUser(userId);
  if (quantity < 1) {
    const next = items.filter((i) => i.id !== itemId);
    saveCartForUser(userId, next);
    return next;
  }
  const next = items.map((i) =>
    i.id === itemId ? { ...i, quantity } : i
  );
  saveCartForUser(userId, next);
  return next;
}

export type RemoveCartItemParams = {
  userId: UserId;
  itemId: CartItemId;
};

export async function removeCartItem(params: RemoveCartItemParams): Promise<CartItem[]> {
  await randomDelay();
  const { userId, itemId } = params;
  const items = loadCartForUser(userId);
  const next = items.filter((i) => i.id !== itemId);
  saveCartForUser(userId, next);
  return next;
}

export async function clearCart(userId: UserId): Promise<void> {
  await randomDelay();
  saveCartForUser(userId, []);
}

export async function getCartCount(userId: UserId): Promise<number> {
  const items = await getCart(userId);
  return items.reduce((acc, i) => acc + i.quantity, 0);
}

// =============================================================================
// Orders (stub – not using mock data)
// =============================================================================

export type CreateOrderParams = {
  userId: UserId;
  items: Array<{ productId: ProductId; variantId: VariantId; quantity: number }>;
  shippingAddress: ShippingAddress;
};

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  await randomDelay();
  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  for (const item of params.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) safeNotFound('Product', item.productId);
    const variant = product.variants.find((v) => v.id === item.variantId);
    if (!variant) safeNotFound('Product variant', item.variantId);
    subtotal += variant.unitPrice * item.quantity;
    orderItems.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantName: variant.name,
      sku: variant.sku,
      unitPrice: variant.unitPrice,
      quantity: item.quantity,
    });
  }
  const shippingFee = subtotal < 500000 ? 30000 : 0;
  const now = new Date().toISOString() as ISODateString;
  const order: Order = {
    id: asOrderId(`ord-${orderCounter++}`),
    userId: params.userId,
    items: orderItems,
    subtotal,
    shippingFee: shippingFee > 0 ? shippingFee : undefined,
    total: subtotal + shippingFee,
    status: OrderStatusEnum.Pending,
    statusHistory: [{ status: OrderStatusEnum.Pending, at: now }],
    shippingAddress: params.shippingAddress,
    createdAt: now,
    updatedAt: now,
  };
  save('orderCounter', orderCounter);
  return order;
}

// =============================================================================
// Admin API
// =============================================================================

export type AdminListUsersFilters = {
  q?: string;
  status?: UserStatus;
  isAdmin?: boolean;
};

export function adminListUsers(filters: AdminListUsersFilters = {}): StoredUser[] {
  let result = [...users];
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }
  if (filters.status) {
    result = result.filter((u) => (u.status ?? 'active') === filters.status);
  }
  if (filters.isAdmin !== undefined) {
    result = result.filter((u) => (u.role === 'admin') === filters.isAdmin);
  }
  return result;
}

export type AdminUpdateUserPatch = {
  role?: UserRole;
  status?: UserStatus;
  avatarUrl?: string | null;
};

export function adminUpdateUser(
  userId: UserId,
  patch: AdminUpdateUserPatch
): StoredUser | null {
  const u = users.find((x) => x.id === userId);
  if (!u) return null;
  if (patch.role !== undefined) u.role = patch.role;
  if (patch.status !== undefined) u.status = patch.status;
  if (patch.avatarUrl !== undefined) u.avatarUrl = patch.avatarUrl || undefined;
  u.updatedAt = new Date().toISOString();
  storageSaveUsers(users);
  return u;
}

export type AdminListProductsFilters = {
  category?: string;
  sellerId?: UserId;
  status?: ContentStatus;
  minRating?: number;
};

export function adminListProducts(
  filters: AdminListProductsFilters = {}
): Product[] {
  let result = [...products];
  if (filters.category) {
    result = result.filter(
      (p) => p.category?.toLowerCase() === filters.category!.toLowerCase()
    );
  }
  if (filters.sellerId) {
    result = result.filter((p) => p.sellerId === filters.sellerId);
  }
  if (filters.status) {
    result = result.filter((p) => (p.status ?? 'active') === filters.status);
  }
  if (filters.minRating !== undefined) {
    result = result.filter((p) => (p.avgRating ?? 0) >= filters.minRating!);
  }
  return result;
}

export type AdminUpdateProductPatch = {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  unit?: string;
  imageUrls?: string[];
  status?: ContentStatus;
  variants?: ProductVariant[];
};

export function adminUpdateProduct(
  productId: ProductId,
  patch: AdminUpdateProductPatch
): Product | null {
  const p = products.find((x) => x.id === productId);
  if (!p) return null;
  if (patch.name !== undefined) p.name = patch.name;
  if (patch.description !== undefined) p.description = patch.description;
  if (patch.category !== undefined) p.category = patch.category;
  if (patch.tags !== undefined) p.tags = patch.tags;
  if (patch.unit !== undefined) p.unit = patch.unit;
  if (patch.imageUrls !== undefined) p.imageUrls = patch.imageUrls;
  if (patch.status !== undefined) p.status = patch.status;
  if (patch.variants !== undefined) p.variants = patch.variants;
  p.updatedAt = new Date().toISOString() as ISODateString;
  save('products', products);
  return p;
}

export type AdminListPostsFilters = {
  authorId?: UserId;
  status?: ContentStatus;
  hasMedia?: boolean;
};

export function adminListPosts(filters: AdminListPostsFilters = {}): Post[] {
  let result = [...posts];
  if (filters.authorId) {
    result = result.filter((p) => p.userId === filters.authorId);
  }
  if (filters.status) {
    result = result.filter((p) => (p.status ?? 'active') === filters.status);
  }
  if (filters.hasMedia) {
    result = result.filter((p) => (p.imageUrls?.length ?? 0) > 0);
  }
  return result;
}

export type AdminUpdatePostPatch = {
  status?: ContentStatus;
};

export function adminListCommentsByPost(postId: PostId): Comment[] {
  return comments.filter((c) => c.postId === postId);
}

export function adminUpdateComment(
  commentId: CommentId,
  patch: { status: ContentStatus }
): Comment | null {
  const c = comments.find((x) => x.id === commentId);
  if (!c) return null;
  c.status = patch.status;
  c.updatedAt = new Date().toISOString() as ISODateString;
  const post = posts.find((p) => p.id === c.postId);
  if (post) {
    post.commentCount = comments.filter(
      (x) => x.postId === c.postId && (x.status ?? 'active') === 'active'
    ).length;
  }
  save('comments', comments);
  save('posts', posts);
  return c;
}

export function adminUpdatePost(
  postId: PostId,
  patch: AdminUpdatePostPatch
): Post | null {
  const p = posts.find((x) => x.id === postId);
  if (!p) return null;
  if (patch.status !== undefined) p.status = patch.status;
  p.updatedAt = new Date().toISOString() as ISODateString;
  save('posts', posts);
  return p;
}

export type AdminListReviewsFilters = {
  productId?: ProductId;
  minRating?: number;
  status?: ContentStatus;
};

export function adminListReviews(
  filters: AdminListReviewsFilters = {}
): Review[] {
  let result = [...reviews];
  if (filters.productId) {
    result = result.filter((r) => r.productId === filters.productId);
  }
  if (filters.minRating !== undefined) {
    result = result.filter((r) => r.rating >= filters.minRating!);
  }
  if (filters.status) {
    result = result.filter((r) => (r.status ?? 'active') === filters.status);
  }
  return result;
}

export type AdminUpdateReviewPatch = {
  status?: ContentStatus;
};

export function adminUpdateReview(
  reviewId: ReviewId,
  patch: AdminUpdateReviewPatch
): Review | null {
  const r = reviews.find((x) => x.id === reviewId);
  if (!r) return null;
  if (patch.status !== undefined) r.status = patch.status;
  r.updatedAt = new Date().toISOString() as ISODateString;
  save('reviews', reviews);
  const product = products.find((p) => p.id === r.productId);
  if (product) recomputeProductRating(product);
  return r;
}

// Reports
export type CreateReportPayload = {
  type: ReportTargetType;
  targetId: string;
  reason: string;
  reporterId: UserId;
};

export function createReport(payload: CreateReportPayload): Report {
  const now = new Date().toISOString();
  const report: Report = {
    id: `rep-${reports.length + 1}`,
    type: payload.type,
    targetId: payload.targetId,
    reason: payload.reason,
    reporterId: payload.reporterId,
    status: 'open',
    createdAt: now as ISODateString,
  };
  reports.push(report);
  save('reports', reports);
  return report;
}

export type AdminListReportsFilters = {
  status?: ReportStatus;
  type?: ReportTargetType;
};

export function adminListReports(filters: AdminListReportsFilters = {}): Report[] {
  seedReportsIfEmpty();
  let result = [...reports];
  if (filters.status) {
    result = result.filter((r) => r.status === filters.status);
  }
  if (filters.type) {
    result = result.filter((r) => r.type === filters.type);
  }
  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export type AdminUpdateReportPatch = {
  status: ReportStatus;
  resolutionNote?: string;
  hideTarget?: boolean;
};

export function adminUpdateReport(
  reportId: string,
  patch: AdminUpdateReportPatch
): Report | null {
  const r = reports.find((x) => x.id === reportId);
  if (!r) return null;
  r.status = patch.status;
  r.resolutionNote = patch.resolutionNote;
  if (patch.status === 'resolved' || patch.status === 'dismissed') {
    r.resolvedAt = new Date().toISOString();
  }
  if (patch.hideTarget && patch.status === 'resolved') {
    const tid = r.targetId;
    const t = r.type;
    if (t === 'product') {
      const p = products.find((x) => x.id === tid);
      if (p) p.status = 'hidden';
      save('products', products);
    } else if (t === 'post') {
      const p = posts.find((x) => x.id === tid);
      if (p) p.status = 'hidden';
      save('posts', posts);
    } else if (t === 'review') {
      const rev = reviews.find((x) => x.id === tid);
      if (rev) rev.status = 'hidden';
      save('reviews', reviews);
    } else if (t === 'comment') {
      const c = comments.find((x) => x.id === tid);
      if (c) c.status = 'hidden';
      save('comments', comments);
    } else if (t === 'user') {
      const u = users.find((x) => x.id === tid);
      if (u) u.status = 'suspended';
      storageSaveUsers(users);
    }
  }
  save('reports', reports);
  return r;
}

export function getAdminSettings(): AdminSettings {
  return { ...adminSettings };
}

export type AdminSettingsPatch = Partial<AdminSettings>;

export function updateAdminSettings(patch: AdminSettingsPatch): AdminSettings {
  adminSettings = { ...adminSettings, ...patch };
  save('adminSettings', adminSettings);
  return adminSettings;
}

/** Get recent activity for dashboard (last N actions) */
export type ActivityItem = {
  type: 'product' | 'post' | 'review' | 'delete_product' | 'delete_post';
  id: string;
  label: string;
  createdAt: string;
};

export function getRecentActivity(limit: number = 10): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (const p of [...products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, limit)) {
    items.push({
      type: 'product',
      id: p.id,
      label: `Sản phẩm mới: ${p.name}`,
      createdAt: p.createdAt,
    });
  }
  for (const p of [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, limit)) {
    items.push({
      type: 'post',
      id: p.id,
      label: `Bài viết mới`,
      createdAt: p.createdAt,
    });
  }
  for (const r of [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, limit)) {
    const prod = products.find((x) => x.id === r.productId);
    items.push({
      type: 'review',
      id: r.id,
      label: `Đánh giá mới ${r.rating}★${prod ? `: ${prod.name}` : ''}`,
      createdAt: r.createdAt,
    });
  }
  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

function seedReportsIfEmpty(): void {
  if (reports.length > 0) return;
  if (users.length === 0) seedAdminAndDemoIfNeeded();
  const now = new Date().toISOString();
  if (products.length > 0) {
    reports.push({
      id: 'rep-1',
      type: 'product',
      targetId: products[0].id,
      reason: 'Nội dung không phù hợp (demo)',
      reporterId: users[0]!.id,
      status: 'open',
      createdAt: now as ISODateString,
    });
  }
  if (posts.length > 0) {
    reports.push({
      id: 'rep-2',
      type: 'post',
      targetId: posts[0].id,
      reason: 'Spam (demo)',
      reporterId: users[1]!.id,
      status: 'open',
      createdAt: now as ISODateString,
    });
  }
  save('reports', reports);
}
