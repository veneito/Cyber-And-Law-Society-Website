import { t as tr } from "../i18n/language";
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
  promoVideo?: string;
}

export interface Officer {
  name: string;
  role: string;
  major: string;
  email?: string;
  bio?: string; // shown in the officer pop-up; falls back to sample text, "" shows nothing
  intro?: "venezuela-scales" | "philippines-computer" | "fishing-fingerprint" | "venezuela-brain";
  image: string | null; // e.g. "/assets/officers/jane.jpg"
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const siteConfig = {
  name: "Cyber & Law Society",
  shortName: "CLS",
  tagline: tr("Where Technology, Justice, and Ethics Intersect"),
  description:
    tr("We explore the digital world, the law that governs it, and the philosophy that challenges it."),

    contactEmail: "cyberlawsociety1@gmail.com",
  links: {
    joinForm: "#", // Google Form / campus portal
    discord: "https://discord.gg/ZKsKn9WNvX",
    instagram: "https://www.instagram.com/cyberlawsociety",
    linkedin: "#",
    x: "#",
    github: "#",
  },

  branding: {
    logoPath: "/assets/logo.webp" as string | null, // files live in /public/assets
    bannerPath: "/assets/banner-cls-binary-v3.svg" as string | null,
    flyerPath: "/assets/flyer.webp" as string | null,
    faviconPath: "/assets/logo.webp" as string | null,
  },

  hologram: {
    path: "/assets/lady-justice-network-v1.json",
    preview: "/assets/lady-justice-network-v1.webp",
    label: tr("Lady Justice holding a cybersecurity shield and a bacteriophage on her scales"),
    author: "Kenny Maguire Studio",
    source: "https://sketchfab.com/3d-models/lady-justice-67b91f4d07ee423b9c5c53a08d8aa454",
    license: "https://creativecommons.org/licenses/by/4.0/",
  },

  hero: {
    pillBadge: tr("Cybersecurity • Law • Philosophy"),
    headline: tr("Shape Justice in the Digital Age"),
    subheadline:
      tr("You wouldn't let a stranger walk into your house, so why let one into your computer? Your devices hold your private messages and personal data. We study the cybersecurity that protects them and the laws that govern who can access them."),
    primaryCtaText: tr("Join the Society"),
    secondaryCtaText: tr("Explore What We Do"),
  },

  pillarsHeading: tr("Three disciplines. One mission."),
  pillars: [
    {
      title: tr("Cybersecurity"),
      motto: tr("Investigate. Analyze. Protect."),
      description: tr("We dive into the technical side of the digital world."),
      topics: [tr("Digital Forensics"), tr("Network Analysis"), tr("Threat Intelligence"), tr("Malware & Exploits"), tr("OSINT & Intelligence"), tr("Incident Response")],
      icon: "Laptop",
    },
    {
      title: tr("Law"),
      motto: tr("Analyze. Argue. Advocate."),
      description: tr("We study the laws, rights, and systems that shape justice."),
      topics: [tr("Criminal Law"), tr("Constitutional Law"), tr("Cyber Law & Privacy"), tr("Evidence & Procedure"), tr("Legal Research"), tr("Mock Trials")],
      icon: "Scale",
    },
    {
      title: tr("Philosophy"),
      motto: tr("Question. Reflect. Challenge."),
      description: tr("We explore the ethical questions behind every case."),
      topics: [tr("Ethics & Morality"), tr("Justice & Responsibility"), tr("Technology & Society"), tr("Free Will & Accountability"), tr("Consequences & Rights"), tr("Philosophical Debate")],
      icon: "Brain",
    },
  ] satisfies Pillar[] as Pillar[],

  activities: [
    { title: tr("Mock Trials"), description: tr("Build your case. Take the stand. Experience the courtroom."), icon: "Gavel" },
    { title: tr("Discussions"), description: tr("Analyze real-world issues where technology, law, and ethics collide."), icon: "MessageSquare" },
    { title: tr("Guest Speakers"), description: tr("Learn from legal professionals, cyber experts, and scholars."), icon: "Mic" },
    { title: tr("Case Investigations"), description: tr("Work in teams to investigate cyber incidents and build legal strategies."), icon: "Search" },
    { title: tr("Skill Building"), description: tr("Develop critical thinking, advocacy, research, and technical skills."), icon: "BrainCog" },
  ] satisfies Activity[] as Activity[],

  openToAll: {
    title: tr("Open to all majors"),
    body: tr("No experience needed. Just curiosity, integrity, and a desire to make an impact."),
  },
  slogan: tr("Think. Investigate. Argue. Reflect."),

  upcomingEvents: [
    {
      title: tr("Metadata Scavenger Hunt: Revamped"),
      date: tr("October 29, 2026"),
      location: tr("Marx Library Meeting Room 181"),
      tag: tr("Upcoming"),
      promoVideo: "", // Add the promotional video URL when ready.
    },
  ] satisfies ClubEvent[] as ClubEvent[],

  pastMeetings: [
    {
      title: tr("Interest Meeting"),
      date: tr("August 20, 2026"),
      summary: tr("Our first meeting introduced the club's mission and walked members through the semester schedule, planned activities and long-term goals. Attendees met the officers, learned how mock trials, case investigations and guest speakers will work, and shared what they want to get out of the society."),
    },
    {
      title: tr("Metadata Scavenger Hunt"),
      date: tr("September 10, 2026"),
      summary: tr("A hands-on digital forensics exercise. Teams examined file metadata to recover hidden evidence, then applied logic and cryptography, including Caesar and symbol ciphers, to decode a series of case-file puzzles. The session built the investigative reasoning that cyber law depends on: how evidence is found, verified and interpreted."),
      images: ["/assets/meetings/hunt3.jpg", "/assets/meetings/hunt4.jpg", "/assets/meetings/hunt5.jpg"],
    },
  ] as { title: string; date: string; summary: string; images?: string[] }[],

  officersPhoto: "/assets/officers/group1.jpg",

  officers: [
    {
      name: "Jon", role: tr("President"), major: tr("Criminal Justice"), image: "/assets/officers/jon.jpg",
      intro: "venezuela-scales",
      email: "jdr2421@jagmail.southalabama.edu",
      bio: tr("Growing up of Venezuelan descent, I witnessed the limited access to cybersecurity education and resources within underserved communities. This experience opened my eyes to the growing disconnect between law, technology, and society, particularly for individuals without a background in either field. I founded this club to bridge that gap and make these complex subjects more accessible to everyone."),
    },
    {
      name: "Alfred", role: tr("Vice President"), major: tr("Information Technology"), image: "/assets/officers/alfred.jpg",
      intro: "philippines-computer",
      email: "all2322@jagmail.southalabama.edu",
      bio: tr("Growing up in the Philippines, I watched technology reshape everyday life faster than the rules around it could keep up. That curiosity led me to IT, and to helping found a club where students can explore how cyber and law shape each other."),
    },
    {
      name: "Andrew", role: tr("Co-President"), major: tr("Digital Forensics"), image: "/assets/officers/andrew.jpg",
      intro: "fishing-fingerprint",
      email: "aop2322@jagmail.southalabama.edu",
      bio: tr("Digital forensics taught me that every click leaves a trail, and that those trails matter in court. I help lead the society to give students hands-on experience tracing evidence and understanding the law behind it."),
    },
    {
      name: "Michelle", role: tr("Social Media Manager"), major: tr("Biology"), image: "/assets/officers/michelle.webp",
      intro: "venezuela-brain",
      bio: tr("Originally from Venezuela, I am bilingual in Spanish and English, creative and passionate about painting, learning, and art."),
    },
    { name: "Professor Wang", role: tr("Advisor"), major: tr("Criminal Justice Professor"), image: "/assets/officers/wang.webp", email: "wang@southalabama.edu", bio: "" },
  ] satisfies Officer[] as Officer[],

  faq: [
    {
      question: tr("Do I need coding or legal experience to join?"),
      answer:
        tr("No experience needed. We're open to all majors: just bring curiosity, integrity, and a desire to make an impact."),
    },
    {
      question: tr("How do I become an active member?"),
      answer:
        tr("Join our Discord, follow us on Instagram, and come to a meeting. Sign-up details will be posted there."),
    },
  ] satisfies FaqItem[] as FaqItem[],
};

/** True when a link has actually been filled in (not "#" or empty). */
export const hasLink = (url?: string | null): url is string => !!url && url !== "#";
