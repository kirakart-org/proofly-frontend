import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CirclePlay,
  Globe2,
  Heart,
  Layers3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const heroImage =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=88";

export function LandingPage() {
  return (
    <div className="marketing">
      <header className="site-nav">
        <Link className="brand-lockup" to="/" aria-label="Proofpage home">
          <span className="brand-mark"><span /><span /><span /></span>
          <span>proofpage</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#stories">Stories</a>
        </nav>
        <div className="nav-actions">
          <Link className="nav-login" to="/app">Log in</Link>
          <Button asChild size="sm" className="nav-cta">
            <Link to="/app">Create your page <ArrowUpRight size={15} /></Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="hero-section" id="top">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> A little more you, online</div>
            <h1>Your work deserves<br />a <em>beautiful</em> first impression.</h1>
            <p className="hero-subtitle">
              One thoughtful page for your work, your story, and the people
              ready to work with you. No website skills required.
            </p>
            <div className="hero-actions">
              <Button asChild size="lg">
                <Link to="/app">Build your free page <ArrowRight size={17} /></Link>
              </Button>
              <a className="text-link" href="#how-it-works"><CirclePlay size={18} /> See how it works</a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>AN</span><span>MK</span><span>JR</span><span>+</span>
              </div>
              <div>
                <div className="proof-stars"><Star /><Star /><Star /><Star /><Star /></div>
                <p>Made for people who care about their craft</p>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-image-frame">
              <img src={heroImage} alt="A wedding photographer documenting a couple in warm evening light" />
              <div className="image-wash" />
              <div className="image-caption">
                <span>THE CREATIVE EDIT</span>
                <span>01 — 04</span>
              </div>
            </div>
            <div className="floating-profile-card">
              <div className="profile-card-top">
                <span className="profile-avatar">JS</span>
                <span className="verified-mark"><Check size={11} /></span>
                <span className="profile-card-label">YOUR PROOFPAGE</span>
                <ArrowUpRight size={16} className="profile-card-arrow" />
              </div>
              <p className="profile-name">Jayasuriya Studio</p>
              <p className="profile-sub">Photography · Bengaluru, India</p>
              <div className="profile-card-bottom">
                <span><Star size={13} fill="currentColor" /> 5.0 <span className="muted">· 28 kind words</span></span>
                <span className="online-dot" /> Taking bookings
              </div>
            </div>
            <div className="hero-note"><Sparkles size={14} /> Yours in an afternoon</div>
            <div className="hero-vertical-note">MADE FOR THE WORK YOU LOVE</div>
          </div>
          <a className="scroll-cue" href="#how-it-works"><span>Scroll to explore</span><ArrowDown size={15} /></a>
        </section>

        <section className="trust-strip" id="stories">
          <p>For independent businesses with something worth sharing</p>
          <div className="trust-names">
            <span>STUDIO <b>FORM</b></span><span className="trust-serif">sunday & co.</span>
            <span className="trust-spaced">FIELDWORK</span><span className="trust-script">made by hand</span>
            <span className="trust-serif">the goodfolk</span>
          </div>
        </section>

        <section className="story-section section-wrap" id="how-it-works">
          <div className="section-intro">
            <span className="eyebrow"><span className="eyebrow-line" /> Simple by design</span>
            <h2>A good first impression<br />should feel <em>effortless.</em></h2>
            <p>All the pieces your future customers need to say “yes”—in one calm, considered place.</p>
          </div>
          <div className="story-grid">
            <div className="story-photo">
              <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1300&q=85" alt="A welcoming independent creative studio" />
              <div className="photo-stamp"><span>01</span><span>YOUR CORNER<br />OF THE INTERNET</span></div>
            </div>
            <div className="story-steps">
              <article className="story-step">
                <span className="step-number">01</span>
                <div><h3>Tell your story</h3><p>Share what you do, who you help, and what makes your work yours.</p></div>
                <ArrowUpRight size={17} />
              </article>
              <article className="story-step">
                <span className="step-number">02</span>
                <div><h3>Show what you make</h3><p>Bring together your best work, services, prices, and the kind words clients leave behind.</p></div>
                <ArrowUpRight size={17} />
              </article>
              <article className="story-step">
                <span className="step-number">03</span>
                <div><h3>Meet your next client</h3><p>Give people a simple way to ask a question, book a service, or start a conversation.</p></div>
                <ArrowUpRight size={17} />
              </article>
              <Link className="text-link story-link" to="/app">Take a look inside <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        <section className="feature-section" id="features">
          <div className="section-wrap feature-inner">
            <div className="feature-heading">
              <div>
                <span className="eyebrow eyebrow-light"><span className="eyebrow-line" /> Everything in its right place</span>
                <h2>Less time arranging.<br /><em>More time doing.</em></h2>
              </div>
              <p>Thoughtful tools for the business behind your craft. Easy to set up, a pleasure to share.</p>
            </div>
            <div className="feature-grid">
              <Feature icon={<Layers3 />} number="01" title="Your work, well presented" text="Build a polished home for your portfolio, packages, and business story." />
              <Feature icon={<Heart />} number="02" title="Trust, built in" text="Bring your best client testimonials forward, right where they matter." />
              <Feature icon={<MessageCircle />} number="03" title="Enquiries, in one place" text="Make it simple to reach you and keep each new conversation close at hand." />
              <Feature icon={<Globe2 />} number="04" title="One link. All of you." text="A shareable page that looks at home in your bio, email, and every introduction." />
            </div>
          </div>
        </section>

        <section className="showcase-section section-wrap">
          <div className="showcase-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> A page that feels like yours</span>
            <h2>Your best work.<br />Your own <em>little world.</em></h2>
            <p>From the first hello to the final detail, your page brings the whole picture together—without the fuss of building a website from scratch.</p>
            <ul className="check-list">
              <li><CheckCircle2 /> A beautiful home for your portfolio</li>
              <li><CheckCircle2 /> Clear services and thoughtful pricing</li>
              <li><CheckCircle2 /> Enquiries sent straight to you</li>
            </ul>
            <Button asChild size="lg"><Link to="/app">Make it yours <ArrowRight size={17} /></Link></Button>
          </div>
          <div className="showcase-visual">
            <div className="showcase-main-img"><img src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=85" alt="An elegant wedding table detail from a sample photography portfolio" /></div>
            <div className="showcase-side-img"><img src="https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=85" alt="An intimate celebration beneath warm lights" /></div>
            <div className="showcase-rating"><div className="rating-stars">★★★★★</div><strong>“They just got it.”</strong><span>— Ananya, a very happy client</span></div>
            <div className="showcase-index">A FEW RECENT MOMENTS <span>→</span></div>
          </div>
        </section>

        <section className="testimonial-section">
          <div className="testimonial-mark">“</div>
          <blockquote>It finally feels like the work I do has a home that does it justice.</blockquote>
          <div className="quote-byline"><span className="quote-avatar">M</span><span><b>Meera Krishnan</b><small>Independent creative · Chennai</small></span></div>
        </section>

        <section className="cta-section">
          <div className="cta-panel">
            <div className="cta-image"><img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=85" alt="A quiet mountain landscape at the edge of evening" /></div>
            <div className="cta-content">
              <span className="eyebrow eyebrow-light"><span className="eyebrow-line" /> Your next chapter starts here</span>
              <h2>Let your work<br />find its <em>people.</em></h2>
              <p>Put your best foot forward. Your first Proofpage is free, and ready when you are.</p>
              <Button asChild size="lg" className="cta-button"><Link to="/app">Create your page <ArrowRight size={17} /></Link></Button>
              <div className="cta-safe"><ShieldCheck size={14} /> No card needed <span>·</span> Ready to share in minutes</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Link className="brand-lockup" to="/"><span className="brand-mark"><span /><span /><span /></span><span>proofpage</span></Link>
        <p>Good work deserves to be seen.</p>
        <div><a href="#top">Back to top ↑</a><span>© 2026 Proofpage</span></div>
      </footer>
    </div>
  );
}

function Feature({ icon, number, title, text }: { icon: ReactNode; number: string; title: string; text: string }) {
  return (
    <article className="feature-card">
      <div className="feature-card-top"><span className="feature-icon">{icon}</span><span>{number}</span></div>
      <h3>{title}</h3>
      <p>{text}</p>
      <ArrowUpRight className="feature-arrow" size={17} />
    </article>
  );
}
