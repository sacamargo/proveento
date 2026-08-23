"use client";

import { useState } from "react";

import { acceptProposal } from "@/actions/accept-proposal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type AcceptProposalButtonProps = {
  requestId: string;
  proposalId: string;
  label: string;
};

export function AcceptProposalButton({
  requestId,
  proposalId,
  label,
}: AcceptProposalButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onAccept() {
    setError(null);
    setPending(true);
    const result = await acceptProposal({ requestId, proposalId });
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="grid gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" className="min-h-11 w-full" disabled={pending}>
            {pending ? "Aceptando…" : "Aceptar propuesta"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aceptar esta propuesta?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a aceptar {label}. Al confirmar se revelará el contacto del
              proveedor y la solicitud quedará emparejada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11"
              disabled={pending}
              onClick={(event) => {
                event.preventDefault();
                void onAccept();
              }}
            >
              {pending ? "Aceptando…" : "Sí, aceptar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
