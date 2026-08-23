"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import { serializeProposalDetails } from "@/lib/proposal-details";
import {
  createProposalSchema,
  type CreateProposalInput,
} from "@/lib/validations/proposal";

export type CreateProposalState = {
  error?: string;
};

export async function createProposalAsAdmin(
  input: CreateProposalInput,
): Promise<CreateProposalState> {
  await requireAdmin();

  const parsed = createProposalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos de la propuesta.",
    };
  }

  const request = await prisma.request.findUnique({
    where: { id: parsed.data.requestId },
    select: { id: true, status: true },
  });

  if (!request) {
    return { error: "La solicitud no existe." };
  }

  if (request.status !== "ACTIVE") {
    return { error: "Solo se pueden cargar propuestas en solicitudes activas." };
  }

  const provider = await prisma.user.findUnique({
    where: { id: parsed.data.providerId },
    select: { id: true, role: true },
  });

  if (!provider || provider.role !== "PROVIDER") {
    return { error: "El proveedor seleccionado no es válido." };
  }

  const warrantyYears =
    parsed.data.warrantyPreset === "other"
      ? parsed.data.warrantyOtherYears
      : Number(parsed.data.warrantyPreset);

  await prisma.proposal.create({
    data: {
      requestId: parsed.data.requestId,
      providerId: parsed.data.providerId,
      totalPrice: parsed.data.totalPrice,
      conditions: serializeProposalDetails({
        version: 1,
        notes: parsed.data.conditions,
        deliveryIncluded: parsed.data.deliveryIncluded,
        deliveryCost: parsed.data.deliveryIncluded
          ? undefined
          : parsed.data.deliveryCost,
        installation: parsed.data.installationNeeded
          ? parsed.data.installationIncluded
            ? "included"
            : "not_included"
          : "not_needed",
        warrantyYears,
        media: parsed.data.media,
      }),
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/request/${parsed.data.requestId}`);
  return {};
}
