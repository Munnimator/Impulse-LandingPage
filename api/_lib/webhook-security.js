import crypto from 'node:crypto';
import { parseCsvEnv, parsePositiveIntEnv } from './env.js';

const DEFAULT_RATE_LIMIT_MAX = 30;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitState = new Map();

function getHeaderValue(req, headerName) {
  const value = req.headers?.[headerName];
  if (Array.isArray(value)) return value[0];
  return value;
}

function timingSafeEqualString(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;

  const aBuffer = Buffer.from(a, 'utf8');
  const bBuffer = Buffer.from(b, 'utf8');

  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function getClientIp(req) {
  const forwardedFor = getHeaderValue(req, 'x-forwarded-for');
  if (typeof forwardedFor === 'string' && forwardedFor.trim() !== '') {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = getHeaderValue(req, 'x-real-ip');
  if (typeof realIp === 'string' && realIp.trim() !== '') {
    return realIp.trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function cleanupRateLimitState(now, windowMs) {
  const ttl = windowMs * 2;
  for (const [key, entry] of rateLimitState.entries()) {
    if (now - entry.windowStart > ttl) {
      rateLimitState.delete(key);
    }
  }
}

function consumeRateLimit(ip) {
  const max = parsePositiveIntEnv('WEBHOOK_RATE_LIMIT_MAX', DEFAULT_RATE_LIMIT_MAX);
  const windowMs = parsePositiveIntEnv('WEBHOOK_RATE_LIMIT_WINDOW_MS', DEFAULT_RATE_LIMIT_WINDOW_MS);
  const now = Date.now();

  cleanupRateLimitState(now, windowMs);

  const bucketKey = ip || 'unknown';
  const existing = rateLimitState.get(bucketKey);

  if (!existing || (now - existing.windowStart) >= windowMs) {
    const nextState = { windowStart: now, count: 1 };
    rateLimitState.set(bucketKey, nextState);
    return {
      allowed: true,
      limit: max,
      remaining: Math.max(0, max - 1),
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  existing.count += 1;
  const allowed = existing.count <= max;
  const remaining = Math.max(0, max - existing.count);
  const resetSeconds = Math.max(1, Math.ceil((existing.windowStart + windowMs - now) / 1000));

  return {
    allowed,
    limit: max,
    remaining,
    resetSeconds,
  };
}

function isIpAllowed(ip) {
  const allowlist = parseCsvEnv('WEBHOOK_ALLOWED_IPS');
  if (allowlist.length === 0) return true;

  return allowlist.includes(ip);
}

function setRateLimitHeaders(res, rateLimit) {
  res.setHeader('RateLimit-Limit', String(rateLimit.limit));
  res.setHeader('RateLimit-Remaining', String(rateLimit.remaining));
  res.setHeader('RateLimit-Reset', String(rateLimit.resetSeconds));
}

function isJsonRequest(req) {
  const contentType = getHeaderValue(req, 'content-type');
  return typeof contentType === 'string' && contentType.toLowerCase().includes('application/json');
}

export function enforceWebhookSecurity(req, res, expectedApiKey) {
  const clientIp = getClientIp(req);

  if (!isIpAllowed(clientIp)) {
    return { ok: false, status: 403, body: { error: 'Forbidden' } };
  }

  const rateLimit = consumeRateLimit(clientIp);
  setRateLimitHeaders(res, rateLimit);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.resetSeconds));
    return { ok: false, status: 429, body: { error: 'Rate limit exceeded' } };
  }

  if (!isJsonRequest(req)) {
    return { ok: false, status: 415, body: { error: 'Unsupported media type' } };
  }

  const requestApiKey = getHeaderValue(req, 'x-api-key');
  if (!timingSafeEqualString(requestApiKey, expectedApiKey)) {
    return { ok: false, status: 401, body: { error: 'Unauthorized' } };
  }

  return { ok: true, clientIp };
}
