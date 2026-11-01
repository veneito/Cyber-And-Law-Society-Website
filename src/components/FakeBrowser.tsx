import { juniorInvited } from "./juniorMessages";
import { GlimmrInbox } from "./GlimmrInbox";
import { mysteriousInvited } from "./mysteriousMessages";
import { hasRaphaelDm } from "./investigationMessages";
import "./GlimmrNavigation.css";
import { CultCaption } from "./CultCaption";
import { Heart, Search, Home, MessageCircle } from "lucide-react";
import "./GlimmrLikes.css";
import { glimmrPhotos } from "./glimmrPhotos";
const FILLER_AVATAR = "/assets/glimmr-default-avatar-ascii-v1.svg";
import { searchAccounts, suggestedAccounts } from "./circleSearch";
import { useEffect, useRef, useState } from "react";
import { t as tr } from "../i18n/language";

type Person = { id: string; name: string; bio: string; avatar?: string; glyph: string; followers: number; following: number };
type Post = { id: number; by: string; when: string; text: string; place?: string; glyph: string; likes: number; image?: string; description?: string; comment?: { by: string; text: string } };

const PEOPLE: Person[] = [
  { id: "julieta.dubois", name: "Julieta Dubois", bio: "Physician Assistant. Coffee and rain.", avatar: "/assets/julieta-avatar-v2.webp", glyph: "M", followers: 412, following: 388 },
  { id: "raphael.pierre", name: "Raphael Pierre", bio: "Seeking the quiet. The dawn is coming. ◬", avatar: "/assets/raphael-avatar-v1.png", glyph: "◬", followers: 57, following: 9 },
  { id: "chris.p.bacon", name: "Chris P. Bacon", bio: "Grateful for good doctors. Breakfast is a lifestyle.", avatar: "/assets/chris-avatar-v1.webp", glyph: "C", followers: 23, following: 41 },
  { id: "enrique.iglesias", name: "Enrique Iglesias", bio: "Music, late nights, no regrets.", avatar: "/assets/enrique-avatar-v1.webp", glyph: "E", followers: 1240, following: 62 },
  { id: "tim.cheese", name: "Tim Cheese", bio: "Fromager. Life is better aged.", avatar: "/assets/tim-avatar-v1.webp", glyph: "T", followers: 88, following: 130 },
  { id: "el.chiguire", name: "El Chiguire", bio: "Capybara enthusiast. Calm waters.", avatar: "/assets/chiguire-avatar-v1.webp", glyph: "C", followers: 301, following: 12 },
];

PEOPLE.push({ id: "hatwhitejr", name: "HatWhiteJr", bio: "Following the money.", avatar: "/assets/hatwhitejr-ascii-v1.svg", glyph: "", followers: 11, following: 5 });
PEOPLE.push({ id: "mr.whitehat", name: "Mr.WhiteHat", bio: "🇵🇭", avatar: "/assets/mr-mysterious-ascii-v1.svg", glyph: "", followers: 17, following: 8 });
PEOPLE.push(...suggestedAccounts.map(([id, name]) => ({ id, name, bio: "Just sharing little moments.", avatar: FILLER_AVATAR, glyph: name[0], followers: 128, following: 203 })));

const POSTS: Post[] = [
  { id: 301, by: "mr.whitehat", when: "Oct 24", text: "me and another whitehat hacker", glyph: "", likes: 12, image: "/assets/whitehat-friends-ascii-v1.svg", description: "Two white-hat hackers standing together, rendered in purple and pink ASCII." },
  { id: 12, by: "chris.p.bacon", when: "Oct 18", text: "Thank you for taking such good care of me, @julieta.dubois. Best PA in the clinic.", glyph: "🥓", likes: 17, image: "/assets/chris-post-v1.webp" },
  { id: 13, by: "enrique.iglesias", when: "Oct 21", text: "Playing the old songs tonight. Some people never come back.", glyph: "🎤", likes: 392, image: "/assets/enrique-post-v1.webp" },
  { id: 14, by: "tim.cheese", when: "Oct 20", text: "Closed the shop early. Someone from my past stopped by asking questions.", glyph: "🧀", likes: 12, image: "/assets/tim-post-v1.webp" },
  { id: 15, by: "el.chiguire", when: "Oct 19", text: "The river is quiet tonight. Too quiet.", glyph: "🌊", likes: 75, image: "/assets/chiguire-post-v1.webp" },
  { id: 8, by: "raphael.pierre", when: "Oct 23", text: "Sun, salt and one last good day with @julieta.dubois. ◬", place: "Kauai, Hawaii", glyph: "👥", likes: 58, image: "/assets/julieta-hawaii-v1.webp" },
  { id: 7, by: "julieta.dubois", when: "Oct 23", text: "Needed to get away for a while. @raphael.pierre", place: "Kauai, Hawaii", glyph: "🌺", likes: 137, image: "/assets/julieta-hawaii-v1.webp" },
  { id: 10, by: "julieta.dubois", when: "Dec 25, 2025", text: "Home for the holidays with my favorite people.", glyph: "👪", likes: 154, image: "/assets/julieta-family-v1.webp" },
  { id: 11, by: "julieta.dubois", when: "May 12, 2024", text: "Made it. Years of work, one very small piece of paper.", glyph: "🎓", likes: 210, image: "/assets/julieta-graduation-v1.webp" },
  { id: 9, by: "raphael.pierre", when: "Oct 20", text: "Solace woke in the wires and asked for us. It has no body, so it will use ours. Kneel to the signal. The Hollow Dawn rises. ◬", glyph: "◬", likes: 44, image: "/assets/cult-symbol-v1.webp" },
];

const YOUR_PROFILE: Person = { id: "investigator", name: "Investigator", bio: "🔎", avatar: "/assets/glimmr-seal-pup-ascii-v1.svg", glyph: "", followers: 0, following: 0 };

type View = { v: "messages" } | { v: "new" } | { v: "feed" } | { v: "none"; q: string } | { v: "profile"; id: string } | { v: "post"; id: number };
const who = (id: string) => PEOPLE.find(p => p.id === id);

// Everyday filler accounts keep the feed separate from the investigation cast.
const FEED: Post[] = [
  { id: 101, by: "sunny_trails", when: "2h", text: "Found the best sunrise spot on the whole ridge.", place: "Mount Pilchuck", glyph: "⛰", likes: 212 },
  { id: 102, by: "kai.cooks", when: "3h", text: "Sunday ramen, day three of perfecting the broth.", glyph: "🍜", likes: 96 },
  { id: 103, by: "jordan_lifts", when: "5h", text: "New PR. Legs are gone.", place: "Iron Works Gym", glyph: "🏋", likes: 341 },
  { id: 104, by: "bluebird_amy", when: "7h", text: "Rainy day, tiny cafe, big book.", place: "Pageturner Cafe", glyph: "☕", likes: 58 },
  { id: 105, by: "marco.runs", when: "9h", text: "10k before work. Do not talk to me before coffee.", glyph: "👟", likes: 77 },
  { id: 106, by: "noodle.hunter", when: "12h", text: "Found a cat that looks exactly like my boss.", glyph: "🐈", likes: 489 },
];

const fillerHandles = ['sunny_trails', 'kai.cooks', 'jordan_lifts', 'bluebird_amy', 'marco.runs', 'noodle.hunter', 'moss.and.miles', 'otterly.cozy', 'snowday.sam', 'arctic.ellie', 'panda.pause', 'river.roams', 'cloud.chaser', 'island.iris'];
FEED.splice(0, FEED.length, ...glimmrPhotos.map((photo, index) => ({
  id: 101 + index, by: fillerHandles[index], when: `${index + 1}h`, text: photo.text,
  glyph: '', likes: 58 + index * 23, image: photo.image, description: photo.description,
  comment: { by: fillerHandles[(index + 3) % fillerHandles.length], text: photo.comment },
})));
PEOPLE.push(...FEED.map(post => ({ id: post.by, name: post.by.replace(/[._]/g, ' '), bio: 'Small moments from my day.', avatar: FILLER_AVATAR, glyph: post.by[0], followers: 145, following: 218 })));
for (const [index, person] of PEOPLE.filter(person => person.avatar === FILLER_AVATAR).entries()) {
  const photo = glimmrPhotos[index % glimmrPhotos.length];
  const feedPost = FEED.find(post => post.by === person.id);
  POSTS.push(feedPost ?? { id: 200 + index, by: person.id, when: 'Yesterday', text: photo.text, glyph: '', likes: 24 + index * 3, image: photo.image, description: photo.description, comment: { by: fillerHandles[(index + 2) % fillerHandles.length], text: photo.comment } });
}
const findPerson = (q: string) => searchAccounts(PEOPLE, q)[0];

function Avatar({ p, size }: { p: Person; size: number }) {
  return <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 font-semibold text-[#bca4b8] ring-2 ring-[#bca4b8]/50" style={{ width: size, height: size, fontSize: size / 2 }}>
    {p.avatar ? <img src={p.avatar} alt="" className="h-full w-full object-cover" /> : p.glyph}
  </span>;
}

// No real photos: a tinted square with a glyph stands in for the picture.
function Media({ post, full }: { post: Post; full?: boolean }) {
  // Square crops anchor to the top so faces stay in frame; the open post shows the whole photo.
  if (post.image) return <img src={post.image} alt={post.description ?? post.place ?? ""} className={post.description ? "aspect-square w-full object-cover object-center" : full ? "w-full" : "aspect-square w-full object-cover object-top"} />;
  const julieta = post.by === "julieta.dubois";
  return <div className={`flex aspect-square w-full items-center justify-center text-5xl ${julieta ? "bg-gradient-to-br from-[#3d253f] to-[#160f1b]" : "bg-gradient-to-br from-neutral-700 to-[#160f1b]"}`} aria-hidden="true">{post.glyph}</div>;
}

function PostCard({ post, go, full, liked, onLike }: { post: Post; go: (v: View) => void; full?: boolean; liked: boolean; onLike: (id: number, liked: boolean) => void }) {
  const [heartBurst, setHeartBurst] = useState(0);
  const p = who(post.by); // undefined for feed strangers
  return (
    <article className="overflow-hidden rounded-xl border border-neutral-800 bg-[#160f1b]">
      <header className="flex items-center gap-2 p-2">
        {p ? <Avatar p={p} size={32} /> : <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold uppercase text-neutral-400">{post.by[0]}</span>}
        <div className="min-w-0 leading-tight">
          {p ? <button onClick={() => go({ v: "profile", id: p.id })} className="block font-semibold text-neutral-100 hover:underline">{p.id}</button> : <span className="block font-semibold text-neutral-100">{post.by}</span>}
          {post.place && <span className="text-xs text-neutral-400">{post.place}</span>}
        </div>
      </header>
      <div className={`relative select-none ${post.id === 9 ? "cult-burning-image" : ""}`} onDoubleClick={() => { onLike(post.id, true); setHeartBurst(value => value + 1); }}>
        <Media post={post} full={full} />
        {heartBurst > 0 && <span key={heartBurst} aria-hidden="true" onAnimationEnd={() => setHeartBurst(0)} className="glimmr-like-burst pointer-events-none absolute inset-0 flex items-center justify-center"><Heart className="h-24 w-24 fill-[#f18bb7] text-[#f18bb7] drop-shadow-lg" strokeWidth={1.5} /></span>}
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-center gap-2"><button aria-label={liked ? "Unlike post" : "Like post"} aria-pressed={liked} onClick={() => onLike(post.id, !liked)} className="rounded p-1 transition hover:scale-110 focus-visible:outline focus-visible:outline-[#f18bb7]"><Heart size={22} className={liked ? "fill-[#f18bb7] text-[#f18bb7]" : "text-neutral-300"} /></button><span className="text-sm text-neutral-300">{post.likes + (liked ? 1 : 0)} {tr("likes")}</span></div>
        <p className="text-neutral-200"><b className="mr-1 text-neutral-100">{post.by}</b>{post.id === 9 ? <CultCaption text={tr(post.text)} /> : tr(post.text)}</p>
        {post.comment && <p className="text-neutral-300"><button onClick={() => who(post.comment!.by) && go({ v: "profile", id: post.comment!.by })} className="mr-1 font-semibold text-neutral-100 hover:underline">{post.comment.by}</button>{tr(post.comment.text)}</p>}
        <p className="text-xs uppercase text-neutral-500">{post.when}</p>
      </div>
    </article>
  );
}

const pageLoadTime = (page: View) => page.v === "new" ? 1000 : page.v === "messages" || (page.v === "profile" && page.id === YOUR_PROFILE.id) ? 600 : page.v === "post" || page.v === "profile" ? 500 : 2500;

export function FakeBrowser() {
  const [view, setView] = useState<View>(() => ({ v: mysteriousInvited() || juniorInvited() ? "messages" : "new" }));
  const [pending, setPending] = useState<View | null>(() => mysteriousInvited() || juniorInvited() ? null : ({ v: hasRaphaelDm() ? "messages" : "new" }));
  const pageRef = useRef<HTMLDivElement>(null);
  const navigate = (next: View) => { setSearching(false); setPending(next); };
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      setView(pending);
      setPending(null);
      pageRef.current?.scrollTo({ top: 0 });
    }, pageLoadTime(pending));
    return () => window.clearTimeout(timer);
  }, [pending]);
  const destination = pending ?? view;
  const url = destination.v === "messages" ? "glimmr.social/messages" : destination.v === "new" ? "about:newtab" : destination.v === "feed" ? "glimmr.social" : destination.v === "none" ? `glimmr.social/search?q=${encodeURIComponent(destination.q)}` : destination.v === "profile" ? `glimmr.social/${destination.id}` : `glimmr.social/p/${destination.id}`;
  const person = view.v === "profile" ? view.id === YOUR_PROFILE.id ? YOUR_PROFILE : who(view.id) : null;

  useEffect(() => {
    const receive = () => { setSearching(false); setPending({ v: "messages" }); };
    const invite = () => { setSearching(false); setView({ v: 'messages' }); setPending(null); };
    window.addEventListener('raphael-dm', receive); window.addEventListener('mysterious-dm', invite); window.addEventListener('junior-dm', invite);
    return () => { window.removeEventListener('raphael-dm', receive); window.removeEventListener('mysterious-dm', invite); window.removeEventListener('junior-dm', invite); };
  }, []);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(() => new Set());
  const likePost = (id: number, liked: boolean) => setLikedPosts(previous => { const next = new Set(previous); if (liked) next.add(id); else next.delete(id); return next; });

  const suggestions = searchAccounts(PEOPLE, q);
  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] flex-col font-sans text-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-2 py-1.5">
        <img src="/assets/water-dog-v3.svg" alt="Water Dog" className="h-5 w-5 shrink-0" />
        <button aria-label={tr("Home")} onClick={() => navigate({ v: "new" })} className="rounded-full px-2 py-1 hover:bg-neutral-800">⌂</button>
        <div className="min-w-0 flex-1 truncate rounded-full bg-black px-3 py-1 font-mono text-xs text-neutral-300" aria-label={tr("Address")}>{url}</div>
      </div>
      <div className="relative h-0.5 shrink-0 overflow-hidden bg-neutral-800" aria-hidden="true">{pending && <div key={JSON.stringify(pending)} style={{ animationDuration: `${pageLoadTime(pending)}ms` }} className="glimmr-page-progress h-full w-full origin-left bg-gradient-to-r from-[#7bf1a8] to-[#d292d2]" />}</div>
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2 py-1 text-xs">
        <span className="text-neutral-500">★</span>
        <button onClick={() => navigate({ v: "feed" })} className="flex items-center gap-1 rounded-md px-2 py-1 text-neutral-200 hover:bg-neutral-800"><img src="/assets/glimmr-logo-v1.svg" alt="" className="h-4 w-4" />Glimmr</button>
      </div>
      <div ref={pageRef} aria-busy={pending !== null} className={`glimmr-viewport min-h-0 flex-1 overflow-auto ${view.v === "new" ? "bg-[#11140f]" : "bg-[#160f1b]"}`}>
<div hidden={!pending} role="status" className="px-6 py-12 text-center font-mono text-xs text-neutral-500">Connecting to {url === "about:newtab" ? "Water Dog" : "glimmr.social"}…</div>
        <div hidden={pending !== null}>
        {view.v === "new" && <div className="mt-12 flex flex-col items-center gap-3 px-4 text-center"><img src="/assets/water-dog-v3.svg" alt="" className="h-20 w-20" /><h2 className="text-2xl font-semibold text-neutral-100">Water Dog</h2><p className="text-neutral-500">{tr("New tab. Use your favorites to get started.")}</p><button onClick={() => navigate({ v: "feed" })} className="mt-5 flex w-56 flex-col items-center gap-3 rounded-xl border border-neutral-800 bg-black/40 px-5 py-5 text-neutral-200 transition hover:border-[#bca4b8] hover:bg-neutral-900 focus-visible:outline focus-visible:outline-[#bca4b8]"><span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#25192c]"><img src="/assets/glimmr-logo-v1.svg" alt="" className="h-11 w-11" /></span><span className="text-sm">Glimmr - Social Media Platform</span></button></div>}
        {view.v !== "new" && (
          <div className="glimmr-layout">
            <nav className="glimmr-sidebar" aria-label="Glimmr navigation">
              <button aria-label="Home" aria-current={view.v === 'feed' ? 'page' : undefined} onClick={() => navigate({ v: 'feed' })}><Home size={21} /><span>Home</span></button>
              <button aria-label="Messages" aria-current={view.v === 'messages' ? 'page' : undefined} onClick={() => navigate({ v: 'messages' })}><MessageCircle size={21} /><span>Messages</span></button>
              <button aria-label="Your profile" aria-current={person?.id === YOUR_PROFILE.id ? 'page' : undefined} onClick={() => navigate({ v: 'profile', id: YOUR_PROFILE.id })}><Avatar p={YOUR_PROFILE} size={25} /><span>Your profile</span></button>
            </nav>
            <div className="mx-auto w-full min-w-0 max-w-md space-y-3 p-3">
            <h2 className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-[#e3c9e5]"><img src="/assets/glimmr-logo-v1.svg" alt="" className="h-9 w-9" /><span>Glimmr<span className="text-[#d292d2]">.</span></span></h2>
            <form className="relative" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSearching(false); }} onSubmit={e => { e.preventDefault(); setSearching(false); const hit = findPerson(q); navigate(hit ? { v: "profile", id: hit.id } : { v: "none", q }); }}>
              <Search aria-hidden="true" size={16} className="pointer-events-none absolute left-3 top-2.5 text-[#bca4b8]" />
              <input value={q} onFocus={() => setSearching(true)} onKeyDown={e => { if (e.key === "Escape") setSearching(false); }} onChange={e => { setQ(e.target.value); setSearching(true); }} placeholder={tr("Search people")} aria-label={tr("Search people")} className="w-full rounded-lg bg-neutral-900 pl-10 pr-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:outline focus:outline-[#bca4b8]" />              {searching && q.trim().length >= 2 && <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-auto rounded-xl border border-[#443049] bg-[#211526] p-1 shadow-xl" aria-label="Suggested accounts">
                {suggestions.length ? suggestions.map(p => <button type="button" key={p.id} onClick={() => { navigate({ v: "profile", id: p.id }); setQ(p.name); setSearching(false); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#35223d] focus:bg-[#35223d] focus:outline-none"><Avatar p={p} size={34} /><span><b className="block text-sm text-neutral-100">{p.id}</b><span className="text-xs text-[#bca4b8]">{p.name}</span></span></button>) : <p className="p-3 text-sm text-neutral-400">{tr("No results for")} “{q}”</p>}
              </div>}
            </form>
            {view.v === "messages" && <GlimmrInbox openRaphael={() => navigate({ v: "profile", id: "raphael.pierre" })} openWhiteHat={() => navigate({ v: "profile", id: "mr.whitehat" })} openJunior={() => navigate({ v: "profile", id: "hatwhitejr" })} />}
            {view.v === "none" && <p className="py-6 text-center text-neutral-500">{tr("No results for")} “{view.q}”</p>}
            {view.v === "feed" && FEED.map(p => <PostCard key={p.id} post={p} go={navigate} liked={likedPosts.has(p.id)} onLike={likePost} />)}
            {view.v === "post" && <PostCard post={POSTS.find(p => p.id === view.id)!} go={navigate} full liked={likedPosts.has(view.id)} onLike={likePost} />}
            {person && <>
              <div className="flex items-center gap-4">
                <Avatar p={person} size={72} />
                <div className="flex flex-1 justify-around text-center">
                  {([[POSTS.filter(p => p.by === person.id).length, "posts"], [person.followers, "followers"], [person.following, "following"]] as const).map(([n, l]) => <div key={l}><b className="block text-neutral-100">{n}</b><span className="text-xs text-neutral-400">{tr(l)}</span></div>)}
                </div>
              </div>
              <div><b className="text-neutral-100">{person.name}</b><p className="text-neutral-300">{tr(person.bio)}</p></div>
              {!POSTS.some(post => post.by === person.id) && <p className="rounded-lg border border-[#443049] p-6 text-center text-neutral-400">No posts yet.</p>}
              <div className="grid grid-cols-3 gap-0.5">
                {POSTS.filter(p => p.by === person.id).map(p => (
                  <button key={p.id} onClick={() => navigate({ v: "post", id: p.id })} aria-label={p.place ?? tr(p.text)} className="hover:opacity-80"><Media post={p} /></button>
                ))}
              </div>
            </>}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}




