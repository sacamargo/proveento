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

export default async function HomePage() {
  const [user, profile] = await Promise.all([
    getSessionUser(),
    getCurrentProfile(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Proveento</CardTitle>
          <CardDescription>
            Marketplace inverso B2B. Fase 1: infraestructura lista.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {user ? (
            <>
              <p className="text-sm text-muted-foreground">
                Sesión activa como{" "}
                <span className="text-foreground">{profile?.name ?? user.email}</span>
                {profile ? ` · ${profile.role}` : null}
              </p>
              <form action={logout}>
                <Button type="submit" variant="outline">
                  Cerrar sesión
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">Crear cuenta</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
