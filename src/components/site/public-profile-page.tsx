import { ArrowLeft, ArrowRight, ArrowUpRight, Check, MapPin, MessageCircle, ShieldCheck, Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useProofpage } from "../../hooks/use-proofpage";
import { createId } from "../../lib/utils";
import { Button } from "../ui/button";

export function PublicProfilePage() {
  const { slug = "" } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const { data, setData, notify } = useProofpage();
  const [submitted, setSubmitted] = useState(false);

  if (slug !== data.business.slug || (!data.business.isPublished && !isPreview)) {
    return (
      <div className="profile-not-found">
        <span className="brand-mark"><span /><span /><span /></span>
        <h1>This page isn’t available yet.</h1>
        <p>It may still be a draft, or the address might have changed.</p>
        <Button asChild><Link to="/app"><ArrowLeft size={15} /> Back to your workspace</Link></Button>
      </div>
    );
  }

  const business = data.business;
  const submitEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const service = String(formData.get("service") ?? "A general enquiry");
    const message = String(formData.get("message") ?? "").trim();
    setData((current) => ({
      ...current,
      leads: [{
        id: createId("lead"),
        name,
        email,
        phone,
        service,
        budget: current.offerings.find((item) => item.title === service)?.price ?? "Custom",
        message,
        status: "New",
        createdAt: "Just now",
      }, ...current.leads],
    }));
    setSubmitted(true);
    notify("Your enquiry has been sent.");
    event.currentTarget.reset();
  };

  return (
    <div className="public-profile">
      {isPreview && <div className="preview-strip"><span>Preview mode · only you can see this</span><Link to="/app/business"><ArrowLeft size={14} /> Back to editor</Link></div>}
      <header className="profile-nav">
        <Link to="/" className="brand-lockup"><span className="brand-mark"><span /><span /><span /></span><span>proofpage</span></Link>
        <nav><a href="#work">Selected work</a><a href="#offerings">Services</a><a href="#kind-words">Kind words</a></nav>
        <a href="#contact" className="profile-contact-link">Let’s talk <ArrowUpRight size={15} /></a>
      </header>
      <main>
        <section className="profile-hero">
          <div className="profile-hero-photo"><img src={business.coverImage || fallbackCover} alt={`${business.name} featured work`} /><span className="photo-credit">A RECENT STORY · BENGALURU</span></div>
          <div className="profile-hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> {business.category} · {business.location}</div>
            <h1>{business.name}<br /><em>by nature.</em></h1>
            <p className="profile-tagline">{business.tagline}</p>
            <p className="profile-bio">{business.bio}</p>
            <a className="profile-scroll" href="#work">Explore the work <ArrowRight size={15} /></a>
          </div>
          <div className="profile-seal"><ShieldCheck size={16} /><span>Independent<br />& intentional</span></div>
        </section>

        {data.projects.length > 0 && <section className="public-section public-work" id="work">
          <div className="public-section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> A FEW RECENT MOMENTS</div><h2>Work that <em>feels like something.</em></h2></div><p>Made with intention, an open mind, and a little bit of magic.</p></div>
          <div className="public-gallery">{data.projects.map((project, index) => <article className={`public-project project-${index % 3}`} key={project.id}><img src={project.image || fallbackCover} alt={project.title} /><div><span>{project.category}</span><h3>{project.title}</h3><p>{project.caption}</p></div></article>)}</div>
        </section>}

        {data.offerings.length > 0 && <section className="public-offerings" id="offerings">
          <div className="public-section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> WAYS WE CAN WORK TOGETHER</div><h2>Thoughtful work.<br /><em>Good things follow.</em></h2></div><p>Every project is a little different. Here are a few ways we can begin.</p></div>
          <div className="public-offering-list">{data.offerings.map((item, index) => <article className="public-offering" key={item.id}><span className="offer-number">0{index + 1}</span><div><span>{item.type}</span><h3>{item.title}</h3><p>{item.description}</p></div><strong>{item.price}</strong><a href="#contact" aria-label={`Ask about ${item.title}`}><ArrowUpRight size={19} /></a></article>)}</div>
        </section>}

        {data.testimonials.length > 0 && <section className="public-testimonials" id="kind-words">
          <div className="eyebrow"><span className="eyebrow-line" /> KIND WORDS FROM GOOD PEOPLE</div>
          <div className="public-quote-grid">{data.testimonials.slice(0, 2).map((review) => <blockquote key={review.id}><div className="review-stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />)}</div><p>“{review.review}”</p><footer><strong>{review.name}</strong><span>{review.role}</span></footer></blockquote>)}</div>
        </section>}

        <section className="profile-contact" id="contact">
          <div className="contact-intro"><div className="eyebrow eyebrow-light"><span className="eyebrow-line" /> GOOD THINGS START WITH A HELLO</div><h2>Have something<br />in <em>mind?</em></h2><p>Tell me a little about it. I’d love to hear what you’re dreaming up.</p><div className="contact-details"><span><MapPin size={15} />{business.location}</span><a href={`mailto:${business.email}`}><MessageCircle size={15} />{business.email}</a></div></div>
          {submitted ? <div className="enquiry-success"><span><Check size={20} /></span><h3>Thank you for reaching out.</h3><p>Your note is on its way. I’ll be in touch soon.</p><Button variant="outline" onClick={() => setSubmitted(false)}>Send another message</Button></div> : <form className="public-enquiry-form" onSubmit={submitEnquiry}>
            <div className="public-form-grid"><label>Your name<input name="name" required placeholder="How should I address you?" /></label><label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label></div>
            <div className="public-form-grid"><label>Phone (optional)<input name="phone" type="tel" placeholder="+91" /></label><label>What are you interested in?<select name="service"><option value="A general enquiry">A general enquiry</option>{data.offerings.map((item) => <option key={item.id}>{item.title}</option>)}</select></label></div>
            <label>A little about your project<textarea name="message" required rows={3} placeholder="Tell me what you have in mind..." /></label>
            <Button type="submit" size="lg">Send your enquiry <ArrowRight size={16} /></Button>
          </form>}
        </section>
      </main>
      <footer className="profile-footer"><Link to="/" className="brand-lockup"><span className="brand-mark"><span /><span /><span /></span><span>proofpage</span></Link><span>© {new Date().getFullYear()} {business.name}</span><span>Made with care, on Proofpage</span></footer>
    </div>
  );
}

const fallbackCover = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85";
