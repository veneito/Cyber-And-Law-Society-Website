import { useRef, useState } from 'react';
import { Download, FolderOpen, WrapText } from 'lucide-react';
import './InvestigationNotes.css';

type Note = { name: string; text: string };
const STORAGE_KEY = 'cls-investigation-notepad-v1';
let memory: Note = { name: 'Investigation notes.txt', text: '' };
function readNote(): Note {
 try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const saved: unknown = JSON.parse(raw); if (saved && typeof saved === 'object' && 'name' in saved && 'text' in saved && typeof saved.name === 'string' && typeof saved.text === 'string') memory = { name: saved.name, text: saved.text }; } } catch { /* Keep the current-session note if browser storage is unavailable. */ }
 return memory;
}
export function InvestigationNotes() {
 const [note, setNote] = useState(readNote);
 const [status, setStatus] = useState('Auto-saves in this browser');
 const [wrap, setWrap] = useState(true);
 const [caret, setCaret] = useState(0);
 const file = useRef<HTMLInputElement>(null), editor = useRef<HTMLTextAreaElement>(null);
 const update = (next: Note) => { memory = next; setNote(next); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setStatus('Saved in this browser'); } catch { setStatus('Kept for this session only — use Save .txt to keep a copy'); } };
 const save = () => {
   const name = (note.name.trim() || 'Investigation notes').replace(/[<>:"/\\|?*]/g, '_');
   const blob = new Blob([note.text], { type: 'text/plain;charset=utf-8' });
   const url = URL.createObjectURL(blob), link = document.createElement('a');
   link.href = url; link.download = name.toLowerCase().endsWith('.txt') ? name : `${name}.txt`;
   link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); setStatus('Text file exported · browser copy retained');
 };
 const before = note.text.slice(0, caret), line = before.split('\n').length, column = before.length - before.lastIndexOf('\n');
 return <div className="investigation-notepad">
  <header><label htmlFor="investigation-note-name">FILE</label><input id="investigation-note-name" aria-label="Note filename" value={note.name} maxLength={100} onChange={e => update({ ...note, name: e.target.value })} /></header>
  <nav aria-label="Notepad controls"><button onClick={() => file.current?.click()}><FolderOpen size={14} /> Open .txt</button><button onClick={save}><Download size={14} /> Save .txt</button><button aria-pressed={wrap} onClick={() => setWrap(value => !value)}><WrapText size={14} /> Word wrap {wrap ? 'on' : 'off'}</button></nav>
  <input ref={file} type="file" accept=".txt,text/plain" hidden onChange={async e => { const selected = e.target.files?.[0]; e.target.value = ''; if (!selected) return; if (selected.size > 1024 * 1024) { setStatus('Choose a text file smaller than 1 MB'); return; } if (note.text && !window.confirm('Replace your current note? Save a .txt copy first if you want to keep it.')) return; try { update({ name: selected.name, text: await selected.text() }); setCaret(0); } catch { setStatus('Unable to read that file. Your current note is unchanged.'); } }} />
  <textarea ref={editor} aria-label="Investigation notes" placeholder="Keep your evidence, transaction trail, commands and password fragments here…" value={note.text} wrap={wrap ? 'soft' : 'off'} spellCheck={false} onChange={e => { update({ ...note, text: e.target.value }); setCaret(e.target.selectionStart); }} onSelect={e => setCaret(e.currentTarget.selectionStart)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } }} />
  <footer><span role="status">{status}</span><span>Ln {line}, Col {column} · {note.text.length.toLocaleString()} chars · UTF-8</span></footer>
 </div>;
}

