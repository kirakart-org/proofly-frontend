import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CirclePlay,
  Globe2,
  Instagram,
  Link2,
  Linkedin,
  Mail,
  Menu,
  MessageCircle,
  Palette,
  ShoppingBag,
  Sparkles,
  X,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { demoData } from "../../data/demo";
import { Button } from "../ui/button";
import "./landing-page.css";

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: <Instagram size={15} /> },
  { label: "LinkedIn", href: "https://linkedin.com", icon: <Linkedin size={15} /> },
  { label: "YouTube", href: "https://youtube.com", icon: <Youtube size={15} /> },
];

const pageFeatures = [
  {
    icon: <Link2 />,
    title: "All your links, together",
    text: "Bring your socials, storefront, booking page, and favorite destinations under one easy-to-remember URL.",
  },
  {
    icon: <BriefcaseBusiness />,
    title: "Show what you do",
    text: "Add your portfolio, services, products, and the details people need to choose you with confidence.",
  },
  {
    icon: <Palette />,
    title: "Make it feel like you",
    text: "Personalize your page with your story, imagery, and style. No design or coding skills needed.",
  },
  {
    icon: <MessageCircle />,
    title: "Make the next step simple",
    text: "Give visitors a clear way to enquire, book, shop, or get in touch from any device.",
  },
];

const steps = [
  { number: "01", title: "Make it yours", text: "Add your name, a little about you, and the links you want people to find." },
  { number: "02", title: "Bring it all together", text: "Showcase your work, services, products, and the ways people can reach you." },
  { number: "03", title: "Share one simple link", text: "Put your Proofly URL in your bio, messages, email signature, or anywhere you show up." },
];

export function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const services = demoData.offerings.filter((item) => item.type === "Service");
  const products = demoData.offerings.filter((item) => item.type === "Product");

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="proofly-landing">
      <header className="landing-nav">
        <Link className="landing-brand" to="/" aria-label="Proofly home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span>proofly</span>
        </Link>

        <nav id="landing-navigation" className={`landing-nav-links${mobileNavOpen ? " is-open" : ""}`} aria-label="Main navigation">
          <a href="#features" onClick={closeMobileNav}>Features</a>
          <a href="#how-it-works" onClick={closeMobileNav}>How it works</a>
          <a href="#pricing" onClick={closeMobileNav}>Pricing</a>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="landing-menu-toggle"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileNavOpen}
          aria-controls="landing-navigation"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        <div className="landing-nav-actions">
          <Link className="landing-login" to="/login">Log in</Link>
          <Button asChild size="sm" className="landing-nav-cta">
            <Link to="/register">Get started free <ArrowUpRight size={15} /></Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="top">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow"><span className="landing-eyebrow-sparkle"><Sparkles size={13} /></span> Your whole online world, connected</div>
            <h1>Everything you want to share, <span>in one link.</span></h1>
            <p className="landing-hero-subtitle">
              Create one customizable page for your links, work, services, and products. Share one simple URL wherever people find you.
            </p>
            <div className="landing-hero-actions">
              <Button asChild size="lg" className="landing-primary-cta">
                <Link to="/register">Create your free page <ArrowRight size={17} /></Link>
              </Button>
              <a className="landing-secondary-cta" href="#how-it-works"><CirclePlay size={18} /> See how it works</a>
            </div>
            <div className="landing-hero-note">
              <span className="landing-note-check"><Check size={13} /></span>
              Free to start <span aria-hidden="true">·</span> No coding needed <span aria-hidden="true">·</span> Ready to share
            </div>
            <div className="landing-url-chip"><Globe2 size={14} /><span>proofly.page/yourname</span><Check size={14} /></div>
          </div>

          <div className="landing-preview-stage" aria-label="Preview of a customizable Proofly profile page">
            <div className="preview-orbit preview-orbit-one" aria-hidden="true" />
            <div className="preview-orbit preview-orbit-two" aria-hidden="true" />
            <div className="preview-floating-tag"><span className="preview-live-dot" /> One page. All of you.</div>
            <div className="preview-phone">
              <div className="preview-phone-screen">
                <div className="preview-phone-status"><span>9:41</span><span className="preview-status-icons">● ● ▰</span></div>
                <div className="preview-cover">
                  <img src={demoData.business.coverImage} alt="" />
                  <span className="preview-cover-glow" />
                </div>
                <div className="preview-profile">
                  <div className="preview-avatar">JS</div>
                  <span className="preview-verified" aria-label="Verified profile"><Check size={12} /></span>
                  <h2>Jayasuriya Studio</h2>
                  <p>Photographer · Bengaluru, India</p>
                  <div className="preview-social-links" aria-label="Social links">
                    {socialLinks.map((social) => (
                      <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                        {social.icon}
                      </a>
                    ))}
                  </div>
                  <div className="preview-contact-actions">
                    <a href={`mailto:${demoData.business.email}`}><Mail size={14} /> Email</a>
                    <Link to="/p/jsphotography#contact"><MessageCircle size={14} /> Contact</Link>
                  </div>
                </div>

                <div className="preview-content">
                  <section className="preview-section">
                    <div className="preview-section-heading"><h3>Selected work</h3><span>View all <ArrowUpRight size={12} /></span></div>
                    <div className="preview-work-grid">
                      {demoData.projects.slice(0, 3).map((project) => (
                        <img key={project.id} src={project.image} alt={project.title} />
                      ))}
                    </div>
                  </section>

                  <section className="preview-section">
                    <div className="preview-section-heading"><h3>Work with me</h3><span>Services</span></div>
                    <div className="preview-service-list">
                      {services.map((service) => (
                        <div className="preview-service" key={service.id}>
                          <span>{service.title}</span><strong>{service.price}</strong>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="preview-section">
                    <div className="preview-section-heading"><h3>Shop presets</h3><ShoppingBag size={14} /></div>
                    {products.map((product) => (
                      <div className="preview-product" key={product.id}>
                        <img src={product.image} alt="" />
                        <span>{product.title}</span>
                        <strong>{product.price}</strong>
                      </div>
                    ))}
                  </section>
                </div>
                <div className="preview-phone-footer"><Link to="/p/jsphotography">Made with Proofly <ArrowUpRight size={11} /></Link></div>
              </div>
            </div>
            <div className="preview-floating-card"><span className="preview-floating-icon"><Link2 size={16} /></span><span><b>One link</b><small>Everything in one place</small></span><ArrowUpRight size={15} /></div>
          </div>
        </section>

        <section className="landing-strip" aria-label="Everything you can add to your page">
          <p>One page for the things you share every day</p>
          <div><span>Social links</span><i /><span>Portfolio</span><i /><span>Services</span><i /><span>Products</span><i /><span>Contact</span></div>
        </section>

        <section className="landing-features landing-section" id="features">
          <div className="landing-section-heading">
            <span className="landing-section-label">MORE THAN A LIST OF LINKS</span>
            <h2>A little page that can do <em>a lot.</em></h2>
            <p>Give every part of your online presence one thoughtful place to live.</p>
          </div>
          <div className="landing-feature-grid">
            {pageFeatures.map((feature, index) => (
              <article className="landing-feature-card" key={feature.title}>
                <span className="landing-feature-icon">{feature.icon}</span>
                <span className="landing-feature-number">0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <ArrowUpRight className="landing-feature-arrow" size={17} />
              </article>
            ))}
          </div>
        </section>

        <section className="landing-how" id="how-it-works">
          <div className="landing-how-inner">
            <div className="landing-how-copy">
              <span className="landing-section-label">SIMPLE BY DESIGN</span>
              <h2>From scattered links to <em>one beautiful page.</em></h2>
              <p>Set up your page once. Keep it current as your work and the things you share grow.</p>
              <Button asChild size="lg" className="landing-primary-cta">
                <Link to="/register">Make your page <ArrowRight size={17} /></Link>
              </Button>
            </div>
            <div className="landing-step-list">
              {steps.map((step) => (
                <article className="landing-step" key={step.number}>
                  <span>{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.text}</p></div>
                  <ChevronRight size={18} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />

        <section className="landing-final-cta">
          <div className="landing-final-glow" aria-hidden="true" />
          <div className="landing-final-copy">
            <span className="landing-section-label">READY WHEN YOU ARE</span>
            <h2>Everything you are,<br /><em>one link away.</em></h2>
            <p>Create a page that feels like you, then share it wherever you show up.</p>
            <Button asChild size="lg" className="landing-final-button">
              <Link to="/register">Create your free page <ArrowRight size={17} /></Link>
            </Button>
            <span className="landing-final-footnote">Free to start · No website skills required</span>
          </div>
          <div className="landing-final-mark" aria-hidden="true"><Link2 /></div>
        </section>
      </main>

      <footer className="landing-footer">
        <Link className="landing-brand" to="/" aria-label="Proofly home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span>proofly</span>
        </Link>
        <p>Everything you want to share, in one link.</p>
        <div><Link to="/login">Log in</Link><span>© {new Date().getFullYear()} Proofly</span></div>
      </footer>
    </div>
  );
}

function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const plans = [
    {
      name: "Free",
      monthlyPrice: "₹0",
      yearlyPrice: "₹0",
      description: "Start building your professional online presence.",
      features: [
        "1 business profile page",
        "Basic profile themes",
        "Up to 5 portfolio projects",
        "Up to 5 products or services",
        "Social media links",
        "WhatsApp contact button",
        "Basic page analytics",
        "Proofly branding",
      ],
      cta: "Get started free",
      popular: false,
    },
    {
      name: "Pro",
      monthlyPrice: "₹199",
      yearlyPrice: "₹1,990",
      description: "Everything you need to grow your personal brand or business.",
      features: [
        "Everything in Free",
        "Unlimited portfolio projects",
        "Unlimited products and services",
        "Premium profile themes",
        "Remove Proofly branding",
        "Customer testimonials",
        "Enquiry management",
        "QR code for your profile",
        "Advanced page analytics",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Business",
      monthlyPrice: "₹499",
      yearlyPrice: "₹4,990",
      description: "Advanced tools for professionals and growing businesses.",
      features: [
        "Everything in Pro",
        "AI-powered profile content generation",
        "Custom domain support",
        "Advanced business insights",
        "Priority support",
        "Enhanced business profile customization",
        "Booking and enquiry tools",
      ],
      cta: "Choose Business",
      popular: false,
    },
  ];
  const comparisonRows: Array<[string, string | boolean, string | boolean, string | boolean]> = [
    ["Business profile", true, true, true],
    ["Portfolio projects", "Up to 5", "Unlimited", "Unlimited"],
    ["Products and services", "Up to 5", "Unlimited", "Unlimited"],
    ["Profile themes", "Basic", "Premium", "Premium"],
    ["Proofly branding", "Included", "Removable", "Removable"],
    ["Testimonials", false, true, true],
    ["Enquiry management", false, true, true],
    ["QR code", false, true, true],
    ["Analytics", "Basic", "Advanced", "Advanced"],
    ["AI profile generation", false, false, true],
    ["Custom domain", false, false, true],
    ["Priority support", false, false, true],
  ];

  return (
    <section className="pricing-page-section" id="pricing">
      <div className="pricing-page-inner">
        <header className="pricing-hero">
          <span className="pricing-eyebrow">SIMPLE, TRANSPARENT PRICING</span>
          <h2>One page. <em>More possibilities.</em></h2>
          <p>Everything you need to showcase your work, share your services, and turn visitors into customers.</p>
          <div className="pricing-billing-toggle" role="group" aria-label="Billing period">
            <button type="button" aria-pressed={billingPeriod === "monthly"} onClick={() => setBillingPeriod("monthly")}>Monthly</button>
            <button type="button" aria-pressed={billingPeriod === "yearly"} onClick={() => setBillingPeriod("yearly")}>
              Yearly <span>Save 2 months</span>
            </button>
          </div>
        </header>

        <div className="pricing-plan-grid">
          {plans.map((plan) => (
            <article className={`pricing-plan-card${plan.popular ? " is-popular" : ""}`} key={plan.name}>
              <div className="pricing-plan-heading">
                <h3>{plan.name}</h3>
                {plan.popular && <span className="pricing-popular-badge">MOST POPULAR</span>}
              </div>
              <p className="pricing-plan-description">{plan.description}</p>
              <div className="pricing-plan-price">
                <strong>{billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice}</strong>
                <span>{plan.name === "Free" ? "/ forever" : billingPeriod === "yearly" ? "/ year" : "/ month"}</span>
              </div>
              <ul className="pricing-plan-features">
                {plan.features.map((feature) => <li key={feature}><Check size={16} aria-hidden="true" /><span>{feature}</span></li>)}
              </ul>
              <Button asChild className={`pricing-plan-cta${plan.popular ? " is-primary" : ""}`}>
                <Link to="/register">{plan.cta}<ArrowRight size={16} /></Link>
              </Button>
            </article>
          ))}
        </div>

        <section className="pricing-comparison" aria-labelledby="pricing-comparison-title">
          <div className="pricing-subsection-heading">
            <span className="pricing-eyebrow">THE DETAILS</span>
            <h2 id="pricing-comparison-title">Compare plans</h2>
          </div>
          <div className="pricing-table-scroll" role="region" aria-label="Plan feature comparison" tabIndex={0}>
            <table className="pricing-table">
              <thead>
                <tr><th scope="col">Feature</th><th scope="col">Free</th><th scope="col">Pro</th><th scope="col">Business</th></tr>
              </thead>
              <tbody>
                {comparisonRows.map(([feature, free, pro, business]) => (
                  <tr key={feature}>
                    <th scope="row">{feature}</th>
                    {[free, pro, business].map((value, index) => (
                      <td key={`${feature}-${index}`}>
                        {value === true
                          ? <Check className="pricing-table-check" size={17} aria-label="Included" />
                          : value === false
                            ? <span className="pricing-table-excluded" aria-label="Not included">—</span>
                            : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pricing-faq" aria-labelledby="pricing-faq-title">
          <div className="pricing-subsection-heading">
            <span className="pricing-eyebrow">GOOD TO KNOW</span>
            <h2 id="pricing-faq-title">Frequently asked questions</h2>
          </div>
          <div className="pricing-faq-list">
            <details><summary>Can I use Proofly for free?</summary><p>Yes. You can create and publish a free profile page without paying.</p></details>
            <details><summary>Can I upgrade later?</summary><p>Yes. You can upgrade whenever you need more features.</p></details>
            <details><summary>Can I cancel my subscription?</summary><p>Yes. You can cancel your paid plan at any time.</p></details>
            <details><summary>Who is Proofly for?</summary><p>Proofly is for freelancers, creators, professionals, and local businesses who want one simple page to showcase their work and connect with customers.</p></details>
            <details><summary>Do I need a website?</summary><p>No. Proofly gives you a shareable profile page that works as your online presence.</p></details>
          </div>
        </section>

        <section className="pricing-final-cta">
          <span className="pricing-eyebrow">START FOR FREE</span>
          <h2>Your next customer is one click away.</h2>
          <p>Create your Proofly page and start sharing your work today.</p>
          <Button asChild className="pricing-final-button">
            <Link to="/register">Create your free page <ArrowRight size={17} /></Link>
          </Button>
        </section>
      </div>
    </section>
  );
}

