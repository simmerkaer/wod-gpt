import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WeightUnit } from "@/components/UnitSelector";

const STORAGE_KEY = "wod-gpt-weight-unit";

function readStored(): WeightUnit {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "kg" || v === "lbs") return v;
  } catch {
    /* ignore */
  }
  return "kg";
}

type Ctx = {
  weightUnit: WeightUnit;
  setWeightUnit: (u: WeightUnit) => void;
};

const WeightUnitContext = createContext<Ctx | undefined>(undefined);

export function WeightUnitProvider({ children }: { children: ReactNode }) {
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>(readStored);

  const setWeightUnit = useCallback((u: WeightUnit) => {
    setWeightUnitState(u);
    try {
      localStorage.setItem(STORAGE_KEY, u);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ weightUnit, setWeightUnit }),
    [weightUnit, setWeightUnit],
  );

  return (
    <WeightUnitContext.Provider value={value}>
      {children}
    </WeightUnitContext.Provider>
  );
}

export function useWeightUnit() {
  const ctx = useContext(WeightUnitContext);
  if (!ctx) {
    throw new Error("useWeightUnit must be used within WeightUnitProvider");
  }
  return ctx;
}
