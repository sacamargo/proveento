"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { getCurrentProfile } from "@/lib/auth/profile";
import { prisma } from "@/lib/prisma";
import {
  createRequestSchema,
  type CreateRequestInput,
} from "@/lib/validations/request";

export type CreateRequestState = {
  error?: string;
};

export async function createRequest(
  input: CreateRequestInput,
): Promise<CreateRequestState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const parsed = createRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos de la solicitud.",
    };
  }

  await prisma.request.create({
    data: {
      buyerId: profile.id,
      city: `${parsed.data.city}, ${parsed.data.department}`,
      deadline: new Date(`${parsed.data.deadline}T12:00:00`),
      items: parsed.data.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        ...(item.description ? { description: item.description } : {}),
      })) as Prisma.InputJsonValue,
    },
  });

  revalidatePath("/");
  redirect("/?creada=1");
}
