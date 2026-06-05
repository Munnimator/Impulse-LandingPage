# ImpulseLog Website Marketing Checklist

This checklist covers the website tasks that support search traffic, App Store conversion, and launch attribution.

## Current Status

- App Store URL is live: `https://apps.apple.com/us/app/impulse-log/id6747727094`
- Website hosting is Vercel from the GitHub `main` branch.
- Google Analytics 4 is installed.
- App Store CTA clicks are tracked with the `app_store_click` event.
- App Store links receive campaign tokens through `ct`.
- Sitemap is generated at `https://www.impulselog.com/sitemap.xml`.
- Focused SEO pages are live for:
  - `/impulse-spending-app/`
  - `/adhd-spending-tracker/`
  - `/shopping-wait-timer/`
  - `/founder-story/`

## Before Each Marketing Push

- [ ] Confirm the latest GitHub commit deployed successfully on Vercel.
- [ ] Open the live homepage and each focused SEO page on desktop and iPhone Safari.
- [ ] Click one App Store CTA from each major page and confirm the App Store opens.
- [ ] Check GA4 Realtime for `app_store_click` after clicking a CTA.
- [ ] Confirm `https://www.impulselog.com/sitemap.xml` includes new static pages.
- [ ] Inspect new or changed URLs in Google Search Console.

## Search Console Follow-Through

- [ ] Submit or resubmit `https://www.impulselog.com/sitemap.xml`.
- [ ] Inspect these URLs after deployment:
  - `https://www.impulselog.com/`
  - `https://www.impulselog.com/impulse-spending-app/`
  - `https://www.impulselog.com/adhd-spending-tracker/`
  - `https://www.impulselog.com/shopping-wait-timer/`
  - `https://www.impulselog.com/founder-story/`
- [ ] Review the last 3 months of Search Console queries.
- [ ] Prioritize rewrites for pages with high impressions and low click-through rate.

## App Store Connect Follow-Through

- [ ] Review App Analytics campaign data after traffic begins landing on the campaign-tagged links.
- [ ] If available, add the App Store Connect provider token to `APP_STORE_PROVIDER_TOKEN` in `script.js` so campaign attribution is cleaner.
- [ ] Create custom product pages for the main intent clusters:
  - Impulse spending app
  - ADHD spending tracker
  - Shopping wait timer
  - Shopping lists and store planning

## Content Priorities

- [ ] Refresh the highest-impression blog posts before writing large batches of new posts.
- [ ] Add direct product CTAs inside top blog posts where they naturally fit.
- [ ] Use the founder story page as the trust link for outreach, press, social profiles, and creator partnerships.
- [ ] Keep copy focused on the user outcome: almost-buys, saved money, wait timers, shopping lists, mood/place patterns, and ADHD-friendly momentum.
