export const PROPOSAL_MEDIA_BUCKET = "proposal-media";

export const PROPOSAL_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export function isAllowedProposalMedia(type: string): boolean {
  return (PROPOSAL_MEDIA_TYPES as readonly string[]).includes(type);
}

export function sanitizeMediaName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80) || "archivo";
}
