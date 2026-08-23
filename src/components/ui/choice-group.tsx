"use client";

import { Button } from "@/components/ui/button";

type ChoiceOption<T extends string> = {
  value: T;
  label: string;
};

type ChoiceGroupProps<T extends string> = {
  labelId: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
};

export function ChoiceGroup<T extends string>({
  labelId,
  value,
  options,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      className="grid grid-cols-2 gap-2"
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            variant={checked ? "default" : "outline"}
            className="min-h-11"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
