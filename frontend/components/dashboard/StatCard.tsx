import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  variant: "blue" | "green" | "purple" | "orange";
  href: string;
}

const variantStyles = {
  blue: {
    icon: "stat-card__icon--blue text-blue-700",
  },
  green: {
    icon: "stat-card__icon--green text-green-700",
  },
  purple: {
    icon: "stat-card__icon--purple text-purple-700",
  },
  orange: {
    icon: "stat-card__icon--orange text-orange-700",
  },
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  variant,
  href,
}: StatCardProps) {
  return (
    <Link href={href} className="stat-card flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`stat-card__icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${variantStyles[variant].icon}`}
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
    </Link>
  );
}