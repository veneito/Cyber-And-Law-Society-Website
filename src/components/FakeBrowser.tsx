import { useState } from "react";
import { t as tr } from "../i18n/language";

type Person = { id: string; name: string; bio: string; avatar?: string; glyph: string; followers: number; following: number };
type Post = { id: number; by: string; when: string; text: string; place?: string; glyph: string; likes: number; image?: string; comment?: { by: string; text: string } };

const PEOPLE: Person[] = [
  { id: "julieta.dubois", name: "Julieta Dubois", bio: "Physician Assistant. Coffee and rain.", avatar: "/assets/julieta-avatar-v2.webp", glyph: "M", followers: 412, following: 388 },
  { id: "raphael.pierre", name: "Raphael Pierre", bio: "Seeking the quiet. The dawn is coming. ◬", avatar: "/assets/raphael-avatar-v1.png", glyph: "◬", followers: 57, following: 9 },
  { id: "chris.p.bacon", name: "Chris P. Bacon", bio: "Grateful for good doctors. Breakfast is a lifestyle.", avatar: "/assets/chris-avatar-v1.webp", glyph: "C", followers: 23, following: 41 },
  { id: "enrique.iglesias", name: "Enrique Iglesias", bio: "Music, late nights, no regrets.", avatar: "/assets/enrique-avatar-v1.webp", glyph: "E", followers: 1240, following: 62 },
  { id: "tim.cheese", name: "Tim Cheese", bio: "Fromager. Life is better aged.", avatar: "/assets/tim-avatar-v1.webp", glyph: "T", followers: 88, following: 130 },
  { id: "el.chiguire", name: "El Chiguire", bio: "Capybara enthusiast. Calm waters.", avatar: "/assets/chiguire-avatar-v1.webp", glyph: "C", followers: 301, following: 12 },
];

const POSTS: Post[] = [
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

type View = { v: "new" } | { v: "feed" } | { v: "none"; q: string } | { v: "profile"; id: string } | { v: "post"; id: number };
const who = (id: string) => PEOPLE.find(p => p.id === id);

// Home-feed filler: strangers with no profile to open. Only a name search reaches Julieta or Raphael.
const FEED: Post[] = [
  { id: 101, by: "sunny_trails", when: "2h", text: "Found the best sunrise spot on the whole ridge.", place: "Mount Pilchuck", glyph: "⛰", likes: 212 },
  { id: 102, by: "kai.cooks", when: "3h", text: "Sunday ramen, day three of perfecting the broth.", glyph: "🍜", likes: 96 },
  { id: 103, by: "jordan_lifts", when: "5h", text: "New PR. Legs are gone.", place: "Iron Works Gym", glyph: "🏋", likes: 341 },
  { id: 104, by: "bluebird_amy", when: "7h", text: "Rainy day, tiny cafe, big book.", place: "Pageturner Cafe", glyph: "☕", likes: 58 },
  { id: 105, by: "marco.runs", when: "9h", text: "10k before work. Do not talk to me before coffee.", glyph: "👟", likes: 77 },
  { id: 106, by: "noodle.hunter", when: "12h", text: "Found a cat that looks exactly like my boss.", glyph: "🐈", likes: 489 },
];

// Match typed words to a profile: every word must appear in the name or handle (case-insensitive, 3+ letters total).
const findPerson = (q: string) => {
  const norm = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); // so "chiguire" finds "Chigüire"
  const words = norm(q.trim()).replace(/@/g, "").split(/\s+/).filter(Boolean);
  return words.join("").length < 3 ? undefined : PEOPLE.find(p => words.every(w => norm(`${p.name} ${p.id}`).includes(w)));
};

function Avatar({ p, size }: { p: Person; size: number }) {
  return <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 font-semibold text-[#bca4b8] ring-2 ring-[#bca4b8]/50" style={{ width: size, height: size, fontSize: size / 2 }}>
    {p.avatar ? <img src={p.avatar} alt="" className="h-full w-full object-cover" /> : p.glyph}
  </span>;
}

// No real photos: a tinted square with a glyph stands in for the picture.
function Media({ post, full }: { post: Post; full?: boolean }) {
  // Square crops anchor to the top so faces stay in frame; the open post shows the whole photo.
  if (post.image) return <img src={post.image} alt={post.place ?? ""} className={full ? "w-full" : "aspect-square w-full object-cover object-top"} />;
  const julieta = post.by === "julieta.dubois";
  return <div className={`flex aspect-square w-full items-center justify-center text-5xl ${julieta ? "bg-gradient-to-br from-[#3d253f] to-[#11140f]" : "bg-gradient-to-br from-neutral-700 to-[#11140f]"}`} aria-hidden="true">{post.glyph}</div>;
}

function PostCard({ post, go, full }: { post: Post; go: (v: View) => void; full?: boolean }) {
  const p = who(post.by); // undefined for feed strangers
  return (
    <article className="overflow-hidden rounded-xl border border-neutral-800 bg-[#11140f]">
      <header className="flex items-center gap-2 p-2">
        {p ? <Avatar p={p} size={32} /> : <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold uppercase text-neutral-400">{post.by[0]}</span>}
        <div className="min-w-0 leading-tight">
          {p ? <button onClick={() => go({ v: "profile", id: p.id })} className="block font-semibold text-neutral-100 hover:underline">{p.id}</button> : <span className="block font-semibold text-neutral-100">{post.by}</span>}
          {post.place && <span className="text-xs text-neutral-400">{post.place}</span>}
        </div>
      </header>
      <Media post={post} full={full} />
      <div className="space-y-1 p-3">
        <p className="text-lg">♡ <span className="ml-2 text-sm text-neutral-300">{post.likes} {tr("likes")}</span></p>
        <p className="text-neutral-200"><b className="mr-1 text-neutral-100">{post.by}</b>{tr(post.text)}</p>
        {post.comment && <p className="text-neutral-300"><button onClick={() => who(post.comment!.by) && go({ v: "profile", id: post.comment!.by })} className="mr-1 font-semibold text-neutral-100 hover:underline">{post.comment.by}</button>{tr(post.comment.text)}</p>}
        <p className="text-xs uppercase text-neutral-500">{post.when}</p>
      </div>
    </article>
  );
}

export function FakeBrowser() {
  const [view, setView] = useState<View>({ v: "new" });
  const url = view.v === "new" ? "about:newtab" : view.v === "feed" ? "circle.net" : view.v === "none" ? `circle.net/search?q=${encodeURIComponent(view.q)}` : view.v === "profile" ? `circle.net/${view.id}` : `circle.net/p/${view.id}`;
  const person = view.v === "profile" ? who(view.id) : null;
  const [q, setQ] = useState("");
  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] flex-col font-sans text-sm">
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-900 px-2 py-1.5">
        <button aria-label={tr("Home")} onClick={() => setView({ v: "new" })} className="rounded-full px-2 py-1 hover:bg-neutral-800">⌂</button>
        <div className="min-w-0 flex-1 truncate rounded-full bg-black px-3 py-1 font-mono text-xs text-neutral-300" aria-label={tr("Address")}>{url}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-800 bg-neutral-950 px-2 py-1 text-xs">
        <span className="text-neutral-500">★</span>
        <button onClick={() => setView({ v: "feed" })} className="flex items-center gap-1 rounded-md px-2 py-1 text-neutral-200 hover:bg-neutral-800"><span className="text-[#bca4b8]">◯</span>Circle</button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-[#11140f]">
        {view.v === "new" && <p className="mt-10 text-center text-neutral-500">{tr("New tab. Use your favorites to get started.")}</p>}
        {view.v !== "new" && (
          <div className="mx-auto max-w-md space-y-3 p-3">
            <h2 className="font-mono text-lg font-bold text-[#bca4b8]">◯ Circle</h2>
            <form onSubmit={e => { e.preventDefault(); const hit = findPerson(q); setView(hit ? { v: "profile", id: hit.id } : { v: "none", q }); }}>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={tr("Search people")} aria-label={tr("Search people")} className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-neutral-100 placeholder:text-neutral-500 focus:outline focus:outline-[#bca4b8]" />
            </form>
            {view.v === "none" && <p className="py-6 text-center text-neutral-500">{tr("No results for")} “{view.q}”</p>}
            {view.v === "feed" && FEED.map(p => <PostCard key={p.id} post={p} go={setView} />)}
            {view.v === "post" && <PostCard post={POSTS.find(p => p.id === view.id)!} go={setView} full />}
            {person && <>
              <div className="flex items-center gap-4">
                <Avatar p={person} size={72} />
                <div className="flex flex-1 justify-around text-center">
                  {([[POSTS.filter(p => p.by === person.id).length, "posts"], [person.followers, "followers"], [person.following, "following"]] as const).map(([n, l]) => <div key={l}><b className="block text-neutral-100">{n}</b><span className="text-xs text-neutral-400">{tr(l)}</span></div>)}
                </div>
              </div>
              <div><b className="text-neutral-100">{person.name}</b><p className="text-neutral-300">{tr(person.bio)}</p></div>
              <div className="grid grid-cols-3 gap-0.5">
                {POSTS.filter(p => p.by === person.id).map(p => (
                  <button key={p.id} onClick={() => setView({ v: "post", id: p.id })} aria-label={p.place ?? tr(p.text)} className="hover:opacity-80"><Media post={p} /></button>
                ))}
              </div>
            </>}
          </div>
        )}
      </div>
    </div>
  );
}
