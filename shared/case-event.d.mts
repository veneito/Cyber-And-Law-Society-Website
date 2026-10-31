export const CASE_EVENT: { title: string; opensAt: string; closesAt: string; discord: string };
export function eventStatus(now?: number): 'upcoming' | 'closed' | 'live';
export function attemptEndsAt(startedAt: number): number;
