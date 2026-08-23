"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireProfile } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const acceptProposalSchema = z.object({
  proposalId: z.string().min(1),
  requestId: z.string().min(1),
});

export type AcceptProposalState = {
  error?: string;
};

export async function acceptProposal(
  input: z.infer<typeof acceptProposalSchema>,
): Promise<AcceptProposalState> {
  const profile = await requireProfile();
  const parsed = acceptProposalSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "No se pudo identificar la propuesta." };
  }

  const proposal = await prisma.proposal.findFirst({
    where: {
      id: parsed.data.proposalId,
      requestId: parsed.data.requestId,
      request: { buyerId: profile.id },
    },
    select: {
      id: true,
      status: true,
      request: { select: { id: true, status: true } },
    },
  });

  if (!proposal) {
    return { error: "La propuesta no existe o no te pertenece." };
  }

  if (proposal.request.status !== "ACTIVE") {
    return { error: "Esta solicitud ya no admite una aceptación." };
  }

  if (proposal.status !== "PENDING") {
    return { error: "Solo puedes aceptar una propuesta pendiente." };
  }

  await prisma.$transaction([
    prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "ACCEPTED" },
    }),
    prisma.request.update({
      where: { id: proposal.request.id },
      data: { status: "MATCHED" },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath(`/request/${proposal.request.id}/compare`);
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/request/${proposal.request.id}`);
  redirect(`/request/${proposal.request.id}/compare?aceptada=1`);
}
