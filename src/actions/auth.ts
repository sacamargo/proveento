"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ensureUserProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  success?: string;
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2),
});

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email o contraseña inválidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { error: error?.message ?? "No se pudo iniciar sesión." };
  }

  try {
    await ensureUserProfile(data.user);
  } catch {
    return {
      error:
        "Sesión iniciada, pero falló el perfil en la base de datos. Revisa DATABASE_URL y la migración.",
    };
  }

  redirect("/");
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Completa nombre, email y una contraseña de al menos 8 caracteres." };
  }

  const headerList = await headers();
  const origin = headerList.get("origin") ?? "http://localhost:3000";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "No se pudo crear la cuenta." };
  }

  try {
    await ensureUserProfile(data.user);
  } catch {
    return {
      error:
        "Cuenta creada en Auth, pero falló el perfil en la base de datos. Revisa DATABASE_URL y la migración.",
    };
  }

  if (!data.session) {
    return { success: "Revisa tu email para confirmar la cuenta." };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
