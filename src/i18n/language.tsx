import es from './es.json';
export const language: 'en' | 'es' = (() => { try { const requested = new URLSearchParams(location.search).get('lang'); if(requested === 'en' || requested === 'es') { localStorage.setItem('cls-language', requested); return requested; } return localStorage.getItem('cls-language') === 'es' ? 'es' : 'en'; } catch { return 'en'; } })();
document.documentElement.lang = language;
const fold = (value: string) => value.trim().replace(/[’‘]/g, "'").toLowerCase();
const dictionary = es as Record<string,string>;
const folded = new Map(Object.entries(dictionary).map(([key,value]) => [fold(key),value]));
export function t(text: string): string {
  if (language === 'en') return text;
  const translated = dictionary[text] ?? folded.get(fold(text));
  if (translated) {
    const value = text.trim() === text.trim().toUpperCase() ? translated.toUpperCase() : translated;
    return (text.match(/^\s*/)?.[0] ?? '') + value + (text.match(/\s*$/)?.[0] ?? '');
  }
  const patterns: [RegExp, (...args: string[]) => string][] = [
    [/^SIGNAL (\d+)%$/, n => 'SEÑAL ' + n + '%'],
    [/^Node (\d+) secured\. Connect node (\d+)\.$/, (a,b) => 'Nodo ' + a + ' conectado. Conecta el nodo ' + b + '.'],
    [/^Signal blocked\. Find node (\d+)\.$/, n => 'Señal bloqueada. Busca el nodo ' + n + '.'],
    [/^Decoded\.(.*)$/, rest => 'Descifrado.' + rest.replace('points','puntos')],
    [/^Not quite: (\d+) wrong pairing\(s\), -10 each\.$/, n => 'Hay ' + n + ' vínculos incorrectos; −10 puntos por cada uno.'],
    [/^Back in\. (.*) points$/, n => 'Acceso recuperado. ' + n + ' puntos'],
  ];
  for (const [pattern, format] of patterns) { const match = text.match(pattern); if(match)return format(...match.slice(1)); }
  return text;
}
document.title = t(document.title);
export function LanguageSwitch() {
  return <div className="fixed bottom-3 left-3 z-[100] flex rounded border border-green-800 bg-black/95 p-1 font-mono text-xs shadow-lg" role="group" aria-label="Language / Idioma">
    {(['en','es'] as const).map(code => <button key={code} lang={code} aria-pressed={language===code} onClick={() => { if(code===language)return; try{localStorage.setItem('cls-language',code);}catch{/* URL still preserves selection */} const url = new URL(location.href); url.searchParams.set('lang',code); location.assign(url.href); }} className={`rounded px-3 py-2 ${language===code?'bg-green-950 text-green-200':'text-neutral-400 hover:text-green-300'}`}>{code==='en'?'English':'Español'}</button>)}
  </div>;
}
