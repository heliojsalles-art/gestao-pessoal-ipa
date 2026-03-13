export function nowIso() {
  return new Date().toISOString();
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function isOlderThanHours(dateIso: string | undefined, hours: number) {
  if (!dateIso) return false;
  return Date.now() - new Date(dateIso).getTime() >= hours * 60 * 60 * 1000;
}
