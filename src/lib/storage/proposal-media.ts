import { createSupabaseContext } from "@/lib/supabase/context";
import type { ProposalMedia } from "@/lib/proposal-details";
import {
  PROPOSAL_MEDIA_BUCKET,
  PROPOSAL_MEDIA_TYPES,
} from "@/lib/storage/proposal-media-shared";

export { PROPOSAL_MEDIA_BUCKET } from "@/lib/storage/proposal-media-shared";

export async function getStorageAdmin() {
  const { data, error } = await createSupabaseContext({ auth: "user" });
  if (error || !data?.supabaseAdmin) {
    throw new Error("No se pudo preparar Storage del concierge.");
  }
  return data.supabaseAdmin;
}

export async function ensureProposalMediaBucket() {
  const admin = await getStorageAdmin();
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    throw new Error(listError.message);
  }

  const exists = buckets?.some((bucket) => bucket.name === PROPOSAL_MEDIA_BUCKET);
  if (!exists) {
    const { error } = await admin.storage.createBucket(PROPOSAL_MEDIA_BUCKET, {
      public: false,
      fileSizeLimit: "50MB",
      allowedMimeTypes: [...PROPOSAL_MEDIA_TYPES],
    });
    if (error && !error.message.toLowerCase().includes("already exists")) {
      throw new Error(error.message);
    }
  }

  return admin;
}

export async function signProposalMedia(
  media: ProposalMedia[],
): Promise<Array<ProposalMedia & { url: string }>> {
  if (media.length === 0) {
    return [];
  }

  const admin = await getStorageAdmin();
  const signed = await Promise.all(
    media.map(async (item) => {
      const { data } = await admin.storage
        .from(PROPOSAL_MEDIA_BUCKET)
        .createSignedUrl(item.path, 60 * 60);
      return { ...item, url: data?.signedUrl ?? "" };
    }),
  );

  return signed.filter((item) => item.url.length > 0);
}
