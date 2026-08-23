"use client";

import { ImageOff } from "lucide-react";

import { QuoteDetailDialog } from "@/components/buyer/quote-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { BuyerProposal } from "@/lib/buyer/dto";
import { formatMoney } from "@/lib/format";

type CompareProposalsProps = {
  requestId: string;
  canAccept: boolean;
  proposals: BuyerProposal[];
};

function coverMedia(proposal: BuyerProposal) {
  return (
    proposal.media.find((item) => item.type.startsWith("image/")) ??
    proposal.media.find((item) => item.type.startsWith("video/")) ??
    null
  );
}

function QuoteCover({ proposal }: { proposal: BuyerProposal }) {
  const cover = coverMedia(proposal);

  if (!cover) {
    return (
      <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
        <div className="grid justify-items-center gap-2 text-center">
          <ImageOff aria-hidden className="size-6" />
          <p className="text-xs">Sin imagen</p>
        </div>
      </div>
    );
  }

  if (cover.type.startsWith("video/")) {
    return (
      <video
        className="aspect-video w-full bg-muted object-cover"
        muted
        preload="metadata"
        src={cover.url}
        aria-label={cover.name}
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    // Signed Storage URLs are temporary; a native img avoids remotePatterns.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cover.url}
      alt=""
      className="aspect-video w-full object-cover"
    />
  );
}

function QuoteCard({
  requestId,
  canAccept,
  proposal,
}: {
  requestId: string;
  canAccept: boolean;
  proposal: BuyerProposal;
}) {
  return (
    <Dialog>
      <Card className="overflow-hidden py-0">
        <QuoteCover proposal={proposal} />
        <CardHeader className="gap-2 px-4 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">{proposal.label}</CardTitle>
            {proposal.status === "ACCEPTED" ? (
              <Badge variant="success">Aceptada</Badge>
            ) : null}
          </div>
          <p className="font-medium">{formatMoney(proposal.totalPrice)}</p>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="min-h-11 w-full">
              Ver cotización
            </Button>
          </DialogTrigger>
        </CardContent>
      </Card>
      <QuoteDetailDialog
        requestId={requestId}
        canAccept={canAccept}
        proposal={proposal}
      />
    </Dialog>
  );
}

export function CompareProposals({
  requestId,
  canAccept,
  proposals,
}: CompareProposalsProps) {
  if (proposals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aún no hay cotizaciones</CardTitle>
          <CardDescription>
            El concierge está buscando propuestas. Cuando lleguen, las
            compararás aquí sin ver quién cotizó.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {proposals.map((proposal) => (
        <li key={proposal.id}>
          <QuoteCard
            requestId={requestId}
            canAccept={canAccept}
            proposal={proposal}
          />
        </li>
      ))}
    </ul>
  );
}
