# Reference Library

> **Asset library for AI agents building the Concorde Catering website.**  
> Organized reference materials from competitor analysis and design research.

---

## Purpose

This library serves as a centralized repository for all visual and structural reference materials gathered during the competitive analysis phase. It enables AI agents to:

- **Quickly locate** specific design patterns or visual references
- **Understand industry standards** for catering/event company websites
- **Extract reusable patterns** (colors, typography, layouts, animations)
- **Maintain consistency** across development iterations

## Directory Structure

```
reference-library/
├── README.md                    # This file - library overview
├── site-manifest.json           # Original site crawl manifest
├── ASSET-CATALOG.json           # Complete asset inventory
│
├── sites/                       # Per-site reference folders
│   ├── concordecatering/        # Primary target site
│   │   ├── screenshots/         # hero.png, full.png, mobile.png
│   │   ├── content.json         # Raw page content (when available)
│   │   └── patterns.md          # Extracted design patterns
│   │
│   ├── wolfgangpuckcatering/    # ★ HIGH PRIORITY REFERENCE
│   │   ├── screenshots/
│   │   └── ...
│   │
│   ├── gammacatering/           # ★ HIGH PRIORITY REFERENCE
│   │   ├── screenshots/
│   │   └── ...
│   │
│   └── ... (22 sites total)
│
├── images/                      # Reference photos by category
│   ├── hero-backgrounds/        # Full-width hero imagery
│   ├── food-photography/        # Plating, dishes, culinary shots
│   ├── events/                  # Event setups, venues, catering in action
│   ├── team/                    # Chef portraits, staff action shots
│   └── abstract/                # Textures, backgrounds, mood references
│
├── patterns/                    # Reusable code patterns (to be populated)
│   ├── css/
│   │   ├── colors.css           # Extracted color palettes
│   │   ├── typography.css       # Font stacks & text styles
│   │   ├── animations.css       # Keyframe libraries
│   │   └── components.css       # Button/card/form styles
│   ├── html/
│   │   ├── hero-templates/      # Hero section markup
│   │   ├── nav-templates/       # Navigation patterns
│   │   └── gallery-templates/   # Gallery/carousel patterns
│   └── motion/
│       ├── framer-motion/       # React animation components
│       └── gsap/               # GSAP timeline configs
│
└── analysis/                    # Summary documents
    ├── pattern-frequency.md     # Common pattern analysis
    ├── best-practices.md        # Industry best practices
    └── implementation-guide.md  # How to use this library
```

## Quick Start Guide

### Finding Hero Section Inspiration

```bash
# View all hero screenshots
ls sites/*/screenshots/*hero.png

# High-priority references
ls sites/wolfgangpuckcatering/screenshots/
ls sites/gammacatering/screenshots/
```

### Finding Color Palettes

```bash
# Check extracted colors (when available)
cat patterns/css/colors.css

# Review dark/luxury mood references
ls images/abstract/dark-luxury*
```

### Understanding Navigation Patterns

```bash
# Compare nav structures across sites
for site in sites/*/; do echo "=== $site ==="; head -5 "${site}patterns.md" 2>/dev/null || echo "No patterns yet"; done
```

## Site Priority Tiers

| Priority | Sites | Rationale |
|----------|-------|-----------|
| **HIGH** | `wolfgangpuckcatering`, `gammacatering` | Premium positioning, similar market segment |
| **STANDARD** | `ridgewells`, `thejdkgroup`, `elegantaffairs` | Strong UX patterns to learn from |
| **REFERENCE** | All others | Specific feature inspiration |

## Image Categories Explained

### hero-backgrounds/
Full-width images suitable for hero sections. Look for:
- Banquet hall shots
- Elegant table settings
- Atmospheric venue photography

### food-photography/
Close-up culinary imagery for:
- Menu showcases
- Service detail sections
- "Our Food" galleries

### events/
Action shots showing:
- Catering in progress
- Event setups
- Wedding receptions
- Corporate gatherings

### team/
People-focused imagery:
- Chef portraits
- Staff in action
- Behind-the-scenes shots

### abstract/
Mood and texture references:
- Dark luxury aesthetics
- Minimalist clean designs
- Background textures

## For AI Agents: Usage Guidelines

1. **Before writing code**, check `patterns/` for existing reusable components
2. **When choosing colors**, reference both `patterns/css/colors.css` and brand guidelines
3. **For layout decisions**, review high-priority site screenshots first
4. **When adding new assets**, follow the naming convention: `{category}-{descriptor}-{n}.{ext}`
5. **Document patterns** you extract in the appropriate `sites/{name}/patterns.md`

## Naming Conventions

### Screenshots
```
{sitename}-{viewtype}.png
# viewtypes: hero, full, mobile, {pagename}
```

### Reference Images
```
{category}-{descriptor}-{n}.{ext}
# categories: hero-banquet, food-plating, chef-action, etc.
```

## Credits & Attribution

### Source Websites
All competitor screenshots are used **internally for reference only** and are not to be distributed or used in production.

- Screenshots captured via automated browser (Task 3-4)
- Original websites remain property of their respective owners
- This analysis falls under fair use for competitive research

### Reference Images
Stock/reference photos sourced from various providers for **mood board purposes only**:
- Not licensed for production use
- Serve as direction guides for future photography/art direction
- Replace with original photography before launch

## Maintenance

- **Add new sites**: Create folder under `sites/`, add screenshots, update catalog
- **Add new patterns**: Place in appropriate `patterns/` subfolder
- **Update catalog**: Run `python scripts/update-catalog.py` after changes (when available)

---

**Last Updated**: 2025-01-15  
**Created By**: Task 3-b Agent  
**Version**: 1.0.0
