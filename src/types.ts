export type Business = {
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
};

export type Offering = {
  id: string;
  type: "Service" | "Product";
  title: string;
  description: string;
  price: string;
  image: string;
};

export type Project = {
  id: string;
  title: string;
  category: string;
  caption: string;
  image: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  rating: number;
  review: string;
  date: string;
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

export type ProofpageData = {
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
