import Link from "next/link";

import { logout } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireProfile } from "@/lib/auth/session";
import { listBuyerRequests } from "@/lib/buyer/queries";
import { formatDate } from "@/lib/format";
import { requestStatusCopy } from "@/lib/status";

export default async function BuyerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ creada?: string }>;
}) {
  const [{ creada }, profile, requests] = await Promise.all([
    searchParams,
    requireProfile(),
    listBuyerRequests(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <h1 className="font-heading text-3xl">Mis solicitudes</h1>
          <p className="text-muted-foreground">
            Compara cotizaciones a ciegas. El proveedor se revela solo cuando
            aceptas.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="min-h-11">
            <Link href="/request/new">Nueva solicitud</Link>
          </Button>
          {profile.role === "ADMIN" ? (
            <Button asChild variant="secondary" className="min-h-11">
              <Link href="/admin/dashboard">Panel concierge</Link>
            </Button>
          ) : null}
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

      {creada === "1" ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-muted px-3 py-2 text-sm"
        >
          Solicitud publicada. El concierge ya puede buscar cotizaciones.
        </p>
      ) : null}

      {requests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Todavía no tienes solicitudes</CardTitle>
            <CardDescription>
              Publica una necesidad para que el concierge busque cotizaciones a
              ciegas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="min-h-11">
              <Link href="/request/new">Crear la primera solicitud</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <ul className="grid gap-3 md:hidden">
            {requests.map((request) => (
              <li key={request.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{request.city}</CardTitle>
                    <CardDescription>
                      Límite {formatDate(request.deadline)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          request.status === "ACTIVE" ? "success" : "outline"
                        }
                      >
                        {requestStatusCopy[request.status]}
                      </Badge>
                      <Badge variant="outline">
                        {request.itemCount}{" "}
                        {request.itemCount === 1 ? "producto" : "productos"}
                      </Badge>
                      <Badge variant="secondary">
                        {request.proposalCount}{" "}
                        {request.proposalCount === 1
                          ? "propuesta"
                          : "propuestas"}
                      </Badge>
                    </div>
                    <Button asChild className="min-h-11">
                      <Link href={`/request/${request.id}/compare`}>
                        Comparar
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha límite</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Propuestas</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.city}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "ACTIVE" ? "success" : "outline"
                        }
                      >
                        {requestStatusCopy[request.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(request.deadline)}</TableCell>
                    <TableCell>{request.itemCount}</TableCell>
                    <TableCell>{request.proposalCount}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" className="min-h-11">
                        <Link href={`/request/${request.id}/compare`}>
                          Comparar
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </main>
  );
}
