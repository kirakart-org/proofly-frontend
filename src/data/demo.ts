import type { ProoflyData } from "../types";

export const demoData: ProoflyData = {
  business: {
    name: "JS Photography Studio",
    slug: "jsphotography",
    tagline: "Editorial, wedding & commercial visual storytelling",
    bio: "Capturing timeless moments with natural light and cinematic precision across India. Available for destination weddings, brand campaigns, and editorial portraits.",
    category: "Photography",
    location: "Bengaluru & Chennai, India",
    email: "hello@jsphotography.in",
    phone: "+91 98400 12345",
    instagram: "@jsphotography.in",
    coverImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85",
    isPublished: true,
  },
  offerings: [
    {
      id: "offering-wedding",
      type: "Service",
      title: "Full-day wedding editorial",
      description:
        "Documentary and candid coverage with two lead photographers and 400+ color-graded stills.",
      price: "₹85,000",
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "offering-brand",
      type: "Service",
      title: "Brand & product lookbook",
      description:
        "A considered commercial shoot for fashion, skincare and lifestyle brands.",
      price: "₹25,000",
      image:
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "offering-presets",
      type: "Product",
      title: "Kodak-inspired Lightroom presets",
      description:
        "Fourteen film-inspired presets for warm skin tones and soft editorial contrast.",
      price: "₹2,499",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    },
  ],
  projects: [
    {
      id: "project-leela",
      title: "Twilight at Leela Palace",
      category: "Wedding",
      caption: "Golden-hour portraits, framed in the quiet grandeur of Bengaluru.",
      image:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85",
    },
    {
      id: "project-botanica",
      title: "Monsoon Botanica",
      category: "Commercial",
      caption: "A skincare story told through natural foliage and soft light.",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
    },
    {
      id: "project-solitude",
      title: "Urban solitude",
      category: "Editorial",
      caption: "A minimalist architectural study in White Town at first light.",
      image:
        "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=1000&q=85",
    },
  ],
  testimonials: [
    {
      id: "review-ananya",
      name: "Ananya & Karthik",
      role: "Wedding clients · Bengaluru",
      rating: 5,
      review:
        "Jayasuriya and his team made us feel completely at ease. Every single frame looks like it belongs in a magazine.",
      date: "Nov 14, 2026",
    },
    {
      id: "review-rohan",
      name: "Rohan Mehta",
      role: "Founder, Veda Botanics",
      rating: 5,
      review:
        "Thoughtful from the first moodboard to the final delivery. The lookbook gave our launch exactly the feeling we wanted.",
      date: "Oct 28, 2026",
    },
  ],
  leads: [
    {
      id: "lead-priya",
      name: "Priya Nair",
      email: "priya.nair@studio.in",
      phone: "+91 98201 44120",
      service: "Full-day wedding editorial",
      budget: "₹85,000",
      message: "Looking for availability for a two-day intimate wedding in Coorg this February.",
      status: "New",
      createdAt: "2 hours ago",
    },
    {
      id: "lead-vikram",
      name: "Vikramaditya Rao",
      email: "vikram@aromalabs.co",
      phone: "+91 99001 88321",
      service: "Brand & product lookbook",
      budget: "₹25,000",
      message: "We need 25 hero shots for our upcoming winter perfume launch.",
      status: "Contacted",
      createdAt: "Yesterday",
    },
    {
      id: "lead-sneha",
      name: "Sneha Kulkarni",
      email: "sneha.k@gmail.com",
      phone: "+91 97411 22904",
      service: "Editorial portrait session",
      budget: "Custom",
      message: "Interested in outdoor portraits for my personal design portfolio.",
      status: "Booked",
      createdAt: "3 days ago",
    },
  ],
  settings: {
    emailAlerts: true,
    searchIndexing: true,
  },
};
