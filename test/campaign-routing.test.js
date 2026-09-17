import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const source = await readFile('script.js', 'utf8');
const routing = source.slice(source.indexOf('const APP_STORE_BASE_URL'), source.indexOf('function describeCtaLocation'));
function link(pathname, campaign = 'cart0917') {
  const context = vm.createContext({ URL, window: { location: { pathname } } });
  vm.runInContext(routing, context);
  return new URL(vm.runInContext(`buildTrackedAppStoreUrl(${JSON.stringify(campaign)})`, context));
}
test('each shopping guide keeps its approved custom product page and campaign token', () => {
  const routes = {
    '/adhd-spending-tracker/': 'd004977f-8431-4fac-b8d2-f0688fe3df79',
    '/shopping-wait-timer/': 'd4097329-bdbc-4b6a-b0f5-6d9b0eb2245b',
    '/impulse-spending-app/': '94cf4060-a1fd-4663-8c11-f81b048b1781',
  };
  for (const [path, id] of Object.entries(routes)) {
    const url = link(path);
    assert.equal(url.hostname, 'apps.apple.com');
    assert.equal(url.searchParams.get('ppid'), id);
    assert.equal(url.searchParams.get('ct'), 'cart0917');
    assert.equal(url.searchParams.get('mt'), '8');
  }
});
test('homepage and unknown paths keep the default listing; campaign values are bounded', () => {
  assert.equal(link('/').searchParams.has('ppid'), false);
  assert.equal(link('/unknown/').searchParams.has('ppid'), false);
  assert.equal(link('/__proto__/').searchParams.has('ppid'), false);
  assert.match(link('/', 'a&ppid=invalid').searchParams.get('ct'), /^[a-z0-9_]{1,40}$/);
});

test('App Store links wait for deferred attribution instead of freezing direct/none', () => {
  const listeners = {};
  const element = { href: 'https://apps.apple.com/us/app/impulse-log-adhd-finances/id6747727094', dataset: { appCta: 'hero' }, addEventListener() {} };
  const window = { location: { pathname: '/shopping-wait-timer/' } };
  const document = { readyState: 'loading', querySelectorAll: () => [element], addEventListener: (name, callback) => { listeners[name] = callback; } };
  const context = vm.createContext({ URL, window, document });
  const start = source.indexOf('const APP_STORE_BASE_URL');
  // Include the function and its startup registration, stopping before unrelated calculator code.
  const startupEnd = source.indexOf("\n}", source.indexOf("document.readyState")) + 2;
  vm.runInContext(source.slice(start, startupEnd), context);
  assert.equal(element.dataset.appStoreCampaign, undefined);
  window.__impulseLogAttribution = { source: 'instagram', campaign: 'cart0917' };
  listeners.DOMContentLoaded();
  const url = new URL(element.href);
  assert.match(url.searchParams.get('ct'), /^instagra_cart0917_/);
  assert.equal(url.searchParams.get('ppid'), 'd4097329-bdbc-4b6a-b0f5-6d9b0eb2245b');
});
