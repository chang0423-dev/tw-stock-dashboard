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
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === r.value
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
