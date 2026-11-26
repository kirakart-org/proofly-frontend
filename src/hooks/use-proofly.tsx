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
import { api, ApiError } from "../api.js";
import {
  createEmptyBusiness,
  isBusinessApiProfile,
  toBusinessDraft,
  unwrapBusinessApiProfile,
} from "../lib/business-profile";
import type { ProoflyData } from "../types";

type ProoflyContextValue = {
  data: ProoflyData;
  setData: Dispatch<SetStateAction<ProoflyData>>;
  isAuthenticated: boolean;
  userEmail: string;
  businessStatus: "loading" | "ready" | "empty" | "error";
  businessError: string;
  authenticate: (token: string, email: string) => void;
  reloadBusiness: () => void;
  clearSession: () => void;
  logout: () => Promise<void>;
  notify: (message: string) => void;
};

const ProoflyContext = createContext<ProoflyContextValue | null>(null);

function createEmptyData(): ProoflyData {
  return {
    business: createEmptyBusiness(),
    offerings: [],
    projects: [],
    testimonials: [],
    leads: [],
    settings: { emailAlerts: true, searchIndexing: true },
  };
}

export function ProoflyProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProoflyData>(createEmptyData);
  const [toast, setToast] = useState("");
  const [accessToken, setAccessToken] = useState(
    () => window.localStorage.getItem("token"),
  );
  const [userEmail, setUserEmail] = useState(
    () => window.localStorage.getItem("proofly-user-email") ?? "",
  );
  const [businessStatus, setBusinessStatus] = useState<ProoflyContextValue["businessStatus"]>(
    () => window.localStorage.getItem("token") ? "loading" : "empty",
  );
  const [businessError, setBusinessError] = useState("");
  const [businessReloadCount, setBusinessReloadCount] = useState(0);

  useEffect(() => {
    const syncAuthentication = (event: StorageEvent) => {
      if (event.key === "token") {
        setAccessToken(event.newValue);
        setUserEmail(window.localStorage.getItem("proofly-user-email") ?? "");
        setData(createEmptyData());
        setBusinessStatus(event.newValue ? "loading" : "empty");
        setBusinessError("");
      } else if (event.key === "proofly-user-email") {
        setUserEmail(event.newValue ?? "");
      }
    };
    window.addEventListener("storage", syncAuthentication);
    return () => window.removeEventListener("storage", syncAuthentication);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setBusinessStatus("empty");
      return;
    }

    let active = true;
    setBusinessStatus("loading");
    setBusinessError("");

    api.get("/business/me")
      .then((response) => {
        if (!active) return;
        const profile = unwrapBusinessApiProfile(response);
        if (profile === null) {
          setData(createEmptyData());
          setBusinessStatus("empty");
          return;
        }
        if (!isBusinessApiProfile(profile)) {
          throw new Error("The business profile response was incomplete or invalid.");
        }
        setData((current) => ({
          ...createEmptyData(),
          settings: current.settings,
          business: toBusinessDraft(profile),
        }));
        setBusinessStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setData(createEmptyData());
          setBusinessStatus("empty");
          return;
        }
        setBusinessError(error instanceof Error ? error.message : "Unable to load your business profile.");
        setBusinessStatus("error");
      });

    return () => {
      active = false;
    };
  }, [accessToken, businessReloadCount]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);
  const authenticate = useCallback((token: string, email: string) => {
    window.localStorage.setItem("token", token);
    window.localStorage.setItem("proofly-user-email", email);
    setAccessToken(token);
    setUserEmail(email);
    setData(createEmptyData());
    setBusinessStatus("loading");
    setBusinessError("");
    setBusinessReloadCount((count) => count + 1);
  }, []);
  const reloadBusiness = useCallback(() => setBusinessReloadCount((count) => count + 1), []);
  const clearSession = useCallback(() => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("proofly-user-email");
    window.sessionStorage.removeItem("token");
    setAccessToken(null);
    setUserEmail("");
    setData(createEmptyData());
    setBusinessStatus("empty");
    setBusinessError("");
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
  const isAuthenticated = Boolean(accessToken);
  const value = useMemo(
    () => ({
      data,
      setData,
      isAuthenticated,
      userEmail,
      businessStatus,
      businessError,
      authenticate,
      reloadBusiness,
      clearSession,
      logout,
      notify,
    }),
    [data, isAuthenticated, userEmail, businessStatus, businessError, authenticate, reloadBusiness, clearSession, logout, notify],
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
