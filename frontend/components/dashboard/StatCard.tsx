interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  variant: "blue" | "green" | "purple" | "orange";
}

const variantStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
  },
  green: {
    icon: "bg-green-50 text-green-600",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
  },
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  variant,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${variantStyles[variant].icon}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <span className="text-xs font-semibold tracking-wide text-slate-500">
          {title}
        </span>

        <strong className="mt-1 block text-2xl font-bold text-slate-900">
          {value}
        </strong>

        <small className="text-xs text-slate-500">
          {description}
        </small>
      </div>
    </div>
  );
}