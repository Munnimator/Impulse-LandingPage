#!/bin/bash
# Blog Post Indexing Monitoring Script for ImpulseLog
# This script checks canonical tags AND Edge Function headers for all blog posts
# Outputs a CSV report for tracking re-indexing progress over time
#
# Usage: ./scripts/monitor-indexing.sh [output_file]
# Default output: monitoring-reports/indexing-report-YYYY-MM-DD.csv

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get output filename
DATE=$(date +%Y-%m-%d)
OUTPUT_DIR="monitoring-reports"
OUTPUT_FILE="${1:-$OUTPUT_DIR/indexing-report-$DATE.csv}"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ImpulseLog Indexing Monitor${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Generating monitoring report...${NC}"
echo -e "${YELLOW}Date: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo ""

# Create CSV header
echo "Date,Slug,URL,Canonical,Canonical_Status,Edge_Function,Post_Status,Response_Code" > "$OUTPUT_FILE"

# Fetch sitemap and extract blog post URLs
BLOG_URLS=$(curl -s "https://www.impulselog.com/sitemap.xml" | \
  grep -o '<loc>https://www.impulselog.com/blog/[^<]*</loc>' | \
  sed 's/<loc>//;s/<\/loc>//')

TOTAL_POSTS=$(echo "$BLOG_URLS" | wc -l | tr -d ' ')
echo -e "${GREEN}Checking ${TOTAL_POSTS} blog posts...${NC}"
echo ""

# Counters
CORRECT=0
ERRORS=0
EDGE_WORKING=0

# Check each blog post
while IFS= read -r url; do
  # Extract slug from URL
  slug=$(echo "$url" | sed 's|.*/||')

  # Create a temporary file for headers
  TEMP_HEADERS=$(mktemp)

  # Fetch page with headers
  http_code=$(curl -s -w "%{http_code}" -D "$TEMP_HEADERS" "$url" -o /dev/null)

  # Extract canonical from HTML
  canonical=$(curl -s "$url" | \
    grep -o '<link[^>]*rel="canonical"[^>]*>' | \
    sed -n 's/.*href="\([^"]*\)".*/\1/p' | \
    head -1)

  # Extract Edge Function headers
  edge_function=$(grep -i "x-edge-function:" "$TEMP_HEADERS" | cut -d' ' -f2 | tr -d '\r' || echo "")
  post_status=$(grep -i "x-post-status:" "$TEMP_HEADERS" | cut -d' ' -f2 | tr -d '\r' || echo "")

  # Clean up temp file
  rm -f "$TEMP_HEADERS"

  # Determine canonical status
  if [ -z "$canonical" ]; then
    canonical_status="MISSING"
    status_symbol="${RED}❌${NC}"
    ERRORS=$((ERRORS + 1))
  elif [ "$canonical" != "$url" ]; then
    canonical_status="MISMATCH"
    status_symbol="${RED}❌${NC}"
    ERRORS=$((ERRORS + 1))
  else
    canonical_status="CORRECT"
    status_symbol="${GREEN}✓${NC}"
    CORRECT=$((CORRECT + 1))
  fi

  # Check Edge Function
  if [ "$edge_function" = "blog-post" ]; then
    EDGE_WORKING=$((EDGE_WORKING + 1))
  fi

  # Output progress
  echo -e "${status_symbol} $slug ${YELLOW}(${canonical_status}, Edge: ${edge_function:-none}, Status: ${post_status:-none})${NC}"

  # Write to CSV
  echo "$DATE,\"$slug\",\"$url\",\"$canonical\",\"$canonical_status\",\"$edge_function\",\"$post_status\",\"$http_code\"" >> "$OUTPUT_FILE"

done <<< "$BLOG_URLS"

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total posts checked:      ${TOTAL_POSTS}"
echo -e "${GREEN}Correct canonicals:       ${CORRECT}${NC}"
echo -e "${GREEN}Edge Function working:    ${EDGE_WORKING}${NC}"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}Incorrect canonicals:     ${ERRORS}${NC}"
  echo ""
  echo -e "${GREEN}✅ All systems operational!${NC}"
else
  echo -e "${RED}Incorrect canonicals:     ${ERRORS}${NC}"
  echo ""
  echo -e "${RED}⚠️  Found issues that need attention${NC}"
fi

echo ""
echo -e "${BLUE}Report saved to: ${OUTPUT_FILE}${NC}"
echo ""
echo -e "${YELLOW}Tip: Run this daily to track Google re-indexing progress${NC}"
echo -e "${YELLOW}     Compare reports over time to see improvements${NC}"

exit 0
