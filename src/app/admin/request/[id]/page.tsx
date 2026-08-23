import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CreateProposalForm } from "@/components/admin/create-proposal-form";
import { ProposalDetailsCard } from "@/components/admin/proposal-details-card";
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
  getRequestForAdmin,
  listProvidersForAdmin,
} from "@/lib/admin/queries";
import { formatDate } from "@/lib/format";
import { parseProposalDetails } from "@/lib/proposal-details";
import { parseRequestItems } from "@/lib/request-items";
import { signProposalMedia } from "@/lib/storage/proposal-media";

const STATUS_COPY = {
  ACTIVE: "Activa",
  MATCHED: "Emparejada",
  CLOSED: "Cerrada",
} as const;

export default async function AdminRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creada?: string }>;
}) {
  const [{ id }, { creada }] = await Promise.all([params, searchParams]);
  const [request, providers] = await Promise.all([
    getRequestForAdmin(id),
    listProvidersForAdmin(),
  ]);

  if (!request) {
    notFound();
  }

  const items = parseRequestItems(request.items);
  const isActive = request.status === "ACTIVE";
  const proposals = await Promise.all(
    request.proposals.map(async (proposal) => ({
      ...proposal,
      media: await signProposalMedia(parseProposalDetails(proposal.conditions).media),
    })),
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="grid gap-3">
        <Button asChild variant="ghost" className="h-auto min-h-11 w-fit px-0">
          <Link href="/admin/dashboard">
            <ArrowLeft data-icon="inline-start" />
            Volver a solicitudes
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-3xl">{request.city}</h1>
          <Badge variant={isActive ? "success" : "outline"}>
            {STATUS_COPY[request.status]}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {request.buyer.name} · {request.buyer.email}
          {request.buyer.phone ? ` · ${request.buyer.phone}` : null}
        </p>
        <p className="text-sm text-muted-foreground">
          Límite para cotizar: {formatDate(request.deadline)}
        </p>
      </div>

      {creada === "1" ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-muted px-3 py-2 text-sm"
        >
          Propuesta guardada. El comprador la verá a ciegas en la comparación.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>
                Lo que el comprador necesita cotizar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Esta solicitud no tiene productos cargados.
                </p>
              ) : (
                <ul className="grid gap-3">
                  {items.map((item, index) => (
                    <li
                      key={`${item.name}-${index}`}
                      className="rounded-lg border border-border p-3"
                    >
                      <p className="font-medium">
                        {item.quantity} × {item.name}
                      </p>
                      {item.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Propuestas cargadas</CardTitle>
              <CardDescription>
                El concierge sí ve al proveedor. El comprador, no.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay cotizaciones para esta solicitud.
                </p>
              ) : (
                <ul className="grid gap-3">
                  {proposals.map((proposal) => (
                    <li
                      key={proposal.id}
                      className="rounded-lg border border-border p-3"
                    >
                      <p className="font-medium">{proposal.provider.name}</p>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {proposal.provider.email}
                        {proposal.provider.phone
                          ? ` · ${proposal.provider.phone}`
                          : null}
                      </p>
                      <ProposalDetailsCard
                        price={proposal.totalPrice}
                        conditions={proposal.conditions}
                        media={proposal.media}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nueva propuesta</CardTitle>
            <CardDescription>
              Simula la cotización de un proveedor y déjala lista para el
              compare ciego.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isActive ? (
              <CreateProposalForm
                requestId={request.id}
                providers={providers}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Esta solicitud ya no está activa. No se pueden cargar más
                propuestas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
