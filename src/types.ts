export type Business = {
  id?: number;
  name: string;
  slug: string;
  tagline: string;
  bio: string;
  category: string;
  location: string;
  email: string;
  phone: string;
  instagram: string;
  coverImage: string;
  isPublished: boolean;
  logoUrl?: string;
  socialLinks?: Record<string, string>;
  theme?: string;
};

export type Offering = {
  id: string;
  type: "Service" | "Product";
  title: string;
  description: string;
  price: string;
  image: string;
  category?: string;
  contactUrl?: string;
  isVisible?: boolean;
};

export type Project = {
  id: string;
  title: string;
  category: string;
  caption: string;
  image: string;
  projectUrl?: string;
  isVisible?: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  rating: number;
  review: string;
  date: string;
  photoUrl?: string;
  isVisible?: boolean;
};

export type LeadStatus = "New" | "Contacted" | "Booked" | "Lost";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
};

export type ProoflyData = {
  business: Business;
  offerings: Offering[];
  projects: Project[];
  testimonials: Testimonial[];
  leads: Lead[];
  settings: {
    emailAlerts: boolean;
    searchIndexing: boolean;
  };
};
