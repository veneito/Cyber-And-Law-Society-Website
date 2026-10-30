const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export const correctFloor = value => /\b(2|2nd|second|two|segundo|segunda)\b/.test(normalize(value));
export const correctItem = value => /\b(book|books|libro|libros)\b/.test(normalize(value));
