export interface WishlistItem {
  product_id: string;
  /** RFC3339 formatida. */
  added_at: string;
}

export interface Wishlist {
  items: WishlistItem[];
  user_id: string;
}
