import { requireProfile } from "@/lib/auth/session";
import {
  toBuyerProposal,
  type BuyerProposal,
  type BuyerRequestSummary,
} from "@/lib/buyer/dto";
import { prisma } from "@/lib/prisma";
import { parseProposalDetails } from "@/lib/proposal-details";
import { parseRequestItems } from "@/lib/request-items";
import { signProposalMedia } from "@/lib/storage/proposal-media";

export async function listBuyerRequests(): Promise<BuyerRequestSummary[]> {
  const profile = await requireProfile();

  const requests = await prisma.request.findMany({
    where: { buyerId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { proposals: true } },
    },
  });

  return requests.map((request) => ({
    id: request.id,
    city: request.city,
    deadline: request.deadline,
    status: request.status,
    itemCount: parseRequestItems(request.items).length,
    proposalCount: request._count.proposals,
  }));
}

export async function getBuyerCompare(requestId: string): Promise<{
  request: {
    id: string;
    city: string;
    deadline: Date;
    status: "ACTIVE" | "MATCHED" | "CLOSED";
    items: ReturnType<typeof parseRequestItems>;
  };
  proposals: BuyerProposal[];
} | null> {
  const profile = await requireProfile();

  const request = await prisma.request.findFirst({
    where: { id: requestId, buyerId: profile.id },
    include: {
      proposals: {
        orderBy: { createdAt: "asc" },
        include: {
          provider: {
            select: { name: true, email: true, phone: true },
          },
        },
      },
    },
  });

  if (!request) {
    return null;
  }

  const proposals = await Promise.all(
    request.proposals.map(async (proposal, index) => {
      const details = parseProposalDetails(proposal.conditions);
      const media = await signProposalMedia(details.media);
      return toBuyerProposal(proposal, index, media);
    }),
  );

  return {
    request: {
      id: request.id,
      city: request.city,
      deadline: request.deadline,
      status: request.status,
      items: parseRequestItems(request.items),
    },
    proposals,
  };
}
