const SITE_ORIGIN = 'https://www.impulselog.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const INDEXNOW_KEY = '41c57d41eab04ea6b61ca2fbd2e88c7c';
const KEY_LOCATION = `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`;

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function validateUrl(value) {
  const url = new URL(value, SITE_ORIGIN);
  if (url.origin !== SITE_ORIGIN) {
    throw new Error(`Refusing to submit a URL outside ${SITE_ORIGIN}: ${value}`);
  }
  return url.toString();
}

async function readSitemapUrls() {
  const response = await fetch(`${SITE_ORIGIN}/sitemap.xml`, {
    headers: { 'user-agent': 'ImpulseLog-IndexNow/1.0' },
  });
  if (!response.ok) {
    throw new Error(`Could not load the sitemap (${response.status}).`);
  }

  const sitemap = await response.text();
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, value]) => validateUrl(decodeXml(value.trim())));
}

const requestedUrls = process.argv.slice(2);
const urls = [...new Set(requestedUrls.length
  ? requestedUrls.map(validateUrl)
  : await readSitemapUrls())];

if (!urls.length) {
  throw new Error('No URLs were found to submit.');
}

const response = await fetch(INDEXNOW_ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(SITE_ORIGIN).hostname,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  }),
});

if (![200, 202].includes(response.status)) {
  const responseBody = await response.text();
  throw new Error(`IndexNow rejected the submission (${response.status}): ${responseBody}`);
}

console.log(`IndexNow accepted ${urls.length} URL${urls.length === 1 ? '' : 's'} (${response.status}).`);
