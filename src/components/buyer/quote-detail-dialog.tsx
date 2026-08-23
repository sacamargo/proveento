"use client";

import { useState } from "react";
import { Mail, Phone, Play, ShieldCheck, Truck, Wrench } from "lucide-react";

import { AcceptProposalButton } from "@/components/buyer/accept-proposal-button";
import { Badge } from "@/components/ui/badge";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { BuyerProposal } from "@/lib/buyer/dto";
import { digitsOnly, formatColombianMobile, formatMoney } from "@/lib/format";
import {
  formatDelivery,
  formatWarranty,
  installationCopy,
} from "@/lib/proposal-details";
import { cn } from "@/lib/utils";

type QuoteDetailDialogProps = {
  requestId: string;
  canAccept: boolean;
  proposal: BuyerProposal;
};

function firstMediaIndex(proposal: BuyerProposal) {
  const imageIndex = proposal.media.findIndex((item) =>
    item.type.startsWith("image/"),
  );
  return imageIndex >= 0 ? imageIndex : 0;
}

function QuoteGallery({ proposal }: { proposal: BuyerProposal }) {
  const [selected, setSelected] = useState(() => firstMediaIndex(proposal));
  const current = proposal.media[selected];

  if (!current) {
    return null;
  }

  return (
    <div className="grid gap-3 md:h-full md:grid-cols-[4.5rem_minmax(0,1fr)] md:items-stretch">
      <div className="order-1 overflow-hidden bg-muted md:order-2 md:rounded-lg">
        <div className="aspect-video w-full md:aspect-auto md:h-full md:min-h-[22rem]">
          {current.type.startsWith("video/") ? (
            <video
              className="size-full object-contain"
              controls
              preload="metadata"
              src={current.url}
              aria-label={current.name}
            >
              <track kind="captions" />
            </video>
          ) : (
            // Signed Storage URLs are temporary; a native img avoids remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.url}
              alt={current.name}
              className="size-full object-contain"
            />
          )}
        </div>
      </div>
      {proposal.media.length > 1 ? (
        <ul className="order-2 flex gap-2 overflow-x-auto md:order-1 md:max-h-full md:flex-col md:overflow-x-hidden md:overflow-y-auto">
          {proposal.media.map((item, index) => (
            <li key={item.path} className="shrink-0">
              <button
                type="button"
                aria-label={`Ver ${item.name}`}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
                className={cn(
                  "relative size-14 overflow-hidden rounded-md border border-border bg-muted transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected === index && "ring-2 ring-ring",
                )}
              >
                {item.type.startsWith("video/") ? (
                  <>
                    <video
                      className="size-full object-cover"
                      muted
                      preload="metadata"
                      src={item.url}
                      aria-hidden
                    >
                      <track kind="captions" />
                    </video>
                    <span className="absolute inset-0 grid place-items-center bg-foreground/40">
                      <Play aria-hidden className="size-3.5 text-background" />
                    </span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
      <div className="grid min-w-0 gap-0.5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function QuoteDetails({
  proposal,
}: {
  proposal: BuyerProposal;
}) {
  return (
    <div className="grid gap-5">
      <DialogHeader className="gap-2 pr-12">
        <div className="flex flex-wrap items-center gap-2">
          <DialogTitle className="text-2xl md:text-3xl">
            {proposal.label}
          </DialogTitle>
          {proposal.status === "ACCEPTED" ? (
            <Badge variant="success">Aceptada</Badge>
          ) : null}
        </div>
        <DialogDescription>
          {proposal.provider
            ? "Cotización aceptada. Aquí está el contacto del proveedor."
            : "Detalle de la cotización. El proveedor permanece oculto hasta que aceptes."}
        </DialogDescription>
      </DialogHeader>

      <p className="font-heading text-4xl leading-none">
        {formatMoney(proposal.totalPrice)}
      </p>

      {proposal.provider ? (
        <div className="grid gap-2 rounded-lg border border-border bg-muted/50 p-4">
          <p className="font-medium">{proposal.provider.name}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail aria-hidden className="size-4 shrink-0" />
            {proposal.provider.email}
          </p>
          {proposal.provider.phone ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone aria-hidden className="size-4 shrink-0" />
              {formatColombianMobile(digitsOnly(proposal.provider.phone))}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-2">
        <Spec
          icon={Truck}
          label="Entrega"
          value={formatDelivery(proposal.details, formatMoney)}
        />
        <Spec
          icon={Wrench}
          label="Instalación"
          value={installationCopy[proposal.details.installation]}
        />
        <Spec
          icon={ShieldCheck}
          label="Garantía"
          value={formatWarranty(proposal.details)}
        />
      </div>

      {proposal.details.notes ? (
        <>
          <Separator />
          <div className="grid gap-1">
            <p className="text-sm text-muted-foreground">Condiciones</p>
            <p>{proposal.details.notes}</p>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function QuoteDetailDialog({
  requestId,
  canAccept,
  proposal,
}: QuoteDetailDialogProps) {
  const hasMedia = proposal.media.length > 0;
  const showAccept = canAccept && proposal.status === "PENDING";

  return (
    <DialogContent
      className={cn(
        "flex max-h-[min(92dvh,54rem)] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 text-base",
        hasMedia ? "sm:max-w-4xl lg:max-w-6xl" : "sm:max-w-2xl",
      )}
    >
      {hasMedia ? (
        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] md:overflow-hidden">
          <div className="min-h-0 bg-muted/30 p-3 md:overflow-hidden md:p-5">
            <QuoteGallery proposal={proposal} />
          </div>
          <div className="flex min-h-0 flex-col border-t border-border md:border-t-0 md:border-l">
            <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-6">
              <QuoteDetails proposal={proposal} />
            </div>
            {showAccept ? (
              <DialogFooter className="mx-0 mb-0 sm:flex-col">
                <AcceptProposalButton
                  requestId={requestId}
                  proposalId={proposal.id}
                  label={proposal.label}
                />
              </DialogFooter>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-6">
            <QuoteDetails proposal={proposal} />
          </div>
          {showAccept ? (
            <DialogFooter className="mx-0 mb-0 sm:flex-col">
              <AcceptProposalButton
                requestId={requestId}
                proposalId={proposal.id}
                label={proposal.label}
              />
            </DialogFooter>
          ) : null}
        </>
      )}
    </DialogContent>
  );
}
