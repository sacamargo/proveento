export type ProposalMedia = {
  path: string;
  name: string;
  type: string;
};

export type ProposalDetails = {
  version: 1;
  notes?: string;
  deliveryIncluded: boolean;
  deliveryCost?: number;
  installation: "not_needed" | "included" | "not_included";
  warrantyYears: number;
  media: ProposalMedia[];
};

export function serializeProposalDetails(details: ProposalDetails): string {
  return JSON.stringify(details);
}

export const installationCopy = {
  not_needed: "No aplica",
  included: "Incluida",
  not_included: "No incluida",
} as const;

export function formatDelivery(details: ProposalDetails, formatMoney: (value: number) => string) {
  if (details.deliveryIncluded) {
    return "Incluida en el precio";
  }
  return `No incluida · ${formatMoney(details.deliveryCost ?? 0)}`;
}

export function formatWarranty(details: ProposalDetails) {
  return `${details.warrantyYears} ${details.warrantyYears === 1 ? "año" : "años"}`;
}

export function parseProposalDetails(raw: string): ProposalDetails {
  try {
    const parsed = JSON.parse(raw) as Partial<ProposalDetails>;
    if (parsed && parsed.version === 1) {
      return {
        version: 1,
        notes: parsed.notes,
        deliveryIncluded: Boolean(parsed.deliveryIncluded),
        deliveryCost: parsed.deliveryCost,
        installation: parsed.installation ?? "not_needed",
        warrantyYears: parsed.warrantyYears ?? 1,
        media: Array.isArray(parsed.media) ? parsed.media : [],
      };
    }
  } catch {
    // Solicitudes guardadas como texto libre.
  }

  return {
    version: 1,
    notes: raw.trim() || undefined,
    deliveryIncluded: true,
    installation: "not_needed",
    warrantyYears: 1,
    media: [],
  };
}
