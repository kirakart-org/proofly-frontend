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
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProofpage } from "../../hooks/use-proofpage";
import { createId, readImageAsDataUrl } from "../../lib/utils";
import type { Business, LeadStatus, Offering, Project, Testimonial } from "../../types";
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

type WorkspaceSection = "overview" | "business" | "offerings" | "portfolio" | "testimonials" | "enquiries" | "settings";

export function WorkspacePage({ section: sectionProp }: { section?: WorkspaceSection }) {
  const { section: routeSection } = useParams();
  const section = (sectionProp ?? routeSection ?? "overview") as WorkspaceSection;
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
  const { data } = useProofpage();
  const navigate = useNavigate();
  const tasks = [
    { title: "Complete your business profile", detail: "Introduce yourself and add your contact details.", done: Boolean(data.business.name && data.business.bio), to: "/app/business" },
    { title: "Add your services and packages", detail: `${data.offerings.length} offering${data.offerings.length === 1 ? "" : "s"} on your page.`, done: data.offerings.length > 0, to: "/app/offerings" },
    { title: "Showcase your best work", detail: `${data.projects.length} project${data.projects.length === 1 ? "" : "s"} in your portfolio.`, done: data.projects.length > 0, to: "/app/portfolio" },
    { title: "Add a little social proof", detail: `${data.testimonials.length} client review${data.testimonials.length === 1 ? "" : "s"} featured.`, done: data.testimonials.length > 0, to: "/app/testimonials" },
  ];
  const progress = Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100);
  const newLeads = data.leads.filter((lead) => lead.status === "New").length;

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="YOUR WORKSPACE"
        title={`Good morning, ${data.business.name.split(" ")[0]}.`}
        description="A little snapshot of your business, and what’s coming your way."
        action={<Button asChild><Link to="/app/business"><Pencil size={15} /> Edit your page</Link></Button>}
      />
      <section className="metric-grid">
        <Metric label="Page views" value="1,428" note="+18.4% this month" icon={<Eye />} positive />
        <Metric label="Active offerings" value={String(data.offerings.length).padStart(2, "0")} note="On your page" icon={<PackageOpen />} />
        <Metric label="Client reviews" value={String(data.testimonials.length).padStart(2, "0")} note="5.0 average rating" icon={<Star />} />
        <Metric label="New enquiries" value={String(newLeads).padStart(2, "0")} note={`${data.leads.length} total conversations`} icon={<Users />} positive />
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
              <span className={`publish-badge ${data.business.isPublished ? "" : "is-draft"}`}><i />{data.business.isPublished ? "Published" : "Draft"}</span>
            </CardHeader>
            <CardContent>
              <div className="published-url">proofpage.site/p/{data.business.slug}</div>
              <div className="published-actions">
                <Button asChild variant="outline" size="sm"><Link to={`/p/${data.business.slug}?preview=1`} target="_blank"><Eye size={14} /> Preview page</Link></Button>
                <Button asChild variant="secondary" size="sm"><Link to="/app/business"><Pencil size={14} /> Edit</Link></Button>
              </div>
            </CardContent>
          </Card>
          <Card className="recent-card">
            <CardHeader className="recent-head"><CardTitle>Recent enquiries</CardTitle><Link to="/app/enquiries">See all <ArrowUpRight size={14} /></Link></CardHeader>
            <CardContent className="recent-list">
              {data.leads.slice(0, 3).map((lead) => (
                <div className="recent-lead" key={lead.id}>
                  <span className="lead-avatar">{lead.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span>
                  <span className="recent-lead-copy"><strong>{lead.name}</strong><small>{lead.service}</small></span>
                  <Badge className={`lead-status ${lead.status.toLowerCase()}`}>{lead.status}</Badge>
                </div>
              ))}
              {data.leads.length === 0 && <p className="muted-copy">New enquiries will show up here.</p>}
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

function BusinessEditor() {
  const { data, setData, notify } = useProofpage();
  const [draft, setDraft] = useState<Business>(data.business);
  const change = (key: keyof Business, value: string | boolean) => setDraft((current) => ({ ...current, [key]: value }));
  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    setData((current) => ({ ...current, business: draft }));
    notify(draft.isPublished ? "Your business page is published." : "Your changes have been saved as a draft.");
  };
  return (
    <div className="page-stack">
      <PageHeading eyebrow="YOUR STORY" title="Business page" description="Make your page sound and feel like your business." action={<Button asChild variant="outline"><Link to={`/p/${draft.slug}?preview=1`} target="_blank"><Eye size={15} /> Preview page</Link></Button>} />
      <form className="editor-layout" onSubmit={handleSave}>
        <div className="editor-main">
          <Card>
            <CardHeader><CardTitle>Start with the essentials</CardTitle><p>Give people a clear, warm introduction to what you do.</p></CardHeader>
            <CardContent className="form-grid">
              <Field label="Business name"><Input required value={draft.name} onChange={(event) => change("name", event.target.value)} /></Field>
              <Field label="Page address"><div className="slug-input"><span>proofpage.site/p/</span><Input required value={draft.slug} onChange={(event) => change("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} /></div></Field>
              <Field label="Your headline" className="full-field"><Input required value={draft.tagline} onChange={(event) => change("tagline", event.target.value)} placeholder="What makes your work special?" /></Field>
              <Field label="About your business" className="full-field"><Textarea required rows={5} value={draft.bio} onChange={(event) => change("bio", event.target.value)} /></Field>
              <Field label="What do you do?"><Input value={draft.category} onChange={(event) => change("category", event.target.value)} /></Field>
              <Field label="Where are you based?"><Input value={draft.location} onChange={(event) => change("location", event.target.value)} /></Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Let them reach you</CardTitle><p>Put the right contact details within easy reach.</p></CardHeader>
            <CardContent className="form-grid">
              <Field label="Contact email"><Input type="email" value={draft.email} onChange={(event) => change("email", event.target.value)} /></Field>
              <Field label="Phone or WhatsApp"><Input value={draft.phone} onChange={(event) => change("phone", event.target.value)} /></Field>
              <Field label="Instagram"><Input value={draft.instagram} onChange={(event) => change("instagram", event.target.value)} /></Field>
              <Field label="Cover image URL"><Input type="url" value={draft.coverImage} onChange={(event) => change("coverImage", event.target.value)} /></Field>
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
              <Button type="submit" className="save-button">Save changes <ArrowRight size={15} /></Button>
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
  const { data, setData, notify } = useProofpage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offering | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const shown = useMemo(() => data.offerings.filter((item) => (filter === "All" || item.type === filter) && item.title.toLowerCase().includes(search.toLowerCase())), [data.offerings, filter, search]);
  const save = (values: Omit<Offering, "id">) => {
    setData((current) => ({ ...current, offerings: editing ? current.offerings.map((item) => item.id === editing.id ? { ...values, id: editing.id } : item) : [{ ...values, id: createId("offering") }, ...current.offerings] }));
    notify(editing ? "Offering updated." : "Offering added to your page.");
    setDialogOpen(false);
  };
  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const remove = (id: string) => { setData((current) => ({ ...current, offerings: current.offerings.filter((item) => item.id !== id) })); notify("Offering removed."); };
  return (
    <div className="page-stack">
      <PageHeading eyebrow="WHAT YOU OFFER" title="Products & services" description="Make it easy for clients to understand what you do and how to get started." action={<Button onClick={openNew}><Plus size={16} /> Add an offering</Button>} />
      <div className="collection-toolbar">
        <div className="filter-tabs">{["All", "Service", "Product"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}{item === "All" && <span>{data.offerings.length}</span>}</button>)}</div>
        <label className="search-field"><Search size={16} /><input placeholder="Find an offering" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      </div>
      {shown.length ? <div className="offering-grid">{shown.map((item) => <Card className="offering-card" key={item.id}>
        <div className="offering-image"><img src={item.image || fallbackImage} alt="" /><Badge>{item.type}</Badge><button aria-label={`More options for ${item.title}`} onClick={() => { setEditing(item); setDialogOpen(true); }}><MoreHorizontal size={17} /></button></div>
        <CardContent className="offering-content"><div className="offering-title-row"><h2>{item.title}</h2><strong>{item.price}</strong></div><p>{item.description}</p><div className="offering-actions"><span><span className="status-dot" /> On your page</span><div><Button variant="ghost" size="icon" aria-label="Edit offering" onClick={() => { setEditing(item); setDialogOpen(true); }}><Pencil size={15} /></Button><Button variant="ghost" size="icon" aria-label="Delete offering" onClick={() => remove(item.id)}><Trash2 size={15} /></Button></div></div></CardContent>
      </Card>)}</div> : <EmptyState icon={<PackageOpen />} title="Nothing here just yet" text="Add a service or product to let potential clients know how you can help." action={openNew} />}
      <OfferDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing} onSave={save} />
    </div>
  );
}

function PortfolioPage() {
  const { data, setData, notify } = useProofpage();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const save = (values: Omit<Project, "id">) => {
    setData((current) => ({ ...current, projects: editing ? current.projects.map((item) => item.id === editing.id ? { ...values, id: editing.id } : item) : [{ ...values, id: createId("project") }, ...current.projects] }));
    notify(editing ? "Portfolio project updated." : "Project added to your portfolio.");
    setOpen(false);
  };
  const remove = (id: string) => { setData((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== id) })); notify("Project removed."); };
  const openNew = () => { setEditing(null); setOpen(true); };
  return (
    <div className="page-stack">
      <PageHeading eyebrow="YOUR BEST WORK" title="Portfolio" description="A few good examples can say more than a thousand words." action={<Button onClick={openNew}><Plus size={16} /> Add project</Button>} />
      {data.projects.length ? <div className="portfolio-grid">{data.projects.map((project) => <Card className="portfolio-card" key={project.id}>
        <div className="portfolio-image"><img src={project.image || fallbackImage} alt={project.title} /><Badge>{project.category}</Badge></div>
        <CardContent className="portfolio-content"><div><h2>{project.title}</h2><p>{project.caption}</p></div><div className="item-actions"><Button variant="ghost" size="icon" aria-label="Edit project" onClick={() => { setEditing(project); setOpen(true); }}><Pencil size={15} /></Button><Button variant="ghost" size="icon" aria-label="Delete project" onClick={() => remove(project.id)}><Trash2 size={15} /></Button></div></CardContent>
      </Card>)}</div> : <EmptyState icon={<FileImage />} title="Your portfolio is waiting" text="Add a project to give people a feel for your craft." action={openNew} />}
      <ProjectDialog open={open} onOpenChange={setOpen} initial={editing} onSave={save} />
    </div>
  );
}

function TestimonialsPage() {
  const { data, setData, notify } = useProofpage();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const save = (values: Omit<Testimonial, "id" | "date">) => {
    setData((current) => ({ ...current, testimonials: editing ? current.testimonials.map((item) => item.id === editing.id ? { ...values, id: editing.id, date: editing.date } : item) : [{ ...values, id: createId("review"), date: "Just now" }, ...current.testimonials] }));
    notify(editing ? "Testimonial updated." : "A new testimonial has been added.");
    setOpen(false);
  };
  const remove = (id: string) => { setData((current) => ({ ...current, testimonials: current.testimonials.filter((item) => item.id !== id) })); notify("Testimonial removed."); };
  const openNew = () => { setEditing(null); setOpen(true); };
  return (
    <div className="page-stack">
      <PageHeading eyebrow="KIND WORDS" title="Testimonials" description="The things clients say about working with you matter. Give them a place to live." action={<Button onClick={openNew}><Plus size={16} /> Add testimonial</Button>} />
      {data.testimonials.length ? <div className="testimonial-grid">{data.testimonials.map((item) => <Card className="review-card" key={item.id}>
        <CardContent><div className="review-stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} fill={i < item.rating ? "currentColor" : "none"} />)}</div><blockquote>“{item.review}”</blockquote><div className="review-byline"><span className="lead-avatar">{item.name.slice(0, 1)}</span><span><strong>{item.name}</strong><small>{item.role}</small></span><div className="item-actions"><Button variant="ghost" size="icon" aria-label="Edit testimonial" onClick={() => { setEditing(item); setOpen(true); }}><Pencil size={15} /></Button><Button variant="ghost" size="icon" aria-label="Delete testimonial" onClick={() => remove(item.id)}><Trash2 size={15} /></Button></div></div></CardContent>
      </Card>)}</div> : <EmptyState icon={<Star />} title="Add your first kind word" text="A genuine client review helps new people feel good about getting in touch." action={openNew} />}
      <TestimonialDialog open={open} onOpenChange={setOpen} initial={editing} onSave={save} />
    </div>
  );
}

function EnquiriesPage() {
  const { data, setData } = useProofpage();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = data.leads.filter((lead) => (filter === "All" || lead.status === filter) && `${lead.name} ${lead.email} ${lead.service}`.toLowerCase().includes(search.toLowerCase()));
  const statuses: LeadStatus[] = ["New", "Contacted", "Booked", "Lost"];
  return (
    <div className="page-stack">
      <PageHeading eyebrow="NEW CONNECTIONS" title="Enquiries" description="Every good project starts with a conversation." action={<Badge className="enquiry-total"><MessageCircle size={13} /> {data.leads.length} conversations</Badge>} />
      <div className="collection-toolbar">
        <div className="filter-tabs">{["All", "New", "Contacted", "Booked", "Lost"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}{item === "New" && <span>{data.leads.filter((lead) => lead.status === "New").length}</span>}</button>)}</div>
        <label className="search-field"><Search size={16} /><input placeholder="Search enquiries" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      </div>
      <div className="enquiry-list">
        {filtered.map((lead) => <Card className="enquiry-card" key={lead.id}>
          <div className="enquiry-avatar">{lead.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>
          <div className="enquiry-main">
            <div className="enquiry-title"><h2>{lead.name}</h2><Badge className={`lead-status ${lead.status.toLowerCase()}`}>{lead.status}</Badge><span className="enquiry-date">{lead.createdAt}</span></div>
            <p className="enquiry-message">{lead.message}</p>
            <div className="enquiry-meta"><span><PackageOpen size={14} />{lead.service} · {lead.budget}</span>{lead.email && <a href={`mailto:${lead.email}`}><Mail size={14} />{lead.email}</a>}{lead.phone && <a href={`tel:${lead.phone}`}><MessageCircle size={14} />{lead.phone}</a>}</div>
          </div>
          <label className="status-select-label"><span>Update status</span><select value={lead.status} onChange={(event) => setData((current) => ({ ...current, leads: current.leads.map((item) => item.id === lead.id ? { ...item, status: event.target.value as LeadStatus } : item) }))}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        </Card>)}
        {filtered.length === 0 && <EmptyState icon={<MessageCircle />} title="No enquiries found" text={data.leads.length ? "Try another search or status filter." : "When someone sends a note from your public page, it will land here."} />}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { data, setData, notify } = useProofpage();
  const updateSetting = (key: keyof typeof data.settings, value: boolean) => {
    setData((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
    notify("Your preference has been saved.");
  };
  return (
    <div className="page-stack">
      <PageHeading eyebrow="PREFERENCES" title="Settings" description="A few small choices for how your Proofpage works." />
      <Card className="settings-card">
        <CardHeader><CardTitle>Your account</CardTitle><p>These details are used when people get in touch with you.</p></CardHeader>
        <CardContent>
          <div className="setting-row"><div className="setting-avatar">JS</div><div><strong>{data.business.name}</strong><small>{data.business.email}</small></div><Badge><ShieldCheck size={12} /> Verified</Badge></div>
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

function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: () => void }) {
  return <Card className="empty-state"><span className="empty-icon">{icon}</span><h2>{title}</h2><p>{text}</p>{action && <Button onClick={action}><Plus size={15} /> Add something</Button>}</Card>;
}

function ImageField({ image, onChange }: { image: string; onChange: (image: string) => void }) {
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setReading(true);
    try {
      onChange(await readImageAsDataUrl(file));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read this image.");
    } finally {
      setReading(false);
      event.target.value = "";
    }
  };
  return (
    <div className="image-field">
      <Input type="url" value={image.startsWith("data:") ? "" : image} onChange={(event) => onChange(event.target.value)} placeholder="Paste an image URL (optional)" />
      <label className="image-upload-button"><Upload size={13} />{reading ? "Preparing image…" : image.startsWith("data:") ? "Image selected" : "Choose image"}<input type="file" accept="image/*" onChange={handleFile} disabled={reading} /></label>
      {error && <span className="image-error" role="alert">{error}</span>}
    </div>
  );
}

function OfferDialog({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; initial: Offering | null; onSave: (values: Omit<Offering, "id">) => void }) {
  const [draft, setDraft] = useState<Omit<Offering, "id">>(emptyOffering);
  useEffect(() => setDraft(initial ? { type: initial.type, title: initial.title, description: initial.description, price: initial.price, image: initial.image } : emptyOffering), [initial, open]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{initial ? "Edit offering" : "Add an offering"}</DialogTitle><DialogDescription>Give this service or product a clear, friendly introduction.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={(event) => { event.preventDefault(); onSave(draft); }}>
    <Field label="Type"><select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as Offering["type"] })}><option>Service</option><option>Product</option></select></Field>
    <Field label="Name"><Input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Full-day wedding editorial" /></Field>
    <Field label="Description"><Textarea rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="What's included?" /></Field>
    <div className="dialog-two-col"><Field label="Price"><Input required value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="₹25,000" /></Field><Field label="Image"><ImageField image={draft.image} onChange={(image) => setDraft({ ...draft, image })} /></Field></div>
    <div className="dialog-actions"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">Save offering <ArrowRight size={15} /></Button></div>
  </form></DialogContent></Dialog>;
}

function ProjectDialog({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; initial: Project | null; onSave: (values: Omit<Project, "id">) => void }) {
  const [draft, setDraft] = useState<Omit<Project, "id">>(emptyProject);
  useEffect(() => setDraft(initial ? { title: initial.title, category: initial.category, caption: initial.caption, image: initial.image } : emptyProject), [initial, open]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{initial ? "Edit project" : "Add a project"}</DialogTitle><DialogDescription>Give your work a title and a little context.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={(event) => { event.preventDefault(); onSave(draft); }}>
    <Field label="Project title"><Input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field>
    <Field label="Category"><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{["Wedding", "Commercial", "Editorial", "Portrait", "Other"].map((option) => <option key={option}>{option}</option>)}</select></Field>
    <Field label="Story or caption"><Textarea rows={3} value={draft.caption} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} /></Field>
    <Field label="Project image"><ImageField image={draft.image} onChange={(image) => setDraft({ ...draft, image })} /></Field>
    <div className="dialog-actions"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">Save project <ArrowRight size={15} /></Button></div>
  </form></DialogContent></Dialog>;
}

function TestimonialDialog({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; initial: Testimonial | null; onSave: (values: Omit<Testimonial, "id" | "date">) => void }) {
  const [draft, setDraft] = useState({ name: "", role: "", rating: 5, review: "" });
  useEffect(() => setDraft(initial ? { name: initial.name, role: initial.role, rating: initial.rating, review: initial.review } : { name: "", role: "", rating: 5, review: "" }), [initial, open]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{initial ? "Edit testimonial" : "Add a kind word"}</DialogTitle><DialogDescription>Share a genuine note from someone you’ve worked with.</DialogDescription></DialogHeader><form className="dialog-form" onSubmit={(event) => { event.preventDefault(); onSave(draft); }}>
    <Field label="Client name"><Input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field>
    <Field label="Role or context"><Input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Wedding client · Bengaluru" /></Field>
    <Field label="Review"><Textarea required rows={4} value={draft.review} onChange={(event) => setDraft({ ...draft, review: event.target.value })} /></Field>
    <Field label="Rating"><select value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })}>{[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{rating} stars</option>)}</select></Field>
    <div className="dialog-actions"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">Save testimonial <ArrowRight size={15} /></Button></div>
  </form></DialogContent></Dialog>;
}

const emptyOffering: Omit<Offering, "id"> = { type: "Service", title: "", description: "", price: "", image: "" };
const emptyProject: Omit<Project, "id"> = { title: "", category: "Wedding", caption: "", image: "" };
const fallbackImage = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80";
