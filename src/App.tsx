import { ArrowRight, Bug, CalendarDays, ChevronDown, Mail, MapPin, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ApplyForm } from "./components/ApplyForm";
import { Anomaly, isFixed, startHunt } from "./components/Anomaly";
import { Icon } from "./components/Icon";
import { Logo } from "./components/Logo";
import { DecodeText } from "./components/Materialize";
import { Quarantine } from "./components/Quarantine";
import { Section } from "./components/Section";
import { Socials } from "./components/Socials";
import { hasLink, siteConfig, type Officer } from "./config/site";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#events", label: "Events" },
  { href: "/#officers", label: "Officers" },
  { href: "/#faq", label: "FAQ" },
  { href: "/play", label: "Play" },
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
      <section id="top" className="relative scroll-mt-16 flex min-h-[calc(100svh-4rem)] flex-col justify-end overflow-hidden">
        <img src={branding.bannerPath} alt={`${name}: ${tagline}`} className="absolute inset-0 h-full w-full bg-black object-contain object-top" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
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

function OfficerCard({ o }: { o: Officer }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false); // replays the decode effect on each open
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
      <button onClick={() => { dlg.current?.showModal(); setOpen(true); }} className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center transition hover:-translate-y-1 hover:border-green-400/50">
        {avatar("h-24 w-24")}
        <h3 className="mt-4 font-semibold text-white">{o.name}</h3>
        <p className="text-sm text-green-300">{o.role}</p>
        <p className="mt-1 text-xs text-neutral-500">{o.major}</p>
      </button>
      {/* showModal() traps focus, handles Escape and restores focus; a click on the dialog itself is a backdrop click */}
      <dialog ref={dlg} aria-label={o.name} onClose={() => setOpen(false)}onClick={(e) => e.target === dlg.current && dlg.current.close()} className="officer-dialog m-auto w-full max-w-md bg-transparent p-4 text-inherit">
        <div className="relative rounded-xl border border-neutral-700 bg-neutral-950 p-8 text-center">
          <button onClick={() => dlg.current?.close()} aria-label="Close" className="absolute right-3 top-3 text-neutral-400 hover:text-white"><X className="h-5 w-5" /></button>
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
        </div>
      </dialog>
    </>
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
        <p>© {new Date().getFullYear()} {siteConfig.name}. Student organization.</p>
      </div>
    </footer>
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
          <p className="q-rise mt-3 mb-10 max-w-2xl text-neutral-400" style={{ animationDelay: "0.2s" }}>
            Malware is hiding in the file system. Scan carefully, use the numbers to track it down, and lock every virus behind our shield.
          </p>
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
      <Section id="meetings" eyebrow="Archive" title="Past meetings">
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
  startHunt();
  const fixed = isFixed();
  return (
    <SubPage>
      <Section id="apply" eyebrow="Leadership" title="Become an officer">
        <div className="max-w-2xl space-y-4 text-neutral-400">
          <p>The main goal of an officer is to be passionate about how cyber is evolving, and to keep a focus on the law that has to evolve with it.</p>
          <p>No title or experience required. Show up, help out, and tell us you want more.</p>
        </div>
        <div className="mt-10 max-w-2xl rounded-xl border border-neutral-800 bg-neutral-950 p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-green-400">Step one</p>
          <p className="mt-2 text-neutral-300">Somewhere on this website is an anomaly, and it hides in a different place for every visitor. Find it and fix the bug.</p>
          {fixed ? (
            <>
              <p className="mt-4 font-mono text-sm text-green-400">&gt; Bug fixed. You're cleared to apply.</p>
              <ApplyForm />
            </>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">Hint: look closely at the sections. It flickers.</p>
          )}
        </div>
      </Section>
    </SubPage>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path === "/become-an-officer") return <OfficerPage />;
  if (path === "/meetings") return <MeetingsPage />;
  if (window.location.pathname.replace(/\/$/, "") === "/play") return <PlayPage />;
  const { pillars, upcomingEvents, officers, officersPhoto, faq } = siteConfig;
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Anomaly spot="hero" />

        <Section id="about" eyebrow="Who We Are" title={siteConfig.pillarsHeading}>
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

          <h3 className="mt-20 font-mono text-xs uppercase tracking-[0.2em] text-green-400">What We Do</h3>
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
        <Anomaly spot="about" />

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
        <div className="mt-8">
            <a href="/meetings" className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-5 py-3 font-semibold text-white hover:border-green-400">
              Past meetings <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </Section>
        <Anomaly spot="events" />

        <Section id="officers" eyebrow="Leadership" title="Meet the officers">
          {officersPhoto && (
            <figure className="relative mb-8 overflow-hidden rounded-xl border border-white/10">
              <img src={officersPhoto} alt="The CLS officers" loading="lazy" className="aspect-[16/9] w-full object-cover sm:aspect-[21/9]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </figure>
          )}
          {officers.length === 0 ? (
            <Empty>Officer roster coming soon.</Empty>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {officers.map((o) => <OfficerCard key={o.name + o.role} o={o} />)}
            </div>
          )}
          <div className="mt-10 text-center">
            <a
              href="/become-an-officer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-400 px-5 py-3 font-semibold text-green-300 hover:bg-green-400 hover:text-black"
            >
              Become an officer <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </Section>
        <Anomaly spot="officers" />

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
        <Anomaly spot="faq" />

        <Section id="contact" eyebrow="Get Involved" title="Ready to join?">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_320px]">
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
            {siteConfig.branding.flyerPath && (
              <a href={siteConfig.branding.flyerPath} target="_blank" rel="noreferrer" className="block">
                <img src={siteConfig.branding.flyerPath} alt={`${siteConfig.name} flyer`} loading="lazy" className="w-full rounded-xl border border-neutral-800 transition hover:border-green-400/50" />
              </a>
            )}
          </div>
        </Section>
        <Anomaly spot="contact" />
      </main>

      <Footer />
    </>
  );
}
