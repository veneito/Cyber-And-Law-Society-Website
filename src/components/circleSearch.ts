export const suggestedAccounts = [
  ['juliette.dubois', 'Juliette Dubois'], ['julieta.draws', 'Julieta Duarte'], ['jules.dubois', 'Jules Dubois'],
  ['raphael.photos', 'Raphael Pierce'], ['rafael.pierre', 'Rafael Pierre'], ['pierre.rapha', 'Pierre Raphael'],
  ['chris.bakes', 'Chris Baker'], ['christina.bacon', 'Christina Bacon'], ['chris.palmer', 'Chris Palmer'],
  ['enrique.iglesia', 'Enrique Iglesia'], ['enrique.runs', 'Enrique Ibarra'], ['elena.iglesias', 'Elena Iglesias'],
  ['tim.chess', 'Tim Chester'], ['timothy.cheeseman', 'Timothy Cheeseman'], ['tina.cheese', 'Tina Cheese'],
  ['el.chiguire.fans', 'El Chiguire Club'], ['chiguire.travels', 'Chiguire Travels'], ['el.chico', 'El Chico'],
];

export function searchAccounts<T extends { id: string; name: string }>(accounts: T[], query: string): T[] {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const words = normalize(query).replace(/@/g, '').trim().split(/\s+/).filter(Boolean);
  if (words.join('').length < 2) return [];
  return accounts.filter(account => words.every(word => normalize(`${account.name} ${account.id}`).includes(word)))
    .sort((a, b) => a.name.localeCompare(b.name)).slice(0, 8);
}
