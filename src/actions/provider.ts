"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/auth/admin";
import { digitsOnly } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import {
  createProviderSchema,
  type CreateProviderInput,
} from "@/lib/validations/provider";

export type CreateProviderState = {
  error?: string;
  provider?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};

export async function createProviderAsAdmin(
  input: CreateProviderInput,
): Promise<CreateProviderState> {
  await requireAdmin();

  const parsed = createProviderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos del proveedor.",
    };
  }

  try {
    const provider = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: digitsOnly(parsed.data.phone),
        role: "PROVIDER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    revalidatePath("/admin/dashboard");
    return { provider };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Ya existe un proveedor con ese email." };
    }

    return { error: "No se pudo registrar el proveedor." };
  }
}
