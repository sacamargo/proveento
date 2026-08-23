"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createProposalAsAdmin } from "@/actions/proposal";
import { CreateProviderDialog } from "@/components/admin/create-provider-dialog";
import { ProposalMediaField } from "@/components/admin/proposal-media-field";
import { Button } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choice-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import type { AdminProvider } from "@/lib/admin/queries";
import { optionalLabel } from "@/lib/format";
import {
  createProposalSchema,
  type CreateProposalInput,
} from "@/lib/validations/proposal";

const WARRANTY_OPTIONS = [
  { value: "1", label: "1 año" },
  { value: "2", label: "2 años" },
  { value: "3", label: "3 años" },
  { value: "4", label: "4 años" },
  { value: "5", label: "5 años" },
  { value: "other", label: "Otro" },
];

function emptyProposal(requestId: string): CreateProposalInput {
  return {
    requestId,
    providerId: "",
    totalPrice: 0,
    deliveryIncluded: true,
    deliveryCost: 0,
    installationNeeded: false,
    installationIncluded: false,
    warrantyPreset: "1",
    warrantyOtherYears: 0,
    conditions: "",
    media: [],
  };
}

type CreateProposalFormProps = {
  requestId: string;
  providers: AdminProvider[];
};

export function CreateProposalForm({
  requestId,
  providers: initialProviders,
}: CreateProposalFormProps) {
  const [providers, setProviders] = useState(initialProviders);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  const form = useForm<CreateProposalInput>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: emptyProposal(requestId),
    mode: "onBlur",
  });

  const deliveryIncluded = useWatch({
    control: form.control,
    name: "deliveryIncluded",
  });
  const installationNeeded = useWatch({
    control: form.control,
    name: "installationNeeded",
  });
  const warrantyPreset = useWatch({
    control: form.control,
    name: "warrantyPreset",
  });

  const providerOptions = useMemo(
    () =>
      providers.map((provider) => ({
        value: provider.id,
        label: `${provider.name} · ${provider.email}`,
      })),
    [providers],
  );

  async function onSubmit(values: CreateProposalInput) {
    setSubmitError(null);
    setSaved(false);
    const result = await createProposalAsAdmin(values);
    if (result?.error) {
      setSubmitError(result.error);
      return;
    }
    form.reset(emptyProposal(requestId));
    setSaved(true);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4"
      noValidate
    >
      <FieldSet>
        <FieldLegend>Cargar cotización</FieldLegend>
        <FieldDescription>
          Atribuye la propuesta a un proveedor. El comprador no verá su
          identidad hasta aceptarla.
        </FieldDescription>
        <FieldGroup className="mt-4">
          <Controller
            control={form.control}
            name="providerId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="providerId">Proveedor</FieldLabel>
                <SearchableSelect
                  id="providerId"
                  value={field.value}
                  options={providerOptions}
                  placeholder="Selecciona un proveedor"
                  searchPlaceholder="Escribe para buscar…"
                  emptyText="No hay proveedores con ese nombre."
                  invalid={fieldState.invalid}
                  onChange={field.onChange}
                />
                <FieldError id="provider-error" errors={[fieldState.error]} />
              </Field>
            )}
          />
          <CreateProviderDialog
            onCreated={(provider) => {
              setProviders((current) => {
                if (current.some((item) => item.id === provider.id)) {
                  return current;
                }
                return [...current, provider].sort((a, b) =>
                  a.name.localeCompare(b.name, "es"),
                );
              });
              form.setValue("providerId", provider.id, { shouldValidate: true });
            }}
          />
          <Controller
            control={form.control}
            name="totalPrice"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="totalPrice">Precio</FieldLabel>
                <MoneyInput
                  id="totalPrice"
                  name={field.name}
                  value={field.value}
                  invalid={fieldState.invalid}
                  describedBy={
                    fieldState.error ? "total-price-error" : undefined
                  }
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                <FieldDescription>Valor de la cotización en COP.</FieldDescription>
                <FieldError
                  id="total-price-error"
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="deliveryIncluded"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel id="delivery-included-label" htmlFor="deliveryIncluded">
                  Entrega incluida en el precio
                </FieldLabel>
                <ChoiceGroup
                  labelId="delivery-included-label"
                  value={field.value ? "yes" : "no"}
                  options={[
                    { value: "yes", label: "Incluida" },
                    { value: "no", label: "No incluida" },
                  ]}
                  onChange={(next) => {
                    const included = next === "yes";
                    field.onChange(included);
                    if (included) {
                      form.setValue("deliveryCost", 0);
                    }
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {!deliveryIncluded ? (
            <Controller
              control={form.control}
              name="deliveryCost"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="deliveryCost">Valor de la entrega</FieldLabel>
                  <MoneyInput
                    id="deliveryCost"
                    name={field.name}
                    value={field.value}
                    invalid={fieldState.invalid}
                    describedBy={
                      fieldState.error ? "delivery-cost-error" : undefined
                    }
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  <FieldError
                    id="delivery-cost-error"
                    errors={[fieldState.error]}
                  />
                </Field>
              )}
            />
          ) : null}
          <Controller
            control={form.control}
            name="installationNeeded"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel
                  id="installation-needed-label"
                  htmlFor="installationNeeded"
                >
                  ¿La instalación es necesaria?
                </FieldLabel>
                <ChoiceGroup
                  labelId="installation-needed-label"
                  value={field.value ? "yes" : "no"}
                  options={[
                    { value: "yes", label: "Sí" },
                    { value: "no", label: "No" },
                  ]}
                  onChange={(next) => {
                    const needed = next === "yes";
                    field.onChange(needed);
                    if (!needed) {
                      form.setValue("installationIncluded", false);
                    }
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {installationNeeded ? (
            <Controller
              control={form.control}
              name="installationIncluded"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel
                    id="installation-included-label"
                    htmlFor="installationIncluded"
                  >
                    Instalación
                  </FieldLabel>
                  <ChoiceGroup
                    labelId="installation-included-label"
                    value={field.value ? "yes" : "no"}
                    options={[
                      { value: "yes", label: "Incluida" },
                      { value: "no", label: "No incluida" },
                    ]}
                    onChange={(next) => field.onChange(next === "yes")}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          ) : null}
          <Controller
            control={form.control}
            name="warrantyPreset"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="warrantyPreset">Garantía</FieldLabel>
                <SearchableSelect
                  id="warrantyPreset"
                  value={field.value}
                  options={WARRANTY_OPTIONS}
                  placeholder="Selecciona la garantía"
                  searchPlaceholder="Escribe para buscar…"
                  emptyText="No hay opciones con ese texto."
                  invalid={fieldState.invalid}
                  onChange={(next) => {
                    field.onChange(next);
                    if (next !== "other") {
                      form.setValue("warrantyOtherYears", 0);
                    }
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {warrantyPreset === "other" ? (
            <Controller
              control={form.control}
              name="warrantyOtherYears"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel htmlFor="warrantyOtherYears">
                    Años de garantía
                  </FieldLabel>
                  <Input
                    id="warrantyOtherYears"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.error ? "warranty-years-error" : undefined
                    }
                    value={field.value || ""}
                    onChange={(event) =>
                      field.onChange(
                        Number.isNaN(event.target.valueAsNumber)
                          ? 0
                          : event.target.valueAsNumber,
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                  <FieldError
                    id="warranty-years-error"
                    errors={[fieldState.error]}
                  />
                </Field>
              )}
            />
          ) : null}
          <Controller
            control={form.control}
            name="conditions"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="conditions">
                  {optionalLabel("Condiciones")}
                </FieldLabel>
                <Textarea
                  {...field}
                  id="conditions"
                  rows={4}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.error ? "conditions-error" : undefined
                  }
                />
                <FieldDescription>
                  Plazo, forma de pago, vigencia u otras notas para el comprador.
                </FieldDescription>
                <FieldError
                  id="conditions-error"
                  errors={[fieldState.error]}
                />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="media"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="proposal-media">
                  {optionalLabel("Multimedia")}
                </FieldLabel>
                <FieldDescription>
                  Fotos o videos del producto o de la cotización. Hasta 8
                  archivos.
                </FieldDescription>
                <ProposalMediaField
                  requestId={requestId}
                  value={field.value}
                  onChange={field.onChange}
                  onUploadingChange={setMediaUploading}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      {saved && !form.formState.isDirty ? (
        <p
          role="status"
          className="rounded-lg border border-border bg-muted px-3 py-2 text-sm"
        >
          Propuesta guardada. El formulario quedó listo para otra cotización.
        </p>
      ) : null}

      {submitError ? (
        <div
          role="alert"
          tabIndex={-1}
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <p className="font-medium">Hay un problema</p>
          <p>{submitError}</p>
        </div>
      ) : null}

      <Button
        type="submit"
        className="min-h-11"
        disabled={form.formState.isSubmitting || mediaUploading}
      >
        {mediaUploading || form.formState.isSubmitting ? (
          <Loader2
            data-icon="inline-start"
            className="animate-spin motion-reduce:animate-none"
          />
        ) : null}
        {mediaUploading
          ? "Subiendo archivos…"
          : form.formState.isSubmitting
            ? "Guardando…"
            : "Guardar propuesta"}
      </Button>
    </form>
  );
}
