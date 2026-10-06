/**
 * SINGLE SOURCE OF TRUTH for all club content.
 * Every name, link, image path and piece of copy on the site comes from here.
 * Fields marked "PENDING" are placeholders awaiting club leadership's reply.
 *
 * Conventions:
 *  - A link set to "#" or "" is treated as "not provided" and hidden in the UI.
 *  - An image path set to null falls back to a generated placeholder.
 *  - Icons are lucide-react names; see ICONS in src/components/Icon.tsx.
 */

export type IconName = "ShieldAlert" | "Scale" | "Users" | "Briefcase" | "Lock" | "Gavel" | "Terminal" | "BookOpen";

export interface Pillar {
  title: string;
  description: string;
  icon: IconName;
}

export interface ClubEvent {
  title: string;
  date: string;
  location: string;
  tag: string;
  description?: string;
  link?: string;
}

export interface Officer {
  name: string;
  role: string;
  major: string;
  image: string | null; // e.g. "/assets/officers/jane.jpg"
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const siteConfig = {
  name: "Cyber and Law Society",
  shortName: "CLS",
  tagline: "Where Technology Meets Legal Policy",
  description:
    "Bridging technical cybersecurity, digital forensics, privacy regulation, and campus career opportunities.",

  // PENDING
  contactEmail: "cyberlawsociety1@gmail.com",
  links: {
    joinForm: "#", // Google Form / campus portal
    discord: "#",
    instagram: "https://www.instagram.com/cyberlawsociety",
    linkedin: "#",
    x: "#",
    github: "#",
  },

  branding: {
    logoPath: null as string | null, // e.g. "/assets/logo.png" (put files in /public/assets)
    faviconPath: null as string | null,
  },

  hero: {
    pillBadge: "Information & Recruitment - Fall 2026",
    headline: "Bridging the Divide Between Code and Law",
    subheadline:
      "You wouldn't let a stranger walk into your house, so why let one into your computer? Your devices hold your private messages and personal data. We study the cybersecurity that protects them and the laws that govern who can access them.",
    primaryCtaText: "Join the Society",
    secondaryCtaText: "Explore What We Do",
  },

  pillars: [
    {
      title: "Technical Security & Labs",
      description: "Hands-on penetration testing, digital forensics, and collegiate CTF challenges.",
      icon: "ShieldAlert",
    },
    {
      title: "Cyber Law & Privacy Policy",
      description: "Analyzing real-world regulatory frameworks, compliance, and landmark legal battles.",
      icon: "Scale",
    },
    {
      title: "Workshops & Guest Lecturers",
      description: "Sessions with practicing cybersecurity analysts, privacy counsel, and researchers.",
      icon: "Users",
    },
    {
      title: "Career & Networking",
      description: "Resume coaching, interdisciplinary connections, and student competition prep.",
      icon: "Briefcase",
    },
  ] satisfies Pillar[] as Pillar[],

  upcomingEvents: [
    {
      title: "Kickoff & General Interest Meeting",
      date: "Date & Time TBA",
      location: "Campus Meeting Room / Discord",
      tag: "Upcoming",
    },
  ] satisfies ClubEvent[] as ClubEvent[],

  officers: [
    {
      name: "Officer Name (TBD)",
      role: "President",
      major: "Information Technology / Pre-Law",
      image: null,
    },
  ] satisfies Officer[] as Officer[],

  faq: [
    {
      question: "Do I need coding or legal experience to join?",
      answer:
        "No prior experience required. We welcome students from computing, criminal justice, business, and any major interested in tech or law.",
    },
    {
      question: "How do I become an active member?",
      answer:
        "Join our community chat and attend our kickoff meeting. Sign-up details will be finalized shortly.",
    },
  ] satisfies FaqItem[] as FaqItem[],
};

/** True when a link has actually been filled in (not "#" or empty). */
export const hasLink = (url?: string | null): url is string => !!url && url !== "#";
