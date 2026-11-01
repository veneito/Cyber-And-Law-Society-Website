import juniorNotes from "../../public/assets/junior-tracing-notes-v1.txt?raw";
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Minus, Plus } from 'lucide-react';
import notes from '../../public/assets/whitehat-field-notes-v1.txt?raw';
import './WhiteHatReader.css';

const makePages = (content: string) => {
const chunks = content.split(/\n(?=\d+\. [A-Z])/);
return chunks.map((chunk, index) => {
  const [heading, ...body] = chunk.trim().split('\n');
  return { title: index === 0 ? 'Before you begin' : heading, body: index === 0 ? chunk.trim() : body.join('\n').trim() };
});
};
export function WhiteHatReader({ junior = false }: { junior?: boolean }) {
  const pages = makePages(junior ? juniorNotes : notes);
  const author = junior ? "HATWHITEJR" : "MR.WHITEHAT";
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const viewport = useRef<HTMLDivElement>(null);
  const turn = (next: number) => { setPage(Math.max(0, Math.min(pages.length - 1, next))); viewport.current?.scrollTo({ top: 0 }); };
  return <div className="whitehat-reader">
    <header className="whitehat-reader-toolbar"><span><FileText size={16} /> {junior ? "HATWHITEJR_TRACING_NOTES.pdf" : "WHITEHAT_FIELD_NOTES.pdf"}</span><small>SECURE DOCUMENT VIEWER</small></header>
    <div className="whitehat-reader-controls"><div><button aria-label="Previous page" disabled={page === 0} onClick={() => turn(page - 1)}><ChevronLeft size={16} /></button><span>PAGE {page + 1} / {pages.length}</span><button aria-label="Next page" disabled={page === pages.length - 1} onClick={() => turn(page + 1)}><ChevronRight size={16} /></button></div><div><button aria-label="Zoom out document" disabled={zoom === 80} onClick={() => setZoom(value => Math.max(80, value - 10))}><Minus size={14} /></button><button aria-label="Reset document zoom" onClick={() => setZoom(100)}>{zoom}%</button><button aria-label="Zoom in document" disabled={zoom === 160} onClick={() => setZoom(value => Math.min(160, value + 10))}><Plus size={14} /></button></div></div>
    <div className="whitehat-reader-layout"><nav aria-label="Document sections">{pages.map((item, index) => <button key={index} aria-current={page === index ? 'page' : undefined} title={item.title} onClick={() => turn(index)}><span>{String(index + 1).padStart(2, '0')}</span><small>{item.title.replace(/^\d+\. /, '')}</small></button>)}</nav><div ref={viewport} className="whitehat-reader-viewport"><article className="whitehat-document" style={{ zoom: zoom / 100 }}><div className="whitehat-document-stamp">FIELDWORK / WHITEHAT INTELLIGENCE<br />REFERENCE COPY · READ ONLY</div><span className="whitehat-document-number">{String(page + 1).padStart(2, '0')}</span><h1>{pages[page].title}</h1>{pages[page].body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<footer>{author} / INVESTIGATION NOTES<span>{page + 1} / {pages.length}</span></footer></article></div></div>
    <footer className="whitehat-reader-status"><span>LOCAL COPY · NO ACTIVE SCRIPTS</span><a href={junior ? "/assets/junior-tracing-notes-v1.txt" : "/assets/whitehat-field-notes-v1.txt"} download>EXPORT TEXT ↓</a></footer>
  </div>;
}

