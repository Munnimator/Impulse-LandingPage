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
├── index.html            # Main landing page
├── blog.html             # Blog archive template
├── blog-post.html        # Blog post template
├── api/                  # Vercel blog and sitemap functions
├── privacy.html          # Privacy policy
├── terms.html            # Terms of service
├── script.js             # Shared browser behavior
├── styles.css            # Shared landing-page styling
├── vercel.json           # Vercel routes and security headers
├── test/                 # Node test suite
├── LAUNCH_CHECKLIST.md   # Production deployment checklist
└── assets/
    ├── images/         # Optimized app screenshots
    └── icons/          # Favicon files
```

## ✨ Features

- **Responsive design** - Works on all devices
- **Current app screenshots** - Lazy-loaded below the initial viewport
- **QR code generation** - Dynamic App Store QR codes
- **Lazy loading** - Images load as needed
- **SEO optimized** - Meta tags, Open Graph, structured data
- **Security headers** - XSS protection, content type validation

## 🔧 Local Development

Install dependencies and run the local server:

```bash
npm ci
npm run dev
```

Then visit `http://localhost:3000`.

Run automated checks with:

```bash
npm test
```

Blog API routes require the Firebase and webhook variables documented in `.env.example` and `BLOG_SETUP.md`.

## 📱 App Integration

This landing page is designed for the ImpulseLog iOS app:

- **App Repo:** [ImpulseLog iOS App](https://github.com/Munnimator/ImpulseLog)
- **Backend:** Railway + Firebase Functions
- **App Store:** [Impulse Log](https://apps.apple.com/us/app/impulse-log-adhd-finances/id6747727094)

## 🛠 Technologies

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - No frameworks
- **Vercel** - Hosting and deployment
- **Google Fonts** - Atkinson Hyperlegible

## 📊 Analytics

Google Analytics 4 is loaded through `assets/js/analytics.js`. App Store links include campaign metadata and emit an `app_store_click` event.

## 📞 Contact

- **Support:** support@impulselog.com
- **Website:** impulselog.com
- **Developer:** [@Munnimator](https://github.com/Munnimator)

---

Built with ❤️ for the neurodivergent community
