"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

export type TerminologyMode = "plain" | "pro";

export type TranslationRoot = {
  professional_term: string;
  plain_english_term: string;
  explanation: string;
  sort_order: number;
};

type TerminologyContextValue = {
  mode: TerminologyMode;
  setMode: (mode: TerminologyMode) => void;
  roots: TranslationRoot[];
  loading: boolean;
};

const TerminologyContext = createContext<TerminologyContextValue | null>(null);

export function TerminologyProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<TerminologyMode>("plain");
  const [roots, setRoots] = useState<TranslationRoot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRoots() {
      const { data, error } = await supabase
        .from("translation_roots")
        .select("professional_term, plain_english_term, explanation, sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (!active) return;
      if (!error && data) {
        setRoots(data as TranslationRoot[]);
      }
    }

    async function applyProfileDefault(userId: string | null) {
      if (!userId) {
        if (active) setMode("plain");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("knowledge_level")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;
      setMode(data?.knowledge_level === "professional" ? "pro" : "plain");
    }

    async function initialize() {
      await loadRoots();
      const { data: { session } } = await supabase.auth.getSession();
      await applyProfileDefault(session?.user?.id ?? null);
      if (active) setLoading(false);
    }

    void initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void applyProfileDefault(session?.user?.id ?? null);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, roots, loading }),
    [mode, roots, loading],
  );

  return (
    <TerminologyContext.Provider value={value}>
      {children}
    </TerminologyContext.Provider>
  );
}

export function useTerminology() {
  const value = useContext(TerminologyContext);
  if (!value) {
    throw new Error("useTerminology must be used within TerminologyProvider.");
  }
  return value;
}
