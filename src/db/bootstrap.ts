import { seedIfEmpty } from './storage';
import { seedData } from './seed';

let bootstrapped = false;

export async function bootstrapDb() {
  if (bootstrapped) return;
  await seedIfEmpty(seedData);
  bootstrapped = true;
}
