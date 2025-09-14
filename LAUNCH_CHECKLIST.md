# ImpulseLog Landing Page - Launch Checklist

## 🔴 CRITICAL - Must Update Before Launch

### 1. App Store URLs
**Current placeholders to replace:**
- `https://apps.apple.com/app/impulselog` (appears in 4+ locations)

**Locations to update:**
- Line 77: Hero CTA button
- Line 417: Final CTA button  
- Line 486: Floating CTA button
- QR code generation in script.js

**How to get real URL:**
1. Submit app to App Store Connect
2. Get actual App Store URL (format: `https://apps.apple.com/us/app/impulselog/idXXXXXXXXXX`)
3. Replace all placeholder URLs

### 2. Apple Smart App Banner
**Current placeholder:**
- Line 16: `<meta name="apple-itunes-app" content="app-id=YOUR_APP_ID">`

**How to fix:**
1. Get your actual App ID from App Store Connect (just the numbers)
2. Replace `YOUR_APP_ID` with actual ID

### 3. Legal Documents
**Need to add dates to:**
- `/privacy.html` - Replace `[DATE]` with actual date
- `/terms.html` - Replace `[DATE]` and `[JURISDICTION]`

## 🟡 IMPORTANT - Should Complete Before Launch

### 4. Favicon Files
**Status:** SVG favicon created ✅, PNG files need generation ❌

**Todo:**
1. Use favicon generator (realfavicongenerator.net)
2. Generate proper PNG files in `/assets/icons/`
3. Test on different browsers

### 5. Analytics & Tracking
**Missing:**
- Google Analytics 4
- Conversion tracking
- Heat mapping (optional)

### 6. Performance Optimizations
**Completed:** ✅
- Image optimization (73% size reduction)
- Lazy loading implemented
- QR code generation working

## 🟢 NICE TO HAVE - Future Improvements

### 7. Email Collection
**Decision:** Removed Android waitlist ✅
**Alternative:** Could add general newsletter signup

### 8. SEO Enhancements
- Add structured data markup
- Create sitemap.xml
- Add Open Graph images

### 9. Security
- Add Content Security Policy headers
- Implement HTTPS headers

## Quick Reference - File Locations

```
landing-page/
├── index.html              # Main landing page
├── privacy.html            # Privacy policy 
├── terms.html              # Terms of service
├── script.js               # JavaScript (QR code generation)
├── styles.css              # All styles
└── assets/
    ├── images/             # Optimized screenshots
    └── icons/              # Favicon files (needs completion)
```

## Final Testing Checklist

Before going live:
- [ ] Test on iPhone Safari
- [ ] Test on desktop browsers
- [ ] Verify all App Store links work
- [ ] Check QR code scans correctly
- [ ] Test Privacy/Terms pages load
- [ ] Verify all images load properly
- [ ] Test responsive design on mobile

## Hosting Options

**Recommended:**
- Vercel (free tier, custom domain)
- Netlify (free tier, forms)
- Firebase Hosting (already using Firebase)

**Current setup:** Express.js dev server (localhost only)