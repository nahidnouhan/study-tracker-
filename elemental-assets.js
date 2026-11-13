/**
 * JLPT N4 Study Studio — Elemental Koi Pond Ecosystem Assets
 * Living, Organic Multi-Element Koi Sanctuaries (Zero Cartoons / Zero Harsh Cutouts)
 * 
 * - spirit: Vocabulary (語彙 / 霊) — Celestial Yin-Yang Spirit Koi Pond (Amethyst Void)
 * - air: Grammar (文法 / 気) — Celestial Sky Breeze Koi Pond (Sky Azure & Sunlight)
 * - earth: Kanji (漢字 / 土) — Resonant Amber Crystal Koi Pond (Honey-Gold Topaz)
 * - water: Listening (聴解 / 水) — Crystalline Aquamarine Tidal Koi Pond (Oceanic Cyan)
 * - fire: Reading (読解 / 火) — Solar Phoenix Caldera Koi Pond (Ruby Flame & Molten Gold)
 */

(function () {
  'use strict';

  const ELEMENTAL_DATA = {
    vocabulary: {
      element: 'spirit',
      kanji: '霊',
      kanjiTitle: '語彙',
      romaji: 'Rei • Spirit Pond',
      martialTitle: 'Celestial Yin-Yang Spirit Koi',
      primaryColor: '#a855f7',
      secondaryColor: '#c084fc',
      accentColor: '#e9d5ff',
      crest: `
        <svg viewBox="0 0 100 100" class="element-crest-svg" aria-label="Sacred Octagram Astral Geometry Crest">
          <circle cx="50" cy="50" r="41" fill="rgba(168, 85, 247, 0.08)" stroke="#a855f7" stroke-width="1.2" stroke-dasharray="4 3" class="geo-spin-cw" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(192, 132, 252, 0.45)" stroke-width="1" />
          <g class="geo-spin-cw-fast">
            <polygon points="50,15 85,50 50,85 15,50" fill="none" stroke="#c084fc" stroke-width="1.8" stroke-linejoin="round" />
            <polygon points="25.2,25.2 74.8,25.2 74.8,74.8 25.2,74.8" fill="none" stroke="#e9d5ff" stroke-width="1.6" stroke-linejoin="round" />
          </g>
          <g class="geo-spin-ccw">
            <circle cx="50" cy="50" r="22" fill="none" stroke="#a855f7" stroke-width="1.4" stroke-dasharray="8 6" />
            <line x1="50" y1="16" x2="50" y2="84" stroke="rgba(233, 213, 255, 0.4)" stroke-width="1" />
            <line x1="16" y1="50" x2="84" y2="50" stroke="rgba(233, 213, 255, 0.4)" stroke-width="1" />
            <line x1="26" y1="26" x2="74" y2="74" stroke="rgba(192, 132, 252, 0.35)" stroke-width="0.8" />
            <line x1="26" y1="74" x2="74" y2="26" stroke="rgba(192, 132, 252, 0.35)" stroke-width="0.8" />
          </g>
          <circle cx="50" cy="50" r="8" fill="rgba(168, 85, 247, 0.45)" stroke="#e9d5ff" stroke-width="1.5" class="geo-core-pulse" />
          <circle cx="50" cy="50" r="3.2" fill="#ffffff" class="geo-sparkle" />
          <circle cx="50" cy="28" r="2" fill="#c084fc" class="geo-spin-cw" />
          <circle cx="50" cy="72" r="2" fill="#e9d5ff" class="geo-spin-cw" />
        </svg>
      `,
      collapsedFigure: `
        <svg viewBox="0 0 80 120" class="collapsed-figure-svg playful-koi-pond-svg" aria-label="Swimming Yin-Yang Koi Pond">
          <ellipse cx="40" cy="55" rx="34" ry="46" fill="none" stroke="rgba(168, 85, 247, 0.22)" stroke-width="1.2" stroke-dasharray="10 8" />
          <circle class="playful-droplet droplet-1" cx="24" cy="28" r="2.2" fill="#e9d5ff" />
          <circle class="playful-droplet droplet-2" cx="58" cy="78" r="2.5" fill="#c084fc" />
          <circle class="playful-droplet droplet-3" cx="22" cy="88" r="1.8" fill="#ffffff" />
          
          <!-- Miniature Yin Koi (Tui) -->
          <g class="playful-mini-koi mini-koi-tui" transform="translate(48, 38)">
            <path class="mini-koi-tail" d="M 0 -14 Q -6 -24 -2 -32 Q 4 -22 0 -14" fill="#e9d5ff" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#ffffff" />
            <circle cx="0" cy="8" r="2" fill="#c084fc" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#e9d5ff" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#e9d5ff" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <!-- Miniature Yang Koi (La) -->
          <g class="playful-mini-koi mini-koi-la" transform="translate(32, 72) rotate(180)">
            <path class="mini-koi-tail" d="M 0 -14 Q 6 -24 2 -32 Q -4 -22 0 -14" fill="#a855f7" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#0c0718" stroke="#a855f7" stroke-width="1.5" />
            <circle cx="0" cy="8" r="2" fill="#38bdf8" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <path class="mini-koi-current" d="M 46 22 C 60 48 20 62 34 88" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.65" />
        </svg>
      `,
      expandedScene: `
        <div class="elemental-pond-container element-pond-spirit">
          <canvas id="spirit-pond-canvas" class="spirit-pond-canvas" style="display:none;"></canvas>
        </div>
      `,
      bannerTail: `
        <svg viewBox="0 0 74 60" class="banner-tail-svg" preserveAspectRatio="none">
          <path class="fluid-tail-wave-1" d="M 0 0 L 74 0 L 74 25 C 64 36 60 56 50 42 C 42 28 36 58 28 38 C 20 22 14 50 6 30 C 2 20 0 25 0 25 Z" fill="#a855f7" opacity="0.4" />
          <path class="fluid-tail-wave-2" d="M 0 0 L 74 0 L 74 16 C 62 26 56 46 46 32 C 38 20 28 44 20 28 C 12 16 6 36 0 20 Z" fill="#c084fc" opacity="0.65" />
        </svg>
      `
    },

    kanji: {
      element: 'earth',
      kanji: '土',
      kanjiTitle: '漢字',
      romaji: 'Tsuchi • Amber Crystal Spring',
      martialTitle: 'Sacred Amber Topaz Koi Pond',
      primaryColor: '#f59e0b',
      secondaryColor: '#fbbf24',
      accentColor: '#fef3c7',
      crest: `
        <svg viewBox="0 0 100 100" class="element-crest-svg" aria-label="Sacred Sri Yantra Hexagram Geometric Crest">
          <circle cx="50" cy="50" r="41" fill="rgba(245, 158, 11, 0.08)" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="5 3" class="geo-spin-cw" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(251, 191, 36, 0.45)" stroke-width="1" />
          <g class="geo-spin-ccw">
            <polygon points="50,16 79,67 21,67" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linejoin="round" />
            <polygon points="50,84 79,33 21,33" fill="none" stroke="#fef3c7" stroke-width="1.8" stroke-linejoin="round" />
          </g>
          <g class="geo-spin-cw-fast">
            <polygon points="50,26 71,62 29,62" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.85" />
            <polygon points="50,74 71,38 29,38" fill="none" stroke="#fbbf24" stroke-width="1.2" opacity="0.85" />
            <circle cx="50" cy="50" r="18" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="6 4" opacity="0.75" />
          </g>
          <polygon points="50,42 58,50 50,58 42,50" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5" class="geo-core-pulse" />
          <circle cx="50" cy="50" r="2.8" fill="#ffffff" class="geo-sparkle" />
          <circle cx="50" cy="16" r="1.8" fill="#fbbf24" />
          <circle cx="79" cy="67" r="1.8" fill="#fbbf24" />
          <circle cx="21" cy="67" r="1.8" fill="#fbbf24" />
        </svg>
      `,
      collapsedFigure: `
        <svg viewBox="0 0 80 120" class="collapsed-figure-svg playful-koi-pond-svg" aria-label="Swimming Amber Crystal Koi Pond">
          <ellipse cx="40" cy="55" rx="34" ry="46" fill="none" stroke="rgba(245, 158, 11, 0.22)" stroke-width="1.2" stroke-dasharray="10 8" />
          <circle class="playful-droplet droplet-1" cx="22" cy="30" r="2.2" fill="#fef3c7" />
          <circle class="playful-droplet droplet-2" cx="60" cy="74" r="2.5" fill="#fbbf24" />
          <circle class="playful-droplet droplet-3" cx="24" cy="86" r="1.8" fill="#f59e0b" />
          
          <!-- Miniature Yin Koi (Amber Tui) -->
          <g class="playful-mini-koi mini-koi-tui" transform="translate(48, 38)">
            <path class="mini-koi-tail" d="M 0 -14 Q -6 -24 -2 -32 Q 4 -22 0 -14" fill="#fef3c7" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#fffbeb" />
            <circle cx="0" cy="8" r="2" fill="#fbbf24" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <!-- Miniature Yang Koi (Topaz La) -->
          <g class="playful-mini-koi mini-koi-la" transform="translate(32, 72) rotate(180)">
            <path class="mini-koi-tail" d="M 0 -14 Q 6 -24 2 -32 Q -4 -22 0 -14" fill="#f59e0b" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#1c1006" stroke="#fbbf24" stroke-width="1.5" />
            <circle cx="0" cy="8" r="2" fill="#fbbf24" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <path class="mini-koi-current" d="M 46 22 C 60 48 20 62 34 88" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.65" />
        </svg>
      `,
      expandedScene: `
        <div class="elemental-pond-container element-pond-earth"></div>
      `,
      bannerTail: `
        <svg viewBox="0 0 74 60" class="banner-tail-svg" preserveAspectRatio="none">
          <polygon class="fluid-tail-wave-1" points="0,0 74,0 74,20 64,30 58,16 48,40 42,24 34,46 26,20 16,38 8,26 0,40" fill="#f59e0b" opacity="0.65" />
          <polygon class="fluid-tail-wave-2" points="0,0 74,0 74,12 66,24 56,14 44,30 36,16 26,34 18,18 10,30 0,18" fill="#fbbf24" opacity="0.35" />
        </svg>
      `
    },

    grammar: {
      element: 'air',
      kanji: '気',
      kanjiTitle: '文法',
      romaji: 'Kaze • Celestial Sky Pond',
      martialTitle: 'Sky Azure & Sunburst Koi Pond',
      primaryColor: '#38bdf8',
      secondaryColor: '#f59e0b',
      accentColor: '#fef08a',
      crest: `
        <svg viewBox="0 0 100 100" class="element-crest-svg" aria-label="Celestial Astrolabe & Merkaba Gyroscopic Crest">
          <circle cx="50" cy="50" r="41" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="6 3" class="geo-spin-cw" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(245, 158, 11, 0.45)" stroke-width="1" />
          <g class="geo-spin-cw">
            <ellipse cx="50" cy="50" rx="33" ry="16" fill="none" stroke="#38bdf8" stroke-width="1.4" transform="rotate(30 50 50)" />
            <ellipse cx="50" cy="50" rx="33" ry="16" fill="none" stroke="#fef08a" stroke-width="1.2" transform="rotate(-30 50 50)" />
            <ellipse cx="50" cy="50" rx="33" ry="16" fill="none" stroke="#f59e0b" stroke-width="1" transform="rotate(90 50 50)" />
          </g>
          <g class="geo-spin-ccw">
            <polygon points="50,17 54,42 79,42 58,54 68,79 50,62 32,79 42,54 21,42 46,42" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" opacity="0.9" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4 4" />
          </g>
          <circle cx="50" cy="50" r="6" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" class="geo-core-pulse" />
          <circle cx="50" cy="50" r="2.5" fill="#ffffff" class="geo-sparkle" />
        </svg>
      `,
      collapsedFigure: `
        <svg viewBox="0 0 80 120" class="collapsed-figure-svg playful-koi-pond-svg" aria-label="Swimming Sky Breeze Koi Pond">
          <ellipse cx="40" cy="55" rx="34" ry="46" fill="none" stroke="rgba(56, 189, 248, 0.22)" stroke-width="1.2" stroke-dasharray="10 8" />
          <circle class="playful-droplet droplet-1" cx="20" cy="26" r="2.2" fill="#e0f2fe" />
          <circle class="playful-droplet droplet-2" cx="62" cy="76" r="2.5" fill="#fef08a" />
          <circle class="playful-droplet droplet-3" cx="26" cy="88" r="1.8" fill="#38bdf8" />
          
          <!-- Miniature Yin Koi (Sky Cloud Tui) -->
          <g class="playful-mini-koi mini-koi-tui" transform="translate(48, 38)">
            <path class="mini-koi-tail" d="M 0 -14 Q -6 -24 -2 -32 Q 4 -22 0 -14" fill="#e0f2fe" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#ffffff" />
            <circle cx="0" cy="8" r="2" fill="#38bdf8" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <!-- Miniature Yang Koi (Sunburst La) -->
          <g class="playful-mini-koi mini-koi-la" transform="translate(32, 72) rotate(180)">
            <path class="mini-koi-tail" d="M 0 -14 Q 6 -24 2 -32 Q -4 -22 0 -14" fill="#f59e0b" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#082f49" stroke="#38bdf8" stroke-width="1.5" />
            <circle cx="0" cy="8" r="2" fill="#fef08a" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <path class="mini-koi-current" d="M 46 22 C 60 48 20 62 34 88" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.65" />
        </svg>
      `,
      expandedScene: `
        <div class="elemental-pond-container element-pond-air"></div>
      `,
      bannerTail: `
        <svg viewBox="0 0 74 60" class="banner-tail-svg" preserveAspectRatio="none">
          <path class="fluid-tail-wave-1" d="M 0 0 L 74 0 L 74 16 C 68 30 62 50 56 36 C 50 24 46 56 40 38 C 34 22 28 48 22 34 C 16 20 10 54 4 36 C 2 28 0 20 0 20 Z" fill="#3b82f6" opacity="0.55" />
          <path class="fluid-tail-wave-2" d="M 0 0 L 74 0 L 74 10 C 66 22 58 38 52 26 C 44 14 36 34 30 20 C 22 10 14 30 0 16 Z" fill="#60a5fa" opacity="0.35" />
        </svg>
      `
    },

    listening: {
      element: 'water',
      kanji: '水',
      kanjiTitle: '聴解',
      romaji: 'Mizu • Mountain Wave Pond',
      martialTitle: 'Crystalline Aquamarine Torrent Koi',
      primaryColor: '#06b6d4',
      secondaryColor: '#38bdf8',
      accentColor: '#cffafe',
      crest: `
        <svg viewBox="0 0 100 100" class="element-crest-svg" aria-label="Harmonic Cymatics & Torus Wave Geometric Crest">
          <circle cx="50" cy="50" r="41" fill="rgba(6, 182, 212, 0.08)" stroke="#06b6d4" stroke-width="1.2" stroke-dasharray="4 4" class="geo-spin-cw" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(56, 189, 248, 0.45)" stroke-width="1" />
          <g class="geo-spin-cw">
            <circle cx="50" cy="30" r="20" fill="none" stroke="#38bdf8" stroke-width="1.4" opacity="0.75" />
            <circle cx="67" cy="40" r="20" fill="none" stroke="#06b6d4" stroke-width="1.4" opacity="0.75" />
            <circle cx="67" cy="60" r="20" fill="none" stroke="#cffafe" stroke-width="1.4" opacity="0.75" />
            <circle cx="50" cy="70" r="20" fill="none" stroke="#38bdf8" stroke-width="1.4" opacity="0.75" />
            <circle cx="33" cy="60" r="20" fill="none" stroke="#06b6d4" stroke-width="1.4" opacity="0.75" />
            <circle cx="33" cy="40" r="20" fill="none" stroke="#cffafe" stroke-width="1.4" opacity="0.75" />
          </g>
          <g class="geo-spin-ccw">
            <circle cx="50" cy="50" r="24" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="6 4" class="geo-wave-pulse" />
            <polygon points="50,22 69,39 69,61 50,78 31,61 31,39" fill="none" stroke="#06b6d4" stroke-width="1" opacity="0.6" />
          </g>
          <circle cx="50" cy="50" r="7" fill="rgba(6, 182, 212, 0.5)" stroke="#cffafe" stroke-width="1.5" class="geo-core-pulse" />
          <circle cx="50" cy="50" r="2.8" fill="#ffffff" class="geo-sparkle" />
        </svg>
      `,
      collapsedFigure: `
        <svg viewBox="0 0 80 120" class="collapsed-figure-svg playful-koi-pond-svg" aria-label="Swimming Oceanic Wave Koi Pond">
          <ellipse cx="40" cy="55" rx="34" ry="46" fill="none" stroke="rgba(6, 182, 212, 0.22)" stroke-width="1.2" stroke-dasharray="10 8" />
          <circle class="playful-droplet droplet-1" cx="24" cy="26" r="2.2" fill="#cffafe" />
          <circle class="playful-droplet droplet-2" cx="58" cy="74" r="2.5" fill="#38bdf8" />
          <circle class="playful-droplet droplet-3" cx="22" cy="86" r="1.8" fill="#06b6d4" />
          
          <!-- Miniature Yin Koi (Ocean Tui) -->
          <g class="playful-mini-koi mini-koi-tui" transform="translate(48, 38)">
            <path class="mini-koi-tail" d="M 0 -14 Q -6 -24 -2 -32 Q 4 -22 0 -14" fill="#cffafe" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#ffffff" />
            <circle cx="0" cy="8" r="2" fill="#06b6d4" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#06b6d4" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#06b6d4" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <!-- Miniature Yang Koi (Torrent La) -->
          <g class="playful-mini-koi mini-koi-la" transform="translate(32, 72) rotate(180)">
            <path class="mini-koi-tail" d="M 0 -14 Q 6 -24 2 -32 Q -4 -22 0 -14" fill="#06b6d4" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#041e2b" stroke="#38bdf8" stroke-width="1.5" />
            <circle cx="0" cy="8" r="2" fill="#38bdf8" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <path class="mini-koi-current" d="M 46 22 C 60 48 20 62 34 88" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.65" />
        </svg>
      `,
      expandedScene: `
        <div class="elemental-pond-container element-pond-water"></div>
      `,
      bannerTail: `
        <svg viewBox="0 0 74 60" class="banner-tail-svg" preserveAspectRatio="none">
          <path class="fluid-tail-wave-1" d="M 0 0 L 74 0 L 74 16 C 68 30 64 56 56 36 C 48 18 42 58 34 34 C 28 16 20 50 12 30 C 8 16 2 44 0 22 Z" fill="#06b6d4" opacity="0.65" />
          <path class="fluid-tail-wave-2" d="M 0 0 L 74 0 L 74 10 C 66 22 58 42 50 26 C 42 12 34 38 26 20 C 18 8 10 28 0 14 Z" fill="#38bdf8" opacity="0.4" />
        </svg>
      `
    },

    reading: {
      element: 'fire',
      kanji: '火',
      kanjiTitle: '読解',
      romaji: 'Hi • Solar Caldera Pond',
      martialTitle: 'Incandescent Solar Phoenix Koi',
      primaryColor: '#f43f5e',
      secondaryColor: '#fb7185',
      accentColor: '#ffe4e6',
      crest: `
        <svg viewBox="0 0 100 100" class="element-crest-svg" aria-label="Solar Tetrahedron & Radiant Flare Geometric Crest">
          <circle cx="50" cy="50" r="41" fill="rgba(244, 63, 94, 0.08)" stroke="#f43f5e" stroke-width="1.2" stroke-dasharray="5 3" class="geo-spin-cw" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(251, 113, 133, 0.45)" stroke-width="1" />
          <g class="geo-spin-cw-fast">
            <polygon points="50,15 82,70 18,70" fill="none" stroke="#f43f5e" stroke-width="1.8" stroke-linejoin="round" />
            <polygon points="50,85 82,30 18,30" fill="none" stroke="#ffd60a" stroke-width="1.6" stroke-linejoin="round" />
            <polygon points="50,23 73,63 27,63" fill="none" stroke="#fb7185" stroke-width="1.2" opacity="0.8" />
            <polygon points="50,77 73,37 27,37" fill="none" stroke="#ffe4e6" stroke-width="1.2" opacity="0.8" />
          </g>
          <g class="geo-spin-ccw">
            <line x1="50" y1="12" x2="50" y2="88" stroke="#ffd60a" stroke-width="1.2" stroke-linecap="round" />
            <line x1="12" y1="50" x2="88" y2="50" stroke="#ffd60a" stroke-width="1.2" stroke-linecap="round" />
            <line x1="23" y1="23" x2="77" y2="77" stroke="#f43f5e" stroke-width="0.9" stroke-dasharray="4 4" />
            <line x1="23" y1="77" x2="77" y2="23" stroke="#f43f5e" stroke-width="0.9" stroke-dasharray="4 4" />
            <circle cx="50" cy="50" r="16" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="5 3" />
          </g>
          <polygon points="50,42 58,50 50,58 42,50" fill="#ffd60a" stroke="#ffffff" stroke-width="1.6" class="geo-core-pulse" />
          <circle cx="50" cy="50" r="3" fill="#ffffff" class="geo-sparkle" />
        </svg>
      `,
      collapsedFigure: `
        <svg viewBox="0 0 80 120" class="collapsed-figure-svg playful-koi-pond-svg" aria-label="Swimming Solar Phoenix Koi Pond">
          <ellipse cx="40" cy="55" rx="34" ry="46" fill="none" stroke="rgba(244, 63, 94, 0.22)" stroke-width="1.2" stroke-dasharray="10 8" />
          <circle class="playful-droplet droplet-1" cx="22" cy="28" r="2.2" fill="#ffe4e6" />
          <circle class="playful-droplet droplet-2" cx="60" cy="74" r="2.5" fill="#ffd60a" />
          <circle class="playful-droplet droplet-3" cx="24" cy="88" r="1.8" fill="#f43f5e" />
          
          <!-- Miniature Yin Koi (Solar Pearl Tui) -->
          <g class="playful-mini-koi mini-koi-tui" transform="translate(48, 38)">
            <path class="mini-koi-tail" d="M 0 -14 Q -6 -24 -2 -32 Q 4 -22 0 -14" fill="#ffe4e6" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#fff1f2" />
            <circle cx="0" cy="8" r="2" fill="#fb7185" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#fb7185" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#fb7185" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <!-- Miniature Yang Koi (Magma Gold La) -->
          <g class="playful-mini-koi mini-koi-la" transform="translate(32, 72) rotate(180)">
            <path class="mini-koi-tail" d="M 0 -14 Q 6 -24 2 -32 Q -4 -22 0 -14" fill="#ffd60a" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="6.5" ry="12" fill="#1c0409" stroke="#f43f5e" stroke-width="1.5" />
            <circle cx="0" cy="8" r="2" fill="#ffd60a" />
            <path d="M -6 -2 Q -12 2 -11 8" fill="none" stroke="#ffd60a" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 6 -2 Q 12 2 11 8" fill="none" stroke="#ffd60a" stroke-width="1.8" stroke-linecap="round" />
          </g>

          <path class="mini-koi-current" d="M 46 22 C 60 48 20 62 34 88" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.65" />
        </svg>
      `,
      expandedScene: `
        <div class="elemental-pond-container element-pond-fire"></div>
      `,
      bannerTail: `
        <svg viewBox="0 0 74 60" class="banner-tail-svg" preserveAspectRatio="none">
          <path class="fluid-tail-wave-1" d="M 0 0 L 74 0 L 74 16 C 66 34 64 60 54 42 C 46 22 40 58 34 38 C 26 18 18 54 10 34 C 6 22 2 42 0 26 Z" fill="#f43f5e" opacity="0.7" />
          <path class="fluid-tail-wave-2" d="M 0 0 L 74 0 L 74 10 C 68 22 60 44 52 28 C 44 14 36 40 28 22 C 20 10 12 34 0 18 Z" fill="#fb7185" opacity="0.4" />
        </svg>
      `
    }
  };

  window.ELEMENTAL_DATA = ELEMENTAL_DATA;

})();
