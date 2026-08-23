import type { RequestStatus } from "@prisma/client";

export const requestStatusCopy: Record<RequestStatus, string> = {
  ACTIVE: "Activa",
  MATCHED: "Emparejada",
  CLOSED: "Cerrada",
};
