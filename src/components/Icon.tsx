import { BookOpen, Briefcase, Gavel, Lock, Scale, ShieldAlert, Terminal, Users, type LucideIcon } from "lucide-react";
import type { IconName } from "../config/site";

const ICONS: Record<IconName, LucideIcon> = { ShieldAlert, Scale, Users, Briefcase, Lock, Gavel, Terminal, BookOpen };

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Cmp = ICONS[name] ?? ShieldAlert;
  return <Cmp className={className} aria-hidden />;
}
