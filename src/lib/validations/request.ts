import { z } from "zod";

import { isValidLocation } from "@/lib/colombia";

export const requestItemSchema = z.object({
  name: z.string().trim().min(2, "El nombre del producto es obligatorio."),
  quantity: z
    .number({ error: "La cantidad debe ser un número." })
    .int("La cantidad debe ser un número entero.")
    .positive("La cantidad debe ser mayor a 0."),
  description: z.string().trim().optional(),
});

export const createRequestSchema = z
  .object({
    items: z.array(requestItemSchema).min(1, "Agrega al menos un producto."),
    department: z.string().trim().min(1, "El departamento es obligatorio."),
    city: z.string().trim().min(1, "La ciudad es obligatoria."),
    deadline: z
      .string()
      .min(1, "La fecha límite es obligatoria.")
      .refine((value) => {
        const selected = new Date(`${value}T12:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return !Number.isNaN(selected.getTime()) && selected > today;
      }, "La fecha límite debe ser posterior a hoy."),
  })
  .refine((data) => isValidLocation(data.department, data.city), {
    message: "La ciudad no pertenece al departamento seleccionado.",
    path: ["city"],
  });

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type RequestItemInput = z.infer<typeof requestItemSchema>;
