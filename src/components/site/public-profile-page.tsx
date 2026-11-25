import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileImage,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Star,
  X,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../../api.js";
import { Skeleton } from "../ui/skeleton";
import type { Business, Offering, Project, Testimonial } from "../../types";
import { Button } from "../ui/button";

type PublicBusinessRecord = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  category: string | null;
  logo_url: string | null;
  cover_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  social_links: Record<string, string>;
  theme: string;
  is_published: boolean;
};

type PublicPortfolioRecord = {
  id: number;
  business_id: number;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  project_url: string | null;
  is_visible: boolean;
};

type PublicProductRecord = {
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

type PublicTestimonialRecord = {
  id: number;
  business_id: number;
  customer_name: string;
  feedback: string;
  rating: number;
  photo_url: string | null;
  is_visible: boolean;
};

type PublicPageResponse = {
  business: PublicBusinessRecord;
  portfolio: PublicPortfolioRecord[];
  products: PublicProductRecord[];
  testimonials: PublicTestimonialRecord[];
};

type PublicPageContent = {
  business: Business;
  projects: Project[];
  offerings: Offering[];
  testimonials: Testimonial[];
};

type PublicTheme = {
  primary: string;
  primaryDark: string;
  soft: string;
  wash: string;
  line: string;
};

type PublicThemeStyle = CSSProperties & {
  "--public-primary": string;
  "--public-primary-dark": string;
  "--public-soft": string;
  "--public-wash": string;
  "--public-line": string;
};

const publicThemes: Record<string, PublicTheme> = {
  violet: { primary: "#6C5CE7", primaryDark: "#5142c5", soft: "#f0eeff", wash: "#f8f7ff", line: "#e5e1fb" },
  forest: { primary: "#2f765c", primaryDark: "#225a45", soft: "#eaf4ee", wash: "#f5faf6", line: "#dcebe1" },
  ocean: { primary: "#2876a8", primaryDark: "#1d5b83", soft: "#eaf4fa", wash: "#f4f9fc", line: "#dceaf3" },
  rose: { primary: "#ba5575", primaryDark: "#93415c", soft: "#faedf1", wash: "#fdf7f9", line: "#f2dfe6" },
  amber: { primary: "#a76b21", primaryDark: "#805019", soft: "#fbf1e2", wash: "#fdf9f2", line: "#f0e2cb" },
};

function getPublicThemeStyle(theme: string): PublicThemeStyle {
  const palette = publicThemes[theme.trim().toLowerCase()] ?? publicThemes.violet;
  return {
    "--public-primary": palette.primary,
    "--public-primary-dark": palette.primaryDark,
    "--public-soft": palette.soft,
    "--public-wash": palette.wash,
    "--public-line": palette.line,
  };
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "B";
}

function isPublicBusinessRecord(value: unknown): value is PublicBusinessRecord {
  if (typeof value !== "object" || value === null) return false;
  const business = value as Record<string, unknown>;
  const optionalStrings = [
    business.bio,
    business.category,
    business.logo_url,
    business.cover_url,
    business.email,
    business.phone,
    business.address,
  ];

  return (
    typeof business.id === "number" &&
    Number.isSafeInteger(business.id) &&
    business.id > 0 &&
    typeof business.name === "string" &&
    typeof business.username === "string" &&
    optionalStrings.every((field) => field === null || typeof field === "string") &&
    typeof business.social_links === "object" &&
    business.social_links !== null &&
    !Array.isArray(business.social_links) &&
    Object.values(business.social_links).every((item) => typeof item === "string") &&
    typeof business.theme === "string" &&
    typeof business.is_published === "boolean"
  );
}

function isPublicPortfolioRecord(value: unknown): value is PublicPortfolioRecord {
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

function isPublicProductRecord(value: unknown): value is PublicProductRecord {
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

function isPublicTestimonialRecord(value: unknown): value is PublicTestimonialRecord {
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

function isPublicPageResponse(value: unknown): value is PublicPageResponse {
  if (typeof value !== "object" || value === null) return false;
  const page = value as Record<string, unknown>;
  return (
    isPublicBusinessRecord(page.business) &&
    Array.isArray(page.portfolio) &&
    page.portfolio.every(isPublicPortfolioRecord) &&
    Array.isArray(page.products) &&
    page.products.every(isPublicProductRecord) &&
    Array.isArray(page.testimonials) &&
    page.testimonials.every(isPublicTestimonialRecord)
  );
}

function toPublicPageContent(response: PublicPageResponse): PublicPageContent {
  const business = response.business;
  return {
    business: {
      id: business.id,
      name: business.name,
      slug: business.username,
      tagline: "",
      bio: business.bio ?? "",
      category: business.category ?? "",
      location: business.address ?? "",
      email: business.email ?? "",
      phone: business.phone ?? "",
      instagram: business.social_links.instagram ?? "",
      coverImage: business.cover_url ?? "",
      isPublished: business.is_published,
      logoUrl: business.logo_url ?? "",
      socialLinks: business.social_links,
      theme: business.theme,
    },
    projects: response.portfolio
      .filter((project) => project.is_visible && project.business_id === business.id)
      .map((project) => ({
        id: String(project.id),
        title: project.title,
        category: project.category ?? "",
        caption: project.description ?? "",
        image: project.image_url ?? "",
        projectUrl: project.project_url ?? "",
        isVisible: project.is_visible,
      })),
    offerings: response.products
      .filter((product) => product.is_visible && product.business_id === business.id)
      .map((product) => ({
        id: String(product.id),
        type: "Product" as const,
        title: product.name,
        description: product.description ?? "",
        price: product.price === null
          ? "Contact for price"
          : `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(product.price)}`,
        image: product.image_url ?? "",
        category: product.category ?? "",
        contactUrl: product.contact_url ?? "",
        isVisible: product.is_visible,
      })),
    testimonials: response.testimonials
      .filter((testimonial) => testimonial.is_visible && testimonial.business_id === business.id)
      .map((testimonial) => ({
        id: String(testimonial.id),
        name: testimonial.customer_name,
        role: "",
        rating: testimonial.rating,
        review: testimonial.feedback,
        date: "",
        photoUrl: testimonial.photo_url ?? "",
        isVisible: testimonial.is_visible,
      })),
  };
}

function PublicBusinessLogo({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return src && !failed
    ? <img className="public-business-logo" src={src} alt={`${name} logo`} onError={() => setFailed(true)} />
    : <span className="public-business-logo public-business-logo-fallback" role="img" aria-label={`${name} logo`}>{getInitials(name)}</span>;
}

function PublicImage({ src, alt, className = "", placeholder = "Image unavailable" }: { src: string; alt: string; className?: string; placeholder?: string }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = src.trim();

  useEffect(() => setFailed(false), [src]);

  return (
    <div className={`public-image ${className}`}>
      {imageUrl && !failed
        ? <img src={imageUrl} alt={alt} onError={() => setFailed(true)} />
        : <div className="public-image-fallback" role="img" aria-label={`${alt}: ${imageUrl ? "Image unavailable" : placeholder}`}><FileImage size={24} /><span>{imageUrl ? "Image unavailable" : placeholder}</span></div>}
    </div>
  );
}

function PublicTestimonialAvatar({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return src && !failed
    ? <img className="public-testimonial-avatar" src={src} alt={`${name}`} onError={() => setFailed(true)} />
    : <span className="public-testimonial-avatar public-testimonial-avatar-fallback" aria-label={name}>{getInitials(name)}</span>;
}

function safeExternalUrl(value: string) {
  try {
    const candidate = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const socialIcons: Record<string, LucideIcon> = {
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  website: Globe,
};

function getSocialItems(links: Record<string, string> | undefined) {
  return Object.entries(links ?? {}).flatMap(([key, value]) => {
    const url = safeExternalUrl(value);
    if (!value.trim() || !url) return [];
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    return [{ label, url, Icon: socialIcons[key.toLowerCase()] ?? Globe }];
  });
}

function PublicProfileSkeleton() {
  return (
    <div className="public-profile public-loading" role="status" aria-label="Loading public profile">
      <header className="profile-nav">
        <Skeleton className="public-skeleton-brand" />
        <Skeleton className="public-skeleton-nav-business" />
        <Skeleton className="public-skeleton-nav-links" />
        <Skeleton className="public-skeleton-nav-action" />
      </header>
      <main>
        <section className="profile-hero">
          <div className="profile-hero-heading"><Skeleton className="public-skeleton-kicker" /><Skeleton className="public-skeleton-hero-title" /></div>
          <div className="profile-hero-showcase">
            <div className="profile-hero-copy"><div className="profile-hero-identity"><Skeleton className="skeleton-avatar public-skeleton-logo" /><span><Skeleton className="public-skeleton-name" /><Skeleton className="public-skeleton-bio" /></span></div><Skeleton className="public-skeleton-paragraph" /><Skeleton className="public-skeleton-action" /></div>
            <Skeleton className="public-skeleton-cover" />
            <div className="profile-hero-projects"><Skeleton className="public-skeleton-project-image" /><Skeleton className="public-skeleton-project-image" /></div>
          </div>
        </section>
        <section className="public-section public-work"><div className="public-section-heading"><Skeleton className="public-skeleton-section-title" /></div><div className="public-gallery">{Array.from({ length: 3 }, (_, index) => <article className="public-project" key={index}><Skeleton className="public-skeleton-card-image" /><div className="public-project-copy"><Skeleton className="public-skeleton-name" /><Skeleton className="public-skeleton-paragraph" /></div></article>)}</div></section>
        <section className="public-offerings"><div className="public-section-heading"><Skeleton className="public-skeleton-section-title" /></div><div className="public-offering-grid">{Array.from({ length: 3 }, (_, index) => <article className="public-offering" key={index}><Skeleton className="public-skeleton-card-image" /><div className="public-offering-copy"><Skeleton className="public-skeleton-name" /><Skeleton className="public-skeleton-paragraph" /><Skeleton className="public-skeleton-price" /></div></article>)}</div></section>
        <section className="public-testimonials"><div className="public-section-heading"><Skeleton className="public-skeleton-section-title" /></div><div className="public-testimonial-grid">{Array.from({ length: 3 }, (_, index) => <article className="public-testimonial" key={index}><Skeleton className="skeleton-rating" /><Skeleton className="public-skeleton-paragraph" /><Skeleton className="public-skeleton-name" /></article>)}</div></section>
        <section className="profile-contact"><Skeleton className="public-skeleton-contact" /><Skeleton className="public-skeleton-contact-form" /></section>
      </main>
      <footer className="profile-footer"><Skeleton className="public-skeleton-footer" /></footer>
    </div>
  );
}

export function PublicProfilePage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [page, setPage] = useState<PublicPageContent | null>(null);
  const [pageStatus, setPageStatus] = useState<"loading" | "ready" | "notFound" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setPage(null);
    setPageStatus("loading");
    setErrorMessage("");
    setSubmitted(false);
    setSubmitError("");

    if (!slug) {
      setPageStatus("notFound");
      return () => {
        active = false;
      };
    }

    api
      .get(`/pages/${encodeURIComponent(slug)}`)
      .then((response) => {
        if (!isPublicPageResponse(response)) {
          throw new Error("The public page response was incomplete or invalid.");
        }
        if (response.business.username !== slug || !response.business.is_published) {
          if (active) setPageStatus("notFound");
          return;
        }
        if (!active) return;
        setPage(toPublicPageContent(response));
        setPageStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 404) {
          setPageStatus("notFound");
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : "Unable to load this page.");
        setPageStatus("error");
      });

    return () => {
      active = false;
    };
  }, [slug, retryCount]);

  if (pageStatus === "loading") {
    return <PublicProfileSkeleton />;
  }

  if (pageStatus === "error") {
    return (
      <div className="profile-not-found" role="alert">
        <span className="brand-mark"><span /><span /><span /></span>
        <h1>We couldn’t load this page.</h1>
        <p>{errorMessage}</p>
        <Button onClick={() => setRetryCount((count) => count + 1)}>Try again</Button>
        <Button asChild variant="outline"><Link to="/"><ArrowLeft size={15} /> Back to Proofly</Link></Button>
      </div>
    );
  }

  if (pageStatus === "notFound" || !page) {
    return (
      <div className="profile-not-found">
        <span className="brand-mark"><span /><span /><span /></span>
        <h1>This page isn’t available.</h1>
        <p>It may be unpublished, or the address might have changed.</p>
        <Button asChild><Link to={isPreview ? "/app/business" : "/"}><ArrowLeft size={15} /> {isPreview ? "Back to the editor" : "Back to Proofly"}</Link></Button>
      </div>
    );
  }

  const business = page.business;
  const socialItems = getSocialItems(business.socialLinks);
  const phoneLink = business.phone.replace(/[^\d+]/g, "");
  const whatsappLink = business.phone.replace(/\D/g, "");

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await api.post("/enquiries", {
        business_id: business.id,
        name,
        email,
        phone: phone || null,
        message,
      });
      form.reset();
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to send your enquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="public-profile" style={getPublicThemeStyle(business.theme ?? "violet")}>
      {isPreview && <div className="preview-strip"><span>Preview mode · public profile data</span><Link to="/app/business"><ArrowLeft size={14} /> Back to editor</Link></div>}
      <header className="profile-nav">
        <Link to="/" className="proofly-brand" aria-label="Proofly home"><span className="proofly-mark">P</span><span>Proofly</span></Link>
        <div className="profile-nav-business"><PublicBusinessLogo name={business.name} src={business.logoUrl ?? ""} /><span>{business.name}</span></div>
        <nav className={`profile-nav-links${mobileMenuOpen ? " is-open" : ""}`} aria-label="Business page">
          {page.projects.length > 0 && <a href="#work" onClick={() => setMobileMenuOpen(false)}>Work</a>}
          {page.offerings.length > 0 && <a href="#offerings" onClick={() => setMobileMenuOpen(false)}>Products</a>}
          {page.testimonials.length > 0 && <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>}
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
        </nav>
        <a href="#contact" className="profile-contact-link">Let’s talk <ArrowUpRight size={16} /></a>
        <button type="button" className="profile-nav-toggle" aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      <main>
        <section className="profile-hero">
          <div className="profile-hero-heading">
            <p className="profile-hero-category"><span />{business.category || "BUSINESS PROFILE"}</p>
            <h1 className="profile-hero-title"><span>A closer look at</span><em>{business.name}</em></h1>
          </div>
          <div className={`profile-hero-showcase${page.projects.length > 0 ? " has-hero-projects" : ""}`}>
            <div className="profile-hero-copy">
              <div className="profile-hero-identity">
                <PublicBusinessLogo name={business.name} src={business.logoUrl ?? ""} />
                <div><strong>{business.name}</strong>{business.category && <span>{business.category}</span>}</div>
              </div>
              {business.bio && <p className="profile-bio">{business.bio}</p>}
              <div className="profile-hero-actions">
                <a href="#contact" className="profile-primary-action">Let’s talk <ArrowUpRight size={17} /></a>
                {page.projects.length > 0 && <a className="profile-secondary-action" href="#work">See the work <ArrowUpRight size={16} /></a>}
              </div>
            </div>
            <div className="profile-hero-visual">
              <PublicImage src={business.coverImage} alt={`${business.name} cover`} className="public-hero-cover" placeholder="Add a cover image to personalize this page" />
              <div className="profile-hero-caption"><span>{business.category || business.name}</span>{business.location && <span><MapPin size={13} />{business.location}</span>}</div>
            </div>
            {page.projects.length > 0 && <div className="profile-hero-projects" aria-label="Featured projects">
              {page.projects.slice(0, 2).map((project) => <div className="profile-hero-project" key={project.id}>
                <PublicImage src={project.image} alt={project.title} className="profile-hero-project-image" placeholder="Project image unavailable" />
                <span>{project.title}</span>
              </div>)}
            </div>}
          </div>
        </section>

        {page.projects.length > 0 && <section className="public-section public-work" id="work">
          <div className="public-section-heading"><div><span className="public-kicker">PORTFOLIO</span><h2>Selected <em>work.</em></h2></div><p>{business.name}</p></div>
          <div className="public-gallery">{page.projects.map((project) => <article className="public-project" key={project.id}>
            <PublicImage src={project.image} alt={project.title} className="public-project-image" placeholder="Project image unavailable" />
            <div className="public-project-copy">
              {project.category && <span className="public-item-category">{project.category}</span>}
              <h3>{project.title}</h3>
              {project.caption && <p>{project.caption}</p>}
              {safeExternalUrl(project.projectUrl ?? "") && <a href={safeExternalUrl(project.projectUrl ?? "") ?? undefined} target="_blank" rel="noreferrer">View project <ArrowUpRight size={15} /></a>}
            </div>
          </article>)}</div>
        </section>}

        {page.offerings.length > 0 && <section className="public-offerings" id="offerings">
          <div className="public-section-heading"><div><span className="public-kicker">PRODUCTS & SERVICES</span><h2>Things to <em>discover.</em></h2></div><p>Explore the available products and services from {business.name}.</p></div>
          <div className="public-offering-grid">{page.offerings.map((item) => <article className="public-offering" key={item.id}>
            <PublicImage src={item.image} alt={item.title} className="public-offering-image" placeholder="Image unavailable" />
            <div className="public-offering-copy">
              <span className="public-item-category">{item.category || item.type}</span>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
              <div className="public-offering-footer"><strong>{item.price}</strong><a href={safeExternalUrl(item.contactUrl ?? "") ?? "#contact"} target={item.contactUrl && safeExternalUrl(item.contactUrl) ? "_blank" : undefined} rel={item.contactUrl && safeExternalUrl(item.contactUrl) ? "noreferrer" : undefined}>Enquire <ArrowUpRight size={15} /></a></div>
            </div>
          </article>)}</div>
        </section>}

        {page.testimonials.length > 0 && <section className="public-testimonials" id="testimonials">
          <div className="public-section-heading"><div><span className="public-kicker">TESTIMONIALS</span><h2>Kind words</h2></div></div>
          <div className="public-testimonial-grid">{page.testimonials.map((review) => <article className="public-testimonial" key={review.id}>
            <div className="public-review-stars" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: review.rating }, (_, index) => <Star key={index} size={15} fill="currentColor" />)}</div>
            <p>{review.review}</p>
            <div className="public-review-author"><PublicTestimonialAvatar name={review.name} src={review.photoUrl ?? ""} /><strong>{review.name}</strong></div>
          </article>)}</div>
        </section>}

        <section className="profile-contact" id="contact">
          <div className="contact-intro">
            <span className="public-kicker">CONTACT</span>
            <h2>Let’s talk.</h2>
            <p>Get in touch with {business.name}.</p>
            <div className="contact-details">
              {business.email && <a href={`mailto:${business.email}`}><Mail size={16} />{business.email}</a>}
              {business.phone && <a href={`tel:${phoneLink}`}><Phone size={16} />{business.phone}</a>}
              {business.phone && whatsappLink && <a href={`https://wa.me/${whatsappLink}`} target="_blank" rel="noreferrer"><MessageCircle size={16} />WhatsApp</a>}
              {business.location && <span><MapPin size={16} />{business.location}</span>}
            </div>
            {socialItems.length > 0 && <div className="public-social-links">{socialItems.map(({ label, url, Icon }) => <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label}><Icon size={17} /><span>{label}</span><ArrowUpRight size={13} /></a>)}</div>}
          </div>
          {submitted ? <div className="enquiry-success" role="status">
            <span><Check size={20} /></span><h3>Enquiry sent</h3><p>Your message has been delivered to {business.name}.</p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>Send another message</Button>
          </div> : <form className="public-enquiry-form" onSubmit={submitEnquiry}>
            <h3>Send an enquiry</h3>
            {submitError && <p className="public-enquiry-error" role="alert">{submitError}</p>}
            <div className="public-form-grid"><label>Your name<input name="name" required autoComplete="name" placeholder="Your name" /></label><label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label></div>
            <label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" placeholder="Phone number" /></label>
            <label>Message<textarea name="message" required rows={5} placeholder="How can we help?" /></label>
            <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send enquiry"} <ArrowRight size={16} /></Button>
          </form>}
        </section>
      </main>
      <footer className="profile-footer">
        <div className="profile-footer-business"><PublicBusinessLogo name={business.name} src={business.logoUrl ?? ""} /><strong>{business.name}</strong></div>
        {socialItems.length > 0 && <div className="profile-footer-socials">{socialItems.map(({ label, url }) => <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>)}</div>}
        <span>© {new Date().getFullYear()} {business.name}</span>
        <Link to="/" className="powered-by">Powered by Proofly</Link>
      </footer>
    </div>
  );
}
