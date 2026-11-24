import { Route, Routes } from "react-router-dom";
import { ProofpageProvider } from "./hooks/use-proofpage";
import { LandingPage } from "./components/site/landing-page";
import { DashboardLayout } from "./components/site/dashboard-layout";
import { WorkspacePage } from "./components/site/workspace-page";
import { PublicProfilePage } from "./components/site/public-profile-page";

export default function App() {
  return (
    <ProofpageProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<WorkspacePage section="overview" />} />
          <Route path=":section" element={<WorkspacePage />} />
        </Route>
        <Route path="/p/:slug" element={<PublicProfilePage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </ProofpageProvider>
  );
}
