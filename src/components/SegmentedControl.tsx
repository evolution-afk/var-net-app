import type { LucideIcon } from "lucide-react";

interface SegmentOption {
  value: string;
  label: string;
  Icon?: LucideIcon;
}

interface SegmentedControlProps {
  label: string;
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ label, options, value, onChange }: SegmentedControlProps) {
  return (
    <div aria-label={label} className="segmented-control" role="tablist">
      {options.map(({ value: optionValue, label: optionLabel, Icon }) => (
        <button
          aria-selected={value === optionValue}
          className={`segment-button ${value === optionValue ? "is-selected" : ""}`}
          key={optionValue}
          onClick={() => onChange(optionValue)}
          role="tab"
          type="button"
        >
          {Icon && <Icon size={16} />}
          {optionLabel}
        </button>
      ))}
    </div>
  );
}
