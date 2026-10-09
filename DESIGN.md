---
name: ImpulseLog website
description: A pause you can almost touch.
colors:
  clay-ink: "#171431"
  clay-purple: "#6640cf"
  primary-dark: "#5031ab"
  primary-light: "#b4a0f0"
  clay-lavender: "#e9e2fa"
  clay-mint: "#d4f4e7"
  clay-yellow: "#f5cf5f"
  background: "#faf8ff"
  surface: "#eee8fa"
  text-secondary: "#514765"
  border: "#d4cce6"
  headline-accent: "#5830b4"
  inverse-text: "#f2edff"
  white: "#ffffff"
typography:
  display:
    fontFamily: "'Nunito Clay', 'Atkinson Hyperlegible', sans-serif"
    fontSize: "clamp(60px, 6.6vw, 96px)"
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: "-.025em"
  headline:
    fontFamily: "'Nunito Clay', 'Atkinson Hyperlegible', sans-serif"
    fontSize: "clamp(34px, 4vw, 56px)"
    fontWeight: 900
    lineHeight: 1.12
    letterSpacing: "-.025em"
  title:
    fontFamily: "'Nunito Clay', 'Atkinson Hyperlegible', sans-serif"
    fontSize: "26px"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-.025em"
  body:
    fontFamily: "'Atkinson Hyperlegible', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "'Atkinson Hyperlegible', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Atkinson Hyperlegible', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.6
rounded:
  field: "8px"
  button: "14px"
  panel: "16px"
  badge: "10px"
  device: "32px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "3rem"
  gutter-desktop: "40px"
  gutter-tablet: "28px"
  gutter-mobile: "24px"
  section-mobile: "60px"
  section-standard: "80px"
  section-generous: "90px"
components:
  button-primary:
    backgroundColor: "{colors.clay-purple}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.clay-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "16px 32px"
  button-large:
    rounded: "{rounded.button}"
    padding: "16px 24px"
  navigation:
    backgroundColor: "{colors.background}"
    height: "80px"
  calculator-input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.clay-ink}"
    rounded: "{rounded.field}"
    padding: "16px"
  faq-disclosure:
    textColor: "{colors.text-secondary}"
    padding: "25px 0"
  pricing-free:
    backgroundColor: "#eee7fb"
    textColor: "{colors.clay-ink}"
    padding: "40px"
  pricing-premium:
    backgroundColor: "#d5f3e7"
    textColor: "{colors.clay-ink}"
    padding: "40px"
  savings-badge:
    backgroundColor: "#bfdfd0"
    textColor: "#23483a"
    rounded: "{rounded.badge}"
    padding: "8px 24px"
  reading-card:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.panel}"
    padding: "24px"
---

# Design System: ImpulseLog website

## Overview

**Creative North Star: "A pause you can almost touch."**

The website carries the user-approved soft clay identity from ImpulseLog's App Store creative. Matte sculptures make the moment before a purchase tangible. Heavy rounded headlines and generous quiet space give the invitation to pause a friendly, direct voice; readable body type keeps the explanation grounded.

Lavender introductions, mint progress sections, deep navy reading passages, and violet download moments create rhythm across the public website. Conceptual clay artwork sits alongside genuine app screenshots. This system describes the marketing website only; it does not prescribe a new native app interface or a replacement app icon.

**Key Characteristics:**
- Matte clay sculptures with transparent surroundings and soft embedded shadows.
- Self-hosted rounded Nunito display type with Atkinson Hyperlegible body text.
- Broad tonal sections, quiet dividers, and restrained interface elevation.
- Semantic headings, visible focus, native disclosures, and reduced-motion support.

Source authority: the final cascade in `assets/css/clay-brand.css`, with retained base rules in `styles.css` and supporting-page styles. The frontmatter records implemented primitives; the sidecar carries states, shadows, motion, and responsive details.

## Colors

The palette places saturated violet actions against light lavender and mint surfaces, with deep navy for readable contrast and a golden clay accent in the artwork.

### Primary
- **Clay Violet** (`clay-purple`): primary buttons, active screenshot navigation, and closing download sections.
- **Deep Violet** (`primary-dark`): primary button hover state.
- **Light Violet** (`primary-light`): retained light accent token used by the shared base stylesheet.
- **Headline Violet** (`headline-accent`): emphasized display wording and contextual links.

### Secondary
- **Quiet Lavender** (`clay-lavender`): hero and introductory backgrounds.
- **Progress Mint** (`clay-mint`): progress passages and highlighted calculator results. The pricing pair uses its observed local mint variant.

### Tertiary
- **Golden Clay** (`clay-yellow`): the sculptural accent and text-selection background.

### Neutral
- **Deep Navy** (`clay-ink`): primary text, dark story passages, footer, and screenshot labels.
- **Soft Paper** (`background`): navigation, reading surfaces, and general page background.
- **Lavender Surface** (`surface`): screenshot and FAQ sections.
- **Muted Plum** (`text-secondary`): explanatory body copy.
- **Lavender Border** (`border`): quiet reading-card borders.
- **Inverse Lavender** (`inverse-text`) and **White** (`white`): text on dark surfaces and primary actions.

**The Tonal Passage Rule.** Let section color carry the large-scale rhythm; avoid adding decorative gradients to the new clay system.

## Typography

**Display Font:** self-hosted Nunito at weight 900, registered as `Nunito Clay`, with Atkinson Hyperlegible and sans-serif fallbacks.

**Body Font:** self-hosted Atkinson Hyperlegible at weights 400 and 700, with the observed system fallbacks in the frontmatter.

The broad, rounded display face echoes the sculpture silhouettes. The body face supplies crisp, distinct letterforms for descriptions, navigation, forms, legal text, and functional labels.

### Hierarchy
- **Display:** homepage hero; the frontmatter records its desktop clamp. At 1100px and below it becomes 74px; at 900px and below it uses `clamp(48px, 7.9vw, 70px)`; at 640px and below it uses `clamp(44px, 11.7vw, 68px)`.
- **Headline:** section headings, with the frontmatter's fluid scale; homepage section headings become 36px on mobile. Supporting-page headlines use `clamp(36px, 4.3vw, 62px)` and become 40px on mobile.
- **Title:** the 26px step heading is the reusable title sample. Other observed titles range from 22px trust headings to 30px plan names, keeping the same rounded face and weight.
- **Body:** base paragraphs use the frontmatter's normal text rhythm. Section summaries are 19px, becoming 18px on mobile, and are constrained to 65ch where the layout allows.
- **Lead:** hero explanation uses a 43ch measure, becoming 19px below 1100px and 18px on mobile.
- **Label:** bold body type identifies actions and navigation. The 17px large button and 14px small button are component variants, not new display roles.

**The Real Text Rule.** Render headings, descriptions, and actions as semantic HTML text; clay images provide imagery rather than substitute interface copy.

## Layout

Center the main content in the observed 1280px container. Horizontal gutters step from desktop (40px) to tablet (28px at 900px) to mobile (24px at 640px). Existing pages use content-specific reading widths: FAQ content reaches 950px, the pricing pair 1000px, and legal content 850px.

Desktop hero composition uses two columns (`1.14fr .96fr`) with a small gap and a large transparent sculpture. At 640px it becomes a vertical flow: headline, explanation, actions, essential facts, then the complete compact sculpture. The mobile App Store action fills the content width; its secondary action becomes an underlined text control. Keep those choices specific to hero composition rather than requiring every surface to use them.

Homepage sections generally use the recorded standard and generous section spacing, becoming 60px on mobile. Supporting-page sections use 70px, becoming 48px on mobile. Guide previews use three columns with a 32px gap, then one column at 640px. Two-column pricing collapses according to its retained base breakpoint at 768px; its final mobile padding is 28px. Blog and legal pages retain reading-oriented layouts.

The fixed navigation is 80px tall, reducing to 72px on mobile. Hero and blog top padding clears it; shared anchor scroll padding is 96px. Navigation links switch to a 44px menu control at 900px.

## Elevation & Depth

The artwork supplies most of the tactile depth through matte surfaces and soft sculptural shadows. The interface uses broad flat color areas, fine dividers, and selective soft shadows on actions and devices. Value rows, steps, FAQ rows, guide text containers, and the pricing panels remain flat. The navigation is opaque and unblurred, without a shadow.

### Shadow Vocabulary
- **Action:** `0 5px 14px #33206321` beneath primary buttons.
- **Screenshot device:** `0 22px 42px #22163d25` beneath the homepage iPhone frames.
- **Supporting device:** `0 18px 35px #261c4326` beneath supporting-page device surfaces.
- **Mobile menu:** `0 15px 25px #17143115` below the open navigation panel.
- **Floating action:** `0 8px 22px #17143125` beneath the floating download control.
- **Inverse action:** `0 6px 15px #25114530` beneath the light button on the violet closing section.

**The Clay Depth Rule.** Keep sculpture depth in the artwork and interface depth selective; do not turn every content row into a raised card.

## Shapes

Buttons have softly rounded corners, panels and illustration fields use a slightly broader curve, and inputs use a tighter curve. Pricing is one clipped rounded container holding two flat plan panels. FAQ and benefit rows use straight dividers rather than individually rounded boxes. Genuine app screens keep their device framing; the clay images keep their full sculptural silhouettes.

Artwork lives in `assets/images/clay-2026/`: `pause.webp`, `timer.webp`, `goals.webp`, and `adhd.webp`, each with its prompt sidecar. They retain transparent backgrounds and matte lavender/violet, mint, navy, and golden material colors consistent with the approved App Store artwork. `social-preview.png` is a separate social composition with its exact generation prompt embedded. Preserve the genuine app icon and screenshots.

## Components

### Buttons

Friendly, legible, and softly lifted. Primary actions use Clay Violet and white text; secondary actions use a transparent fill, navy text, and a fine lavender stroke. Large and small variants retain the observed size differences. Primary hover deepens the violet; secondary hover adds a lavender fill. Buttons do not lift or translate on hover. Color and shadow transitions last 0.2s; reduced motion removes the transition.

The closing violet section uses an inverse light primary action. On navy passages, secondary actions use light text and a muted violet border. The global focus treatment uses a visible 3px outline with a 5px offset; existing native disclosure focus rules keep their 4px offset.

### Navigation

Opaque Soft Paper bar, genuine app icon, rounded display wordmark, bold Atkinson links, and a primary download control. The mobile panel shares the bar's background and fine lower border. Use the existing menu button, expanded state, and close behavior; do not create a separate navigation pattern for supporting pages.

### Cards / Containers

Benefit and guide copy are open containers. Guide artwork has a rounded tonal field; it may use lavender, navy, or mint behind the sculpture. Blog reading cards use a quiet border and rounded corners without a shadow. The Free/Premium comparison is a joined lavender-and-mint pair, with no raised featured plan. Plan content remains governed by current product facts.

### Chips

The existing savings badge is compact, mint-toned, and softly rounded. It communicates a factual pricing annotation. It is not a model for decorative eyebrow labels.

### Inputs / Fields

The optional calculator's number fields use Soft Paper, navy input text, centered figures, a fine lavender border, and the tighter field curve. Retain the input label, prefix relationship, and numeric behavior. Highlighted results use mint; totals use the headline accent and tabular numerals.

### Native Disclosures

FAQ questions and the optional calculator use native `details`/`summary`. FAQ rows have a minimum 44px summary target and a lower divider; the calculator summary has a minimum 48px target inside a rounded tonal container. Expanded answers retain a readable text measure. Keep the native open state and keyboard behavior.

### Sculptural Pause

The pause sculpture is the signature image, not a control. Deliberate hero-image hover or focus on a hero action triggers one 0.9s settling motion: rise gently and rotate slightly, then return to rest. Reduced motion removes the animation. Generic entrance fades are suppressed; there is no looping decorative animation.

## Do's and Don'ts

### Do:
- **Do** use the approved clay artwork and preserve its matte material, transparent edges, and full silhouettes.
- **Do** pair rounded Nunito display text with readable Atkinson body text.
- **Do** let broad lavender, mint, navy, and violet passages establish rhythm.
- **Do** show genuine app screens alongside conceptual illustrations and retain the existing app icon.
- **Do** preserve semantic text, visible keyboard focus, native disclosures, readable contrast, and reduced-motion behavior.

### Don't:
- **Don't** turn conceptual clay illustrations into fabricated app screenshots or product evidence.
- **Don't** inherit unused legacy gradients as the new system's color or elevation rules.
- **Don't** add decorative eyebrow labels or raise every content container into a card.
- **Don't** loop the sculpture animation or restore generic entrance fades.
- **Don't** treat this website system as authorization to redesign the native app or change product claims, pricing, or entitlements.
