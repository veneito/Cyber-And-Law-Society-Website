import { t as tr } from "./i18n/language";
import { ArrowRight, Bug, CalendarDays, ChevronDown, Mail, MapPin, Menu, X } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { ApplyForm } from "./components/ApplyForm";
import { Anomaly, isFixed, resetHunt, startHunt } from "./components/Anomaly";
import { Icon } from "./components/Icon";
import { CasePage } from "./components/Case";
import { Logo } from "./components/Logo";
import { Network } from "./components/Network";
import { JusticeHologram } from "./components/JusticeHologram";
import { OfficerIntro } from "./components/OfficerIntro";
import { Phage } from "./components/Phage";
import { DecodeText } from "./components/Materialize";
import { Quarantine } from "./components/Quarantine";
import { Section } from "./components/Section";
import { Socials } from "./components/Socials";
import { hasLink, siteConfig, type Officer } from "./config/site";

const NAV = [
  { href: "/", label: tr("Home") },
  { href: "/#about", label: tr("About") },
  { href: "/#events", label: tr("Events") },
  { href: "/#officers", label: tr("Officers") },
  { href: "/#faq", label: tr("FAQ") },
  { href: "/activities", label: tr("Activities") },
];

const initials = (name: string) =>
  name.replace(/\(.*?\)/g, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

function JoinButton({ className = "" }: { className?: string }) {
  const { joinForm, discord } = siteConfig.links;
  const target = hasLink(joinForm) ? joinForm : hasLink(discord) ? discord : null;
  return (
    <a
      href={target ?? "/#contact"}
      target={target ? "_blank" : undefined}
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
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
        <a href="/" className="flex items-center gap-3">
          <Logo />
          <span className="font-semibold text-white md:hidden">{siteConfig.shortName}</span>
          <span className="hidden font-semibold text-white md:inline">{siteConfig.name}</span>
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

function HeroButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <JoinButton />
      <a href="#about" className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-black/40 px-5 py-3 font-semibold text-white backdrop-blur-sm hover:border-neutral-500">
        {siteConfig.hero.secondaryCtaText} <ChevronDown className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}

function Hero() {
  const { hero, name, tagline, branding } = siteConfig;
  const grid = (
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#22c55e14_1px,transparent_1px),linear-gradient(to_bottom,#22c55e14_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" />
  );
  const intro = (
    <>
      <span className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 font-mono text-xs text-green-300">
        <span className="h-1.5 w-1.5 rounded-full bg-green-300" /> {hero.pillBadge}
      </span>
      <p className="mt-8 text-sm font-medium text-neutral-400">{name} · {tagline}</p>
      <h1 className="mt-3 max-w-4xl font-mono text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
        <span className="text-green-400">&gt;</span> {hero.headline}
        <span className="cursor ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-green-400" aria-hidden />
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-neutral-400">{hero.subheadline}</p>
    </>
  );

  if (!branding.bannerPath) {
    return (
      <section id="top" className="relative scroll-mt-16 flex min-h-[calc(100svh-4rem)] flex-col justify-end overflow-hidden">
        {grid}
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20">
          {intro}
          <div className="mt-10"><HeroButtons /></div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Phones: image cropped to its centre (sides cut off), buttons below. md+: whole image at its natural height (capped to one screen) with buttons over its bottom edge, so no empty black band at any window size. */}
      <section id="top" className="relative scroll-mt-16 flex flex-col justify-end overflow-hidden">
        <img src={branding.bannerPath} alt={`${name}: ${tagline}`} className="h-80 w-full bg-black object-cover object-center md:h-auto md:max-h-[calc(100svh-4rem)] md:object-contain" />
        <Network />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-black to-transparent md:block" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-8 pt-6 sm:px-6 md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:pb-14 md:pt-0">
          <HeroButtons />
        </div>
      </section>
      <section className="relative overflow-hidden">
        {grid}
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">{intro}</div>
      </section>
    </>
  );
}

const SAMPLE_BIO = "Sample bio: this is placeholder text about the officer. Add a short intro, what they study, why they joined the society and what they are working on this semester.";

function OfficerCard({ o, pos, onSelect }: { o: Officer; pos: number; onSelect: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false); // replays the decode effect on each open
  const [intro, setIntro] = useState(false);
  const avatar = (size: string) =>
    o.image ? (
      <img src={o.image} alt={o.name} className={`mx-auto ${size} rounded-full object-cover`} />
    ) : (
      <div className={`mx-auto grid ${size} place-items-center rounded-full bg-gradient-to-br from-green-500/30 to-green-900/40 text-2xl font-semibold text-white ring-1 ring-neutral-700`}>
        {initials(o.name)}
      </div>
    );
  return (
    <>
      {/* Centre card opens the pop-up; side cards slide to the centre. Cards beyond two steps fade out. */}
      <button
        onClick={() => {
          if (pos !== 0) { onSelect(); return; }
          setIntro(Boolean(o.intro) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
          dlg.current?.showModal();
          setOpen(true);
        }}
        aria-label={pos === 0 ? `${o.name}, open bio` : `Show ${o.name}`}
        tabIndex={Math.abs(pos) > 2 ? -1 : 0}
        className={`group absolute left-1/2 top-6 ${pos === 0 ? "" : "max-sm:hidden"} aspect-square w-56 overflow-hidden rounded-2xl border bg-neutral-900 text-left transition-all duration-500 ease-out sm:w-72${
          pos === 0 ? "border-green-400/70 shadow-[0_0_24px_-4px_#4ade80aa] sm:shadow-[0_0_60px_-8px_#4ade80aa]" : "border-neutral-700 shadow-2xl"
        }`}
        style={{
          transform: `translateX(calc(-50% + ${pos * 58}%)) rotateY(${Math.sign(pos) * -32}deg) scale(${1 - Math.min(Math.abs(pos), 3) * 0.13})`,
          zIndex: 10 - Math.abs(pos),
          opacity: Math.abs(pos) > 2 ? 0 : 1,
          pointerEvents: Math.abs(pos) > 2 ? "none" : "auto",
          filter: pos === 0 ? "none" : `brightness(${0.5 - Math.abs(pos) * 0.08}) saturate(0.7)`,
        }}
      >
        {o.image ? (
          <img src={o.image} alt="" draggable={false} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-green-500/30 to-green-900/40 text-6xl font-semibold text-white">{initials(o.name)}</div>
        )}
        {pos === 0 && <span className="absolute left-3 top-3 rounded-full border border-green-400/40 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-green-300 backdrop-blur">{tr("Read bio")}</span>}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-5 pt-16">
          <h3 className={`font-semibold text-white ${pos === 0 ? "text-xl" : ""}`}>{o.name}</h3>
          <p className="font-mono text-xs uppercase tracking-wider text-green-300">{o.role}</p>
          <p className="mt-0.5 text-xs text-neutral-400">{o.major}</p>
        </div>
      </button>
      {/* showModal() traps focus, handles Escape and restores focus; a click on the dialog itself is a backdrop click */}
      <dialog ref={dlg} aria-label={o.name} onClose={() => { setOpen(false); setIntro(false); }} onClick={(e) => e.target === dlg.current && dlg.current.close()} className="officer-dialog m-auto w-full max-w-md bg-transparent p-4 text-inherit">
        <div className="relative rounded-xl border border-neutral-700 bg-neutral-950 p-8 text-center">
          <button onClick={() => dlg.current?.close()} aria-label={tr("Close")} className="absolute right-3 top-3 text-neutral-400 hover:text-white"><X className="h-5 w-5" /></button>
          {open && intro && o.intro ? <OfficerIntro kind={o.intro} name={o.name} onComplete={() => setIntro(false)} /> : <>
          {avatar("h-32 w-32")}
          <h3 className="mt-4 text-xl font-semibold text-white"><DecodeText text={o.name} active={open} /></h3>
          <p className="text-sm text-green-300"><DecodeText text={`${o.role} · ${o.major}`} active={open} /></p>
          {(o.bio ?? SAMPLE_BIO) && (
            <p className="mt-4 text-left text-neutral-300">
              {(o.bio ?? SAMPLE_BIO).split(" ").map((w, i) => (
                <span key={i} className={open ? "bio-word" : ""} style={{ animationDelay: `${0.3 + i * 0.06}s` }}>{w} </span>
              ))}
            </p>
          )}
          {o.email && <a href={`mailto:${o.email}`} className="mt-5 inline-flex max-w-full items-center justify-center gap-2 break-all rounded-lg border border-green-400 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-400 hover:text-black"><Mail className="h-4 w-4 shrink-0" aria-hidden />{o.email}</a>}
          </>}
        </div>
      </dialog>
    </>
  );
}

function OfficerCarousel({ officers }: { officers: Officer[] }) {
  const [i, setI] = useState(0);
  const go = (n: number) => setI(Math.max(0, Math.min(officers.length - 1, n)));
  const startX = useRef(0);
  // Holographic: translucent green glass with a neon glow that intensifies on hover.
  // On phones they sit under the card, either side of the dots, so they never cover the photo.
  const arrow = "absolute top-[18.75rem] z-20 -translate-y-1/2 rounded-full sm:top-[10.5rem] border border-green-400/60 bg-green-400/10 grid h-10 w-10 sm:h-14 sm:w-14 place-items-center text-green-300 shadow-[0_0_12px_-2px_#4ade8066] backdrop-blur transition hover:scale-110 hover:border-green-300 hover:text-green-200 hover:shadow-[0_0_18px_0_#4ade8099] disabled:opacity-25 disabled:shadow-none disabled:hover:scale-100";
  return (
    <div className="relative" onKeyDown={(e) => { if (e.key === "ArrowLeft") go(i - 1); if (e.key === "ArrowRight") go(i + 1); }}>
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/15 blur-2xl sm:bg-green-500/10 sm:h-72 sm:w-[36rem] sm:blur-3xl" aria-hidden />
    <div
      className="relative mx-auto h-[17rem] max-w-4xl sm:h-[21rem] sm:overflow-hidden"
      style={{ perspective: "1200px" }}
      onPointerDown={(e) => { startX.current = e.clientX; }}
      onPointerUp={(e) => { const dx = e.clientX - startX.current; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); }}
    >
      {officers.map((o, n) => <OfficerCard key={o.name + o.role} o={o} pos={n - i} onSelect={() => go(n)} />)}
    </div>
    {/* Outside the overflow-hidden stage so the glow isn't clipped at the edges */}
    <button aria-label="Previous officer" disabled={i === 0} onClick={() => go(i - 1)} className={`${arrow} left-6 sm:left-2`}><Phage className="h-7 w-5 sm:h-9 sm:w-7 -rotate-90" /></button>
    <button aria-label="Next officer" disabled={i === officers.length - 1} onClick={() => go(i + 1)} className={`${arrow} right-6 sm:right-2`}><Phage className="h-7 w-5 sm:h-9 sm:w-7 rotate-90" /></button>
    <div className="mt-2 flex h-10 items-center justify-center gap-2 sm:mt-4 sm:h-auto" role="presentation">
      {officers.map((o, n) => (
        <button key={o.name} aria-label={`Show ${o.name}`} onClick={() => go(n)} className={`h-1.5 rounded-full transition-all duration-300 ${n === i ? "w-8 bg-green-400" : "w-3 bg-neutral-700 hover:bg-neutral-500"}`} />
      ))}
    </div>
    </div>
  );
}

const Empty = ({ children }: { children: string }) => (
  <p className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-500">{children}</p>
);

function Footer() {
  return (
    <footer className="border-t border-neutral-800 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-500 sm:flex-row sm:px-6">
        <div className="flex items-center gap-3"><Logo className="h-7 w-7" /> {siteConfig.name}</div>
        <p>© {new Date().getFullYear()} {siteConfig.name}{tr(". Student organization.")}</p>
      </div>
    </footer>
  );
}

function ActivitiesPage() {
  const items = [
    { href: "/play", tag: tr("Mini-game"), title: tr("Quarantine the viruses"), text: tr("Scan the file system, track down the malware and lock it away. Climb the leaderboard.") },
    { href: "/case/wellington", tag: tr("Investigation"), title: tr("The Bea F. Wellington case file"), text: tr("A cyber-crime investigation. Follow the photo, find the key, crack the ciphers and prove what she did.") },
  ];
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-green-400">{tr("Activities")}</p>
        <h1 className="mt-2 font-mono text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{tr("Pick a challenge")}</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map((a) => (
            <a key={a.href} href={a.href} className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-green-400/50">
              <span className="rounded-full bg-green-500/10 px-2.5 py-1 font-mono text-xs text-green-300">{a.tag}</span>
              <h2 className="mt-4 text-xl font-semibold text-white">{a.title}</h2>
              <p className="mt-2 text-sm text-neutral-400">{a.text}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm text-green-300">{tr("Open")}<ArrowRight className="h-4 w-4" aria-hidden /></p>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

function PlayPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <>
      <Header />
      <main className="relative overflow-hidden">
        <div className="q-grid pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#22c55e14_1px,transparent_1px),linear-gradient(to_bottom,#22c55e14_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        {[8, 22, 71, 88, 45].map((left, k) => (
          <Bug key={left} className="q-drift pointer-events-none absolute h-6 w-6 text-red-500/20" style={{ left: `${left}%`, animationDelay: `${k * -3.1}s`, animationDuration: `${14 + k * 3}s` }} aria-hidden />
        ))}
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="q-rise font-mono text-xs uppercase tracking-[0.2em] text-green-400"><DecodeText text="Mini-Game" active={ready} /></p>
          <h1 className="q-rise mt-2 font-mono text-3xl font-extrabold tracking-tight text-white sm:text-4xl" style={{ animationDelay: "0.1s" }}>
            <span className="text-green-400">&gt;</span> <DecodeText text="Quarantine the viruses" active={ready} />
            <span className="cursor ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-green-400" aria-hidden />
          </h1>
          <p className="q-rise mt-3 mb-10 max-w-2xl text-neutral-400" style={{ animationDelay: "0.2s" }}>{tr("Malware is hiding in the file system. Scan carefully, use the numbers to track it down, and lock every virus behind our shield.")}</p>
          <div className="q-rise" style={{ animationDelay: "0.3s" }}><Quarantine /></div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SubPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function MeetingsPage() {
  return (
    <SubPage>
      <Section id="meetings" eyebrow="Archive" title={tr("Past meetings")}>
        <div>
          <div className="grid content-start gap-4">
            {siteConfig.pastMeetings.map((m) => (
              <article key={m.title} className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <p className="font-mono text-xs uppercase tracking-wider text-green-400">{m.date}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{m.title}</h3>
                <p className="mt-2 text-sm text-neutral-400">{m.summary}</p>
                {m.images && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {m.images.map((src) => <img key={src} src={src} alt={`${m.title} photo`} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />)}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Anomaly spot="meetings" />
    </SubPage>
  );
}

function OfficerPage() {
  // Arriving from the win screen's Apply button switches the bug off; the home page's "Become an officer" button switches it back on.
  if (!location.search.includes("from=win")) startHunt();
  const fixed = isFixed();
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  return (
    <SubPage>
      <Section id="apply" eyebrow={tr("Leadership")} title={tr("Become an officer")}>
        <div className="max-w-2xl space-y-4 text-neutral-400">
          <p>{tr("The main goal of an officer is to be passionate about how cyber is evolving, and to keep a focus on the law that has to evolve with it.")}</p>
          <p>{tr("No title or experience required. Show up, help out, and tell us you want more.")}</p>
        </div>
        <div className="mt-10 max-w-2xl rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-green-400">{tr("Step one")}</p>
          <p className="mt-2 text-neutral-300">{tr("Somewhere on this website is an anomaly, and it hides in a different place for every visitor. Find it and fix the bug.")}</p>
          {fixed ? (
            <>
              <p className="mt-4 font-mono text-sm text-green-400">{tr("&gt; Bug fixed. You're cleared to apply.")}</p>
              <button onClick={() => { resetHunt(); rerender(); }} className="mt-4 rounded-lg border border-green-400 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-400 hover:text-black">{tr("Play again")}</button>
              <ApplyForm />
            </>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">{tr("Hint: look closely at the sections. It flickers.")}</p>
          )}
        </div>
      </Section>
    </SubPage>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path === "/become-an-officer") return <OfficerPage />;
  if (path === "/case/wellington") return <CasePage />;
  if (path === "/activities") return <ActivitiesPage />;
  if (path === "/meetings") return <MeetingsPage />;
  if (window.location.pathname.replace(/\/$/, "") === "/play") return <PlayPage />;
  const { pillars, upcomingEvents, officers, officersPhoto, faq } = siteConfig;
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Anomaly spot="hero" />

        <Section id={"about"} eyebrow="Who We Are" title={siteConfig.pillarsHeading}>
          <p className="-mt-4 mb-10 max-w-2xl text-neutral-400">{siteConfig.description}</p>
          <div className="grid gap-6 lg:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-green-400/50">
                <Icon name={p.icon} className="h-9 w-9 text-green-400" />
                <h3 className="mt-4 font-mono text-xl font-bold uppercase tracking-wide text-white">{p.title}</h3>
                <p className="mt-1 font-mono text-sm text-green-400">{p.motto}</p>
                <p className="mt-3 text-sm text-neutral-400">{p.description}</p>
                <ul className="mt-5 space-y-2 border-t border-neutral-800 pt-5 text-sm text-neutral-300">
                  {p.topics.map((t) => (
                    <li key={t} className="flex gap-2"><span className="font-mono text-green-500">&gt;</span>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="mt-20 font-mono text-xs uppercase tracking-[0.2em] text-green-400">{tr("What We Do")}</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {siteConfig.activities.map((a) => (
              <div key={a.title}>
                <Icon name={a.icon} className="h-7 w-7 text-white" />
                <h4 className="mt-3 font-semibold text-white">{a.title}</h4>
                <p className="mt-1 text-sm text-neutral-400">{a.description}</p>
              </div>
            ))}
          </div>
        </Section>
        <Anomaly spot={"about"} />

        <Section id={"events"} eyebrow={tr("Events")} title={tr("Upcoming meetings & workshops")}>
          {upcomingEvents.length === 0 ? (
            <Empty>{tr("No events scheduled yet — check back soon.")}</Empty>
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
                  {e.promoVideo !== undefined && (
                    hasLink(e.promoVideo) ? (
                      <a href={e.promoVideo} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-green-300 hover:underline">{tr("Watch the promo video")}<ArrowRight className="h-3 w-3" aria-hidden />
                      </a>
                    ) : (
                      <p className="mt-4 text-sm text-neutral-400">{tr("Promo video coming soon")}</p>
                    )
                  )}
                  {hasLink(e.link) && (
                    <a href={e.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-green-300 hover:underline">{tr("Details")}<ArrowRight className="h-3 w-3" aria-hidden />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        <div className="mt-8">
            <a href="/meetings" className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-5 py-3 font-semibold text-white hover:border-green-400">{tr("Past meetings")}<ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </Section>
        <Anomaly spot={"events"} />

        <Section id={"officers"} eyebrow={tr("Leadership")} title={tr("Meet the officers")}>
          {officersPhoto && (
            <figure className="relative mb-8 overflow-hidden rounded-xl border border-white/10">
              <img src={officersPhoto} alt="The CLS officers" loading="lazy" className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </figure>
          )}
          {officers.length === 0 ? (
            <Empty>{tr("Officer roster coming soon.")}</Empty>
          ) : (
            <OfficerCarousel officers={officers} />
          )}
          <div className="mt-10 text-center">
            <a
              href="/become-an-officer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-400 px-5 py-3 font-semibold text-green-300 hover:bg-green-400 hover:text-black"
            >{tr("Become an officer")}<ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </Section>
        <Anomaly spot={"officers"} />

        <Section id={"faq"} eyebrow={tr("FAQ")} title={tr("Frequently asked questions")}>
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
        <Anomaly spot={"faq"} />

        <Section id={"contact"} eyebrow={tr("Get Involved")} title={tr("Ready to join?")}>
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_440px]">
            <div>
              <p className="font-mono text-lg text-white">{siteConfig.slogan}</p>
              <div className="mt-6 max-w-xl rounded-xl border border-green-400/30 bg-green-400/5 p-5">
                <p className="font-mono text-sm font-bold uppercase tracking-wide text-green-400">★ {siteConfig.openToAll.title}</p>
                <p className="mt-2 text-neutral-300">{siteConfig.openToAll.body}</p>
              </div>
              <div className="mt-8 flex flex-col gap-8">
                <JoinButton className="self-start" />
                <Socials />
              </div>
            </div>
            <JusticeHologram />
          </div>
        </Section>
        <Anomaly spot={"contact"} />
      </main>

      <Footer />
    </>
  );
}
