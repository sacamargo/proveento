"use client";

import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { createProposalMediaUploadUrl } from "@/actions/proposal-media";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { isAllowedProposalMedia } from "@/lib/storage/proposal-media-shared";
import type { ProposalMedia } from "@/lib/proposal-details";

type ProposalMediaFieldProps = {
  requestId: string;
  value: ProposalMedia[];
  onChange: (value: ProposalMedia[]) => void;
};

export function ProposalMediaField({
  requestId,
  value,
  onChange,
}: ProposalMediaFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const next = [...value];
      for (const file of Array.from(files)) {
        if (next.length >= 8) {
          setError("Puedes agregar hasta 8 archivos.");
          break;
        }
        if (file.size > 50 * 1024 * 1024) {
          setError("Cada archivo debe pesar menos de 50 MB.");
          continue;
        }
        if (!isAllowedProposalMedia(file.type)) {
          setError("Solo se permiten fotos o videos.");
          continue;
        }

        const prepared = await createProposalMediaUploadUrl({
          requestId,
          fileName: file.name,
          contentType: file.type,
        });

        if (prepared.error || !prepared.signedUrl || !prepared.path) {
          setError(prepared.error ?? "No se pudo subir el archivo.");
          continue;
        }

        const uploaded = await fetch(prepared.signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploaded.ok) {
          setError("No se pudo completar la carga del archivo.");
          continue;
        }

        next.push({
          path: prepared.path,
          name: file.name,
          type: file.type,
        });
      }
      onChange(next);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <input
        id="proposal-media"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        multiple
        className="sr-only"
        onChange={(event) => {
          void addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <Button asChild variant="outline" className="min-h-11" disabled={uploading}>
        <label htmlFor="proposal-media">
          <ImagePlus data-icon="inline-start" />
          {uploading ? "Subiendo…" : "Agregar fotos o videos"}
        </label>
      </Button>
      {value.length > 0 ? (
        <ul className="grid gap-2">
          {value.map((item) => (
            <li
              key={item.path}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">{item.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11"
                onClick={() =>
                  onChange(value.filter((current) => current.path !== item.path))
                }
              >
                <Trash2 data-icon="inline-start" />
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <FieldError errors={[{ message: error }]} /> : null}
    </div>
  );
}
