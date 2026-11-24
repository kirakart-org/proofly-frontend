import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { demoData } from "../data/demo";
import type { ProofpageData } from "../types";

type ProofpageContextValue = {
  data: ProofpageData;
  setData: Dispatch<SetStateAction<ProofpageData>>;
  notify: (message: string) => void;
};

const ProofpageContext = createContext<ProofpageContextValue | null>(null);
const STORAGE_KEY = "proofpage-demo-v1";

export function ProofpageProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProofpageData>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as ProofpageData) : demoData;
  });
  const [toast, setToast] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);
  const value = useMemo(() => ({ data, setData, notify }), [data, notify]);

  return (
    <ProofpageContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-dot" />
          {toast}
        </div>
      )}
    </ProofpageContext.Provider>
  );
}

export function useProofpage() {
  const context = useContext(ProofpageContext);
  if (!context) throw new Error("useProofpage must be used within ProofpageProvider");
  return context;
}
