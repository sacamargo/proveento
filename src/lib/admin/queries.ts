import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export async function listActiveRequestsForAdmin() {
  await requireAdmin();

  return prisma.request.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { proposals: true },
      },
    },
  });
}

export async function getRequestForAdmin(id: string) {
  await requireAdmin();

  return prisma.request.findUnique({
    where: { id },
    include: {
      buyer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      proposals: {
        orderBy: { createdAt: "desc" },
        include: {
          provider: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      },
    },
  });
}

export async function listProvidersForAdmin() {
  await requireAdmin();

  return prisma.user.findMany({
    where: { role: "PROVIDER" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });
}

export type AdminProvider = Awaited<
  ReturnType<typeof listProvidersForAdmin>
>[number];
