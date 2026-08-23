import { z } from "zod";

export const proposalMediaSchema = z.object({
  path: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
});

export const createProposalSchema = z
  .object({
    requestId: z.string().min(1, "Falta la solicitud."),
    providerId: z.string().min(1, "Selecciona un proveedor."),
    totalPrice: z
      .number({ error: "El precio debe ser un número." })
      .positive("El precio debe ser mayor a 0."),
    deliveryIncluded: z.boolean(),
    deliveryCost: z.number(),
    installationNeeded: z.boolean(),
    installationIncluded: z.boolean(),
    warrantyPreset: z.enum(["1", "2", "3", "4", "5", "other"]),
    warrantyOtherYears: z.number(),
    conditions: z.string().trim().optional(),
    media: z.array(proposalMediaSchema),
  })
  .superRefine((data, ctx) => {
    if (!data.deliveryIncluded && data.deliveryCost <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryCost"],
        message: "Indica el valor de la entrega.",
      });
    }

    if (data.warrantyPreset === "other" && data.warrantyOtherYears < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["warrantyOtherYears"],
        message: "Indica cuántos años de garantía quieres dar.",
      });
    }
  });

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
