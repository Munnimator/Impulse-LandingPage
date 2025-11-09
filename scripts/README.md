# ImpulseLog Scripts

This directory contains scripts for monitoring and managing blog post canonical tags and Google indexing.

---

## Scripts Overview

### 1. `check-canonicals.sh`
**Purpose:** Verify all blog posts have correct self-referencing canonical tags

**Usage:**
```bash
./scripts/check-canonicals.sh
```

**Output:**
- ✅ Green checkmark for correct canonicals
- ❌ Red X for missing or incorrect canonicals
- Summary report at the end

**When to Use:**
- After deploying canonical tag fixes
- Daily monitoring during re-indexing period
- Before requesting Google re-indexing
- Any time you suspect canonical issues

**Example Output:**
```
✓ adhd-spending-triggers-savings-goals
✓ emotional-triggers-impulse-purchases
...
========================================
  Summary
========================================
Total posts checked:  29
Correct canonicals:   29
Incorrect canonicals: 0
✅ All blog posts have correct canonical tags!
```

---

### 2. `monitor-indexing.sh`
**Purpose:** Comprehensive monitoring including canonicals AND Edge Function headers

**Usage:**
```bash
# Generate today's report
./scripts/monitor-indexing.sh

# Custom output file
./scripts/monitor-indexing.sh custom-report.csv
```

**Output:**
- CSV report saved to `monitoring-reports/indexing-report-YYYY-MM-DD.csv`
- Terminal summary with color-coded status
- Tracks Edge Function headers (x-edge-function, x-post-status)

**When to Use:**
- Daily monitoring during re-indexing campaign
- Tracking re-indexing progress over time
- Debugging Edge Function issues
- Creating reports for stakeholders

**CSV Format:**
```csv
Date,Slug,URL,Canonical,Canonical_Status,Edge_Function,Post_Status,Response_Code
2025-11-09,"track-spending-adhd","https://...","https://...","CORRECT","blog-post","validated","200"
```

**Tracking Over Time:**
```bash
# Run daily
./scripts/monitor-indexing.sh

# Compare reports
diff monitoring-reports/indexing-report-2025-11-09.csv \
     monitoring-reports/indexing-report-2025-11-10.csv
```

---

### 3. `add-updated-dates.js`
**Purpose:** Update all blog posts' `updatedAt` timestamp to trigger Google re-crawl

**Setup:**
Requires Firebase Admin credentials in environment variables:
```bash
export FIREBASE_CLIENT_EMAIL="your-email@project.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Usage:**
```bash
# Dry run (preview changes without applying)
node scripts/add-updated-dates.js --dry-run

# Apply updates
node scripts/add-updated-dates.js
```

**When to Use:**
- **Before** requesting re-indexing in Google Search Console
- Signals to Google that content has changed
- Triggers faster crawl priority
- **Warning:** Only use once, not repeatedly (could be seen as manipulation)

**Output:**
```
ℹ Fetching published blog posts from Firestore...
✓ Found 29 published blog posts

Updating Posts
✓ Updated: adhd-spending-triggers-savings-goals
✓ Updated: emotional-triggers-impulse-purchases
...

Summary
Total posts:     29
Updated:         29
✓ All posts updated successfully!
```

---

## Workflows

### Daily Monitoring Workflow

```bash
# 1. Check all canonicals are correct
./scripts/check-canonicals.sh

# 2. Generate detailed monitoring report
./scripts/monitor-indexing.sh

# 3. Review report
cat monitoring-reports/indexing-report-$(date +%Y-%m-%d).csv
```

### Pre-Deployment Verification

```bash
# Before deploying any canonical tag changes:
./scripts/check-canonicals.sh

# After deployment:
sleep 60  # Wait for CDN to propagate
./scripts/check-canonicals.sh  # Verify again
```

### Re-Indexing Campaign Workflow

```bash
# 1. Update all post timestamps (ONCE, before requesting indexing)
node scripts/add-updated-dates.js --dry-run  # Preview
node scripts/add-updated-dates.js            # Apply

# 2. Verify canonicals are correct
./scripts/check-canonicals.sh

# 3. Request indexing in Google Search Console (manual)
# See: ../docs/reindex-workflow.md

# 4. Monitor progress daily
./scripts/monitor-indexing.sh

# 5. Track changes over time
ls -l monitoring-reports/
```

---

## Troubleshooting

### "Permission denied" when running scripts

**Fix:**
```bash
chmod +x scripts/check-canonicals.sh
chmod +x scripts/monitor-indexing.sh
chmod +x scripts/add-updated-dates.js
```

### "Firebase credentials not found"

**For `add-updated-dates.js` only:**
```bash
# Set environment variables
export FIREBASE_CLIENT_EMAIL="your-email@project.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="$(cat path/to/private-key.pem)"
```

Or create `.env` file (DO NOT commit to git):
```bash
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

### "curl: command not found"

**Fix:** Install curl:
```bash
# macOS (should be pre-installed)
brew install curl

# Linux
sudo apt-get install curl

# Windows (WSL)
sudo apt-get install curl
```

### "No blog posts found in sitemap"

**Issue:** Sitemap may be down or empty
**Fix:**
```bash
# Verify sitemap is accessible
curl -s https://www.impulselog.com/sitemap.xml | head -20

# Check for blog post URLs
curl -s https://www.impulselog.com/sitemap.xml | grep "/blog/" | wc -l
```

---

## Automation

### Set up daily monitoring with cron

```bash
# Edit crontab
crontab -e

# Add daily monitoring at 9 AM
0 9 * * * cd /path/to/Impulse-LandingPage && ./scripts/monitor-indexing.sh >> monitoring.log 2>&1
```

### GitHub Actions (optional)

Create `.github/workflows/check-canonicals.yml`:
```yaml
name: Check Canonicals
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check canonical tags
        run: ./scripts/check-canonicals.sh
```

---

## Related Documentation

- **Re-Indexing Workflow:** `../docs/reindex-workflow.md`
- **Canonical Tag Fix History:** Git commits `31871d6`, `1844bf8`
- **Edge Function Code:** `../api/blog/[slug].js`
- **Google's Canonical Guide:** https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

---

## Maintenance

These scripts should be run:
- **check-canonicals.sh:** Daily during re-indexing, weekly afterward
- **monitor-indexing.sh:** Daily during re-indexing, weekly afterward
- **add-updated-dates.js:** Once only (before re-indexing campaign)

After Google has fully re-indexed (all 29 posts showing as indexed in GSC):
- Reduce monitoring to weekly
- Keep scripts for future use if issues arise
- Archive old monitoring reports after 90 days

---

**Last Updated:** 2025-11-09
**Maintained By:** ImpulseLog Development Team
