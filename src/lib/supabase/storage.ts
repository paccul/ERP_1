import { createAdminClient } from "./admin";

export const BUCKET_COMPANY_LOGOS = "company-logos";
export const BUCKET_AVATARS = "avatars";

/**
 * Ensures public storage buckets exist with appropriate configuration
 */
export async function ensureStorageBuckets() {
  try {
    const admin = createAdminClient();
    const { data: buckets } = await admin.storage.listBuckets();
    const existingNames = (buckets || []).map((b) => b.name);

    if (!existingNames.includes(BUCKET_COMPANY_LOGOS)) {
      await admin.storage.createBucket(BUCKET_COMPANY_LOGOS, {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
      });
    }

    if (!existingNames.includes(BUCKET_AVATARS)) {
      await admin.storage.createBucket(BUCKET_AVATARS, {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024, // 2MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
      });
    }
  } catch (err) {
    console.error("Storage bucket initialization warning:", err);
  }
}
