import { ShieldCheck } from "lucide-react";
import { siteConfig } from "../config/site";

export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  const { logoPath } = siteConfig.branding;
  if (logoPath) return <img src={logoPath} alt={`${siteConfig.name} logo`} className={`${className} rounded-full bg-white object-contain p-0.5`} />;
  return (
    <span className={`${className} grid place-items-center rounded-lg bg-green-500/15 ring-1 ring-green-400/40`}>
      <ShieldCheck className="h-5 w-5 text-green-300" aria-hidden />
    </span>
  );
}
