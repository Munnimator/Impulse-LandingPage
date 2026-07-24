const PRODUCTION_ORIGIN = 'https://www.impulselog.com';

function firstHeaderValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function isAllowedHost(host) {
  return host === 'impulselog.com' ||
    host === 'www.impulselog.com' ||
    host.endsWith('.vercel.app') ||
    /^localhost(?::\d+)?$/.test(host) ||
    /^127\.0\.0\.1(?::\d+)?$/.test(host);
}

export function getRequestOrigin(req) {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  const rawHost = firstHeaderValue(req.headers?.['x-forwarded-host']) || req.headers?.host;
  const host = typeof rawHost === 'string' ? rawHost.trim().toLowerCase() : '';
  if (!host || !isAllowedHost(host)) return PRODUCTION_ORIGIN;

  const rawProtocol = firstHeaderValue(req.headers?.['x-forwarded-proto']);
  const localHost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const protocol = localHost && rawProtocol === 'http' ? 'http' : 'https';
  return `${protocol}://${host}`;
}
