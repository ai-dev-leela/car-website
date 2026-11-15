/**
 * NOCTIS Configuration
 * All section heights, chapter ranges, frame counts, frame paths and callout positions
 * can be tuned here.
 */
const NOCTIS_CONFIG = {
  // Brand tokens (reference)
  tokens: {
    asphalt: '#07080A',
    graphite: '#121418',
    fog: '#8A8F98',
    bone: '#EDEAE4',
    xenon: '#CFE3FF',
    taillight: '#E1251B',
    hairline: 'rgba(237, 234, 228, 0.12)',
  },

  // Preloader settings
  preloader: {
    heroInitialBatch: 40, // frames 1–40 loaded before revealing page
  },

  // Section 1: Hero Pinned Scrollytelling
  hero: {
    frameCount: 548,
    desktopDir: 'assets/frames/hero/',
    mobileDir: 'assets/frames/hero-mobile/',
    filePrefix: 'frame_',
    fileExt: '.webp',
    scrollDistance: '600vh',
    fadeStartProgress: 0.95, // over last 5%, canvas fades to solid #07080A
    hud: {
      speedMax: 118,    // 000 -> 118 KM/H
      distanceMax: 4.2, // 0.0 -> 4.2 KM
    },
    chapters: [
      {
        id: 'ch-01',
        hudNum: '01/04',
        start: 0.00,
        end: 0.12,
        fadeIn: 0.02,
        fadeOut: 0.10,
        // Chapter 1 content rendered in empty sky
      },
      {
        id: 'ch-02',
        hudNum: '02/04',
        start: 0.22,
        end: 0.40,
        fadeIn: 0.24,
        fadeOut: 0.38,
      },
      {
        id: 'ch-03',
        hudNum: '03/04',
        start: 0.50,
        end: 0.68,
        fadeIn: 0.52,
        fadeOut: 0.66,
      },
      {
        id: 'ch-04',
        hudNum: '04/04',
        start: 0.80,
        end: 1.00,
        fadeIn: 0.82,
        fadeOut: 0.98,
      },
    ],
  },

  // Section 2: Statement (word-by-word reveal)
  statement: {
    sectionNum: '02 — ENGINEERING',
    sentence: 'Every part was designed to disappear into one line of light.',
  },

  // Section 3: Dismantle Pinned Scrollytelling
  dismantle: {
    frameCount: 198,
    desktopDir: 'assets/frames/dismantle/',
    mobileDir: 'assets/frames/dismantle-mobile/',
    filePrefix: 'frame_',
    fileExt: '.webp',
    scrollDistance: '350vh',
    title: 'Look closer.',
    calloutsStart: 0.70,
    // Percentage coordinates (relative to stage viewport: 0-100%)
    callouts: [
      {
        id: 'callout-body',
        code: 'BODY',
        title: 'Carbon composite monocoque',
        start: 0.72,
        // Dot position on the part
        dotX: 42,
        dotY: 34,
        // Label offset in px (or % for responsiveness)
        offsetX: -160,
        offsetY: -60,
        align: 'right', // line connects to label
      },
      {
        id: 'callout-battery',
        code: 'BATTERY',
        title: '110 kWh structural pack',
        start: 0.78,
        dotX: 38,
        dotY: 66,
        offsetX: -180,
        offsetY: 60,
        align: 'right',
      },
      {
        id: 'callout-drive',
        code: 'DRIVE',
        title: 'Dual axial-flux motors, 680 kW',
        start: 0.84,
        dotX: 66,
        dotY: 63,
        offsetX: 160,
        offsetY: 60,
        align: 'left',
      },
      {
        id: 'callout-light',
        code: 'LIGHT',
        title: 'Single-line LED signature',
        start: 0.90,
        dotX: 74,
        dotY: 42,
        offsetX: 170,
        offsetY: -50,
        align: 'left',
      },
    ],
  },

  // Section 4: Lineup Accordion
  lineup: {
    sectionNum: '03 — THE LINEUP',
    heading: 'Five ways to drive the night.',
    models: [
      {
        id: 'gt-e',
        index: '01',
        name: 'GT-E',
        tagline: 'The grand tourer.',
        summary: '640 km · 3.1 s · 680 kW',
        specs: [
          { label: 'RANGE', value: '640 KM' },
          { label: '0–100 KM/H', value: '3.1 S' },
          { label: 'POWER', value: '680 KW' },
        ],
        swatches: ['#1F2124', '#0F1012', '#2A2D32', '#141517'],
        image: 'assets/cars/gt-e.webp',
        alt: 'NOCTIS GT-E matte graphite grand tourer coupe',
        defaultOpen: true,
      },
      {
        id: 's',
        index: '02',
        name: 'S',
        tagline: 'Four doors, no compromise.',
        summary: '600 km · 3.6 s · 520 kW',
        specs: [
          { label: 'RANGE', value: '600 KM' },
          { label: '0–100 KM/H', value: '3.6 S' },
          { label: 'POWER', value: '520 KW' },
        ],
        swatches: ['#EDEAE4', '#DCD8D0', '#C8C5BD', '#E2DFD9'],
        image: 'assets/cars/s.webp',
        alt: 'NOCTIS S satin bone white sport sedan',
      },
      {
        id: 'x',
        index: '03',
        name: 'X',
        tagline: 'Higher, never heavier.',
        summary: '560 km · 4.2 s · 480 kW',
        specs: [
          { label: 'RANGE', value: '560 KM' },
          { label: '0–100 KM/H', value: '4.2 S' },
          { label: 'POWER', value: '480 KW' },
        ],
        swatches: ['#121926', '#0D131E', '#182234', '#0A0E18'],
        image: 'assets/cars/x.webp',
        alt: 'NOCTIS X midnight blue electric coupe SUV',
      },
      {
        id: 'r',
        index: '04',
        name: 'R',
        tagline: 'Built for the track.',
        summary: '420 km · 2.4 s · 900 kW',
        specs: [
          { label: 'RANGE', value: '420 KM' },
          { label: '0–100 KM/H', value: '2.4 S' },
          { label: 'POWER', value: '900 KW' },
        ],
        swatches: ['#0A0A0C', '#E1251B', '#1A1B1F', '#222428'],
        image: 'assets/cars/r.webp',
        alt: 'NOCTIS R track coupe with fixed rear wing',
      },
      {
        id: 'one',
        index: '05',
        name: 'ONE',
        tagline: 'The future, early.',
        summary: 'Concept · Hypercar · Liquid Silver',
        specs: [
          { label: 'RANGE', value: '750 KM' },
          { label: '0–100 KM/H', value: '1.9 S' },
          { label: 'POWER', value: '1100 KW' },
        ],
        swatches: ['#B8C0C8', '#D0D6DC', '#9FA8B0', '#7D848C'],
        image: 'assets/cars/one.webp',
        alt: 'NOCTIS ONE liquid silver concept hypercar',
      },
    ],
  },

  // Section 5: Reserve
  reserve: {
    heading: 'Drive the night.',
    body: 'The city waits in silence. Reserve your allocation for 2026 delivery.',
    cta: 'RESERVE YOUR NOCTIS',
  },

  // Reduced motion static frame indices (0-indexed)
  reducedMotion: {
    heroFrames: [0, 191, 356, 547], // 0%, ~35%, ~65%, 100%
    dismantleFrames: [0, 197],       // first, last
  },
};
