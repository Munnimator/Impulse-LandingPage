# ImpulseLog Landing Page

Official landing page for ImpulseLog - the iOS app that turns impulse buying into intentional saving.

🌐 **Live Site:** [impulselog.com](https://impulselog.com)

## 🚀 Deployment

This site is automatically deployed to Vercel from the `main` branch.

- **Hosting:** Vercel
- **Domain:** impulselog.com
- **SSL:** Automatic via Vercel

## 📁 Project Structure

```
├── index.html           # Main landing page
├── privacy.html         # Privacy policy
├── terms.html          # Terms of service  
├── script.js           # JavaScript functionality
├── styles.css          # All styling
├── vercel.json         # Vercel deployment config
├── LAUNCH_CHECKLIST.md # Production deployment checklist
└── assets/
    ├── images/         # Optimized app screenshots
    └── icons/          # Favicon files
```

## ✨ Features

- **Responsive design** - Works on all devices
- **Optimized images** - 73% size reduction for fast loading
- **QR code generation** - Dynamic App Store QR codes
- **Lazy loading** - Images load as needed
- **SEO optimized** - Meta tags, Open Graph, structured data
- **Security headers** - XSS protection, content type validation

## 🔧 Local Development

To run locally, simply serve the static files:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## 📱 App Integration

This landing page is designed for the ImpulseLog iOS app:

- **App Repo:** [ImpulseLog iOS App](https://github.com/Munnimator/ImpulseLog)
- **Backend:** Railway + Firebase Functions
- **App Store:** (Coming soon)

## 🛠 Technologies

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - No frameworks
- **Vercel** - Hosting and deployment
- **Google Fonts** - Inter font family

## 📊 Performance

- **Lighthouse Score:** 95+ on all metrics
- **Image Optimization:** WebP with PNG fallbacks
- **Caching:** Static assets cached for 1 year
- **CDN:** Global edge caching via Vercel

## 🚨 Before App Store Launch

Replace these placeholders:

1. **App Store URLs** (4 locations):
   - Current: `https://apps.apple.com/app/impulselog`
   - Replace with: Actual App Store URL

2. **Apple App ID** (1 location):
   - Current: `YOUR_APP_ID`
   - Replace with: Actual numeric App ID

3. **Legal Documents**:
   - Add dates to privacy.html and terms.html
   - Add jurisdiction to terms.html

See `LAUNCH_CHECKLIST.md` for complete details.

## 📞 Contact

- **Support:** support@impulselog.com
- **Website:** impulselog.com
- **Developer:** [@Munnimator](https://github.com/Munnimator)

---

Built with ❤️ for the neurodivergent community