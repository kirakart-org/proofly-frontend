import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  FileImage,
  Mail,
  MessageCircle,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../api.js";
import { useProofly } from "../../hooks/use-proofly";
import { createId, readImageAsDataUrl } from "../../lib/utils";
import { getPublicProfileUrl } from "../../lib/public-profile";
import {
  createEmptyBusiness,
  isBusinessApiProfile,
  toBusinessDraft,
  unwrapBusinessApiProfile,
  type BusinessApiProfile,
} from "../../lib/business-profile";
import type { Business, Offering, Project, Testimonial } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";

type WorkspaceSection = "overview" | "business" | "offerings" | "portfolio" | "testimonials" | "enquiries" | "settings";

type DashboardSummary = {
  business_name: string;
  username: string;
  is_published: boolean;
  total_portfolio: number;
  total_products: number;
  total_testimonials: number;
  total_enquiries: number;
  total_page_views: number;
};

type PortfolioApiProject = {
  id: number;
  business_id: number;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  project_url: string | null;
  is_visible: boolean;
};

function isPortfolioApiProject(value: unknown): value is PortfolioApiProject {
  if (typeof value !== "object" || value === null) return false;

  const project = value as Record<string, unknown>;
  return (
    typeof project.id === "number" &&
    Number.isSafeInteger(project.id) &&
    project.id > 0 &&
    typeof project.business_id === "number" &&
    Number.isSafeInteger(project.business_id) &&
    project.business_id > 0 &&
    typeof project.title === "string" &&
    [project.description, project.category, project.image_url, project.project_url].every(
      (field) => field === null || typeof field === "string",
    ) &&
    typeof project.is_visible === "boolean"
  );
}

function toPortfolioProject(project: PortfolioApiProject): Project {
  return {
    id: String(project.id),
    title: project.title,
    category: project.category ?? "",
    caption: project.description ?? "",
    image: project.image_url ?? "",
    projectUrl: project.project_url ?? "",
    isVisible: project.is_visible,
  };
}

function toPortfolioPayload(project: Omit<Project, "id">, includeVisibility: boolean) {
  return {
    title: project.title.trim(),
    description: project.caption.trim() || null,
    category: project.category.trim() || null,
    image_url: project.image.trim() || null,
    project_url: project.projectUrl?.trim() || null,
    ...(includeVisibility ? { is_visible: project.isVisible ?? true } : {}),
  };
}

type ProductApiProduct = {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  image_url: string | null;
  contact_url: string | null;
  is_visible: boolean;
};

function isProductApiProduct(value: unknown): value is ProductApiProduct {
  if (typeof value !== "object" || value === null) return false;

  const product = value as Record<string, unknown>;
  return (
    typeof product.id === "number" &&
    Number.isSafeInteger(product.id) &&
    product.id > 0 &&
    typeof product.business_id === "number" &&
    Number.isSafeInteger(product.business_id) &&
    product.business_id > 0 &&
    typeof product.name === "string" &&
    [product.description, product.category, product.image_url, product.contact_url].every(
      (field) => field === null || typeof field === "string",
    ) &&
    (product.price === null || (typeof product.price === "number" && Number.isFinite(product.price))) &&
    typeof product.is_visible === "boolean"
  );
}

function toProductOffering(product: ProductApiProduct): Offering {
  return {
    id: String(product.id),
    type: "Product",
    title: product.name,
    description: product.description ?? "",
    category: product.category ?? "",
    price: product.price === null
      ? ""
      : `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(product.price)}`,
    image: product.image_url ?? "",
    contactUrl: product.contact_url ?? "",
    isVisible: product.is_visible,
  };
}

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function isValidHttpsImageUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function normalizeImageUrl(value: string) {
  const imageUrl = value.trim();
  if (!imageUrl) return null;
  if (!isValidImageUrl(imageUrl)) {
    throw new Error("Enter a valid HTTP or HTTPS image URL.");
  }
  return imageUrl;
}

async function uploadImage(file: File, redirectForUnauthorized: (error: unknown) => boolean) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 8 MB.");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/uploads/image", formData);
    if (typeof response !== "object" || response === null) {
      throw new Error("The image upload response was invalid.");
    }
    const imageUrl = (response as Record<string, unknown>).image_url;
    if (typeof imageUrl !== "string") {
      throw new Error("The image upload response did not include an image URL.");
    }
    const hostedUrl = normalizeImageUrl(imageUrl);
    if (!hostedUrl) {
      throw new Error("The image upload response did not include an image URL.");
    }
    return hostedUrl;
  } catch (error) {
    redirectForUnauthorized(error);
    throw error;
  }
}

function toProductPayload(product: Omit<Offering, "id">, includeVisibility: boolean) {
  const normalizedPrice = product.price.trim().replace(/[₹,\s]/g, "");
  const price = Number(normalizedPrice);
  if (!normalizedPrice || !Number.isFinite(price) || price < 0) {
    throw new Error("Enter a valid product price.");
  }

  return {
    name: product.title.trim(),
    description: product.description.trim() || null,
    category: product.category?.trim() || null,
    price,
    image_url: normalizeImageUrl(product.image),
    contact_url: product.contactUrl?.trim() || null,
    ...(includeVisibility ? { is_visible: product.isVisible ?? true } : {}),
  };
}

type TestimonialApiRecord = {
  id: number;
  business_id: number;
  customer_name: string;
  feedback: string;
  rating: number;
  photo_url: string | null;
  is_visible: boolean;
};

function isTestimonialApiRecord(value: unknown): value is TestimonialApiRecord {
  if (typeof value !== "object" || value === null) return false;

  const testimonial = value as Record<string, unknown>;
  return (
    typeof testimonial.id === "number" &&
    Number.isSafeInteger(testimonial.id) &&
    testimonial.id > 0 &&
    typeof testimonial.business_id === "number" &&
    Number.isSafeInteger(testimonial.business_id) &&
    testimonial.business_id > 0 &&
    typeof testimonial.customer_name === "string" &&
    typeof testimonial.feedback === "string" &&
    typeof testimonial.rating === "number" &&
    Number.isInteger(testimonial.rating) &&
    testimonial.rating >= 1 &&
    testimonial.rating <= 5 &&
    (testimonial.photo_url === null || typeof testimonial.photo_url === "string") &&
    typeof testimonial.is_visible === "boolean"
  );
}

function toTestimonial(record: TestimonialApiRecord): Testimonial {
  return {
    id: String(record.id),
    name: record.customer_name,
    role: "",
    rating: record.rating,
    review: record.feedback,
    date: "",
    photoUrl: record.photo_url ?? "",
    isVisible: record.is_visible,
  };
}

function toTestimonialPayload(
  testimonial: Omit<Testimonial, "id" | "date">,
  includeVisibility: boolean,
) {
  if (!Number.isInteger(testimonial.rating) || testimonial.rating < 1 || testimonial.rating > 5) {
    throw new Error("Choose a rating between 1 and 5.");
  }

  return {
    customer_name: testimonial.name.trim(),
    feedback: testimonial.review.trim(),
    rating: testimonial.rating,
    photo_url: testimonial.photoUrl?.trim() || null,
    ...(includeVisibility ? { is_visible: testimonial.isVisible ?? true } : {}),
  };
}

type DashboardEnquiryStatus = "new" | "contacted" | "completed";

type DashboardEnquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: DashboardEnquiryStatus;
};

type EnquiryApiRecord = {
  id: number;
  business_id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: DashboardEnquiryStatus;
};

function isDashboardEnquiryStatus(value: unknown): value is DashboardEnquiryStatus {
  return value === "new" || value === "contacted" || value === "completed";
}

function isEnquiryApiRecord(value: unknown): value is EnquiryApiRecord {
  if (typeof value !== "object" || value === null) return false;

  const enquiry = value as Record<string, unknown>;
  return (
    typeof enquiry.id === "number" &&
    Number.isSafeInteger(enquiry.id) &&
    enquiry.id > 0 &&
    typeof enquiry.business_id === "number" &&
    Number.isSafeInteger(enquiry.business_id) &&
    enquiry.business_id > 0 &&
    typeof enquiry.name === "string" &&
    typeof enquiry.email === "string" &&
    (enquiry.phone === null || typeof enquiry.phone === "string") &&
    typeof enquiry.message === "string" &&
    isDashboardEnquiryStatus(enquiry.status)
  );
}

function toDashboardEnquiry(enquiry: EnquiryApiRecord): DashboardEnquiry {
  return {
    id: String(enquiry.id),
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone ?? "",
    message: enquiry.message,
    status: enquiry.status,
  };
}

function isUsernameAvailability(value: unknown): value is { available: boolean } {
  return (
    typeof value === "object" &&
    value !== null &&
    "available" in value &&
    typeof value.available === "boolean"
  );
}

function toBusinessPayload(draft: Business, includePublished: boolean) {
  const socialLinks = { ...(draft.socialLinks ?? {}) };
  if (draft.instagram.trim()) {
    socialLinks.instagram = draft.instagram.trim();
  } else {
    delete socialLinks.instagram;
  }

  return {
    name: draft.name.trim(),
    username: draft.slug.trim(),
    bio: draft.bio.trim() || null,
    category: draft.category.trim() || null,
    logo_url: draft.logoUrl?.trim() || null,
    cover_url: draft.coverImage.trim() || null,
    email: draft.email.trim() || null,
    phone: draft.phone.trim() || null,
    address: draft.location.trim() || null,
    social_links: socialLinks,
    theme: draft.theme?.trim() || "violet",
    ...(includePublished ? { is_published: draft.isPublished } : {}),
  };
}

function isDashboardSummary(value: unknown): value is DashboardSummary {
  if (typeof value !== "object" || value === null) return false;

  const dashboard = value as Record<string, unknown>;
  return (
    typeof dashboard.business_name === "string" &&
    dashboard.business_name.trim().length > 0 &&
    typeof dashboard.username === "string" &&
    dashboard.username.trim().length > 0 &&
    typeof dashboard.is_published === "boolean" &&
    [
      dashboard.total_portfolio,
      dashboard.total_products,
      dashboard.total_testimonials,
      dashboard.total_enquiries,
      dashboard.total_page_views,
    ].every((count) => typeof count === "number" && Number.isSafeInteger(count) && count >= 0)
  );
}

export function WorkspacePage({ section: sectionProp }: { section?: WorkspaceSection }) {
  const { section: routeSection } = useParams();
  const section = (sectionProp ?? routeSection ?? "overview") as WorkspaceSection;
  const { businessStatus, businessError, reloadBusiness } = useProofly();
  if (businessStatus === "loading") return <OverviewSkeleton />;
  if (businessStatus === "error") {
    return (
      <div className="page-stack">
        <PageHeading eyebrow="YOUR WORKSPACE" title="Your business" description="We couldn’t load your business details." />
        <div className="dashboard-state" role="alert">
          <p>{businessError}</p>
          <Button variant="outline" onClick={reloadBusiness}>Try again</Button>
        </div>
      </div>
    );
  }
  switch (section) {
    case "business": return <BusinessEditor />;
    case "offerings": return <OfferingsPage />;
    case "portfolio": return <PortfolioPage />;
    case "testimonials": return <TestimonialsPage />;
    case "enquiries": return <EnquiriesPage />;
    case "settings": return <SettingsPage />;
    default: return <OverviewPage />;
  }
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <div className="page-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function OverviewPage() {
  const { data, setData, clearSession } = useProofly();
  const navigate = useNavigate();
  const businessId = data.business.id;
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [dashboardStatus, setDashboardStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [dashboardError, setDashboardError] = useState("");
  const [recentEnquiries, setRecentEnquiries] = useState<DashboardEnquiry[]>([]);
  const [recentStatus, setRecentStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [recentError, setRecentError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setDashboard(null);
    setDashboardError("");

    if (typeof businessId !== "number" || !Number.isSafeInteger(businessId) || businessId < 1) {
      setDashboardStatus("empty");
      setRecentStatus("missing");
      return () => {
        active = false;
      };
    }

    setDashboardStatus("loading");
    api
      .get(`/dashboard?business_id=${encodeURIComponent(String(businessId))}`)
      .then((response) => {
        if (!isDashboardSummary(response)) {
          throw new Error("The dashboard response was incomplete or invalid.");
        }
        if (active) {
          setDashboard(response);
          setData((current) => ({
            ...current,
            business: {
              ...current.business,
              name: response.business_name,
              slug: response.username,
              isPublished: response.is_published,
            },
          }));
          setDashboardStatus("ready");
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }
        setDashboardError(error instanceof Error ? error.message : "Unable to load dashboard data.");
        setDashboardStatus("error");
      });

    setRecentStatus("loading");
    setRecentError("");
    api
      .get(`/enquiries?business_id=${encodeURIComponent(String(businessId))}`)
      .then((response) => {
        if (!Array.isArray(response) || !response.every(isEnquiryApiRecord) ||
          response.some((enquiry) => enquiry.business_id !== businessId)) {
          throw new Error("The recent enquiries response was incomplete or invalid.");
        }
        if (active) {
          setRecentEnquiries(response.map(toDashboardEnquiry).slice(0, 3));
          setRecentStatus("ready");
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }
        setRecentError(error instanceof Error ? error.message : "Unable to load recent enquiries.");
        setRecentStatus("error");
      });

    return () => {
      active = false;
    };
  }, [businessId, clearSession, navigate, retryCount, setData]);

  if (dashboardStatus !== "ready" || !dashboard) {
    if (dashboardStatus === "loading") return <OverviewSkeleton />;
    const stateMessage =
      dashboardStatus === "error"
          ? dashboardError
          : dashboardStatus === "empty"
            ? "You don't have a business profile yet. Create one to set up your dashboard."
            : "Your dashboard is not available.";

    return (
      <div className="page-stack">
        <PageHeading
          eyebrow="YOUR WORKSPACE"
          title="Your dashboard"
          description="A snapshot of your business and what’s coming your way."
        />
        <div className="dashboard-state" role={dashboardStatus === "error" ? "alert" : "status"}>
          <p>{stateMessage}</p>
          {dashboardStatus === "empty" && <Button asChild variant="outline"><Link to="/app/business">Set up your business</Link></Button>}
          {dashboardStatus === "error" && (
            <Button variant="outline" onClick={() => setRetryCount((count) => count + 1)}>
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  const tasks = [
    { title: "Complete your business profile", detail: `Set up ${dashboard.business_name}.`, done: Boolean(dashboard.business_name), to: "/app/business" },
    { title: "Add products to your page", detail: `${dashboard.total_products} product${dashboard.total_products === 1 ? "" : "s"} on your page.`, done: dashboard.total_products > 0, to: "/app/offerings" },
    { title: "Showcase your best work", detail: `${dashboard.total_portfolio} project${dashboard.total_portfolio === 1 ? "" : "s"} in your portfolio.`, done: dashboard.total_portfolio > 0, to: "/app/portfolio" },
    { title: "Add a little social proof", detail: `${dashboard.total_testimonials} client review${dashboard.total_testimonials === 1 ? "" : "s"} featured.`, done: dashboard.total_testimonials > 0, to: "/app/testimonials" },
  ];
  const progress = Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100);

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="YOUR WORKSPACE"
        title={`Good morning, ${dashboard.business_name}.`}
        description={`A little snapshot of ${dashboard.business_name}, and what’s coming your way.`}
        action={<Button asChild><Link to="/app/business"><Pencil size={15} /> Edit your page</Link></Button>}
      />
      <section className="metric-grid overview-metric-grid">
        <Metric label="Page views" value={dashboard.total_page_views.toLocaleString()} note="Total views" icon={<Eye />} positive />
        <Metric label="Portfolio" value={String(dashboard.total_portfolio)} note="Projects" icon={<FileImage />} />
        <Metric label="Products" value={String(dashboard.total_products)} note="On your page" icon={<PackageOpen />} />
        <Metric label="Testimonials" value={String(dashboard.total_testimonials)} note="Client reviews" icon={<Star />} />
        <Metric label="Enquiries" value={String(dashboard.total_enquiries)} note="Total enquiries" icon={<Users />} positive />
      </section>

      <div className="overview-grid">
        <Card className="setup-card">
          <CardHeader className="setup-header">
            <div><CardTitle>Make your page feel like you</CardTitle><p>Four simple steps to help good-fit clients find you.</p></div>
            <Badge>{progress}% complete</Badge>
          </CardHeader>
          <CardContent>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            <div className="checklist">
              {tasks.map((task) => (
                <button className="checklist-item" type="button" key={task.title} onClick={() => navigate(task.to)}>
                  <span className={`check-circle ${task.done ? "is-done" : ""}`}>{task.done && <Check size={14} />}</span>
                  <span className="checklist-copy"><strong>{task.title}</strong><small>{task.detail}</small></span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="overview-side">
          <Card className="published-card">
            <CardHeader className="published-head">
              <div><CardTitle>Your page</CardTitle><p>One link. All the good stuff.</p></div>
              <span className={`publish-badge ${dashboard.is_published ? "" : "is-draft"}`}><i />{dashboard.is_published ? "Published" : "Draft"}</span>
            </CardHeader>
            <CardContent>
              <div className="published-url">{getPublicProfileUrl(dashboard.username)}</div>
              <div className="published-actions">
                <Button asChild variant="outline" size="sm"><a href={`${getPublicProfileUrl(dashboard.username)}?preview=1`} target="_blank" rel="noreferrer"><Eye size={14} /> Preview page</a></Button>
                <Button asChild variant="secondary" size="sm"><Link to="/app/business"><Pencil size={14} /> Edit</Link></Button>
              </div>
            </CardContent>
          </Card>
          <Card className="recent-card">
            <CardHeader className="recent-head"><CardTitle>Recent enquiries</CardTitle><Link to="/app/enquiries">See all <ArrowUpRight size={14} /></Link></CardHeader>
            <CardContent className="recent-list">
              {recentStatus === "loading" && <RecentEnquiriesSkeleton />}
              {recentStatus === "error" && <div className="recent-loading-error" role="alert">{recentError}<Button variant="outline" size="sm" onClick={() => setRetryCount((count) => count + 1)}>Retry</Button></div>}
              {recentEnquiries.map((lead) => (
                <div className="recent-lead" key={lead.id}>
                  <span className="lead-avatar">{lead.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span>
                  <span className="recent-lead-copy"><strong>{lead.name}</strong><small>{lead.email}</small></span>
                  <Badge className={`lead-status ${lead.status}`}>{`${lead.status[0].toUpperCase()}${lead.status.slice(1)}`}</Badge>
                </div>
              ))}
              {recentStatus === "ready" && recentEnquiries.length === 0 && <p className="muted-copy">New enquiries will show up here.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="overview-note"><Sparkles size={15} /><span><b>A small reminder:</b> the best page is the one that sounds like you. Keep it simple, specific, and real.</span><ArrowDownRight size={17} /></div>
    </div>
  );
}

function Metric({ label, value, note, icon, positive }: { label: string; value: string; note: string; icon: ReactNode; positive?: boolean }) {
  return (
    <Card className="metric-card">
      <div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div>
      <div className="metric-value">{value}</div>
      <div className={`metric-note ${positive ? "positive" : ""}`}>{positive && <TrendingUp size={13} />}{note}</div>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="page-stack" role="status" aria-label="Loading dashboard">
      <div className="page-heading skeleton-heading">
        <div><Skeleton className="skeleton-eyebrow" /><Skeleton className="skeleton-heading-title" /><Skeleton className="skeleton-heading-copy" /></div>
        <Skeleton className="skeleton-heading-action" />
      </div>
      <section className="metric-grid overview-metric-grid">
        {Array.from({ length: 5 }, (_, index) => <Card className="metric-card" key={index}><Skeleton className="skeleton-metric-label" /><Skeleton className="skeleton-metric-number" /><Skeleton className="skeleton-metric-note" /></Card>)}
      </section>
      <div className="overview-grid">
        <Card className="setup-card overview-skeleton-setup"><CardContent><Skeleton className="skeleton-card-title" /><Skeleton className="skeleton-card-copy" /><Skeleton className="skeleton-progress" />{Array.from({ length: 4 }, (_, index) => <div className="skeleton-checklist-row" key={index}><Skeleton className="skeleton-check" /><span><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line skeleton-line-short" /></span></div>)}</CardContent></Card>
        <div className="overview-side">
          <Card className="published-card"><CardContent><Skeleton className="skeleton-card-title" /><Skeleton className="skeleton-card-copy" /><Skeleton className="skeleton-published-url" /><Skeleton className="skeleton-published-actions" /></CardContent></Card>
          <Card className="recent-card"><CardContent><Skeleton className="skeleton-card-title" /><RecentEnquiriesSkeleton /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}

function RecentEnquiriesSkeleton() {
  return <div className="recent-skeleton-list">{Array.from({ length: 3 }, (_, index) => <div className="recent-skeleton-row" key={index}><Skeleton className="skeleton-avatar" /><span><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line skeleton-line-short" /></span><Skeleton className="skeleton-status" /></div>)}</div>;
}

function BusinessEditor() {
  const { data, setData, notify, clearSession } = useProofly();
  const navigate = useNavigate();
  const businessId = data.business.id;
  const [imageUploads, setImageUploads] = useState({ logo: false, cover: false });
  const [draft, setDraft] = useState<Business>(() =>
    businessId ? data.business : createEmptyBusiness(),
  );
  const [isCreating, setIsCreating] = useState(!businessId);
  const [profileStatus, setProfileStatus] = useState<"loading" | "ready" | "error">(
    businessId ? "loading" : "ready",
  );
  const [profileError, setProfileError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const [usernameError, setUsernameError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);
  const redirectForUnauthorized = useCallback((error: unknown) => {
    if (!(error instanceof ApiError) || error.status !== 401) return false;
    clearSession();
    navigate("/login", { replace: true });
    return true;
  }, [clearSession, navigate]);
  const uploadBusinessImage = async (file: File) => {
    const imageUrl = await uploadImage(file, redirectForUnauthorized);
    if (!isValidHttpsImageUrl(imageUrl)) {
      throw new Error("Uploaded business images must use HTTPS.");
    }
    return imageUrl;
  };
  const isImageUploading = imageUploads.logo || imageUploads.cover;

  useEffect(() => {
    let active = true;

    if (typeof businessId !== "number" || !Number.isSafeInteger(businessId) || businessId < 1) {
      setDraft(createEmptyBusiness());
      setCurrentUsername("");
      setIsCreating(true);
      setProfileStatus("ready");
      setProfileError("");
      return () => {
        active = false;
      };
    }

    setProfileStatus("loading");
    setProfileError("");
    api
      .get(`/business/${businessId}`)
      .then((response) => {
        const profile = unwrapBusinessApiProfile(response);
        if (!isBusinessApiProfile(profile)) {
          throw new Error("The business profile response was incomplete or invalid.");
        }
        if (!active) return;

        const profileDraft = toBusinessDraft(profile, data.business.tagline);
        setDraft(profileDraft);
        setCurrentUsername(profile.username);
        setIsCreating(false);
        setData((current) => ({
          ...current,
          business: toBusinessDraft(profile, current.business.tagline),
        }));
        setProfileStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setData((current) => ({
            ...current,
            business: { ...current.business, id: undefined },
          }));
          setDraft(createEmptyBusiness());
          setCurrentUsername("");
          setIsCreating(true);
          setProfileStatus("ready");
          return;
        }
        setProfileError(error instanceof Error ? error.message : "Unable to load your business profile.");
        setProfileStatus("error");
      });

    return () => {
      active = false;
    };
  }, [businessId, clearSession, data.business.tagline, navigate, reloadCount, setData]);

  useEffect(() => {
    const username = draft.slug.trim();
    if (profileStatus !== "ready" || !username) {
      setUsernameStatus("idle");
      setUsernameError("");
      return;
    }
    if (username === currentUsername) {
      setUsernameStatus("available");
      setUsernameError("");
      return;
    }

    let active = true;
    setUsernameStatus("checking");
    setUsernameError("");
    const timeout = window.setTimeout(() => {
      api
        .get(`/business/check-username/${encodeURIComponent(username)}`)
        .then((response) => {
          if (!isUsernameAvailability(response)) {
            throw new Error("The username availability response was invalid.");
          }
          if (active) {
            setUsernameStatus(response.available ? "available" : "taken");
          }
        })
        .catch((error: unknown) => {
          if (!active) return;
          if (error instanceof ApiError && error.status === 401) {
            clearSession();
            navigate("/login", { replace: true });
            return;
          }
          setUsernameError(error instanceof Error ? error.message : "Unable to check username availability.");
          setUsernameStatus("error");
        });
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [clearSession, currentUsername, draft.slug, navigate, profileStatus]);

  const change = (key: keyof Business, value: string | boolean) => setDraft((current) => ({ ...current, [key]: value }));

  const persistProfile = (profile: BusinessApiProfile) => {
    setData((current) => ({
      ...current,
      business: toBusinessDraft(profile, draft.tagline),
    }));
    setDraft((current) => toBusinessDraft(profile, current.tagline));
    setCurrentUsername(profile.username);
    setIsCreating(false);
    setProfileStatus("ready");
  };

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");
    setSuccessMessage("");
    if ([draft.logoUrl ?? "", draft.coverImage].some((imageUrl) => imageUrl.trim() && !isValidHttpsImageUrl(imageUrl))) {
      setSaveError("Logo and cover image URLs must use HTTPS. Upload an image or enter a secure image URL.");
      return;
    }
    if (usernameStatus !== "available") {
      setSaveError("Choose a username that has been checked and is available.");
      return;
    }

    setIsSaving(true);
    let createdProfile: BusinessApiProfile | null = null;
    try {
      const payload = toBusinessPayload(draft, false);
      let savedProfile: BusinessApiProfile;

      if (isCreating) {
        let existingProfile: unknown = null;
        try {
          existingProfile = await api.get("/business/me");
        } catch (error) {
          if (!(error instanceof ApiError) || error.status !== 404) throw error;
        }
        existingProfile = unwrapBusinessApiProfile(existingProfile);
        if (existingProfile !== null) {
          if (!isBusinessApiProfile(existingProfile)) {
            throw new Error("The existing business profile response was incomplete or invalid.");
          }
          persistProfile(existingProfile);
          setSuccessMessage("Your existing business profile was loaded.");
          notify("Your existing business profile is ready.");
          return;
        }

        const response = unwrapBusinessApiProfile(await api.post("/business", payload));
        if (!isBusinessApiProfile(response)) {
          throw new Error("The business profile response was incomplete or invalid.");
        }
        createdProfile = response;
        savedProfile = response;

        if (draft.isPublished && !response.is_published) {
          const publishedResponse = unwrapBusinessApiProfile(await api.put(`/business/${response.id}`, {
            ...toBusinessPayload(draft, true),
          }));
          if (!isBusinessApiProfile(publishedResponse)) {
            throw new Error("The updated business profile response was incomplete or invalid.");
          }
          savedProfile = publishedResponse;
        }
      } else {
        if (typeof draft.id !== "number") {
          throw new Error("The saved business ID is missing. Reload the profile and try again.");
        }
        const response = unwrapBusinessApiProfile(await api.put(`/business/${draft.id}`, toBusinessPayload(draft, true)));
        if (!isBusinessApiProfile(response)) {
          throw new Error("The updated business profile response was incomplete or invalid.");
        }
        savedProfile = response;
      }

      persistProfile(savedProfile);
      setSuccessMessage(isCreating ? "Your business profile has been created." : "Your business profile has been saved.");
      notify(savedProfile.is_published ? "Your business page is published." : "Your changes have been saved.");
    } catch (error) {
      if (createdProfile) {
        persistProfile(createdProfile);
      }
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        navigate("/login", { replace: true });
        return;
      }
      setSaveError(error instanceof Error ? error.message : "Unable to save your business profile.");
    } finally {
      setIsSaving(false);
    }
  }

  if (profileStatus === "loading" || profileStatus === "error") {
    return (
      <div className="page-stack">
        <PageHeading eyebrow="YOUR STORY" title="Business page" description="Make your page sound and feel like your business." />
        {profileStatus === "loading" ? <BusinessEditorSkeleton /> : <div className="editor-state" role="alert">
        <p>{profileError}</p>
          {profileStatus === "error" && (
            <Button variant="outline" onClick={() => setReloadCount((count) => count + 1)}>
              Try again
            </Button>
          )}
        </div>}
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="YOUR STORY"
        title={isCreating ? "Create your business profile" : "Business page"}
        description={isCreating ? "Add the details for your new business page." : "Make your page sound and feel like your business."}
        action={draft.slug ? <Button asChild variant="outline"><a href={`${getPublicProfileUrl(draft.slug)}?preview=1`} target="_blank" rel="noreferrer"><Eye size={15} /> Preview page</a></Button> : undefined}
      />
      <form className="editor-layout" onSubmit={handleSave}>
        <div className="editor-main">
          {saveError && <p className="editor-message editor-error" role="alert">{saveError}</p>}
          {successMessage && <p className="editor-message editor-success" role="status">{successMessage}</p>}
          <Card>
            <CardHeader><CardTitle>Start with the essentials</CardTitle><p>Give people a clear, warm introduction to what you do.</p></CardHeader>
            <CardContent className="form-grid">
              <Field label="Business name"><Input required value={draft.name} onChange={(event) => change("name", event.target.value)} /></Field>
              <Field label="Page address">
                <div className="slug-input">
                  <span>{`${window.location.origin}/p/`}</span>
                  <Input
                    required
                    value={draft.slug}
                    onChange={(event) => {
                      change("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                      setUsernameStatus("idle");
                      setUsernameError("");
                    }}
                  />
                </div>
                {draft.slug && (
                  <small className={`username-status username-${usernameStatus}`}>
                    {usernameStatus === "checking" && "Checking availability..."}
                    {usernameStatus === "available" && "Username is available."}
                    {usernameStatus === "taken" && "That username is already taken."}
                    {usernameStatus === "error" && (usernameError || "Could not check username availability.")}
                  </small>
                )}
              </Field>
              <Field label="Your headline" className="full-field"><Input required value={draft.tagline} onChange={(event) => change("tagline", event.target.value)} placeholder="What makes your work special?" /></Field>
              <Field label="About your business" className="full-field"><Textarea required rows={5} value={draft.bio} onChange={(event) => change("bio", event.target.value)} /></Field>
              <Field label="What do you do?"><Input value={draft.category} onChange={(event) => change("category", event.target.value)} /></Field>
              <Field label="Business address"><Input value={draft.location} onChange={(event) => change("location", event.target.value)} /></Field>
              <Field label="Theme"><Input value={draft.theme ?? "violet"} onChange={(event) => change("theme", event.target.value)} /></Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Let them reach you</CardTitle><p>Put the right contact details within easy reach.</p></CardHeader>
            <CardContent className="form-grid">
              <Field label="Contact email"><Input type="email" value={draft.email} onChange={(event) => change("email", event.target.value)} /></Field>
              <Field label="Phone or WhatsApp"><Input value={draft.phone} onChange={(event) => change("phone", event.target.value)} /></Field>
              <Field label="Instagram"><Input value={draft.instagram} onChange={(event) => change("instagram", event.target.value)} /></Field>
              <Field label="LinkedIn"><Input value={draft.socialLinks?.linkedin ?? ""} onChange={(event) => setDraft((current) => ({ ...current, socialLinks: { ...current.socialLinks, linkedin: event.target.value } }))} /></Field>
              <Field label="YouTube"><Input value={draft.socialLinks?.youtube ?? ""} onChange={(event) => setDraft((current) => ({ ...current, socialLinks: { ...current.socialLinks, youtube: event.target.value } }))} /></Field>
              <Field label="Website"><Input value={draft.socialLinks?.website ?? ""} onChange={(event) => setDraft((current) => ({ ...current, socialLinks: { ...current.socialLinks, website: event.target.value } }))} /></Field>
            </CardContent>
          </Card>
          <Card className="business-image-card">
            <CardHeader><CardTitle>Brand imagery</CardTitle><p>Upload or link secure images to personalize your public business page.</p></CardHeader>
            <CardContent className="form-grid">
              <Field label="Business logo">
                <ImageField
                  image={draft.logoUrl ?? ""}
                  onChange={(image) => change("logoUrl", image)}
                  uploadImage={uploadBusinessImage}
                  showPreview
                  previewAlt="Business logo preview"
                  previewFit="contain"
                  requireHttps
                  allowRemove
                  onBusyChange={(busy) => setImageUploads((current) => ({ ...current, logo: busy }))}
                />
              </Field>
              <Field label="Cover image">
                <ImageField
                  image={draft.coverImage}
                  onChange={(image) => change("coverImage", image)}
                  uploadImage={uploadBusinessImage}
                  showPreview
                  previewAlt="Business cover preview"
                  requireHttps
                  allowRemove
                  onBusyChange={(busy) => setImageUploads((current) => ({ ...current, cover: busy }))}
                />
              </Field>
            </CardContent>
          </Card>
        </div>
        <aside className="editor-aside">
          <Card className="publish-control">
            <CardHeader><CardTitle>Page visibility</CardTitle><p>Choose when your page is ready to be found.</p></CardHeader>
            <CardContent>
              <label className="switch-row">
                <span className={`switch ${draft.isPublished ? "switch-on" : ""}`}><i /></span>
                <input type="checkbox" checked={draft.isPublished} onChange={(event) => change("isPublished", event.target.checked)} />
                <span><strong>{draft.isPublished ? "Published" : "Draft mode"}</strong><small>{draft.isPublished ? "Anyone with the link can see your page." : "Only you can see your page right now."}</small></span>
              </label>
              <Button type="submit" className="save-button" disabled={isSaving || isImageUploading || profileStatus !== "ready" || usernameStatus !== "available"}>
                {isSaving ? "Saving..." : isCreating ? "Create profile" : "Save changes"} <ArrowRight size={15} />
              </Button>
            </CardContent>
          </Card>
          <Card className="editor-tip">
            <Sparkles size={18} /><strong>A little tip</strong>
            <p>Write the way you talk. A specific, human story makes it easier for the right clients to picture working with you.</p>
          </Card>
        </aside>
      </form>
    </div>
  );
}

function OfferingsPage() {
  const { data, setData, notify, clearSession } = useProofly();
  const navigate = useNavigate();
  const businessId = data.business.id;
  const hasBusinessId = typeof businessId === "number" && Number.isSafeInteger(businessId) && businessId > 0;
  const [products, setProducts] = useState<Offering[]>([]);
  const [productStatus, setProductStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [productError, setProductError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offering | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Offering | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const redirectForUnauthorized = useCallback((error: unknown) => {
    if (!(error instanceof ApiError) || error.status !== 401) return false;
    clearSession();
    navigate("/login", { replace: true });
    return true;
  }, [clearSession, navigate]);

  const syncProducts = useCallback((items: Offering[]) => {
    setProducts(items);
    setData((current) => ({
      ...current,
      offerings: [...current.offerings.filter((item) => item.type !== "Product"), ...items],
    }));
  }, [setData]);

  const loadProducts = useCallback(async () => {
    if (!hasBusinessId) {
      syncProducts([]);
      setProductStatus("missing");
      setProductError("");
      return;
    }

    syncProducts([]);
    setProductStatus("loading");
    setProductError("");
    try {
      const response = await api.get(`/products?business_id=${encodeURIComponent(String(businessId))}`);
      if (!Array.isArray(response) || !response.every(isProductApiProduct)) {
        throw new Error("The products response was incomplete or invalid.");
      }
      if (response.some((product) => product.business_id !== businessId)) {
        throw new Error("The products response contains an item from another business.");
      }
      syncProducts(response.map(toProductOffering));
      setProductStatus("ready");
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setProductError(error instanceof Error ? error.message : "Unable to load products.");
      setProductStatus("error");
    }
  }, [businessId, hasBusinessId, redirectForUnauthorized, syncProducts]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const uploadProductImage = (file: File) => uploadImage(file, redirectForUnauthorized);

  const offerings = useMemo(
    () => [...data.offerings.filter((item) => item.type === "Service"), ...products],
    [data.offerings, products],
  );
  const shown = useMemo(
    () => offerings.filter(
      (item) => (filter === "All" || item.type === filter) &&
        item.title.toLowerCase().includes(search.toLowerCase()),
    ),
    [offerings, filter, search],
  );

  const openNew = () => {
    setProductError("");
    setSuccessMessage("");
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = async (item: Offering) => {
    setProductError("");
    setSuccessMessage("");
    if (item.type === "Service") {
      setEditing(item);
      setDialogOpen(true);
      return;
    }

    setLoadingProductId(item.id);
    try {
      const productId = Number(item.id);
      if (!Number.isSafeInteger(productId) || productId < 1) {
        throw new Error("This product has an invalid ID and cannot be edited.");
      }
      const response = await api.get(`/products/${productId}`);
      if (!isProductApiProduct(response) || response.business_id !== businessId) {
        throw new Error("The product response was invalid or belongs to another business.");
      }
      setEditing(toProductOffering(response));
      setDialogOpen(true);
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setProductError(error instanceof Error ? error.message : "Unable to load this product.");
    } finally {
      setLoadingProductId(null);
    }
  };

  const save = async (values: Omit<Offering, "id">) => {
    setProductError("");
    setSuccessMessage("");

    if (values.type === "Product") {
      if (!hasBusinessId) {
        throw new Error("Create or select a business before adding products.");
      }

      let createdProduct: ProductApiProduct | null = null;
      try {
        let response: unknown;
        if (editing?.type === "Product") {
          const productId = Number(editing.id);
          if (!Number.isSafeInteger(productId) || productId < 1) {
            throw new Error("This product has an invalid ID and cannot be updated.");
          }
          response = await api.put(`/products/${productId}`, toProductPayload(values, true));
        } else {
          response = await api.post("/products", {
            ...toProductPayload(values, false),
            business_id: businessId,
          });
          if (!isProductApiProduct(response) || response.business_id !== businessId) {
            throw new Error("The created product response was invalid.");
          }
          createdProduct = response;
          if (values.isVisible === false) {
            response = await api.put(
              `/products/${response.id}`,
              toProductPayload(values, true),
            );
          }
        }

        if (!isProductApiProduct(response) || response.business_id !== businessId) {
          throw new Error("The saved product response was invalid.");
        }
        setDialogOpen(false);
        setEditing(null);
        setSuccessMessage(editing?.type === "Product" ? "Product updated." : "Product added.");
        notify(editing?.type === "Product" ? "Product updated." : "Product added.");
        await loadProducts();
      } catch (error) {
        if (createdProduct) {
          setEditing(toProductOffering(createdProduct));
          await loadProducts();
        }
        if (redirectForUnauthorized(error)) throw error;
        const message = error instanceof Error ? error.message : "Unable to save this product.";
        setProductError(message);
        throw error instanceof Error ? error : new Error(message);
      }
      return;
    }

    setData((current) => ({
      ...current,
      offerings: editing?.type === "Service"
        ? current.offerings.map((item) => item.id === editing.id ? { ...values, id: editing.id } : item)
        : [{ ...values, id: createId("offering") }, ...current.offerings],
    }));
    const message = editing?.type === "Service" ? "Offering updated." : "Offering added to your page.";
    notify(message);
    setDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const productId = Number(deleteTarget.id);
      if (!Number.isSafeInteger(productId) || productId < 1) {
        throw new Error("This product has an invalid ID and cannot be deleted.");
      }
      await api.delete(`/products/${productId}`);
      setDeleteTarget(null);
      setSuccessMessage("Product removed.");
      notify("Product removed.");
      await loadProducts();
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setDeleteError(error instanceof Error ? error.message : "Unable to delete this product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeading eyebrow="WHAT YOU OFFER" title="Products & services" description="Make it easy for clients to understand what you do and how to get started." action={<Button onClick={openNew}><Plus size={16} /> Add an offering</Button>} />
      {productStatus === "loading" && <ProductGridSkeleton />}
      {productStatus === "missing" && <p className="product-message product-error" role="status">Save a business profile before managing products.</p>}
      {productStatus === "error" && (
        <div className="product-state product-state-error" role="alert">
          <p>{productError}</p>
          <Button variant="outline" onClick={() => void loadProducts()}>Try again</Button>
        </div>
      )}
      {successMessage && <p className="product-message product-success" role="status">{successMessage}</p>}
      {productError && productStatus !== "error" && <p className="product-message product-error" role="alert">{productError}</p>}
      <div className="collection-toolbar">
        <div className="filter-tabs">{["All", "Service", "Product"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}{productStatus === "ready" && item === "All" && <span>{offerings.length}</span>}</button>)}</div>
        <label className="search-field"><Search size={16} /><input placeholder="Find an offering" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      </div>
      {productStatus === "ready" && shown.length > 0 ? <div className="offering-grid">{shown.map((item) => <Card className="offering-card" key={item.id}>
        <div className="offering-image">{item.type === "Product" ? <ProductCardImage src={item.image} alt={item.title} /> : <img src={item.image || fallbackImage} alt="" />}<Badge>{item.type}</Badge>{item.type === "Product" && item.isVisible === false && <Badge className="offering-hidden-badge">Hidden</Badge>}<button aria-label={`More options for ${item.title}`} disabled={loadingProductId !== null} onClick={() => void openEdit(item)}><MoreHorizontal size={17} /></button></div>
        <CardContent className="offering-content"><div className="offering-title-row"><h2>{item.title}</h2><strong>{item.price}</strong></div><p>{item.description}</p><div className="offering-actions"><span className={item.type === "Product" && item.isVisible === false ? "offering-status-hidden" : ""}><span className="status-dot" /> {item.type === "Product" && item.isVisible === false ? "Hidden from page" : "On your page"}</span><div><Button variant="ghost" size="icon" aria-label={item.type === "Product" ? "Edit product" : "Edit offering"} disabled={loadingProductId !== null} onClick={() => void openEdit(item)}><Pencil size={15} /></Button><Button variant="ghost" size="icon" aria-label={item.type === "Product" ? "Delete product" : "Delete offering"} disabled={loadingProductId !== null} onClick={() => {
          if (item.type === "Product") {
            setDeleteError("");
            setDeleteTarget(item);
          } else {
            setData((current) => ({ ...current, offerings: current.offerings.filter((offering) => offering.id !== item.id) }));
            notify("Offering removed.");
          }
        }}><Trash2 size={15} /></Button></div></div></CardContent>
      </Card>)}</div> : productStatus === "ready" ? <EmptyState icon={<PackageOpen />} title="Nothing here just yet" text="Add a service or product to let potential clients know how you can help." action={openNew} /> : null}
      <OfferDialog
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen);
          if (!isOpen) setEditing(null);
        }}
        initial={editing}
        onSave={save}
        uploadImage={uploadProductImage}
      />
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>This will permanently remove “{deleteTarget?.title}”.</DialogDescription>
          </DialogHeader>
          {deleteError && <p className="product-message product-error" role="alert">{deleteError}</p>}
          <div className="dialog-actions">
            <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void confirmDelete()}>
              {isDeleting ? "Deleting..." : "Delete product"} <Trash2 size={15} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PortfolioPage() {
  const { data, setData, notify, clearSession } = useProofly();
  const navigate = useNavigate();
  const businessId = data.business.id;
  const hasBusinessId = typeof businessId === "number" && Number.isSafeInteger(businessId) && businessId > 0;
  const [listStatus, setListStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const redirectForUnauthorized = useCallback((error: unknown) => {
    if (!(error instanceof ApiError) || error.status !== 401) return false;
    clearSession();
    navigate("/login", { replace: true });
    return true;
  }, [clearSession, navigate]);
  const uploadPortfolioImage = (file: File) => uploadImage(file, redirectForUnauthorized);

  const loadProjects = useCallback(async () => {
    if (!hasBusinessId) {
      setData((current) => ({ ...current, projects: [] }));
      setListStatus("missing");
      return;
    }

    setListStatus("loading");
    setErrorMessage("");
    try {
      const response = await api.get(`/portfolio?business_id=${encodeURIComponent(String(businessId))}`);
      if (!Array.isArray(response) || !response.every(isPortfolioApiProject)) {
        throw new Error("The portfolio response was incomplete or invalid.");
      }
      const projects = response.map(toPortfolioProject);
      setData((current) => ({ ...current, projects }));
      setListStatus("ready");
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setErrorMessage(error instanceof Error ? error.message : "Unable to load portfolio projects.");
      setListStatus("error");
    }
  }, [businessId, hasBusinessId, redirectForUnauthorized, setData]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const openNew = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditing(null);
    setOpen(true);
  };

  const openEdit = async (project: Project) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingProjectId(project.id);
    try {
      const projectId = Number(project.id);
      if (!Number.isSafeInteger(projectId) || projectId < 1) {
        throw new Error("This project has an invalid ID and cannot be edited.");
      }
      const response = await api.get(`/portfolio/${projectId}`);
      if (!isPortfolioApiProject(response) || response.business_id !== businessId) {
        throw new Error("The project response was invalid or belongs to another business.");
      }
      setEditing(toPortfolioProject(response));
      setOpen(true);
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setErrorMessage(error instanceof Error ? error.message : "Unable to load this project.");
    } finally {
      setEditingProjectId(null);
    }
  };

  const save = async (values: Omit<Project, "id">): Promise<void> => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!hasBusinessId) {
      throw new Error("Create or select a business before adding portfolio projects.");
    }

    let createdProject: PortfolioApiProject | null = null;
    try {
      if (editing) {
        const projectId = Number(editing.id);
        const response = await api.put(`/portfolio/${projectId}`, toPortfolioPayload(values, true));
        if (!isPortfolioApiProject(response) || response.business_id !== businessId) {
          throw new Error("The updated project response was invalid.");
        }
      } else {
        const response = await api.post("/portfolio", {
          ...toPortfolioPayload(values, false),
          business_id: businessId,
        });
        if (!isPortfolioApiProject(response) || response.business_id !== businessId) {
          throw new Error("The created project response was invalid.");
        }
        createdProject = response;
        const createdItem = toPortfolioProject(response);
        setData((current) => ({ ...current, projects: [createdItem, ...current.projects] }));

        if (values.isVisible === false) {
          const visibilityResponse = await api.put(
            `/portfolio/${response.id}`,
            toPortfolioPayload(values, true),
          );
          if (!isPortfolioApiProject(visibilityResponse) || visibilityResponse.business_id !== businessId) {
            throw new Error("The project visibility response was invalid.");
          }
        }
      }

      const message = editing ? "Portfolio project updated." : "Project added to your portfolio.";
      setOpen(false);
      setEditing(null);
      setSuccessMessage(message);
      notify(message);
      await loadProjects();
    } catch (error) {
      if (createdProject) {
        const createdItem = toPortfolioProject(createdProject);
        setEditing(createdItem);
        setData((current) => ({
          ...current,
          projects: [createdItem, ...current.projects.filter((item) => item.id !== createdItem.id)],
        }));
      }
      if (redirectForUnauthorized(error)) throw error;
      const message = error instanceof Error ? error.message : "Unable to save the portfolio project.";
      setErrorMessage(message);
      throw error instanceof Error ? error : new Error(message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const projectId = Number(deleteTarget.id);
      if (!Number.isSafeInteger(projectId) || projectId < 1) {
        throw new Error("This project has an invalid ID and cannot be deleted.");
      }
      await api.delete(`/portfolio/${projectId}`);
      const message = "Project removed from your portfolio.";
      setDeleteTarget(null);
      setSuccessMessage(message);
      notify(message);
      await loadProjects();
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setDeleteError(error instanceof Error ? error.message : "Unable to delete this project.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="YOUR BEST WORK"
        title="Portfolio"
        description="A few good examples can say more than a thousand words."
        action={<Button onClick={openNew} disabled={!hasBusinessId || listStatus === "loading"}><Plus size={16} /> Add project</Button>}
      />
      {successMessage && <p className="portfolio-message portfolio-success" role="status">{successMessage}</p>}
      {errorMessage && listStatus !== "error" && <p className="portfolio-message portfolio-error" role="alert">{errorMessage}</p>}
      {listStatus === "loading" && <PortfolioGridSkeleton />}
      {listStatus === "missing" && (
        <div className="portfolio-state" role="status">Create or select a business profile before managing portfolio projects.</div>
      )}
      {listStatus === "error" && (
        <div className="portfolio-state" role="alert">
          <p>{errorMessage}</p>
          <Button variant="outline" onClick={() => void loadProjects()}>Try again</Button>
        </div>
      )}
      {listStatus === "ready" && data.projects.length > 0 && (
        <div className="portfolio-grid">
          {data.projects.map((project) => (
            <Card className="portfolio-card" key={project.id}>
              <div className="portfolio-image">
                <PortfolioCardImage src={project.image} alt={project.title} />
                <Badge>{project.category || "Uncategorized"}</Badge>
                {project.isVisible === false && <Badge className="portfolio-hidden-badge">Hidden</Badge>}
              </div>
              <CardContent className="portfolio-content">
                <div><h2>{project.title}</h2><p>{project.caption}</p></div>
                <div className="item-actions">
                  <Button variant="ghost" size="icon" aria-label="Edit project" disabled={editingProjectId !== null} onClick={() => void openEdit(project)}><Pencil size={15} /></Button>
                  <Button variant="ghost" size="icon" aria-label="Delete project" disabled={editingProjectId !== null} onClick={() => { setDeleteError(""); setDeleteTarget(project); }}><Trash2 size={15} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {listStatus === "ready" && data.projects.length === 0 && (
        <EmptyState icon={<FileImage />} title="Your portfolio is waiting" text="Add a project to give people a feel for your craft." action={openNew} />
      )}
      {editingProjectId && <div className="portfolio-state" role="status">Loading project details...</div>}
      <ProjectDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setEditing(null);
        }}
        initial={editing}
        onSave={save}
        uploadImage={uploadPortfolioImage}
      />
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription>This will permanently remove “{deleteTarget?.title}” from your portfolio.</DialogDescription>
          </DialogHeader>
          {deleteError && <p className="portfolio-message portfolio-error" role="alert">{deleteError}</p>}
          <div className="dialog-actions">
            <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void confirmDelete()}>
              {isDeleting ? "Deleting..." : "Delete project"} <Trash2 size={15} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TestimonialsPage() {
  const { data, setData, notify, clearSession } = useProofly();
  const navigate = useNavigate();
  const businessId = data.business.id;
  const hasBusinessId = typeof businessId === "number" && Number.isSafeInteger(businessId) && businessId > 0;
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [listStatus, setListStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const redirectForUnauthorized = useCallback((error: unknown) => {
    if (!(error instanceof ApiError) || error.status !== 401) return false;
    clearSession();
    navigate("/login", { replace: true });
    return true;
  }, [clearSession, navigate]);

  const syncTestimonials = useCallback((items: Testimonial[]) => {
    setTestimonials(items);
    setData((current) => ({
      ...current,
      testimonials: items.filter((item) => item.isVisible !== false),
    }));
  }, [setData]);

  const loadTestimonials = useCallback(async () => {
    if (!hasBusinessId) {
      syncTestimonials([]);
      setListStatus("missing");
      setErrorMessage("");
      return;
    }

    syncTestimonials([]);
    setListStatus("loading");
    setErrorMessage("");
    try {
      const response = await api.get(`/testimonials?business_id=${encodeURIComponent(String(businessId))}`);
      if (!Array.isArray(response) || !response.every(isTestimonialApiRecord)) {
        throw new Error("The testimonials response was incomplete or invalid.");
      }
      if (response.some((testimonial) => testimonial.business_id !== businessId)) {
        throw new Error("The testimonials response contains an item from another business.");
      }
      syncTestimonials(response.map(toTestimonial));
      setListStatus("ready");
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setErrorMessage(error instanceof Error ? error.message : "Unable to load testimonials.");
      setListStatus("error");
    }
  }, [businessId, hasBusinessId, redirectForUnauthorized, syncTestimonials]);

  useEffect(() => {
    void loadTestimonials();
  }, [loadTestimonials]);

  const save = async (values: Omit<Testimonial, "id" | "date">) => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!hasBusinessId) {
      throw new Error("Create or select a business before adding testimonials.");
    }

    let createdTestimonial: TestimonialApiRecord | null = null;
    try {
      let response: unknown;
      if (editing) {
        const testimonialId = Number(editing.id);
        if (!Number.isSafeInteger(testimonialId) || testimonialId < 1) {
          throw new Error("This testimonial has an invalid ID and cannot be updated.");
        }
        response = await api.put(
          `/testimonials/${testimonialId}`,
          toTestimonialPayload(values, true),
        );
      } else {
        response = await api.post("/testimonials", {
          ...toTestimonialPayload(values, false),
          business_id: businessId,
        });
        if (!isTestimonialApiRecord(response) || response.business_id !== businessId) {
          throw new Error("The created testimonial response was invalid.");
        }
        createdTestimonial = response;
        if (values.isVisible === false) {
          response = await api.put(
            `/testimonials/${response.id}`,
            toTestimonialPayload(values, true),
          );
        }
      }

      if (!isTestimonialApiRecord(response) || response.business_id !== businessId) {
        throw new Error("The saved testimonial response was invalid.");
      }
      const message = editing ? "Testimonial updated." : "Testimonial added.";
      setOpen(false);
      setEditing(null);
      setSuccessMessage(message);
      notify(message);
      await loadTestimonials();
    } catch (error) {
      if (createdTestimonial) {
        setEditing(toTestimonial(createdTestimonial));
        await loadTestimonials();
      }
      if (redirectForUnauthorized(error)) throw error;
      const message = error instanceof Error ? error.message : "Unable to save this testimonial.";
      setErrorMessage(message);
      throw error instanceof Error ? error : new Error(message);
    }
  };

  const remove = async (testimonial: Testimonial) => {
    setErrorMessage("");
    setSuccessMessage("");
    setDeletingId(testimonial.id);
    try {
      const testimonialId = Number(testimonial.id);
      if (!Number.isSafeInteger(testimonialId) || testimonialId < 1) {
        throw new Error("This testimonial has an invalid ID and cannot be deleted.");
      }
      await api.delete(`/testimonials/${testimonialId}`);
      setSuccessMessage("Testimonial removed.");
      notify("Testimonial removed.");
      await loadTestimonials();
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete this testimonial.");
    } finally {
      setDeletingId(null);
    }
  };

  const openNew = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditing(null);
    setOpen(true);
  };

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="KIND WORDS"
        title="Testimonials"
        description="The things clients say about working with you matter. Give them a place to live."
        action={<Button onClick={openNew} disabled={!hasBusinessId || listStatus === "loading"}><Plus size={16} /> Add testimonial</Button>}
      />
      {listStatus === "loading" && <TestimonialGridSkeleton />}
      {listStatus === "missing" && <p className="testimonial-message testimonial-error" role="status">Save a business profile before managing testimonials.</p>}
      {listStatus === "error" && (
        <div className="testimonial-state testimonial-state-error" role="alert">
          <p>{errorMessage}</p>
          <Button variant="outline" onClick={() => void loadTestimonials()}>Try again</Button>
        </div>
      )}
      {successMessage && <p className="testimonial-message testimonial-success" role="status">{successMessage}</p>}
      {errorMessage && listStatus !== "error" && <p className="testimonial-message testimonial-error" role="alert">{errorMessage}</p>}
      {listStatus === "ready" && testimonials.length > 0 ? (
        <div className="testimonial-grid">{testimonials.map((item) => <Card className="review-card" key={item.id}>
          <CardContent>
            <div className="testimonial-card-heading">
              <div className="review-stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} fill={i < item.rating ? "currentColor" : "none"} />)}</div>
              {item.isVisible === false && <Badge className="testimonial-hidden-badge">Hidden</Badge>}
            </div>
            <blockquote>“{item.review}”</blockquote>
            <div className="review-byline">
              <span className={`lead-avatar ${item.photoUrl ? "testimonial-avatar-image" : ""}`}>
                {item.photoUrl ? <img src={item.photoUrl} alt="" /> : item.name.slice(0, 1)}
              </span>
              <span><strong>{item.name}</strong>{item.role && <small>{item.role}</small>}</span>
              <div className="item-actions">
                <Button variant="ghost" size="icon" aria-label="Edit testimonial" disabled={deletingId !== null} onClick={() => { setEditing(item); setOpen(true); }}><Pencil size={15} /></Button>
                <Button variant="ghost" size="icon" aria-label="Delete testimonial" disabled={deletingId !== null} onClick={() => void remove(item)}><Trash2 size={15} /></Button>
              </div>
            </div>
          </CardContent>
        </Card>)}</div>
      ) : listStatus === "ready" ? (
        <EmptyState icon={<Star />} title="Add your first kind word" text="A genuine client review helps new people feel good about getting in touch." action={openNew} />
      ) : null}
      <TestimonialDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setEditing(null);
        }}
        initial={editing}
        onSave={save}
      />
    </div>
  );
}

function EnquiriesPage() {
  const { data, notify, clearSession } = useProofly();
  const navigate = useNavigate();
  const businessId = data.business.id;
  const hasBusinessId = typeof businessId === "number" && Number.isSafeInteger(businessId) && businessId > 0;
  const [enquiries, setEnquiries] = useState<DashboardEnquiry[]>([]);
  const [listStatus, setListStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DashboardEnquiry | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const redirectForUnauthorized = useCallback((error: unknown) => {
    if (!(error instanceof ApiError) || error.status !== 401) return false;
    clearSession();
    navigate("/login", { replace: true });
    return true;
  }, [clearSession, navigate]);

  const loadEnquiries = useCallback(async () => {
    if (!hasBusinessId) {
      setEnquiries([]);
      setListStatus("missing");
      setErrorMessage("");
      return;
    }

    setEnquiries([]);
    setListStatus("loading");
    setErrorMessage("");
    try {
      const response = await api.get(`/enquiries?business_id=${encodeURIComponent(String(businessId))}`);
      if (!Array.isArray(response) || !response.every(isEnquiryApiRecord)) {
        throw new Error("The enquiries response was incomplete or invalid.");
      }
      if (response.some((enquiry) => enquiry.business_id !== businessId)) {
        throw new Error("The enquiries response contains an item from another business.");
      }
      setEnquiries(response.map(toDashboardEnquiry));
      setListStatus("ready");
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setErrorMessage(error instanceof Error ? error.message : "Unable to load enquiries.");
      setListStatus("error");
    }
  }, [businessId, hasBusinessId, redirectForUnauthorized]);

  useEffect(() => {
    void loadEnquiries();
  }, [loadEnquiries]);

  const updateStatus = async (id: string, status: DashboardEnquiryStatus) => {
    setUpdatingId(id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const enquiryId = Number(id);
      if (!Number.isSafeInteger(enquiryId) || enquiryId < 1) {
        throw new Error("This enquiry has an invalid ID and cannot be updated.");
      }
      const response = await api.patch(`/enquiries/${enquiryId}`, { status });
      if (!isEnquiryApiRecord(response) || response.business_id !== businessId || response.status !== status) {
        throw new Error("The updated enquiry response was invalid.");
      }
      setSuccessMessage("Enquiry status updated.");
      notify("Enquiry status updated.");
      await loadEnquiries();
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setErrorMessage(error instanceof Error ? error.message : "Unable to update enquiry status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const enquiryId = Number(deleteTarget.id);
      if (!Number.isSafeInteger(enquiryId) || enquiryId < 1) {
        throw new Error("This enquiry has an invalid ID and cannot be deleted.");
      }
      await api.delete(`/enquiries/${enquiryId}`);
      setDeleteTarget(null);
      setSuccessMessage("Enquiry deleted.");
      notify("Enquiry deleted.");
      await loadEnquiries();
    } catch (error) {
      if (redirectForUnauthorized(error)) return;
      setDeleteError(error instanceof Error ? error.message : "Unable to delete this enquiry.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = enquiries.filter((enquiry) =>
    (filter === "All" || enquiry.status === filter) &&
    `${enquiry.name} ${enquiry.email} ${enquiry.phone} ${enquiry.message}`.toLowerCase().includes(search.toLowerCase()),
  );
  const statuses: DashboardEnquiryStatus[] = ["new", "contacted", "completed"];

  return (
    <div className="page-stack">
      <PageHeading eyebrow="NEW CONNECTIONS" title="Enquiries" description="Every good project starts with a conversation." action={listStatus === "loading" ? <Skeleton className="skeleton-heading-action" /> : listStatus === "ready" ? <Badge className="enquiry-total"><MessageCircle size={13} /> {enquiries.length} conversations</Badge> : undefined} />
      {listStatus === "loading" && <EnquiryListSkeleton />}
      {listStatus === "missing" && <div className="enquiry-state" role="status">Save a business profile before viewing enquiries.</div>}
      {listStatus === "error" && (
        <div className="enquiry-state enquiry-state-error" role="alert">
          <p>{errorMessage}</p>
          <Button variant="outline" onClick={() => void loadEnquiries()}>Try again</Button>
        </div>
      )}
      {successMessage && <p className="enquiry-feedback enquiry-success" role="status">{successMessage}</p>}
      {errorMessage && listStatus !== "error" && <p className="enquiry-feedback enquiry-error" role="alert">{errorMessage}</p>}
      <div className="collection-toolbar">
        <div className="filter-tabs">{["All", ...statuses].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "All" ? "All" : `${item[0].toUpperCase()}${item.slice(1)}`}{listStatus === "ready" && item === "All" && <span>{enquiries.length}</span>}{listStatus === "ready" && item === "new" && <span>{enquiries.filter((enquiry) => enquiry.status === "new").length}</span>}</button>)}</div>
        <label className="search-field"><Search size={16} /><input placeholder="Search enquiries" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      </div>
      <div className="enquiry-list">
        {listStatus === "ready" && filtered.map((enquiry) => <Card className="enquiry-card" key={enquiry.id}>
          <div className="enquiry-avatar">{enquiry.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>
          <div className="enquiry-main">
            <div className="enquiry-title"><h2>{enquiry.name}</h2><Badge className={`lead-status ${enquiry.status}`}>{`${enquiry.status[0].toUpperCase()}${enquiry.status.slice(1)}`}</Badge></div>
            <p className="enquiry-message">{enquiry.message}</p>
            <div className="enquiry-meta">{enquiry.email && <a href={`mailto:${enquiry.email}`}><Mail size={14} />{enquiry.email}</a>}{enquiry.phone && <a href={`tel:${enquiry.phone}`}><MessageCircle size={14} />{enquiry.phone}</a>}</div>
          </div>
          <div className="enquiry-management">
            <label className="status-select-label"><span>Update status</span><select value={enquiry.status} disabled={updatingId !== null || isDeleting} onChange={(event) => {
              const status = event.target.value;
              if (isDashboardEnquiryStatus(status)) void updateStatus(enquiry.id, status);
            }}>{statuses.map((status) => <option key={status} value={status}>{`${status[0].toUpperCase()}${status.slice(1)}`}</option>)}</select></label>
            <Button variant="ghost" size="icon" aria-label={`Delete enquiry from ${enquiry.name}`} disabled={updatingId !== null || isDeleting} onClick={() => { setDeleteError(""); setDeleteTarget(enquiry); }}><Trash2 size={15} /></Button>
          </div>
        </Card>)}
        {listStatus === "ready" && filtered.length === 0 && <EmptyState icon={<MessageCircle />} title="No enquiries found" text={enquiries.length ? "Try another search or status filter." : "When someone sends a note from your public page, it will land here."} />}
      </div>
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this enquiry?</DialogTitle>
            <DialogDescription>This will permanently remove the enquiry from {deleteTarget?.name}.</DialogDescription>
          </DialogHeader>
          {deleteError && <p className="enquiry-feedback enquiry-error" role="alert">{deleteError}</p>}
          <div className="dialog-actions">
            <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void confirmDelete()}>
              {isDeleting ? "Deleting..." : "Delete enquiry"} <Trash2 size={15} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsPage() {
  const { data, setData, notify, userEmail } = useProofly();
  const updateSetting = (key: keyof typeof data.settings, value: boolean) => {
    setData((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
    notify("Your preference has been saved.");
  };
  return (
    <div className="page-stack">
      <PageHeading eyebrow="PREFERENCES" title="Settings" description="A few small choices for how your Proofly works." />
      <Card className="settings-card">
        <CardHeader><CardTitle>Your account</CardTitle><p>This is the email associated with your Proofly account.</p></CardHeader>
        <CardContent>
          <div className="setting-row"><div className="setting-avatar">{userEmail.split("@")[0].slice(0, 2).toUpperCase() || "A"}</div><div><strong>{userEmail}</strong><small>Account email</small></div></div>
          <SettingToggle title="Enquiry email alerts" description="Get a note when a new client reaches out." checked={data.settings.emailAlerts} onChange={(value) => updateSetting("emailAlerts", value)} />
          <SettingToggle title="Search engine visibility" description="Allow search engines to index your public page." checked={data.settings.searchIndexing} onChange={(value) => updateSetting("searchIndexing", value)} />
        </CardContent>
      </Card>
    </div>
  );
}

function SettingToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="setting-toggle"><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className={`switch ${checked ? "switch-on" : ""}`}><i /></span></label>;
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`form-field ${className}`}><span>{label}</span>{children}</label>;
}

function BusinessEditorSkeleton() {
  return (
    <div className="editor-layout" role="status" aria-label="Loading business profile">
      <div className="editor-main">
        <Card><CardContent className="business-skeleton-fields">{Array.from({ length: 7 }, (_, index) => <span key={index}><Skeleton className="skeleton-field-label" /><Skeleton className="skeleton-field-input" /></span>)}</CardContent></Card>
        <Card><CardContent className="business-skeleton-fields">{Array.from({ length: 5 }, (_, index) => <span key={index}><Skeleton className="skeleton-field-label" /><Skeleton className="skeleton-field-input" /></span>)}</CardContent></Card>
        <Card><CardContent className="business-skeleton-images"><span><Skeleton className="skeleton-field-label" /><Skeleton className="skeleton-business-image" /></span><span><Skeleton className="skeleton-field-label" /><Skeleton className="skeleton-business-image skeleton-business-cover" /></span></CardContent></Card>
      </div>
      <aside className="editor-aside"><Card><CardContent className="business-skeleton-fields"><Skeleton className="skeleton-card-title" /><Skeleton className="skeleton-card-copy" /><Skeleton className="skeleton-published-actions" /></CardContent></Card></aside>
    </div>
  );
}

function ProductGridSkeleton() {
  return <div className="offering-grid" role="status" aria-label="Loading products">{Array.from({ length: 3 }, (_, index) => <Card className="offering-card skeleton-collection-card" key={index}><Skeleton className="skeleton-offering-image" /><CardContent className="offering-content"><Skeleton className="skeleton-card-title" /><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line skeleton-line-short" /><Skeleton className="skeleton-product-price" /><Skeleton className="skeleton-published-actions" /></CardContent></Card>)}</div>;
}

function PortfolioGridSkeleton() {
  return <div className="portfolio-grid" role="status" aria-label="Loading portfolio projects">{Array.from({ length: 3 }, (_, index) => <Card className="portfolio-card skeleton-collection-card" key={index}><Skeleton className="skeleton-portfolio-image" /><CardContent className="portfolio-content"><div><Skeleton className="skeleton-card-title" /><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line skeleton-line-short" /></div></CardContent></Card>)}</div>;
}

function TestimonialGridSkeleton() {
  return <div className="testimonial-grid" role="status" aria-label="Loading testimonials">{Array.from({ length: 3 }, (_, index) => <Card className="review-card" key={index}><CardContent><Skeleton className="skeleton-rating" /><Skeleton className="skeleton-review-line" /><Skeleton className="skeleton-review-line" /><div className="review-byline"><Skeleton className="skeleton-avatar" /><span><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line skeleton-line-short" /></span></div></CardContent></Card>)}</div>;
}

function EnquiryListSkeleton() {
  return <div className="enquiry-list" role="status" aria-label="Loading enquiries">{Array.from({ length: 3 }, (_, index) => <Card className="enquiry-card skeleton-enquiry-card" key={index}><Skeleton className="skeleton-avatar" /><div className="enquiry-main"><Skeleton className="skeleton-card-title" /><Skeleton className="skeleton-line" /><Skeleton className="skeleton-line skeleton-line-short" /></div><Skeleton className="skeleton-status" /></Card>)}</div>;
}

function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: () => void }) {
  return <Card className="empty-state"><span className="empty-icon">{icon}</span><h2>{title}</h2><p>{text}</p>{action && <Button onClick={action}><Plus size={15} /> Add something</Button>}</Card>;
}

function PortfolioCardImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="portfolio-image-placeholder" role="img" aria-label={`${alt}: image unavailable`}>
        <FileImage size={23} aria-hidden="true" />
        <span>Image unavailable</span>
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} />;
}

function ProductCardImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="product-image-placeholder" role="img" aria-label={`${alt}: image unavailable`}>
        <FileImage size={23} aria-hidden="true" />
        <span>Image unavailable</span>
      </div>
    );
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} />;
}

function ImageField({
  image,
  onChange,
  uploadImage,
  showPreview = false,
  onBusyChange,
  previewAlt = "Image preview",
  previewFit = "cover",
  requireHttps = false,
  allowRemove = false,
}: {
  image: string;
  onChange: (image: string) => void;
  uploadImage?: (file: File) => Promise<string>;
  showPreview?: boolean;
  onBusyChange?: (busy: boolean) => void;
  previewAlt?: string;
  previewFit?: "cover" | "contain";
  requireHttps?: boolean;
  allowRemove?: boolean;
}) {
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const previewSource = localPreview ?? image;

  useEffect(() => {
    if (!localPreview) return;
    return () => URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  useEffect(() => {
    setPreviewFailed(false);
  }, [previewSource]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setPreviewFailed(false);
    if (showPreview) {
      setLocalPreview(URL.createObjectURL(file));
    }
    setReading(true);
    onBusyChange?.(true);
    try {
      onChange(uploadImage ? await uploadImage(file) : await readImageAsDataUrl(file));
      setLocalPreview(null);
    } catch (reason) {
      setLocalPreview(null);
      setError(reason instanceof Error ? reason.message : "Could not read this image.");
    } finally {
      setReading(false);
      onBusyChange?.(false);
      event.target.value = "";
    }
  };
  return (
    <div className="image-field">
      <Input type="url" value={image.startsWith("data:") ? "" : image} onChange={(event) => { setLocalPreview(null); setError(""); onChange(event.target.value); }} placeholder={requireHttps ? "Paste an HTTPS image URL" : "Paste an image URL (optional)"} disabled={reading} />
      <label className="image-upload-button"><Upload size={13} />{reading ? uploadImage ? "Uploading image…" : "Preparing image…" : image.startsWith("data:") ? "Image selected" : "Choose image"}<input type="file" accept="image/*" onChange={handleFile} disabled={reading} /></label>
      {showPreview && <div className={`image-field-preview${previewFit === "contain" ? " image-field-preview-contain" : ""}`}>
        {!previewSource || previewFailed
          ? <div className="image-preview-placeholder"><FileImage size={20} /><span>{previewSource ? "Image preview unavailable" : "No image selected"}</span></div>
          : <img src={previewSource} alt={previewAlt} onError={() => setPreviewFailed(true)} />}
      </div>}
      {showPreview && image.trim() && !(requireHttps ? isValidHttpsImageUrl(image) : isValidImageUrl(image)) && <span className="image-error" role="alert">{requireHttps ? "Enter a valid HTTPS image URL." : "Enter a valid HTTP or HTTPS image URL."}</span>}
      {error && <span className="image-error" role="alert">{error}</span>}
      {allowRemove && image.trim() && <button type="button" className="image-remove-button" disabled={reading} onClick={() => { setLocalPreview(null); setError(""); onChange(""); }}>Remove image</button>}
    </div>
  );
}

function OfferDialog({ open, onOpenChange, initial, onSave, uploadImage }: { open: boolean; onOpenChange: (open: boolean) => void; initial: Offering | null; onSave: (values: Omit<Offering, "id">) => void | Promise<void>; uploadImage: (file: File) => Promise<string> }) {
  const [draft, setDraft] = useState<Omit<Offering, "id">>(emptyOffering);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  useEffect(() => {
    setDraft(initial
      ? {
          type: initial.type,
          title: initial.title,
          description: initial.description,
          price: initial.price,
          image: initial.image,
          category: initial.category ?? "",
          contactUrl: initial.contactUrl ?? "",
          isVisible: initial.isVisible ?? true,
        }
      : emptyOffering);
    setSubmitError("");
  }, [initial, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");
    try {
      await onSave(draft);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save this offering.");
    } finally {
      setIsSaving(false);
    }
  }

  return <Dialog open={open} onOpenChange={(isOpen) => { if (!isSaving && !isImageUploading) onOpenChange(isOpen); }}><DialogContent><DialogHeader><DialogTitle>{initial ? `Edit ${draft.type.toLowerCase()}` : draft.type === "Product" ? "Add a product" : "Add an offering"}</DialogTitle><DialogDescription>Give this service or product a clear, friendly introduction.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={handleSubmit}>
    <Field label="Type"><select value={draft.type} disabled={initial?.type === "Product" || isImageUploading} onChange={(event) => setDraft({ ...draft, type: event.target.value as Offering["type"] })}><option>Service</option><option>Product</option></select></Field>
    <Field label="Name"><Input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Full-day wedding editorial" /></Field>
    <Field label="Description"><Textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="What's included?" /></Field>
    {draft.type === "Product" && <Field label="Category"><Input value={draft.category ?? ""} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></Field>}
    <div className="dialog-two-col"><Field label="Price"><Input required value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="₹25,000" /></Field><Field label="Image"><ImageField image={draft.image} onChange={(image) => setDraft({ ...draft, image })} uploadImage={draft.type === "Product" ? uploadImage : undefined} showPreview={draft.type === "Product"} onBusyChange={setIsImageUploading} /></Field></div>
    {draft.type === "Product" && <>
      <Field label="Contact URL"><Input type="url" value={draft.contactUrl ?? ""} onChange={(event) => setDraft({ ...draft, contactUrl: event.target.value })} placeholder="https://example.com/contact" /></Field>
      <label className="switch-row">
        <span className={`switch ${draft.isVisible !== false ? "switch-on" : ""}`}><i /></span>
        <input type="checkbox" checked={draft.isVisible !== false} onChange={(event) => setDraft({ ...draft, isVisible: event.target.checked })} />
        <span><strong>{draft.isVisible === false ? "Hidden from page" : "Visible on page"}</strong><small>Choose whether this product appears on your public page.</small></span>
      </label>
    </>}
    {submitError && <p className="product-message product-error" role="alert">{submitError}</p>}
    <div className="dialog-actions"><Button type="button" variant="outline" disabled={isSaving || isImageUploading} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isSaving || isImageUploading}>{isImageUploading ? "Uploading image..." : isSaving ? "Saving..." : draft.type === "Product" ? "Save product" : "Save offering"} <ArrowRight size={15} /></Button></div>
  </form></DialogContent></Dialog>;
}

function ProjectDialog({ open, onOpenChange, initial, onSave, uploadImage }: { open: boolean; onOpenChange: (open: boolean) => void; initial: Project | null; onSave: (values: Omit<Project, "id">) => Promise<void>; uploadImage: (file: File) => Promise<string> }) {
  const [draft, setDraft] = useState<Omit<Project, "id">>(emptyProject);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  useEffect(() => {
    setDraft(initial
      ? {
          title: initial.title,
          category: initial.category,
          caption: initial.caption,
          image: initial.image,
          projectUrl: initial.projectUrl ?? "",
          isVisible: initial.isVisible ?? true,
        }
      : emptyProject);
    setSubmitError("");
  }, [initial, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");
    try {
      await onSave(draft);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save this project.");
    } finally {
      setIsSaving(false);
    }
  }

  return <Dialog open={open} onOpenChange={(isOpen) => { if (!isSaving && !isImageUploading) onOpenChange(isOpen); }}><DialogContent><DialogHeader><DialogTitle>{initial ? "Edit project" : "Add a project"}</DialogTitle><DialogDescription>Give your work a title and a little context.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={handleSubmit}>
    <Field label="Project title"><Input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field>
    <Field label="Category"><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{["Wedding", "Commercial", "Editorial", "Portrait", "Other"].map((option) => <option key={option}>{option}</option>)}</select></Field>
    <Field label="Story or caption"><Textarea rows={3} value={draft.caption} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} /></Field>
    <Field label="Project image"><ImageField image={draft.image} onChange={(image) => setDraft({ ...draft, image })} uploadImage={uploadImage} showPreview onBusyChange={setIsImageUploading} /></Field>
    <Field label="Project URL"><Input type="url" value={draft.projectUrl ?? ""} onChange={(event) => setDraft({ ...draft, projectUrl: event.target.value })} placeholder="https://example.com/project" /></Field>
    <label className="switch-row">
      <span className={`switch ${draft.isVisible ? "switch-on" : ""}`}><i /></span>
      <input type="checkbox" checked={draft.isVisible ?? true} onChange={(event) => setDraft({ ...draft, isVisible: event.target.checked })} />
      <span><strong>{draft.isVisible === false ? "Hidden from page" : "Visible on page"}</strong><small>Choose whether this project appears on your public page.</small></span>
    </label>
    {submitError && <p className="portfolio-message portfolio-error" role="alert">{submitError}</p>}
    <div className="dialog-actions"><Button type="button" variant="outline" disabled={isSaving || isImageUploading} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isSaving || isImageUploading}>{isImageUploading ? "Uploading image..." : isSaving ? "Saving..." : "Save project"} <ArrowRight size={15} /></Button></div>
  </form></DialogContent></Dialog>;
}

function TestimonialDialog({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; initial: Testimonial | null; onSave: (values: Omit<Testimonial, "id" | "date">) => void | Promise<void> }) {
  const [draft, setDraft] = useState<Omit<Testimonial, "id" | "date">>({
    name: "",
    role: "",
    rating: 5,
    review: "",
    photoUrl: "",
    isVisible: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setDraft(initial
      ? {
          name: initial.name,
          role: initial.role,
          rating: initial.rating,
          review: initial.review,
          photoUrl: initial.photoUrl ?? "",
          isVisible: initial.isVisible ?? true,
        }
      : { name: "", role: "", rating: 5, review: "", photoUrl: "", isVisible: true });
    setSubmitError("");
  }, [initial, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitError("");
    try {
      await onSave(draft);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save this testimonial.");
    } finally {
      setIsSaving(false);
    }
  }

  return <Dialog open={open} onOpenChange={(isOpen) => { if (!isSaving) onOpenChange(isOpen); }}><DialogContent><DialogHeader><DialogTitle>{initial ? "Edit testimonial" : "Add a kind word"}</DialogTitle><DialogDescription>Share a genuine note from someone you’ve worked with.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={handleSubmit}>
    <Field label="Client name"><Input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
    <Field label="Photo URL"><Input type="url" value={draft.photoUrl ?? ""} onChange={(event) => setDraft({ ...draft, photoUrl: event.target.value })} placeholder="https://example.com/photo.jpg" /></Field>
    <Field label="Feedback"><Textarea required rows={4} value={draft.review} onChange={(event) => setDraft({ ...draft, review: event.target.value })} /></Field>
    <Field label="Rating"><select value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })}>{[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{rating} stars</option>)}</select></Field>
    <label className="switch-row">
      <span className={`switch ${draft.isVisible !== false ? "switch-on" : ""}`}><i /></span>
      <input type="checkbox" checked={draft.isVisible !== false} onChange={(event) => setDraft({ ...draft, isVisible: event.target.checked })} />
      <span><strong>{draft.isVisible === false ? "Hidden from page" : "Visible on page"}</strong><small>Choose whether this testimonial appears on your public page.</small></span>
    </label>
    {submitError && <p className="testimonial-message testimonial-error" role="alert">{submitError}</p>}
    <div className="dialog-actions"><Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save testimonial"} <ArrowRight size={15} /></Button></div>
  </form></DialogContent></Dialog>;
}

const emptyOffering: Omit<Offering, "id"> = { type: "Service", title: "", description: "", price: "", image: "" };
const emptyProject: Omit<Project, "id"> = { title: "", category: "Wedding", caption: "", image: "", projectUrl: "", isVisible: true };
const fallbackImage = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80";
