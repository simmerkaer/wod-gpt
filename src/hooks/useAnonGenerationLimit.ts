import { useCallback, useEffect, useState } from "react";
import {
  ANON_DAILY_LIMIT,
  incrementAnonCount,
  readAnonCount,
} from "@/lib/anonLimit";
import { useAuth } from "./useAuth";

export const useAnonGenerationLimit = () => {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(readAnonCount());
  }, []);

  const remaining = isAuthenticated
    ? Infinity
    : Math.max(0, ANON_DAILY_LIMIT - count);
  const limitReached = !isAuthenticated && count >= ANON_DAILY_LIMIT;

  const recordGeneration = useCallback(() => {
    if (isAuthenticated) return;
    setCount(incrementAnonCount());
  }, [isAuthenticated]);

  return {
    count,
    remaining,
    limit: ANON_DAILY_LIMIT,
    limitReached,
    recordGeneration,
  };
};
