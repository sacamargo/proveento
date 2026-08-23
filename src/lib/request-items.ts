export type RequestItem = {
  name: string;
  quantity: number;
  description?: string;
};

export function parseRequestItems(value: unknown): RequestItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    if (typeof record.name !== "string" || typeof record.quantity !== "number") {
      return [];
    }

    return [
      {
        name: record.name,
        quantity: record.quantity,
        description:
          typeof record.description === "string" ? record.description : undefined,
      },
    ];
  });
}
