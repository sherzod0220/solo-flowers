export interface GalleryPost {
  id: string;
  description?: string;
  /** Eng ko'pi bilan 3 ta CDN URL. */
  image_urls: string[];
  created_at: string;
}
