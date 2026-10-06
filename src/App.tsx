import { ArrowRight, CalendarDays, ChevronDown, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { Icon } from "./components/Icon";
import { Logo } from "./components/Logo";
import { Section } from "./components/Section";
import { Socials } from "./components/Socials";
import { hasLink, siteConfig, type Officer } from "./config/site";

const NAV = [
  { href: "#about", label: "What We Do" },
  { href: "#events", label: "Events" },
  { href: "#officers", label: "Officers" },
  { href: "#faq", label: "FAQ" },
];

const initials = (name: string) =>
  name.replace(/\(.*?\)/g, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

function JoinButton({ className = "" }: { className?: string }) {
  const { joinForm } = siteConfig.links;
  const ready = hasLink(joinForm);
  return (
    <a
      href={ready ? joinForm : "#contact"}
      target={ready ? "_blank" : undefined}
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-green-400 px-5 py-3 font-semibold text-black hover:bg-green-300 ${className}`}
    >
      {siteConfig.hero.primaryCtaText} <ArrowRight className="h-4 w-4" aria-hidden />
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-3">
          <Logo />
          <span className="font-semibold text-white">{siteConfig.shortName}</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-neutral-400 hover:text-white">{n.label}</a>
          ))}
          <JoinButton className="px-4 py-2 text-sm" />
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-4 border-t border-neutral-800 px-4 py-4 md:hidden">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-neutral-300">{n.label}</a>
          ))}
          <JoinButton />
        </nav>
      )}
    </header>
  );
}

function Hero() {
  const { hero, name, tagline } = siteConfig;
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#22c55e14_1px,transparent_1px),linear-gradient(to_bottom,#22c55e14_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 font-mono text-xs text-green-300">
          <span className="h-1.5 w-1.5 rounded-full bg-green-300" /> {hero.pillBadge}
        </span>
        <p className="mt-8 text-sm font-medium text-neutral-400">{name} · {tagline}</p>
        <h1 className="mt-3 max-w-4xl font-mono text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          <span className="text-green-400">&gt;</span> {hero.headline}
          <span className="cursor ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-green-400" aria-hidden />
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-400">{hero.subheadline}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <JoinButton />
          <a href="#about" className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 px-5 py-3 font-semibold text-white hover:border-neutral-500">
            {hero.secondaryCtaText} <ChevronDown className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

function OfficerCard({ o }: { o: Officer }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center">
      {o.image ? (
        <img src={o.image} alt={o.name} className="mx-auto h-24 w-24 rounded-full object-cover" />
      ) : (
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-green-500/30 to-green-900/40 text-2xl font-semibold text-white ring-1 ring-neutral-700">
          {initials(o.name)}
        </div>
      )}
      <h3 className="mt-4 font-semibold text-white">{o.name}</h3>
      <p className="text-sm text-green-300">{o.role}</p>
      <p className="mt-1 text-xs text-neutral-500">{o.major}</p>
    </div>
  );
}

const Empty = ({ children }: { children: string }) => (
  <p className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-500">{children}</p>
);

export default function App() {
  const { pillars, upcomingEvents, officers, faq } = siteConfig;
  return (
    <>
      <Header />
      <main>
        <Hero />

        <Section id="about" eyebrow="What We Do" title="Four pillars, one community">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition hover:border-green-400/50">
                <Icon name={p.icon} className="h-8 w-8 text-green-300" />
                <h3 className="mt-4 font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-neutral-400">{p.description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="events" eyebrow="Events" title="Upcoming meetings & workshops">
          {upcomingEvents.length === 0 ? (
            <Empty>No events scheduled yet — check back soon.</Empty>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {upcomingEvents.map((e) => (
                <article key={e.title} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                  <span className="rounded-full bg-green-500/10 px-2.5 py-1 font-mono text-xs text-green-300">{e.tag}</span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{e.title}</h3>
                  {e.description && <p className="mt-2 text-sm text-neutral-400">{e.description}</p>}
                  <div className="mt-4 space-y-2 text-sm text-neutral-400">
                    <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" aria-hidden /> {e.date}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden /> {e.location}</p>
                  </div>
                  {hasLink(e.link) && (
                    <a href={e.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-green-300 hover:underline">
                      Details <ArrowRight className="h-3 w-3" aria-hidden />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section id="officers" eyebrow="Leadership" title="Meet the officers">
          {officers.length === 0 ? (
            <Empty>Officer roster coming soon.</Empty>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {officers.map((o) => <OfficerCard key={o.name + o.role} o={o} />)}
            </div>
          )}
        </Section>

        <Section id="faq" eyebrow="FAQ" title="Frequently asked questions">
          <div className="max-w-3xl divide-y divide-neutral-800 rounded-xl border border-neutral-800">
            {faq.map((f) => (
              <details key={f.question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-white">
                  {f.question}
                  <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-3 text-neutral-400">{f.answer}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section id="contact" eyebrow="Get Involved" title="Ready to join?">
          <p className="max-w-2xl text-neutral-400">{siteConfig.description}</p>
          <div className="mt-8 flex flex-col gap-8">
            <JoinButton className="self-start" />
            <Socials />
          </div>
        </Section>
      </main>

      <footer className="border-t border-neutral-800 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3"><Logo className="h-7 w-7" /> {siteConfig.name}</div>
          <p>© {new Date().getFullYear()} {siteConfig.name}. Student organization.</p>
        </div>
      </footer>
    </>
  );
}
