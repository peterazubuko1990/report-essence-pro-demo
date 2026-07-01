import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { year: number; setYear: (y: number) => void; years: number[] };
const YearCtx = createContext<Ctx>({ year: 2024, setYear: () => {}, years: [2023, 2024] });

export function YearProvider({ children }: { children: ReactNode }) {
  const { data: years = [2023, 2024] } = useQuery({
    queryKey: ["years"],
    queryFn: async () => {
      const { data, error } = await supabase.from("years").select("year").order("year");
      if (error) return [2023, 2024];
      return (data ?? []).map((r) => r.year as number);
    },
  });

  const [year, setYearState] = useState<number>(() => {
    if (typeof window === "undefined") return 2024;
    const stored = Number(window.localStorage.getItem("itf.year"));
    return Number.isFinite(stored) && stored > 0 ? stored : 2024;
  });

  useEffect(() => {
    if (years.length && !years.includes(year)) setYearState(years[years.length - 1]);
  }, [years, year]);

  const setYear = (y: number) => {
    setYearState(y);
    if (typeof window !== "undefined") window.localStorage.setItem("itf.year", String(y));
  };

  return <YearCtx.Provider value={{ year, setYear, years }}>{children}</YearCtx.Provider>;
}

export const useYear = () => useContext(YearCtx);
