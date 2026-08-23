import Link from "next/link";

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
import { listActiveRequestsForAdmin } from "@/lib/admin/queries";
import { formatDate } from "@/lib/format";
import { parseRequestItems } from "@/lib/request-items";

export default async function AdminDashboardPage() {
  const requests = await listActiveRequestsForAdmin();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="grid gap-2">
        <h1 className="font-heading text-3xl">Solicitudes activas</h1>
        <p className="text-muted-foreground">
          Revisa lo que pidieron los compradores y carga cotizaciones a nombre
          de un proveedor.
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay solicitudes activas</CardTitle>
            <CardDescription>
              Cuando un comprador publique una necesidad, aparecerá aquí para
              que el concierge busque cotizaciones.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <ul className="grid gap-3 md:hidden">
            {requests.map((request) => {
              const itemCount = parseRequestItems(request.items).length;
              return (
                <li key={request.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{request.city}</CardTitle>
                      <CardDescription>
                        {request.buyer.name} · límite {formatDate(request.deadline)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {itemCount} {itemCount === 1 ? "producto" : "productos"}
                        </Badge>
                        <Badge variant="secondary">
                          {request._count.proposals}{" "}
                          {request._count.proposals === 1
                            ? "propuesta"
                            : "propuestas"}
                        </Badge>
                      </div>
                      <Button asChild className="min-h-11">
                        <Link href={`/admin/request/${request.id}`}>
                          Ver solicitud
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Fecha límite</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Propuestas</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const itemCount = parseRequestItems(request.items).length;
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.city}</TableCell>
                      <TableCell>{request.buyer.name}</TableCell>
                      <TableCell>{formatDate(request.deadline)}</TableCell>
                      <TableCell>{itemCount}</TableCell>
                      <TableCell>{request._count.proposals}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" className="min-h-11">
                          <Link href={`/admin/request/${request.id}`}>
                            Ver
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </main>
  );
}
