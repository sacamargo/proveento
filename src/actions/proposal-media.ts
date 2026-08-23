"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { ensureProposalMediaBucket } from "@/lib/storage/proposal-media";
import {
  isAllowedProposalMedia,
  PROPOSAL_MEDIA_BUCKET,
  sanitizeMediaName,
} from "@/lib/storage/proposal-media-shared";

export type ProposalUploadUrlState = {
  error?: string;
  path?: string;
  token?: string;
  signedUrl?: string;
};

export async function createProposalMediaUploadUrl(input: {
  requestId: string;
  fileName: string;
  contentType: string;
}): Promise<ProposalUploadUrlState> {
  await requireAdmin();

  if (!input.requestId) {
    return { error: "Falta la solicitud." };
  }

  if (!isAllowedProposalMedia(input.contentType)) {
    return { error: "Solo se permiten fotos o videos (JPG, PNG, WebP, GIF, MP4 o WebM)." };
  }

  try {
    const admin = await ensureProposalMediaBucket();
    const path = `${input.requestId}/${crypto.randomUUID()}-${sanitizeMediaName(input.fileName)}`;
    const { data, error } = await admin.storage
      .from(PROPOSAL_MEDIA_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return { error: error?.message ?? "No se pudo preparar la carga del archivo." };
    }

    return {
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo preparar la carga del archivo.",
    };
  }
}
