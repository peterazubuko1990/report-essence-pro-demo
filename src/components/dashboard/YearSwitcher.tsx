import { useYear } from "@/lib/year-context";

export function YearSwitcher() {
  const { year, setYear, years } = useYear();
  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-white/10 border border-white/20 p-0.5">
      {years.map((y) => (
        <button
          key={y}
          onClick={() => setYear(y)}
          className={`px-3 py-1 rounded text-[11px] font-semibold tracking-wide transition ${
            y === year ? "bg-itf-gold text-itf-ink" : "text-white/80 hover:bg-white/10"
          }`}
        >
          FY {y}
        </button>
      ))}
    </div>
  );
}
