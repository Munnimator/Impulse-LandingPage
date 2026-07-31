# ImpulseLog Discoverability Launch Plan

This is the production checklist for organic search, App Store search, paid acquisition, and AI-assisted discovery. The website changes are implemented in this repository; items labeled **Dashboard** require the founder to finish them in the named platform.

## Positioning to Keep Consistent

ImpulseLog is an impulse-control and intentional-spending app. It helps people pause before checkout, track almost-buys, use wait timers, and make spending patterns visible. ADHD is an important audience and use case, but the product should not be presented as clinical treatment or as making guaranteed savings outcomes.

Core language:

- Primary: impulse spending, pause before buying, almost-buys, intentional spending
- Secondary: ADHD-friendly spending tracker, shopping wait timer, emotional spending patterns
- Avoid: treatment, cure, clinically proven, guaranteed savings, stop spending forever

## Apple App Store Search

### Metadata package

- Existing name: `Impulse Log: ADHD Finances`
- Existing subtitle: `ADHD-friendly budget tracker`
- Recommended keyword field (92 UTF-8 bytes):

```text
spending,savings,shopping,overspending,almost buy,cooldown,wait timer,urges,mindful,no spend
```

The keyword field deliberately avoids repeating meaningful words already in the name and subtitle. Do not add spaces after commas; Apple counts every character.

- Recommended promotional text (149 characters):

```text
Pause before checkout, track almost-buys, use wait timers, and turn intentional decisions into visible savings—without shame or a complicated budget.
```

Promotional text helps product-page clarity and can be changed without a new version, but Apple does not use it for search ranking.

### Dashboard actions

- [ ] Use **Finance** as the primary category and **Lifestyle** as the secondary category if App Store Connect accepts both and the classification accurately reflects the current app.
- [ ] Paste the keyword field above into the next editable App Store version.
- [ ] Add the promotional text above.
- [ ] Review Apple-generated app tags and select only accurate concepts such as budgeting, saving money, spending tracker, or shopping where available.
- [ ] Make the first three screenshots communicate: pause an impulse, log the decision, see progress. The first screenshot should remain understandable without reading a paragraph.
- [ ] Keep release notes outcome-focused; do not use them as a keyword list.
- [ ] Prompt for ratings only after a genuine successful moment, never during a rescue flow or after an error.

### Custom product pages

Create three custom product pages and match each ad or outreach link to its intent:

1. **ADHD impulse spending** — lead with quick capture, low shame, patterns, and visual progress.
2. **Pause before buying** — lead with Impulse Rescue, wait timers, and intentional decisions.
3. **Almost-buy savings** — lead with saved decisions, goals, and visible progress without claiming money was automatically secured.

### Apple Ads structure

- Brand exact: ImpulseLog, Impulse Log
- Impulse exact/phrase: impulse spending app, stop impulse buying, overspending app, mindful spending
- ADHD exact/phrase: ADHD spending tracker, ADHD budget app, ADHD impulse spending
- Shopping exact/phrase: shopping wait timer, pause before buying, no spend app
- Discovery: Search Match in its own capped campaign so it cannot consume the high-intent budget

Send each group to the closest custom product page. Start with exact and phrase match, conservative bids, and Search Results inventory. Judge terms by trial starts and paid conversions—not taps alone.

## Google Organic Search and AI Overviews

Implemented:

- Unique intent-focused titles/descriptions and canonical URLs
- Crawlable server-rendered blog pages and archive
- Dynamic sitemap including blog posts
- WebSite, SoftwareApplication, Organization, HowTo, Blog, Article, and FAQ schema where appropriate
- Fast WebP product screenshots with explicit dimensions
- Google-friendly `robots.txt`

Dashboard:

- [ ] Add and verify the domain property in Google Search Console.
- [ ] Submit `https://www.impulselog.com/sitemap.xml`.
- [ ] Inspect the homepage, three intent pages, blog archive, and top ten blog posts after deployment.
- [ ] Review search queries monthly; update titles where impressions grow but click-through remains weak.
- [ ] Build editorial links through useful creator coverage, founder interviews, app roundups, and relevant communities. Do not buy bulk backlinks.

Google states that AI Overviews and AI Mode use the same core SEO requirements as ordinary Search; there is no separate AI schema or special AI text file required.

## Bing, Copilot, and IndexNow

Implemented:

- Bing-compatible sitemap and robots directives
- Public IndexNow verification key
- `npm run submit:indexnow` to submit every current sitemap URL after deployment

Dashboard:

- [ ] Add the site to Bing Webmaster Tools (importing from Search Console is acceptable).
- [ ] Submit the sitemap once.
- [ ] Review crawl errors and indexed-page counts after the first IndexNow submission.

## ChatGPT and Other AI Referrals

Implemented:

- `OAI-SearchBot`, `ChatGPT-User`, and `GPTBot` are allowed to crawl public content while `/api/` remains blocked.
- `llms.txt` provides concise product facts, pricing, platform requirements, privacy positioning, and canonical links.
- Broad referral attribution recognizes ChatGPT traffic without collecting prompt text.

Important: no publisher can guarantee that a foundation model will mention a product. The durable strategy is accurate, crawlable first-party information plus legitimate third-party mentions from sources users trust.

## Google Ads

Use the matching landing page rather than sending every click to the homepage:

- `/adhd-spending-tracker/` — ADHD spending terms
- `/impulse-spending-app/` — impulse spending and overspending terms
- `/shopping-wait-timer/` — wait timer and pause-before-buying terms

Starting campaign groups:

- ADHD finances: ADHD spending tracker, ADHD budget app, ADHD impulse spending
- Impulse control: impulse spending app, stop impulse buying, control online shopping
- Purchase pause: shopping wait timer, pause before buying, think before buying app

Starting negatives: free money, loan, credit card, debt relief, gambling, clinical treatment, diagnosis, medication, jobs, template, spreadsheet, PDF.

Measurement:

- [ ] Link Firebase/GA4 to Google Ads.
- [ ] Import `first_open`, `activation_first_win`, `activation_first_paywall_view`, and `activation_first_paid_conversion` where available.
- [ ] Optimize initially for qualified activation when paid-conversion volume is too low, then graduate to paid conversion.
- [ ] Keep ADHD campaigns contextual/search-based. Do not create personalized health-condition audiences or imply knowledge of a specific user's diagnosis.

Suggested URL parameters:

```text
utm_source=google&utm_medium=cpc&utm_campaign=impulse_spending&utm_content={campaignid}_{adgroupid}_{creative}&utm_term={keyword}
```

## Meta Ads

The website now preserves sanitized UTM source/campaign data through the App Store click. No Meta Pixel or native Meta SDK was added; either would be a material privacy and App Store disclosure decision.

- Start with broad or contextual creative testing, not sensitive ADHD profiling.
- Use dedicated campaign names and the three intent landing pages.
- Compare landing-page sessions, App Store clicks, first wins, trial starts, and paid conversions by campaign.
- Do not claim the app treats ADHD or guarantees savings.

Suggested URL parameters:

```text
utm_source=meta&utm_medium=paid_social&utm_campaign=impulse_spending&utm_content={{placement}}_{{ad.name}}
```

Before adding a Meta Pixel, SDK, or mobile measurement partner:

- [ ] Decide whether the additional attribution value justifies the data collection.
- [ ] Update the website privacy policy, App Store privacy answers, consent behavior, and data-retention documentation.
- [ ] Verify iOS tracking/ATT obligations for the exact configuration.

## Go/No-Go Before Paid Traffic

- [ ] Live blog and all product pages return 200, not serverless errors.
- [ ] Sitemap includes static pages and current blog posts.
- [ ] App Store links open and `app_store_click` appears in GA4 Realtime.
- [ ] Firebase activation and paid-conversion events are visible and consistently named.
- [ ] Apple product page metadata and screenshots match the landing-page promise.
- [ ] Search Console and Bing Webmaster Tools are verified.
- [ ] A weekly spend ceiling and stop-loss rule are defined.
- [ ] Every campaign has one primary audience, one promise, one landing page, and one measurable outcome.

## Primary References

- [Apple: Optimizing for App Store search](https://developer.apple.com/app-store/search/)
- [Apple: Product page optimization](https://developer.apple.com/help/app-store-connect/create-product-page-optimization-tests/overview-of-product-page-optimization/)
- [Apple: Custom product pages](https://developer.apple.com/app-store/custom-product-pages/)
- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: Search Essentials](https://developers.google.com/search/docs/essentials)
- [Microsoft: IndexNow documentation](https://www.indexnow.org/documentation)
- [OpenAI: Search crawlers and referral traffic](https://platform.openai.com/docs/bots)
