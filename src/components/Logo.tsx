import { ShieldCheck } from "lucide-react";
import { siteConfig } from "../config/site";

export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  const { logoPath } = siteConfig.branding;
  if (logoPath) return <img src={logoPath} alt={`${siteConfig.name} logo`} className={`${className} object-contain`} />;
  return (
    <span className={`${className} grid place-items-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/40`}>
      <ShieldCheck className="h-5 w-5 text-cyan-300" aria-hidden />
    </span>
  );
}
