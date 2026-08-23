"use client";

import { Input } from "@/components/ui/input";
import { formatThousands, parseThousandsInput } from "@/lib/format";

type MoneyInputProps = {
  id: string;
  name?: string;
  value: number;
  invalid?: boolean;
  describedBy?: string;
  onChange: (value: number) => void;
  onBlur?: () => void;
};

export function MoneyInput({
  id,
  name,
  value,
  invalid,
  describedBy,
  onChange,
  onBlur,
}: MoneyInputProps) {
  return (
    <Input
      id={id}
      name={name}
      inputMode="numeric"
      autoComplete="off"
      aria-invalid={invalid}
      aria-describedby={describedBy}
      value={formatThousands(value)}
      onChange={(event) => onChange(parseThousandsInput(event.target.value))}
      onBlur={onBlur}
    />
  );
}
