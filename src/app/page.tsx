import Link from "next/link";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/profile";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ creada?: string }>;
}) {
  const [{ creada }, user, profile] = await Promise.all([
    searchParams,
    getSessionUser(),
    getCurrentProfile(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-3xl">Proveento</CardTitle>
          <CardDescription>
            Marketplace inverso B2B. Publica una necesidad y compara propuestas
            a ciegas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {creada === "1" ? (
            <p
              role="status"
              className="rounded-lg border border-border bg-muted px-3 py-2 text-sm"
            >
              Solicitud publicada. El concierge ya puede buscar cotizaciones.
            </p>
          ) : null}
          {user ? (
            <>
              <p className="text-sm text-muted-foreground">
                Sesión activa como{" "}
                <span className="text-foreground">
                  {profile?.name ?? user.email}
                </span>
                {profile ? ` · ${profile.role}` : null}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="min-h-11">
                  <Link href="/request/new">Nueva solicitud</Link>
                </Button>
                <form action={logout}>
                  <Button
                    type="submit"
                    variant="outline"
                    className="min-h-11 w-full sm:w-auto"
                  >
                    Cerrar sesión
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="min-h-11">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11">
                <Link href="/signup">Crear cuenta</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
