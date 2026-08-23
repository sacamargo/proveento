"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createProviderAsAdmin } from "@/actions/provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AdminProvider } from "@/lib/admin/queries";
import { digitsOnly, formatColombianMobile } from "@/lib/format";
import {
  createProviderSchema,
  type CreateProviderInput,
} from "@/lib/validations/provider";

type CreateProviderDialogProps = {
  onCreated: (provider: AdminProvider) => void;
};

const defaultValues: CreateProviderInput = {
  name: "",
  email: "",
  phone: "",
};

export function CreateProviderDialog({ onCreated }: CreateProviderDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateProviderInput>({
    resolver: zodResolver(createProviderSchema),
    defaultValues,
    mode: "onBlur",
  });

  async function onSubmit(values: CreateProviderInput) {
    setSubmitError(null);
    const result = await createProviderAsAdmin(values);
    if (result.error || !result.provider) {
      setSubmitError(result.error ?? "No se pudo registrar el proveedor.");
      return;
    }

    onCreated(result.provider);
    form.reset(defaultValues);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSubmitError(null);
          form.reset(defaultValues);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11">
          Registrar proveedor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo proveedor</DialogTitle>
          <DialogDescription>
            Queda en tu directorio para atribuirle cotizaciones. El comprador no
            verá estos datos hasta aceptar una propuesta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="provider-name">
                    Nombre comercial
                  </FieldLabel>
                  <Input
                    {...field}
                    id="provider-name"
                    autoComplete="organization"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.error ? "provider-name-error" : undefined
                    }
                  />
                  <FieldError
                    id="provider-name-error"
                    errors={[fieldState.error]}
                  />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="provider-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="provider-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.error ? "provider-email-error" : undefined
                    }
                  />
                  <FieldError
                    id="provider-email-error"
                    errors={[fieldState.error]}
                  />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="provider-phone">Celular</FieldLabel>
                  <FieldDescription>
                    10 dígitos y siempre empieza por 3. Ejemplo: 300 123 4567.
                  </FieldDescription>
                  <Input
                    id="provider-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.error ? "provider-phone-error" : undefined
                    }
                    value={formatColombianMobile(digitsOnly(field.value ?? ""))}
                    onChange={(event) => {
                      const next = digitsOnly(event.target.value);
                      if (next.length > 0 && next[0] !== "3") {
                        return;
                      }
                      field.onChange(next);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                  <FieldError
                    id="provider-phone-error"
                    errors={[fieldState.error]}
                  />
                </Field>
              )}
            />
          </FieldGroup>
          {submitError ? (
            <div
              role="alert"
              tabIndex={-1}
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <p className="font-medium">Hay un problema</p>
              <p>{submitError}</p>
            </div>
          ) : null}
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              className="min-h-11"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Guardando…" : "Guardar proveedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
