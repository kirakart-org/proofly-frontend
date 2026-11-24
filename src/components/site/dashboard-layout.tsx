import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  Copy,
  CircleHelp,
  Globe2,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PackageOpen,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useProofpage } from "../../hooks/use-proofpage";
import { Button } from "../ui/button";

const navigation = [
  { path: "overview", label: "Overview", icon: LayoutDashboard },
  { path: "business", label: "Business page", icon: Globe2 },
  { path: "offerings", label: "Products & services", icon: PackageOpen },
  { path: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { path: "testimonials", label: "Testimonials", icon: Star },
  { path: "enquiries", label: "Enquiries", icon: MessageSquareText },
];

export function DashboardLayout() {
  const { data, notify } = useProofpage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title =
    navigation.find((item) => location.pathname.endsWith(`/${item.path}`))?.label ??
    (location.pathname === "/app" ? "Overview" : "Settings");
  const copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${data.business.slug}`);
      notify("Your public page link has been copied.");
    } catch (error) {
      notify(error instanceof Error ? `Could not copy link: ${error.message}` : "Could not copy your page link.");
    }
  };

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <div className="topbar-left">
          <Button variant="ghost" size="icon" className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu size={19} />
          </Button>
          <Link to="/" className="brand-lockup workspace-brand">
            <span className="brand-mark"><span /><span /><span /></span><span>proofpage</span>
          </Link>
          <span className="crumb-slash">/</span>
          <span className="crumb-label">{title}</span>
        </div>
        <div className="topbar-actions">
          <Link to={`/p/${data.business.slug}`} target="_blank" rel="noreferrer" className="preview-link">
            <span className="status-dot" /> View live page <ArrowUpRight size={15} />
          </Link>
          <span className="topbar-divider" />
          <button className="user-menu" type="button" aria-label="Account menu">
            <span className="user-avatar">JS</span><span className="user-email">{data.business.email}</span><ChevronDown size={14} />
          </button>
        </div>
      </header>

      {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <div className="workspace-body">
        <aside className={`workspace-sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-mobile-head">
            <Link to="/" className="brand-lockup"><span className="brand-mark"><span /><span /><span /></span><span>proofpage</span></Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></Button>
          </div>
          <div className="workspace-label">YOUR WORKSPACE</div>
          <nav className="workspace-nav">
            {navigation.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path === "overview" ? "/app" : `/app/${path}`} end={path === "overview"} onClick={() => setMobileOpen(false)}>
                <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
                {path === "enquiries" && data.leads.filter((lead) => lead.status === "New").length > 0 && (
                  <span className="nav-count">{data.leads.filter((lead) => lead.status === "New").length}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-spacer" />
          <div className="sidebar-page-card">
            <div className="page-card-head"><span className="page-live"><span className="status-dot" /> {data.business.isPublished ? "Page is live" : "Draft mode"}</span><ShieldCheck size={14} /></div>
            <p>Share your work with the people who need it.</p>
            <div className="page-url">proofpage.site/p/{data.business.slug}</div>
            <div className="page-card-actions">
              <button type="button" onClick={copyPageLink}><Copy size={12} /> Copy link</button>
              <Link to="/app/business">Edit page <ArrowUpRight size={13} /></Link>
            </div>
          </div>
          <div className="sidebar-footer">
            <NavLink to="/app/settings"><Settings2 size={17} /> Settings</NavLink>
            <a href="mailto:hello@proofpage.site"><CircleHelp size={17} /> Help & support</a>
          </div>
        </aside>
        <main className="workspace-main"><Outlet /></main>
      </div>
      <div className="demo-banner"><Sparkles size={13} /> Interactive demo · Your changes are saved in this browser</div>
    </div>
  );
}
