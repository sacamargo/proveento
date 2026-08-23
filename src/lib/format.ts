const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
});

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatDate(value: Date): string {
  return dateFormatter.format(value);
}

export function formatMoney(value: number): string {
  return currencyFormatter.format(value);
}

export function formatThousands(value: number): string {
  if (!value) {
    return "";
  }
  return new Intl.NumberFormat("es-CO").format(value);
}

export function parseThousandsInput(raw: string, maxDigits = 12): number {
  const digits = raw.replace(/\D/g, "").slice(0, maxDigits);
  return digits ? Number(digits) : 0;
}

export function digitsOnly(value: string, max = 10): string {
  return value.replace(/\D/g, "").slice(0, max);
}

export function isColombianMobile(value: string): boolean {
  return /^3\d{9}$/.test(digitsOnly(value));
}

export function formatColombianMobile(digits: string): string {
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function optionalLabel(label: string): string {
  return `${label} (opcional)`;
}
