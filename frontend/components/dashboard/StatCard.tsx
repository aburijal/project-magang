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
    icon: "bg-[#E7EFF8] text-[#315F86]",
    accent: "bg-[#315F86]",
  },
  green: {
    icon: "bg-[#DCEDE7] text-[#4B806E]",
    accent: "bg-[#4B806E]",
  },
  purple: {
    icon: "bg-[#EAE6F5] text-[#71649A]",
    accent: "bg-[#71649A]",
  },
  orange: {
    icon: "bg-[#F5E8CE] text-[#AD8748]",
    accent: "bg-[#AD8748]",
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
  const styles = variantStyles[variant];

  return (
    <Link
      href={href}
      className="group relative flex min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C5D5E4] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315F86] focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${styles.accent}`}
      />

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold transition-transform duration-200 group-hover:scale-105 ${styles.icon}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase leading-5 tracking-[0.08em] text-slate-500">
          {title}
        </p>

        <strong className="mt-1 block break-words text-2xl font-bold leading-tight tracking-tight text-[#193B5A]">
          {value}
        </strong>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-[#315F86]"
      >
        <path
          d="M5 12h14m-6-6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}