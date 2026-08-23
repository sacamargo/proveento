"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { createProposalMediaUploadUrl } from "@/actions/proposal-media";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { isAllowedProposalMedia } from "@/lib/storage/proposal-media-shared";
import type { ProposalMedia } from "@/lib/proposal-details";

type PendingUpload = {
  id: string;
  name: string;
};

type ProposalMediaFieldProps = {
  requestId: string;
  value: ProposalMedia[];
  onChange: (value: ProposalMedia[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

function FileNameText({ name }: { name: string }) {
  const lastDot = name.lastIndexOf(".");
  const hasExt =
    lastDot > 0 && lastDot < name.length - 1 && name.length - lastDot <= 8;
  const ext = hasExt ? name.slice(lastDot) : "";
  const base = hasExt ? name.slice(0, lastDot) : name;

  return (
    <span className="flex min-w-0 flex-1" title={name}>
      <span className="truncate">{base}</span>
      {ext ? <span className="shrink-0">{ext}</span> : null}
    </span>
  );
}

export function ProposalMediaField({
  requestId,
  value,
  onChange,
  onUploadingChange,
}: ProposalMediaFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<PendingUpload[]>([]);

  function setBusy(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setError(null);
    const queued = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      file,
    }));
    setPending(queued.map(({ id, name }) => ({ id, name })));
    setBusy(true);

    try {
      const next = [...value];
      for (const item of queued) {
        try {
          if (next.length >= 8) {
            setError("Puedes agregar hasta 8 archivos.");
            break;
          }
          if (item.file.size > 50 * 1024 * 1024) {
            setError("Cada archivo debe pesar menos de 50 MB.");
            continue;
          }
          if (!isAllowedProposalMedia(item.file.type)) {
            setError("Solo se permiten fotos o videos.");
            continue;
          }

          const prepared = await createProposalMediaUploadUrl({
            requestId,
            fileName: item.file.name,
            contentType: item.file.type,
          });

          if (prepared.error || !prepared.signedUrl || !prepared.path) {
            setError(prepared.error ?? "No se pudo subir el archivo.");
            continue;
          }

          const uploaded = await fetch(prepared.signedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": item.file.type,
            },
            body: item.file,
          });

          if (!uploaded.ok) {
            setError("No se pudo completar la carga del archivo.");
            continue;
          }

          next.push({
            path: prepared.path,
            name: item.file.name,
            type: item.file.type,
          });
        } finally {
          setPending((current) =>
            current.filter((pendingItem) => pendingItem.id !== item.id),
          );
        }
      }
      onChange(next);
    } finally {
      setPending([]);
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3" aria-busy={uploading || undefined}>
      <input
        id="proposal-media"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        multiple
        disabled={uploading}
        className="sr-only"
        onChange={(event) => {
          void addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <Button asChild variant="outline" className="min-h-11" disabled={uploading}>
        <label
          htmlFor="proposal-media"
          className={uploading ? "pointer-events-none" : undefined}
        >
          {uploading ? (
            <Loader2
              data-icon="inline-start"
              className="animate-spin motion-reduce:animate-none"
            />
          ) : (
            <ImagePlus data-icon="inline-start" />
          )}
          {uploading ? "Subiendo…" : "Agregar fotos o videos"}
        </label>
      </Button>
      {uploading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Espera a que terminen de subir los archivos para guardar.
        </p>
      ) : null}
      {value.length > 0 || pending.length > 0 ? (
        <ul className="grid gap-2">
          {value.map((item) => (
            <li
              key={item.path}
              className="flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border border-border px-3 py-2 text-sm"
            >
              <FileNameText name={item.name} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11 shrink-0"
                disabled={uploading}
                onClick={() =>
                  onChange(value.filter((current) => current.path !== item.path))
                }
              >
                <Trash2 data-icon="inline-start" />
                Quitar
              </Button>
            </li>
          ))}
          {pending.map((item) => (
            <li
              key={item.id}
              className="flex min-w-0 items-center gap-3 overflow-hidden rounded-lg border border-border px-3 py-2 text-sm"
            >
              <Loader2
                aria-hidden
                className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
              />
              <FileNameText name={item.name} />
              <span className="shrink-0 text-xs text-muted-foreground">
                Subiendo…
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <FieldError errors={[{ message: error }]} /> : null}
    </div>
  );
}
