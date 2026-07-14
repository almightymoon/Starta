# STRATA

Premium interactive marketing site for an independent construction studio — scroll-driven motion, a live 3D house model, and multi-page studio sections.

## Live site

**[https://starta-steel.vercel.app/](https://starta-steel.vercel.app/)**

## Pages

| Page | Path |
|------|------|
| Home | `outputs/strata/index.html` |
| Approach (workflow) | `outputs/strata/approach.html` |
| Gallery | `outputs/strata/gallery.html` |
| Studio | `outputs/strata/studio.html` |
| Contact | `outputs/strata/contact.html` |

## Features

- Custom dual cursor and scroll progress
- Intro loading sequence on first open
- Interactive GLB model (Three.js + OrbitControls)
- Parallax, reveals, marquee rails, and magnetic CTAs
- Contact enquiry forms
- Responsive layout for desktop and mobile

## Local development

Serve the site over HTTP (required for ES modules / the 3D model):

```bash
cd outputs/strata
python3 -m http.server 8765
```

Then open [http://127.0.0.1:8765/](http://127.0.0.1:8765/).

## Stack

- HTML / CSS / vanilla JavaScript
- [Three.js](https://threejs.org/) for the curved-roof house `.glb`
- Google Fonts (Manrope, Playfair Display, DM Mono)

## Project layout

```
withe/
├── outputs/strata/     # Deployable site
│   ├── index.html
│   ├── approach.html
│   ├── gallery.html
│   ├── studio.html
│   ├── contact.html
│   ├── assets/         # Images + curved-roof-house.glb
│   ├── model.js
│   ├── script.js
│   └── *.css
├── work/               # Source imagery / tooling
└── README.md
```

## Deploy

The live build is on Vercel. To redeploy, point the project root (or `outputs/strata`) at Vercel and publish static files as usual.
