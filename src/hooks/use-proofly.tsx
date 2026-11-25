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
import { api } from "../api.js";
import type { ProoflyData } from "../types";

type ProoflyContextValue = {
  data: ProoflyData;
  setData: Dispatch<SetStateAction<ProoflyData>>;
  isAuthenticated: boolean;
  authenticate: (token: string) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
  notify: (message: string) => void;
};

const ProoflyContext = createContext<ProoflyContextValue | null>(null);
const STORAGE_KEY = "proofly-demo-v1";
const LEGACY_STORAGE_KEY = "proofpage-demo-v1";

function createClearedData(settings: ProoflyData["settings"]): ProoflyData {
  return {
    business: {
      name: "",
      slug: "",
      tagline: "",
      bio: "",
      category: "",
      location: "",
      email: "",
      phone: "",
      instagram: "",
      coverImage: "",
      isPublished: false,
      socialLinks: {},
      theme: "violet",
    },
    offerings: [],
    projects: [],
    testimonials: [],
    leads: [],
    settings,
  };
}

export function ProoflyProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProoflyData>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as ProoflyData) : demoData;
  });
  const [toast, setToast] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(window.localStorage.getItem("token")),
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [data]);

  useEffect(() => {
    const syncAuthentication = (event: StorageEvent) => {
      if (event.key === "token") {
        setIsAuthenticated(Boolean(event.newValue));
        if (!event.newValue) {
          setData((current) => createClearedData(current.settings));
        }
      }
    };
    window.addEventListener("storage", syncAuthentication);
    return () => window.removeEventListener("storage", syncAuthentication);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);
  const authenticate = useCallback((token: string) => {
    window.localStorage.setItem("token", token);
    setIsAuthenticated(true);
  }, []);
  const clearSession = useCallback(() => {
    window.localStorage.removeItem("token");
    window.sessionStorage.removeItem("token");
    setIsAuthenticated(false);
    setData((current) => createClearedData(current.settings));
  }, []);
  const logout = useCallback(async () => {
    try {
      if (window.localStorage.getItem("token")) {
        await api.post("/auth/logout");
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);
  const value = useMemo(
    () => ({ data, setData, isAuthenticated, authenticate, clearSession, logout, notify }),
    [data, isAuthenticated, authenticate, clearSession, logout, notify],
  );

  return (
    <ProoflyContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-dot" />
          {toast}
        </div>
      )}
    </ProoflyContext.Provider>
  );
}

export function useProofly() {
  const context = useContext(ProoflyContext);
  if (!context) throw new Error("useProofly must be used within ProoflyProvider");
  return context;
}
