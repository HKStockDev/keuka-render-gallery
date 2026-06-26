"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  projectCount: number;
  totalProjectCount: number;
  imageCount: number;
}

export default function SearchBar({
  value,
  onChange,
  projectCount,
  totalProjectCount,
  imageCount,
}: SearchBarProps) {
  const isFiltering = value.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search projects…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-keuka-accent/40 focus:ring-1 focus:ring-keuka-accent/30 transition"
        />
        {isFiltering && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-sm text-[var(--muted)]">
        {isFiltering ? (
          <>
            Showing <span className="text-[var(--foreground)]">{projectCount}</span> of{" "}
            {totalProjectCount} projects ·{" "}
            <span className="text-[var(--foreground)]">{imageCount}</span> renders
          </>
        ) : (
          <>
            <span className="text-[var(--foreground)]">{projectCount}</span> projects ·{" "}
            <span className="text-[var(--foreground)]">{imageCount}</span> renders
          </>
        )}
      </p>
    </div>
  );
}
