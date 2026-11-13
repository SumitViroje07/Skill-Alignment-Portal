import type { LucideIcon } from 'lucide-react';

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'bg-primary-100 text-primary-600',
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card flex w-full items-center gap-4 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={22} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-soft">{label}</span>
        <span className="block truncate text-2xl font-bold text-ink">{value}</span>
      </span>
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-500">
        <Icon size={24} />
      </span>
      <p className="font-semibold text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export function Alert({
  kind,
  message,
}: {
  kind: 'success' | 'error' | 'info';
  message: string;
}) {
  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-primary-200 bg-primary-50 text-primary-700',
  }[kind];
  return (
    <div
      role="status"
      className={`animate-fade-in rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}
    >
      {message}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
    </div>
  );
}
