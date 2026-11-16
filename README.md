# NOCTIS — Electric Grand Tourer

> *"The city is in total blackout at night. The car's light is the only light in the world."*

A premium, minimal, single-page scrollytelling website for **NOCTIS**, a fictional electric car brand.

---

## Highlights

- **Pure Vanilla Web Stack**: Built with plain HTML5, CSS3, and vanilla ES6 JavaScript. No frameworks, no build tools, zero npm runtime dependencies.
- **Canvas Scrollytelling Engine**: Scroll-scrubbed image sequences drawn on `<canvas>` elements (`position: sticky` stage architecture) with responsive cover-fit (landscape) and contain-fit (portrait), lerp frame interpolation, and `devicePixelRatio` scaling.
- **Responsive Frame Sequences**: Optimized WebP sequences for desktop (1600px, quality 78) and mobile (< 768px, 960px, quality 72).
- **Procedural Film Grain**: Lightweight offscreen canvas noise shifted ~8 times per second at 3.5% opacity without gradients or vignettes.
- **"The Headlight" Custom Cursor**: Desktop cursor featuring a 6px xenon dot inside a 28px ring following the pointer with 0.18 lerp, morphing into a 44×2px light bar with contextual mono labels over interactive elements.
- **Engineering Dismantle Callouts**: Interactive technical callouts (Body, Battery, Drive, Light) with 1px hairline connectors fading in as the vehicle disassembles.
- **Interactive Lineup Accordion**: Horizontal hover accordion on desktop with debounced transitions and arrow-key navigation; stacked responsive card accordion on mobile.
- **Strict Minimalist Aesthetic**: Flat solid colors (`--asphalt: #07080A`), 1px hairlines, pure photography, and typography (Archivo, Inter, JetBrains Mono). Zero gradients, zero glassmorphism, zero drop shadows.

---

## Project Structure

```
├── index.html            # Semantic site markup
├── styles.css            # Design tokens, layout, and component styles
├── main.js               # Scrollytelling engine, cursor, preloader & interactions
├── config.js             # Tunable parameters (frame counts, chapters, coordinates)
├── assets/
│   ├── cars/             # Studio side-profile renders (GT-E, S, X, R, ONE)
│   └── frames/           # Converted WebP image sequences
│       ├── hero/         # Desktop hero sequence (548 frames)
│       ├── hero-mobile/  # Mobile hero sequence (548 frames)
│       ├── dismantle/    # Desktop dismantle sequence (198 frames)
│       └── dismantle-mobile/ # Mobile dismantle sequence (198 frames)
└── frames/               # Source frame assets
```

---

## URLs & Development

### Live Demo (GitHub Pages)
- **Live URL**: [https://ai-dev-leela.github.io/car-website/](https://ai-dev-leela.github.io/car-website/)
*(To activate: Repository **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: **main** / `root` → **Save**)*

### Local Development
Run with any local HTTP static server:

```bash
# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve .
```

Then visit in your browser:
- **Primary Local URL**: [http://localhost:8000](http://localhost:8000)
- **Alternative Local URL**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
