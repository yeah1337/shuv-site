# Handoff: Shuv marketing + legal site

## Overview
Static website for **Shuv**, an iOS/Android skateboarding coach app (the mascot Rash grades your ollie in real time). The site has two jobs:
1. Explain the app on the home page (`index.html`).
2. Host the **privacy policy** (`privacy.html`) and **terms of service** (`terms.html`) at stable public URLs, plus a support contact. Apple and Google both require a reachable privacy policy URL and a support URL before they will review the app.

## About these files
`site/` is a **working, production-ready static site**: plain HTML, CSS and JavaScript, with no framework, build step or dependencies. It is also the approved hi-fi design reference.

- **Option A (simplest):** deploy `site/` as-is to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages). Then work through "Before launch" below.
- **Option B:** port it into an existing codebase or framework. Recreate the markup and CSS with that codebase's patterns and keep the behaviour described under "Interactions".

**There is one set of files for phone and desktop.** The phone layout is the default, and `css/shuv.css` switches to the desktop layout at `min-width: 900px`. Don't split it into separate mobile pages.

Outstanding work is tracked in `docs/WEBSITE-LAUNCH-NOTES.md` in the app repo, not in this folder.

## Fidelity
**High fidelity.** Final colours, type, spacing, artwork positions and interactions, signed off by the owner against their phone and desktop mockups. Match it closely.

## Files
```
site/
  index.html      home page
  privacy.html    privacy policy   → store "Privacy Policy URL"
  terms.html      terms of service → store "Terms / EULA" link
  css/shuv.css    all styles, commented by section (tokens at the top, desktop overrides at the bottom)
  js/shuv.js      all behaviour, 7 numbered parts
  assets/         only the images the site uses
```

## Pages

### index.html (home), top to bottom
| Section | Anchor | Phone | Desktop (900px+) |
|---|---|---|---|
| Header | – | logo centred, hamburger right | logo left, text links right |
| Hero | `#top` | Rash, then headline; "Coming soon" store boxes pinned to Rash's bottom right | Rash left, headline right; store boxes bottom left |
| Pop. Slide. Land. | – | card, then illustrated scene | scene left, card right |
| Tutorial | `#tutorial` | 3 rows, picture above its card | rows alternate picture side |
| Why choose Shuv? | – | centred list separated by rules | same, wider |
| Shuv Pro | `#pro` | art, then Free vs Pro card ($5.99/month, 4 days free) | art left, card right |
| Safety | `#safety` | pink bordered box, 5 bullets, fallen Rash | same, max 960px |
| Contact | `#contact` | form + social icons | same, max 900px |
| Footer | – | support/privacy emails, privacy + TOS links, "Ages 13+" | same |

**Pop scene:** a fixed-aspect box (`aspect-ratio: 1080/1645`). The skater, the three app UI pills (1 COMBO, AUTO · WATCHING, REC), Rash and the speech bubble are absolutely positioned in % of the box (see `.pop-scene__*` in css section 7). The bubble is sized in `cqw` container units, so the whole scene scales like one picture. Desktop adds 72px above and below so it stays clear of the store badges and the TUTORIAL heading.

### privacy.html / terms.html
Big outlined title (pink for privacy, periwinkle for terms), a rule, the "Last updated" date, then numbered `h2` sections of body text. The privacy page ends with a **Support** section (`#support`) with both emails. Each page links to the other at the bottom.

## Interactions
- **Page fade:** every page fades in over 0.35s (CSS `body` animation). Clicking a link to another page fades out over 0.3s and then navigates (`js` part 3). Pages restored from the back/forward cache are un-faded.
- **Section links:** `#section` links smooth scroll without reloading and update the URL hash. Arriving at `index.html#tutorial` from a legal page lands on that section, re-aligned after fonts load (`js` part 4). Scroll targets stop below the sticky header, whose measured height is kept in `--header-h`.
- **Phone menu:** the hamburger slides a panel in from the right (0.42s, `cubic-bezier(.22,.8,.24,1)`). It closes on a link, the pink close button, a tap outside, Esc, or resizing to desktop. It scrolls if taller than the screen.
- **Jello press:** elements with class `jello` (nav links, menu links, buttons) squash and stretch over 0.6s on press.
- **Buttons:** 4px cobalt border with a hard `0 8px 0` cobalt shadow. On `:active` they move down 8px and the shadow collapses.
- **Contact form:** browser validation (all fields required, email format), then it opens the visitor's email app with a pre-filled message to support@shuvskate.com. It also posts to the `contact` Edge Function, which stores the message and emails a notification.
- **Reduced motion:** all fades, slides and wobbles are off when the OS asks for reduced motion.

## Design tokens
**Colours** (from the app theme):
- cobalt `#2742dd` (borders, depth shadows)
- periwinkle `#7382f0` (primary)
- periwinkle soft `#7f9cff` (nav, outlined headings)
- ink `#1b2150`
- body text `#6d78b4`
- muted `#8088b8`
- panel `#eef1ff`
- rule `#d9e0fb`
- green `#22c97a`
- pink `#ff5a9e` / `#c2185b`
- legal bold `#4f5aa0`

**Type:** Michroma (Google Fonts) for everything; it has one weight.
- **Bold:** faked with `-webkit-text-stroke` in the text's own colour, `0.03em` for body and `~0.045em` for headings.
- **Outlined headings:** white text ringed by 48 hard `text-shadow`s at radius `0.15em` (`.outline`). This is the same ratio as the app's 3px outline on 20px text. Don't replace it with `-webkit-text-stroke`, which gives sharp corners.
- **Scale:** tokens `--h1 --big --ch --body --btn` in `:root`.
  - Phone sizes follow `vw` (capped for tablets).
  - Desktop sizes are `min(vw, px)`.

**Shape:**
- **Borders:** cards 4px, badges 3px, safety box 6px, menu 6px.
- **Radii:** cards 28px, buttons 24px, inputs 22px, badges 14px (phone) / 16px (desktop), safety box 48px, menu 56px on its left side.
- **Shadows:** hard only, no blur. Cards and buttons `0 8px 0`, badges `0 5px 0`, in cobalt.

## Assets
All art was supplied by the owner and cropped/cleaned for the web. The UI pills were cut from the owner's mockup, and the logo is the app's own SVG.
- **Home page:** `hero-rash`, `girl-ollie`, `pill-combo`, `pill-auto`, `pill-rec`, `rash-yell`, `tut-solo`, `tut-centered`, `tut-friend`, `ollie-snap`, `safety-fallen` (all PNG).
- **Every page:** `logo.svg` in the header.
- **Third party:** none. Michroma is self-hosted from `assets/fonts/`, and
  the social icons are local SVGs in `assets/social/`.

## Before launch

**Not in this file.** See `docs/WEBSITE-LAUNCH-NOTES.md` in the app repo.

This README is inside the folder that gets deployed, so anything written
here is served publicly next to the pages it talks about — which is the
wrong home for a checklist about what is unfinished, who has not reviewed
the legal text, and which artwork is forbidden and why.

## Audit: already fixed in this export
- **Code cleanup:**
  - Rebuilt from the design tool's output as plain HTML/CSS/JS, with no runtime or build step.
  - Removed bloat: dead parallax code, duplicate phone/desktop headers and badges, unused CSS variables, and about 3KB of outline styles repeated on every heading (now one class).
  - Pages went from about 53KB to 10 to 16KB each.
- **Images:** every image has `width`/`height`, so there's no layout shift and anchor jumps land correctly. Images below the fold load lazily, and the oversized pill images were resized.
- **Bug fixes:**
  - Social icon placeholders (`href="#"`) used to scroll the page to the top. They're now a no-op.
  - Email and external links no longer trigger the page fade-out.
  - Pages no longer stay faded after pressing Back.
  - On small iPhones the form fields were under 16px, so Safari zoomed in. They're now at least 16px.
  - On tablets (600 to 899px wide) the phone type scaled up to about 35px body text. It's now capped.
  - On very wide screens the anchor offset was fixed, so headings could hide under the header. It now uses the measured header height.
- **Phone menu:** added Esc to close, focus handling and `aria-expanded`. It now scrolls on short or landscape phones and closes on resize to desktop.
- **Accessibility and SEO:**
  - Added page titles, descriptions and `lang`.
  - Legal headings are now `h2` (they were `h3` under the `h1`).
  - The Pro table has proper headers and screen-reader labels for the ticks and dashes.
  - The safety bullets are a real list.

## Browser support
Current Chrome, Edge, Firefox, and Safari 16+ (iOS 16+). Needed for container query units in the speech bubble, `overflow-x: clip`, and the `scale` property in the jello effect.
