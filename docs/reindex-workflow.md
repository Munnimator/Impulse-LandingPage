# Google Search Console Re-Indexing Workflow

## Overview

This document provides a step-by-step workflow for requesting re-indexing of ImpulseLog blog posts in Google Search Console after canonical tag fixes.

**Timeline:** 3 days to submit all requests (Google limits to ~10/day)
**Expected Results:** 1-4 weeks for complete re-indexing

---

## Current Status

- **Total Blog Posts:** 29
- **Technical Status:** ✅ All canonical tags are correct (verified via Edge Function)
- **GSC Status:** ⚠️ Showing old crawl data from broken period (Oct 24-27)
- **Issue:** Google chose arbitrary canonicals when all posts pointed to `/blog`

---

## Why Re-Indexing is Needed

From **Oct 24-27**, all blog posts had incorrect canonicals pointing to `/blog` instead of their individual URLs. This caused Google to:

1. See all posts as duplicates of `/blog`
2. Pick arbitrary "primary" versions (e.g., `track-spending-adhd`)
3. De-index other posts as duplicates
4. Show "Duplicate, Google chose different canonical than user" errors

The technical fix was deployed **Oct 27**, but Google hasn't fully re-crawled yet.

---

## Blog Post URLs (All 29)

Copy these URLs for requesting indexing in Google Search Console:

```
https://www.impulselog.com/blog/adhd-spending-triggers-savings-goals
https://www.impulselog.com/blog/emotional-triggers-impulse-purchases
https://www.impulselog.com/blog/adhd-spending-triggers-visual-tracking-solutions
https://www.impulselog.com/blog/daily-reflection-emotional-spending
https://www.impulselog.com/blog/adhd-financial-habit-analyzer-clarity
https://www.impulselog.com/blog/neurodivergent-savings-goal-finder-tool
https://www.impulselog.com/blog/break-emotional-ties-purchases
https://www.impulselog.com/blog/dopamine-budget-planner-joyful-finances
https://www.impulselog.com/blog/track-spending-adhd
https://www.impulselog.com/blog/visual-progress-tracking-adhd-finances
https://www.impulselog.com/blog/impulse-purchase-calculator-smart-choices
https://www.impulselog.com/blog/adhd-financial-decisions-challenges
https://www.impulselog.com/blog/adhd-spending-tracker-budgeting
https://www.impulselog.com/blog/emotional-spending-adhd-tools-help
https://www.impulselog.com/blog/daily-spending-challenge-generator
https://www.impulselog.com/blog/dopamine-impacts-adhd-spending-saving
https://www.impulselog.com/blog/adhd-impulse-spending-emotional-spending
https://www.impulselog.com/blog/emotional-spending-trigger-analyzer
https://www.impulselog.com/blog/gamified-savings-goal-tracker
https://www.impulselog.com/blog/adhd-budget-planner
https://www.impulselog.com/blog/apps-vs-spreadsheets-adhd-money-management
https://www.impulselog.com/blog/impulse-spending-calculator
https://www.impulselog.com/blog/mood-affects-shopping-adhd
https://www.impulselog.com/blog/guide-adhd-financial-wellness
https://www.impulselog.com/blog/money-habits-people-with-adhd
https://www.impulselog.com/blog/buy-things-when-emotional-adhd
https://www.impulselog.com/blog/adhd-spending-tricks
https://www.impulselog.com/blog/stop-impulse-buying-adhd
https://www.impulselog.com/blog/adhd-budget-checklist-simple-steps
```

---

## Priority Order (High to Low)

Request indexing in this order to prioritize high-traffic and high-value posts:

### Day 1 (Top 10 Priority Posts)
1. `track-spending-adhd` (Google's chosen canonical - highest priority)
2. `emotional-triggers-impulse-purchases` (currently showing errors in GSC)
3. `adhd-spending-triggers-savings-goals`
4. `stop-impulse-buying-adhd`
5. `adhd-budget-planner`
6. `guide-adhd-financial-wellness`
7. `money-habits-people-with-adhd`
8. `adhd-financial-decisions-challenges`
9. `dopamine-impacts-adhd-spending-saving`
10. `adhd-impulse-spending-emotional-spending`

### Day 2 (Next 10 Posts)
11. `adhd-spending-tricks`
12. `buy-things-when-emotional-adhd`
13. `mood-affects-shopping-adhd`
14. `impulse-spending-calculator`
15. `neurodivergent-savings-goal-finder-tool`
16. `dopamine-budget-planner-joyful-finances`
17. `break-emotional-ties-purchases`
18. `adhd-financial-habit-analyzer-clarity`
19. `daily-reflection-emotional-spending`
20. `visual-progress-tracking-adhd-finances`

### Day 3 (Remaining 9 Posts)
21. `adhd-spending-triggers-visual-tracking-solutions`
22. `adhd-spending-tracker-budgeting`
23. `emotional-spending-adhd-tools-help`
24. `daily-spending-challenge-generator`
25. `emotional-spending-trigger-analyzer`
26. `gamified-savings-goal-tracker`
27. `apps-vs-spreadsheets-adhd-money-management`
28. `impulse-purchase-calculator-smart-choices`
29. `adhd-budget-checklist-simple-steps`

---

## Step-by-Step Process

### 1. Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select property: `https://www.impulselog.com`
3. Navigate to **URL Inspection** tool (left sidebar or top search bar)

### 2. Test Live URL (IMPORTANT)

For each URL:

1. **Paste the URL** into the inspection bar
2. **Wait for initial crawl data** to load
3. **Click "TEST LIVE URL"** button (top right)
   - This tests the CURRENT live version (with fixed canonicals)
   - Don't skip this step! It shows Google the updated version
4. **Wait for test to complete** (~30 seconds)

### 3. Verify Canonical is Correct

In the "TEST LIVE URL" results:

1. Look for **"Canonical tag"** section
2. Verify it shows the URL you're testing (self-referencing)
3. ✅ **Good:** Canonical matches URL
4. ❌ **Bad:** Canonical points to different URL or `/blog`

If canonical is still wrong, the deployment may not have propagated. Wait and retry.

### 4. Request Indexing

1. **Click "REQUEST INDEXING"** button
2. Google will confirm: "Indexing requested"
3. **Record the date** in tracking spreadsheet (see below)
4. **Note:** You can only request ~10 URLs per day

### 5. Track Progress

Use the tracking spreadsheet template below to monitor progress.

---

## Tracking Spreadsheet Template

Create a Google Sheet or Excel file with these columns:

| Date Requested | URL | Canonical (Live Test) | Status | Re-Crawl Date | Notes |
|---|---|---|---|---|---|
| 2025-11-09 | /blog/track-spending-adhd | ✅ Correct | Requested | - | Priority post |
| 2025-11-09 | /blog/emotional-triggers-impulse-purchases | ✅ Correct | Requested | - | Had GSC errors |
| ... | ... | ... | ... | ... | ... |

**Status Options:**
- `Requested` - Submitted to GSC
- `Re-crawled` - Google has re-crawled (check GSC "Crawl" section)
- `Indexed` - Showing in Google index
- `Fixed` - No longer showing canonical errors in GSC

---

## Monitoring Re-Indexing Progress

### Check GSC Coverage Report

1. Go to **Indexing → Pages** in GSC
2. Look at "Why pages aren't indexed" section
3. Monitor these metrics daily:

| Metric | Current | Target | Trend |
|---|---|---|---|
| "Duplicate, Google chose different canonical" | 9-20+ | 0 | ↓ Should decrease |
| "Indexed, not submitted in sitemap" | 5 | 0 | ↓ Should decrease |
| Indexed pages | 5 | 29 | ↑ Should increase |

### Check Individual URL Status

For any specific URL:
1. Go to **URL Inspection**
2. Enter the URL
3. Check "Last crawl" date
4. Look for canonical tag in "Page indexing" details

### Use Monitoring Scripts

Run the verification scripts daily:

```bash
# Check all canonicals are still correct
./scripts/check-canonicals.sh

# Generate monitoring report
./scripts/monitor-indexing.sh

# Reports saved to: monitoring-reports/indexing-report-YYYY-MM-DD.csv
```

---

## Alternative Methods to Speed Up Re-Crawling

### 1. Update sitemap.xml Timestamps

Already done (commit d03bf1c), but can update again:
- Sitemap automatically updates daily
- Or trigger manual update via API

### 2. Update Blog Post Content

Trigger `updatedAt` field updates in Firebase:

```bash
# Dry run (preview changes)
node scripts/add-updated-dates.js --dry-run

# Apply updates
node scripts/add-updated-dates.js
```

This signals to Google that posts have changed.

### 3. Share on Social Media

- Tweet blog post links (drives traffic, speeds up crawl)
- Share on LinkedIn
- Post in relevant communities

### 4. Add Internal Links

- Link to blog posts from homepage
- Add "Related Posts" sections (already exists)
- Update older posts to link to newer ones

---

## Expected Timeline

| Milestone | Timeframe | How to Verify |
|---|---|---|
| All requests submitted | 3 days (Nov 9-12) | Tracking spreadsheet complete |
| First posts re-crawled | 3-7 days (Nov 12-16) | GSC shows newer "Last crawl" dates |
| Majority re-indexed | 1-2 weeks (Nov 16-23) | GSC indexed count increases |
| All posts re-indexed | 2-4 weeks (Nov 23-Dec 9) | 29 indexed pages, 0 canonical errors |
| X/Twitter unblocks links | 1-3 weeks (after fix) | Test sharing in tweets |

---

## Troubleshooting

### "Canonical still shows /blog in live test"

**Issue:** Edge Function may not be running
**Fix:**
1. Check Vercel deployment status
2. Verify Edge Function headers: `curl -I https://www.impulselog.com/blog/[slug]`
3. Should see `x-edge-function: blog-post`

### "Request indexing is greyed out"

**Issue:** Daily quota reached
**Fix:** Wait 24 hours, continue next day

### "Google still picking wrong canonical"

**Issue:** Google hasn't re-crawled yet
**Fix:**
1. Wait for requested re-crawl
2. Update post content to trigger faster crawl
3. Add internal links to the post

### "Indexed count not increasing"

**Issue:** Google's index takes time to update
**Fix:**
1. Be patient (can take 2-4 weeks)
2. Keep monitoring GSC
3. Verify canonicals are correct via scripts

---

## Success Criteria

You'll know re-indexing is complete when:

- ✅ All 29 blog posts show as "Indexed" in GSC
- ✅ "Duplicate, Google chose different canonical" errors = 0
- ✅ Each post's canonical matches its own URL
- ✅ X/Twitter no longer blocks blog post links
- ✅ Monitoring scripts show 100% correct canonicals
- ✅ Google Search shows blog posts in results

---

## Questions?

- **GSC Documentation:** https://support.google.com/webmasters/answer/7440203
- **Canonical Tag Guide:** https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- **Indexing API Docs:** https://developers.google.com/search/apis/indexing-api/v3/quickstart

---

**Last Updated:** 2025-11-09
**Status:** Active re-indexing campaign
