#!/bin/bash
# Canonical Tag Verification Script for ImpulseLog Blog
# This script checks all blog posts to ensure they have correct self-referencing canonical tags
#
# Usage: ./scripts/check-canonicals.sh
# Output: Reports any posts with incorrect or missing canonical tags

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ImpulseLog Canonical Tag Checker${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Fetch sitemap and extract blog post URLs
echo -e "${YELLOW}Fetching blog post URLs from sitemap...${NC}"
BLOG_URLS=$(curl -s "https://www.impulselog.com/sitemap.xml" | \
  grep -o '<loc>https://www.impulselog.com/blog/[^<]*</loc>' | \
  sed 's/<loc>//;s/<\/loc>//')

TOTAL_POSTS=$(echo "$BLOG_URLS" | wc -l | tr -d ' ')
echo -e "${GREEN}Found ${TOTAL_POSTS} blog posts${NC}"
echo ""

# Counter for errors
ERRORS=0
CORRECT=0

# Check each blog post
while IFS= read -r url; do
  # Extract slug from URL
  slug=$(echo "$url" | sed 's|.*/||')

  # Fetch the canonical tag from the live page
  canonical=$(curl -s "$url" | \
    grep -o '<link[^>]*rel="canonical"[^>]*>' | \
    sed -n 's/.*href="\([^"]*\)".*/\1/p' | \
    head -1)

  # Expected canonical URL
  expected="$url"

  # Compare canonical with expected
  if [ -z "$canonical" ]; then
    echo -e "${RED}❌ MISSING: $slug${NC}"
    echo -e "   ${RED}No canonical tag found${NC}"
    ERRORS=$((ERRORS + 1))
  elif [ "$canonical" != "$expected" ]; then
    echo -e "${RED}❌ MISMATCH: $slug${NC}"
    echo -e "   ${YELLOW}Expected:${NC} $expected"
    echo -e "   ${YELLOW}Got:${NC}      $canonical"
    ERRORS=$((ERRORS + 1))
  else
    echo -e "${GREEN}✓${NC} $slug"
    CORRECT=$((CORRECT + 1))
  fi
done <<< "$BLOG_URLS"

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total posts checked:  ${TOTAL_POSTS}"
echo -e "${GREEN}Correct canonicals:   ${CORRECT}${NC}"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}Incorrect canonicals: ${ERRORS}${NC}"
  echo ""
  echo -e "${GREEN}✅ All blog posts have correct canonical tags!${NC}"
  exit 0
else
  echo -e "${RED}Incorrect canonicals: ${ERRORS}${NC}"
  echo ""
  echo -e "${RED}⚠️  Found ${ERRORS} posts with incorrect or missing canonicals${NC}"
  exit 1
fi
