import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CompareProposals } from "@/components/buyer/compare-proposals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBuyerCompare } from "@/lib/buyer/queries";
import { formatDate } from "@/lib/format";
import { requestStatusCopy } from "@/lib/status";

export default async function CompareRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aceptada?: string }>;
}) {
  const [{ id }, { aceptada }] = await Promise.all([params, searchParams]);
  const data = await getBuyerCompare(id);

  if (!data) {
    notFound();
  }

  const canAccept = data.request.status === "ACTIVE";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <div className="grid gap-3">
        <Button asChild variant="ghost" className="h-auto min-h-11 w-fit px-0">
          <Link href="/dashboard">
            <ArrowLeft data-icon="inline-start" />
            Volver a mis solicitudes
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-3xl">{data.request.city}</h1>
          <Badge variant={data.request.status === "ACTIVE" ? "success" : "outline"}>
            {requestStatusCopy[data.request.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Límite para cotizar: {formatDate(data.request.deadline)}
        </p>
        <p className="text-sm text-muted-foreground">
          Las propuestas se comparan a ciegas. Nadie ve al proveedor hasta que
          aceptas una.
        </p>
      </div>

      {aceptada === "1" ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-muted px-3 py-2 text-sm"
        >
          Propuesta aceptada. Ya puedes ver el contacto del proveedor.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Tu pedido</CardTitle>
          <CardDescription>Lo que publicaste para cotizar.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.request.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Esta solicitud no tiene productos cargados.
            </p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {data.request.items.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <span className="font-medium">
                    {item.quantity} × {item.name}
                  </span>
                  {item.description ? (
                    <span className="block text-muted-foreground">
                      {item.description}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CompareProposals
        requestId={data.request.id}
        canAccept={canAccept}
        proposals={data.proposals}
      />
    </main>
  );
}
