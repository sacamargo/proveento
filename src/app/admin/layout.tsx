import Link from "next/link";

import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-heading text-xl">
              <Link href="/admin/dashboard" className="hover:underline">
                Proveento Concierge
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">{profile.name}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/">Inicio</Link>
            </Button>
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                className="min-h-11 w-full sm:w-auto"
              >
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
