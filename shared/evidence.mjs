export const EVIDENCE_ES = [
 'LA RED FALSA ESTA ACTIVA TRESCIENTAS CREDENCIALES PARA EL VIERNES',
 'VENDI LAS CREDENCIALES AL COMPRADOR POR OCHO BITCOINS',
 'ENTRE EN LOS SERVIDORES CON UNA CUENTA ROBADA PAGUEN O TODO SEGUIRA BLOQUEADO',
 'EL TECNICO GUARDARA SILENCIO O PUBLICARE SUS SECRETOS',
 'EL DINERO YA ESTA LIMPIO NADIE PUEDE SEGUIRLO HASTA MI',
 'CULPEN AL ESTUDIANTE BORREN TODOS LOS REGISTROS ANTES DEL LUNES',
];
export const EVIDENCE_EN = [
 'THE FAKE NETWORK IS LIVE THREE HUNDRED LOGINS BY FRIDAY',
 'SOLD THE LOGINS TO THE BUYER FOR EIGHT BITCOIN',
 'INSIDE THE SERVERS WITH A STOLEN LOGIN PAY OR EVERYTHING STAYS LOCKED',
 'THE IT MAN WILL STAY QUIET OR HIS SECRETS GO PUBLIC',
 'THE MONEY IS CLEAN NOBODY CAN FOLLOW IT BACK TO ME',
 'BLAME THE STUDENT DELETE EVERY LOG BEFORE MONDAY',
];
export const normalized = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
export function spanishEvidence(config) {
 if(config.answers.length!==EVIDENCE_EN.length || config.answers.some((a,i)=>normalized(a)!==normalized(EVIDENCE_EN[i])))return null;
 const glyphs=[...'♈♉♊♋♌♍♎♏♐♑♒♓☉☽☿♀♂♃♄♅♆♇⚷⚸♁☊'];
 return EVIDENCE_ES.map((text,stage)=>{
  let index=0;
  const shifted=(n)=>[...text].map(c=>c===' '?' ':String.fromCharCode((c.charCodeAt(0)-65+n(++index))%26+65)).join('');
  if(stage===1||stage===5)return text.split(' ').map(word=>[...word].map(c=>c.charCodeAt(0)-64).join('-')).join(' / ');
  if(stage===3)return [...text].map(c=>c===' '?' ':glyphs[c.charCodeAt(0)-65]).join('');
  return shifted(stage===2?i=>i:()=>stage===0?7:11);
 });
}
