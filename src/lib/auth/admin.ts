import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/profile";

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  if (profile.role !== "ADMIN") {
    redirect("/");
  }
  return profile;
}
