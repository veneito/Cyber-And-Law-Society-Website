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

export type IconName =
  | "ShieldAlert" | "Scale" | "Users" | "Briefcase" | "Lock" | "Gavel" | "Terminal" | "BookOpen"
  | "Laptop" | "Brain" | "BrainCog" | "MessageSquare" | "Mic" | "Search";

export interface Pillar {
  title: string;
  motto: string;
  description: string;
  topics: string[];
  icon: IconName;
}

export interface Activity {
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
  name: "Cyber & Law Society",
  shortName: "CLS",
  tagline: "Where Technology, Justice, and Ethics Intersect",
  description:
    "We explore the digital world, the law that governs it, and the philosophy that challenges it.",

    contactEmail: "cyberlawsociety1@gmail.com",
  links: {
    joinForm: "#", // Google Form / campus portal
    discord: "https://discord.gg/YhXXvyGTnb",
    instagram: "https://www.instagram.com/cyberlawsociety",
    linkedin: "#",
    x: "#",
    github: "#",
  },

  branding: {
    logoPath: "/assets/logo.webp" as string | null, // files live in /public/assets
    bannerPath: "/assets/banner-justice.webp" as string | null,
    flyerPath: "/assets/flyer.webp" as string | null,
    faviconPath: "/assets/logo.webp" as string | null,
  },

  hero: {
    pillBadge: "Cybersecurity • Law • Philosophy",
    headline: "Shape Justice in the Digital Age",
    subheadline:
      "You wouldn't let a stranger walk into your house, so why let one into your computer? Your devices hold your private messages and personal data. We study the cybersecurity that protects them and the laws that govern who can access them.",
    primaryCtaText: "Join the Society",
    secondaryCtaText: "Explore What We Do",
  },

  pillarsHeading: "Three disciplines. One mission.",
  pillars: [
    {
      title: "Cybersecurity",
      motto: "Investigate. Analyze. Protect.",
      description: "We dive into the technical side of the digital world.",
      topics: ["Digital Forensics", "Network Analysis", "Threat Intelligence", "Malware & Exploits", "OSINT & Intelligence", "Incident Response"],
      icon: "Laptop",
    },
    {
      title: "Law",
      motto: "Analyze. Argue. Advocate.",
      description: "We study the laws, rights, and systems that shape justice.",
      topics: ["Criminal Law", "Constitutional Law", "Cyber Law & Privacy", "Evidence & Procedure", "Legal Research", "Mock Trials"],
      icon: "Scale",
    },
    {
      title: "Philosophy",
      motto: "Question. Reflect. Challenge.",
      description: "We explore the ethical questions behind every case.",
      topics: ["Ethics & Morality", "Justice & Responsibility", "Technology & Society", "Free Will & Accountability", "Consequences & Rights", "Philosophical Debate"],
      icon: "Brain",
    },
  ] satisfies Pillar[] as Pillar[],

  activities: [
    { title: "Mock Trials", description: "Build your case. Take the stand. Experience the courtroom.", icon: "Gavel" },
    { title: "Discussions", description: "Analyze real-world issues where technology, law, and ethics collide.", icon: "MessageSquare" },
    { title: "Guest Speakers", description: "Learn from legal professionals, cyber experts, and scholars.", icon: "Mic" },
    { title: "Case Investigations", description: "Work in teams to investigate cyber incidents and build legal strategies.", icon: "Search" },
    { title: "Skill Building", description: "Develop critical thinking, advocacy, research, and technical skills.", icon: "BrainCog" },
  ] satisfies Activity[] as Activity[],

  openToAll: {
    title: "Open to all majors",
    body: "No experience needed. Just curiosity, integrity, and a desire to make an impact.",
  },
  slogan: "Think. Investigate. Argue. Reflect.",

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
        "No experience needed. We're open to all majors: just bring curiosity, integrity, and a desire to make an impact.",
    },
    {
      question: "How do I become an active member?",
      answer:
        "Join our Discord, follow us on Instagram, and come to a meeting. Sign-up details will be posted there.",
    },
  ] satisfies FaqItem[] as FaqItem[],
};

/** True when a link has actually been filled in (not "#" or empty). */
export const hasLink = (url?: string | null): url is string => !!url && url !== "#";
