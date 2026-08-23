import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/profile";

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}
