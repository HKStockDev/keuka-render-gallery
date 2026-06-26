"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  projectCount: number;
  imageCount: number;
}

export default function SearchBar({
  value,
  onChange,
  projectCount,
  imageCount,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-xl">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-keuka-slate"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search by project name..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-keuka-slate focus:outline-none focus:ring-2 focus:ring-keuka-accent/50 focus:border-keuka-accent/50 transition"
        />
      </div>
      <div className="flex gap-4 text-sm text-keuka-slate shrink-0">
        <span>
          <strong className="text-keuka-accent">{projectCount}</strong> projects
        </span>
        <span>
          <strong className="text-keuka-accent">{imageCount}</strong> renders
        </span>
      </div>
    </div>
  );
}
