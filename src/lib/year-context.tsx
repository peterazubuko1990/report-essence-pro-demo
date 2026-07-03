import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  year: number;
  setYear: (y: number) => void;
  years: number[];              // all registered years
  yearsWithData: number[];      // years that actually contain KRA/revenue/training data
  hasData: (y: number) => boolean;
};

const YearCtx = createContext<Ctx>({
  year: new Date().getFullYear(),
  setYear: () => {},
  years: [],
  yearsWithData: [],
  hasData: () => false,
});

async function fetchYearsWithData(): Promise<number[]> {
  // Union of years that have any operational data across the primary tables.
  const tables = ["kra_rows", "revenue_rows", "area_revenue", "training_programmes", "staff_school", "hr_metrics"] as const;
  const found = new Set<number>();
  for (const t of tables) {
    const { data } = await supabase.from(t).select("year");
    (data ?? []).forEach((r: any) => found.add(r.year));
  }
  return Array.from(found).sort((a, b) => a - b);
}

export function YearProvider({ children }: { children: ReactNode }) {
  const { data: years = [] } = useQuery({
    queryKey: ["years"],
    queryFn: async () => {
      const { data, error } = await supabase.from("years").select("year").order("year");
      if (error) return [] as number[];
      return (data ?? []).map((r) => r.year as number);
    },
  });

  const { data: yearsWithData = [] } = useQuery({
    queryKey: ["years_with_data"],
    queryFn: fetchYearsWithData,
  });

  const [year, setYearState] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const stored = Number(window.localStorage.getItem("itf.year"));
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  });

  useEffect(() => {
    if (!years.length) return;
    if (!year || !years.includes(year)) {
      // Prefer newest year that has data; else newest registered year.
      const target = yearsWithData.length ? yearsWithData[yearsWithData.length - 1] : years[years.length - 1];
      setYearState(target);
    }
  }, [years, yearsWithData, year]);

  const setYear = (y: number) => {
    setYearState(y);
    if (typeof window !== "undefined") window.localStorage.setItem("itf.year", String(y));
  };

  const hasData = (y: number) => yearsWithData.includes(y);

  return (
    <YearCtx.Provider value={{ year, setYear, years, yearsWithData, hasData }}>{children}</YearCtx.Provider>
  );
}

export const useYear = () => useContext(YearCtx);
