# Implementation Guide

> How to use this reference library when building the Concorde Catering website

## Getting Started

### 1. Understand the Library Structure

```
reference-library/
├── README.md              # Start here - library overview
├── ASSET-CATALOG.json     # Complete asset inventory (machine-readable)
├── site-manifest.json     # Original crawl data with site details
├── sites/                 # Per-site reference materials
├── images/                # Reference photos organized by category
├── patterns/              # Extracted code patterns (to be populated)
└── analysis/              # Summary documents and best practices
```

### 2. Identify Your Current Task

| If you're building... | Start with... |
|------------------------|---------------|
| Hero section | `sites/wolfgangpuckcatering/` + `sites/gammacatering/` |
| Navigation | `analysis/pattern-frequency.md` → Navigation section |
| Color scheme | `patterns/css/colors.css` (when available) + `images/abstract/` |
| Service pages | `analysis/best-practices.md` → Service Presentation |
| Gallery | `analysis/best-practices.md` → Gallery section |
| Contact form | `analysis/best-practices.md` → Lead Capture |
| Mobile views | `sites/*/screenshots/*mobile.png` |

## Workflow Examples

### Example 1: Building the Hero Component

```bash
# Step 1: Review high-priority references
cat sites/wolfgangpuckcatering/patterns.md
cat sites/gammacatering/patterns.md

# Step 2: View actual screenshots for visual reference
open sites/wolfgangpuckcatering/screenshots/wolfgangpuck-hero.png
open sites/gammacatering/screenshots/gammacatering-hero.png

# Step 3: Check for extracted patterns
ls patterns/html/hero-templates/

# Step 4: Review color options
cat patterns/css/colors.css  # or create from analysis

# Step 5: Look at hero-background images for mood
ls images/hero-backgrounds/
```

### Example 2: Choosing a Color Palette

```bash
# Step 1: Review positioning decision
# Are we premium/luxury or modern/fresh?

# Step 2: Check pattern frequency analysis
cat analysis/pattern-frequency.md | grep -A 20 "Color Palette"

# Step 3: Look at abstract/mood images
ls images/abstract/dark-luxury*    # For premium
ls images/abstract/minimalist*     # For modern

# Step 4: Extract colors from high-priority sites
# (Use eyedropper on their screenshots)
```

### Example 3: Designing the Navigation

```bash
# Step 1: See what competitors use
cat site-manifest.json | jq '.sites[].navigation'

# Step 2: Read best practices
cat analysis/best-practices.md | grep -A 30 "Navigation"

# Step 3: Compare specific implementations
# Open multiple screenshots side by side
```

## File Naming When Adding Assets

### Screenshots
```bash
{sitename}-{viewtype}.png
# Examples:
# concordecatering-hero.png
# concordecatering-full.png
# concordecatering-mobile.png
# concordecatering-weddings.png  (deep pages)
```

### Reference Images
```bash
{category}-{descriptor}-{n}.{ext}
# Categories: hero-banquet, food-plating, chef-action, 
#             event-setup, wedding-romance, dark-luxury, 
#             minimalist-clean, catering-service
# Examples:
# hero-banquet-elegant-hall-1.jpg
# food-plating-appetizer-closeup-2.jpg
```

### Pattern Files
```bash
patterns/css/{component}.css      # CSS patterns
patterns/html/{type}/{name}.html  # HTML templates
patterns/motion/{lib}/{anim}.json # Animation configs
```

## Updating the Catalog

After adding new assets, update `ASSET-CATALOG.json`:

1. Add new site entry to `sites[]` array
2. Add new image files to appropriate `images.{category}.files[]`
3. Update count fields
4. Increment `catalog_version` (patch for small changes, minor for additions)

## Quick Reference Commands

```bash
# List all sites with screenshot counts
for d in sites/*/; do echo "$(basename $d): $(ls $d/screenshots 2>/dev/null | wc -l) screenshots"; done

# Find all hero screenshots
find . -name "*hero.png" -path "*/screenshots/*"

# Find all mobile-responsive screenshots
find . -name "*mobile.png" -path "*/screenshots/*"

# Count assets by category
echo "Images:" && ls images/*/* 2>/dev/null | wc -l
echo "Screenshots:" && find sites -name "*.png" | wc -l

# Search manifest for specific features
cat site-manifest.json | jq '.sites[] | select(.unique_features[] | contains("video"))'
```

## Decision Framework

When choosing between competing patterns:

1. **User goal first**: What is the visitor trying to accomplish?
2. **Brand alignment**: Does this match our positioning?
3. **Technical feasibility**: Can we implement this well?
4. **Maintenance burden**: Is this sustainable long-term?
5. **Differentiation**: Does this help us stand out?

## Common Pitfalls to Avoid

1. **Copying exactly**: Use patterns as inspiration, not templates
2. **Over-engineering**: Start simple, enhance based on data
3. **Ignoring mobile**: Design mobile-first, always
4. **Feature creep**: Every element should earn its place
5. **Stock photo reliance**: Plan for original photography

## Getting Help

- Library structure questions: See `README.md`
- Pattern specifics: Check `analysis/pattern-frequency.md`
- Implementation guidance: Check `analysis/best-practices.md`
- Asset inventory: Check `ASSET-CATALOG.json`

---
*Last updated: 2025-01-15 | Maintained by AI agents*
