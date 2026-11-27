import { Navigate, Route, Routes } from "react-router-dom";
import { ProoflyProvider, useProofly } from "./hooks/use-proofly";
import { LandingPage } from "./components/site/landing-page";
import { DashboardLayout } from "./components/site/dashboard-layout";
import { WorkspacePage } from "./components/site/workspace-page";
import { PublicProfilePage } from "./components/site/public-profile-page";
import { AuthPage } from "./components/site/auth-page";
import { getSubdomainUsername } from "./lib/public-profile";

function ProtectedDashboard() {
  const { isAuthenticated } = useProofly();
  return isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />;
}

export default function App() {
  const subdomainUsername = getSubdomainUsername(window.location.hostname);

  if (subdomainUsername) {
    return <PublicProfilePage username={subdomainUsername} />;
  }

  return (
    <ProoflyProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/app" element={<ProtectedDashboard />}>
          <Route index element={<WorkspacePage section="overview" />} />
          <Route path=":section" element={<WorkspacePage />} />
        </Route>
        <Route path="/p/:slug" element={<PublicProfilePage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </ProoflyProvider>
  );
}
