import { useState, type FormEvent } from "react";

const input = "mt-1 w-full rounded-lg border border-neutral-700 bg-black px-3 py-2 text-white focus:border-green-400 focus:outline-none";

export function ApplyForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") return <p className="mt-6 font-mono text-sm text-green-400">&gt; Application received. We'll be in touch.</p>;

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="text-sm text-neutral-300">Name<input name="name" required maxLength={80} className={input} /></label>
      <label className="text-sm text-neutral-300">Email<input name="email" type="email" required maxLength={120} className={input} /></label>
      <label className="text-sm text-neutral-300">Major<input name="major" required maxLength={80} className={input} /></label>
      <label className="text-sm text-neutral-300">Year
        <select name="year" required defaultValue="" className={input}>
          <option value="" disabled>Select…</option>
          {["Freshman", "Sophomore", "Junior", "Senior", "Graduate"].map((y) => <option key={y}>{y}</option>)}
        </select>
      </label>
      <label className="text-sm text-neutral-300 sm:col-span-2">Role you're interested in<input name="role" required maxLength={80} placeholder="e.g. Treasurer, Events, any" className={input} /></label>
      <label className="text-sm text-neutral-300 sm:col-span-2">Relevant experience (optional)<textarea name="experience" rows={3} maxLength={800} className={input} /></label>
      <label className="text-sm text-neutral-300 sm:col-span-2">Why do you want to be an officer?<textarea name="why" required rows={4} maxLength={1200} className={input} /></label>
      <div className="sm:col-span-2">
        <button disabled={state === "sending"} className="rounded-lg bg-green-400 px-5 py-3 font-semibold text-black hover:bg-green-300 disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Submit application"}
        </button>
        <p className="mt-3 h-5 text-sm text-red-400" role="status">{state === "error" ? "Couldn't send. Wait a minute and try again." : ""}</p>
      </div>
    </form>
  );
}
