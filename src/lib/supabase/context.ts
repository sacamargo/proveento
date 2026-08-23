import {
  createAdminClient,
  createContextClient,
  resolveEnv,
  verifyCredentials,
} from "@supabase/server/core";
import type {
  AuthModeWithKey,
  SupabaseContext,
  SupabaseEnv,
} from "@supabase/server";

import { createClient } from "@/lib/supabase/server";

function resolveAppEnv(): Partial<SupabaseEnv> {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const jwksUrl = process.env.SUPABASE_JWKS_URL;

  return {
    url: url ?? undefined,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {},
    jwks: jwksUrl ? new URL(jwksUrl) : null,
  };
}

export type AppSupabaseContext = Omit<SupabaseContext, "supabaseAdmin"> & {
  supabaseAdmin: SupabaseContext["supabaseAdmin"] | null;
};

export async function createSupabaseContext(
  options: { auth?: AuthModeWithKey | AuthModeWithKey[] } = { auth: "user" },
): Promise<
  { data: AppSupabaseContext; error: null } | { data: null; error: Error }
> {
  const { data: env, error: envError } = resolveEnv(resolveAppEnv());

  if (envError || !env) {
    return {
      data: null,
      error: envError ?? new Error("No se pudo resolver el entorno de Supabase."),
    };
  }

  const ssrClient = await createClient();
  const {
    data: { session },
  } = await ssrClient.auth.getSession();
  const token = session?.access_token ?? null;

  const { data: auth, error } = await verifyCredentials(
    { token, apikey: null },
    { auth: options.auth ?? "user", env },
  );

  if (error) {
    return { data: null, error };
  }

  const supabase = createContextClient({
    auth: { token: auth.token },
    env,
  });

  let supabaseAdmin: AppSupabaseContext["supabaseAdmin"] = null;
  if (env.secretKeys.default) {
    supabaseAdmin = createAdminClient({ env });
  }

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: auth.userClaims,
      jwtClaims: auth.jwtClaims,
      authMode: auth.authMode,
    },
    error: null,
  };
}
