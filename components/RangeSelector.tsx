import type { HistoryRange } from "@/types/stock";

const RANGES: { value: HistoryRange; label: string }[] = [
  { value: "1m", label: "近 1 個月" },
  { value: "3m", label: "近 3 個月" },
  { value: "1y", label: "近 1 年" },
];

interface RangeSelectorProps {
  value: HistoryRange;
  onChange: (range: HistoryRange) => void;
}

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-800 bg-gray-900 p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === r.value
              ? "bg-gray-700 text-gray-100 shadow-sm"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
