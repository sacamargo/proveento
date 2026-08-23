"use client";

import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import { createRequest } from "@/actions/request";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  createRequestSchema,
  type CreateRequestInput,
} from "@/lib/validations/request";

const STEPS = [
  { id: "items", title: "Productos", fields: ["items"] as const },
  { id: "city", title: "Ciudad", fields: ["city"] as const },
  { id: "deadline", title: "Fecha", fields: ["deadline"] as const },
  { id: "review", title: "Revisión", fields: [] as const },
];

const defaultValues: CreateRequestInput = {
  items: [{ name: "", quantity: 1, description: "" }],
  city: "",
  deadline: "",
};

export function NewRequestForm() {
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const minDeadline = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }, []);

  async function goNext() {
    const current = STEPS[step];
    if (current.fields.length > 0) {
      const valid = await form.trigger(current.fields);
      if (!valid) {
        return;
      }
    }
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  }

  async function onSubmit(values: CreateRequestInput) {
    setSubmitError(null);
    const result = await createRequest(values);
    if (result?.error) {
      setSubmitError(result.error);
    }
  }

  const values = form.watch();

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-6"
      noValidate
    >
      <ol className="grid grid-cols-4 gap-2" aria-label="Progreso de la solicitud">
        {STEPS.map((item, index) => {
          const isCurrent = index === step;
          const isDone = index < step;
          return (
            <li key={item.id} className="min-w-0">
              <p
                className={`text-xs font-medium ${
                  isCurrent
                    ? "text-foreground"
                    : isDone
                      ? "text-primary"
                      : "text-muted-foreground"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {index + 1}. {item.title}
              </p>
              <div
                className={`mt-1 h-1 rounded-full ${
                  isCurrent || isDone ? "bg-primary" : "bg-muted"
                }`}
              />
            </li>
          );
        })}
      </ol>

      {step === 0 ? (
        <FieldSet>
          <FieldLegend>Qué necesitas cotizar</FieldLegend>
          <FieldDescription>
            Agrega cada producto. Puedes sumar más filas si la solicitud tiene
            varios ítems.
          </FieldDescription>
          <FieldGroup className="mt-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-heading text-base">Producto {index + 1}</p>
                  {fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-11"
                      onClick={() => remove(index)}
                    >
                      <Trash2 data-icon="inline-start" />
                      Quitar
                    </Button>
                  ) : null}
                </div>
                <Controller
                  control={form.control}
                  name={`items.${index}.name`}
                  render={({ field: itemField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor={`item-name-${index}`}>
                        Nombre
                      </FieldLabel>
                      <Input
                        {...itemField}
                        id={`item-name-${index}`}
                        autoComplete="off"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.error ? `item-name-error-${index}` : undefined
                        }
                      />
                      <FieldError
                        id={`item-name-error-${index}`}
                        errors={[fieldState.error]}
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field: itemField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor={`item-qty-${index}`}>
                        Cantidad
                      </FieldLabel>
                      <Input
                        id={`item-qty-${index}`}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.error ? `item-qty-error-${index}` : undefined
                        }
                        value={itemField.value}
                        onChange={(event) =>
                          itemField.onChange(
                            Number.isNaN(event.target.valueAsNumber)
                              ? 0
                              : event.target.valueAsNumber,
                          )
                        }
                        onBlur={itemField.onBlur}
                        name={itemField.name}
                      />
                      <FieldError
                        id={`item-qty-error-${index}`}
                        errors={[fieldState.error]}
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field: itemField, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor={`item-desc-${index}`}>
                        Descripción
                      </FieldLabel>
                      <Textarea
                        {...itemField}
                        id={`item-desc-${index}`}
                        rows={3}
                        aria-invalid={fieldState.invalid}
                        aria-describedby={
                          fieldState.error ? `item-desc-error-${index}` : undefined
                        }
                      />
                      <FieldError
                        id={`item-desc-error-${index}`}
                        errors={[fieldState.error]}
                      />
                    </Field>
                  )}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() =>
                append({ name: "", quantity: 1, description: "" })
              }
            >
              <Plus data-icon="inline-start" />
              Agregar producto
            </Button>
            <FieldError errors={[form.formState.errors.items]} />
          </FieldGroup>
        </FieldSet>
      ) : null}

      {step === 1 ? (
        <FieldSet>
          <FieldLegend>Ciudad de entrega</FieldLegend>
          <Controller
            control={form.control}
            name="city"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                <Input
                  {...field}
                  id="city"
                  autoComplete="address-level2"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.error ? "city-error" : undefined}
                />
                <FieldError id="city-error" errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldSet>
      ) : null}

      {step === 2 ? (
        <FieldSet>
          <FieldLegend>Fecha límite</FieldLegend>
          <Controller
            control={form.control}
            name="deadline"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="deadline">
                  ¿Hasta cuándo necesitas las cotizaciones?
                </FieldLabel>
                <Input
                  {...field}
                  id="deadline"
                  type="date"
                  min={minDeadline}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.error ? "deadline-error" : undefined
                  }
                />
                <FieldDescription>
                  Los proveedores verán esta fecha como tope para responder.
                </FieldDescription>
                <FieldError id="deadline-error" errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldSet>
      ) : null}

      {step === 3 ? (
        <section className="grid gap-4" aria-labelledby="review-title">
          <h2 id="review-title" className="font-heading text-xl">
            Revisa y publica
          </h2>
          <div className="grid gap-3 rounded-xl border border-border bg-card p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Ciudad: </span>
              {values.city}
            </p>
            <p>
              <span className="text-muted-foreground">Fecha límite: </span>
              {values.deadline}
            </p>
            <Separator />
            <ul className="grid gap-2">
              {values.items.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  {item.quantity} × {item.name}
                  <span className="block text-muted-foreground">
                    {item.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
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

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={step === 0 || form.formState.isSubmitting}
          onClick={() => setStep((value) => Math.max(value - 1, 0))}
        >
          Atrás
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" className="min-h-11" onClick={goNext}>
            Continuar
          </Button>
        ) : (
          <Button
            type="submit"
            className="min-h-11"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Publicando…" : "Publicar solicitud"}
          </Button>
        )}
      </div>
    </form>
  );
}
