import { AtSign, Code2, Globe, Mail, MessageCircle, Users, type LucideIcon } from "lucide-react";
import { hasLink, siteConfig } from "../config/site";

const SOCIALS: { key: keyof typeof siteConfig.links; label: string; icon: LucideIcon }[] = [
  { key: "discord", label: "Discord", icon: MessageCircle },
  { key: "instagram", label: "Instagram", icon: AtSign },
  { key: "linkedin", label: "LinkedIn", icon: Users },
  { key: "x", label: "X", icon: Globe },
  { key: "github", label: "GitHub", icon: Code2 },
];

export function Socials() {
  const items = SOCIALS.filter((s) => hasLink(siteConfig.links[s.key]));
  const email = siteConfig.contactEmail;
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ key, label, icon: I }) => (
        <a key={key} href={siteConfig.links[key]} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm hover:border-green-400 hover:text-green-300">
          <I className="h-4 w-4" aria-hidden /> {label}
        </a>
      ))}
      {email && (
        <a href={`mailto:${email}`}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm hover:border-green-400 hover:text-green-300">
          <Mail className="h-4 w-4" aria-hidden /> {email}
        </a>
      )}
    </div>
  );
}
