import type { ProposalStatus, RequestStatus } from "@prisma/client";

import {
  parseProposalDetails,
  type ProposalDetails,
  type ProposalMedia,
} from "@/lib/proposal-details";

export type RevealedProvider = {
  name: string;
  email: string;
  phone: string | null;
};

export type BuyerProposal = {
  id: string;
  label: string;
  status: ProposalStatus;
  totalPrice: number;
  details: ProposalDetails;
  media: Array<ProposalMedia & { url: string }>;
  provider: RevealedProvider | null;
};

export type BuyerRequestSummary = {
  id: string;
  city: string;
  deadline: Date;
  status: RequestStatus;
  itemCount: number;
  proposalCount: number;
};

type ProposalRecord = {
  id: string;
  status: ProposalStatus;
  totalPrice: number;
  conditions: string;
  provider: {
    name: string;
    email: string;
    phone: string | null;
  };
};

export function toBuyerProposal(
  proposal: ProposalRecord,
  index: number,
  media: Array<ProposalMedia & { url: string }>,
): BuyerProposal {
  const accepted = proposal.status === "ACCEPTED";

  return {
    id: proposal.id,
    label: accepted ? proposal.provider.name : `Proveedor oculto ${index + 1}`,
    status: proposal.status,
    totalPrice: proposal.totalPrice,
    details: parseProposalDetails(proposal.conditions),
    media,
    provider: accepted
      ? {
          name: proposal.provider.name,
          email: proposal.provider.email,
          phone: proposal.provider.phone,
        }
      : null,
  };
}
