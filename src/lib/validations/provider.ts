import { z } from "zod";

import { isColombianMobile } from "@/lib/format";

export const createProviderSchema = z.object({
  name: z.string().trim().min(2, "El nombre comercial es obligatorio."),
  email: z.string().email("Ingresa un email válido."),
  phone: z
    .string()
    .trim()
    .min(1, "El celular es obligatorio.")
    .refine(
      (value) => isColombianMobile(value),
      "El celular debe tener 10 dígitos y empezar por 3.",
    ),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
