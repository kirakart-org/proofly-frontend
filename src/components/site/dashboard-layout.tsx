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
  Star,
  LogOut,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getPublicProfileUrl } from "../../lib/public-profile";
import { useProofly } from "../../hooks/use-proofly";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

const navigation = [
  { path: "overview", label: "Overview", icon: LayoutDashboard },
  { path: "business", label: "Business page", icon: Globe2 },
  { path: "offerings", label: "Products & services", icon: PackageOpen },
  { path: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { path: "testimonials", label: "Testimonials", icon: Star },
  { path: "enquiries", label: "Enquiries", icon: MessageSquareText },
];

export function DashboardLayout() {
  const { data, notify, logout, userEmail } = useProofly();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const publicProfileUrl = getPublicProfileUrl(data.business.slug);
  const accountInitials = userEmail.split("@")[0].slice(0, 2).toUpperCase() || "A";
  const title =
    navigation.find((item) => location.pathname.endsWith(`/${item.path}`))?.label ??
    (location.pathname === "/app" ? "Overview" : "Settings");
  const copyPageLink = async () => {
    if (!publicProfileUrl) {
      notify("Your public page URL is not ready yet.");
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable in this browser.");
      }
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopied(true);
      notify("Copied!");
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      notify(error instanceof Error ? `Could not copy link: ${error.message}` : "Could not copy your page link.");
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setAccountMenuOpen(false);
    try {
      await logout();
      notify("You have been logged out.");
    } catch {
      notify("You have been logged out locally. The server could not end the session.");
    } finally {
      navigate("/login", { replace: true });
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
            <span className="brand-mark"><span /><span /><span /></span><span>proofly</span>
          </Link>
          <span className="crumb-slash">/</span>
          <span className="crumb-label">{title}</span>
        </div>
        <div className="topbar-actions">
          {data.business.id && publicProfileUrl ? (
            <a href={publicProfileUrl} target="_blank" rel="noreferrer" className="preview-link">
              <span className="status-dot" /> View live page <ArrowUpRight size={15} />
            </a>
          ) : null}
          <span className="topbar-divider" />
          <div className="account-dropdown">
            <button className="user-menu" type="button" aria-label="Account menu" aria-haspopup="menu" aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen((open) => !open)}>
              <span className="user-avatar">{accountInitials}</span><span className="user-email">{userEmail || "Account"}</span><ChevronDown size={14} />
            </button>
            {accountMenuOpen && (
              <div className="account-menu" role="menu">
                <button type="button" role="menuitem" disabled={isLoggingOut} onClick={() => void handleLogout()}>
                  <LogOut size={14} /> {isLoggingOut ? "Logging out…" : "Log out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <div className="workspace-body">
        <aside className={`workspace-sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
          <div className="sidebar-mobile-head">
            <Link to="/" className="brand-lockup"><span className="brand-mark"><span /><span /><span /></span><span>proofly</span></Link>
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
          {data.business.id && <div className="sidebar-page-card">
            <div className="page-card-head">{publicProfileUrl ? <span className="page-live"><span className="status-dot" /> {data.business.isPublished ? "Page is live" : "Draft mode"}</span> : <Skeleton className="skeleton-page-status" />}<ShieldCheck size={14} /></div>
            <div className="sidebar-business-name">{data.business.name || <Skeleton className="skeleton-business-name" />}</div>
            <p>Share your work with the people who need it.</p>
            <div className="page-url">{publicProfileUrl || <Skeleton className="skeleton-url" />}</div>
            <div className="page-card-actions">
              <button type="button" onClick={() => void copyPageLink()} disabled={!publicProfileUrl}><Copy size={12} /> {copied ? "Copied!" : "Copy link"}</button>
              <Link to="/app/business">Edit page <ArrowUpRight size={13} /></Link>
            </div>
          </div>}
          <div className="sidebar-footer">
            <NavLink to="/app/settings"><Settings2 size={17} /> Settings</NavLink>
            <a href="mailto:hello@proofly.page"><CircleHelp size={17} /> Help & support</a>
          </div>
        </aside>
        <main className="workspace-main"><Outlet /></main>
      </div>
    </div>
  );
}
