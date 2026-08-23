import type { User as AuthUser } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function isAdminEmail(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail && email.toLowerCase() === adminEmail);
}

function displayName(user: AuthUser): string {
  const metadataName = user.user_metadata.name;
  if (typeof metadataName === "string" && metadataName.trim().length > 0) {
    return metadataName.trim();
  }

  const emailPrefix = user.email?.split("@")[0];
  return emailPrefix && emailPrefix.length > 0 ? emailPrefix : "Usuario";
}

export async function ensureUserProfile(user: AuthUser) {
  const email = user.email;
  if (!email) {
    throw new Error("El usuario de autenticación no tiene email.");
  }

  return prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email,
      name: displayName(user),
      role: isAdminEmail(email) ? "ADMIN" : "BUYER",
    },
    update: {
      email,
      ...(isAdminEmail(email) ? { role: "ADMIN" as const } : {}),
    },
  });
}

export async function getSessionUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getCurrentProfile() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  try {
    const profile = await prisma.user.findUnique({ where: { id: user.id } });
    if (profile) {
      if (isAdminEmail(profile.email) && profile.role !== "ADMIN") {
        return prisma.user.update({
          where: { id: profile.id },
          data: { role: "ADMIN" },
        });
      }
      return profile;
    }
    return ensureUserProfile(user);
  } catch {
    return null;
  }
}
