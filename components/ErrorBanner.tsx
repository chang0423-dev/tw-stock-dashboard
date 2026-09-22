interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-300">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-md border border-red-800 px-3 py-1 text-xs font-medium hover:bg-red-900"
        >
          重試
        </button>
      )}
    </div>
  );
}
