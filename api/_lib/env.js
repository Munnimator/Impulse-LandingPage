export function requireEnv(name) {
  const value = process.env[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function parsePositiveIntEnv(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue === undefined) return fallback;

  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;

  return parsed;
}

export function parseCsvEnv(name) {
  const rawValue = process.env[name];
  if (!rawValue) return [];

  return rawValue
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
}
