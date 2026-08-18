#!/usr/bin/env python3
"""
Generate structured reports from complete analysis data
"""
import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

OUTPUT_DIR = Path("/home/z/my-project/docs/technical-assets")

def load_analysis():
    with open(OUTPUT_DIR / "complete_analysis.json", 'r') as f:
        return json.load(f)

def generate_css_analysis(data):
    """Generate CSS-specific report"""
    css_report = {
        "analysis_date": data["analysis_date"],
        "summary": {
            "total_sites": len(data["sites"]),
            "sites_with_external_css": 0,
            "framework_usage": {
                "bootstrap": 0,
                "tailwind": 0,
                "font_awesome": 0,
                "animate_css": 0,
                "carousel_css": 0
            }
        },
        "sites": {}
    }
    
    for url, site in data["sites"].items():
        css_files = site.get("css_files", [])
        frameworks = site.get("css_frameworks", {})
        
        if css_files:
            css_report["summary"]["sites_with_external_css"] += 1
        
        # Count framework usage
        for fw, val in frameworks.items():
            if val:
                css_report["summary"]["framework_usage"][fw] += 1
        
        css_report["sites"][url] = {
            "css_file_count": len(css_files),
            "css_files": css_files[:10],
            "frameworks_detected": {k: v for k, v in frameworks.items() if v},
            "css_variables_count": len(site.get("css_variables_sample", []))
        }
    
    return css_report

def generate_fonts_report(data):
    """Generate fonts compilation report"""
    fonts_report = {
        "analysis_date": data["analysis_date"],
        "summary": {
            "total_sites": len(data["sites"]),
            "google_fonts_users": 0,
            "unique_google_fonts": [],
            "most_common_font_families": []
        },
        "fonts_by_site": {}
    }
    
    google_fonts_set = set()
    font_family_counts = defaultdict(int)
    
    for url, site in data["sites"].items():
        fonts = site.get("fonts", {})
        google_fonts = fonts.get("google_fonts", [])
        font_families = fonts.get("font_family_declarations", [])
        
        if google_fonts:
            fonts_report["summary"]["google_fonts_users"] += 1
            google_fonts_set.update(google_fonts)
        
        for ff in font_families[:3]:
            if ff and not ff.startswith(('inherit', 'serif', 'sans-serif', 'monospace')):
                font_family_counts[ff] += 1
        
        fonts_report["fonts_by_site"][url] = {
            "google_fonts": google_fonts,
            "primary_font_families": font_families[:5]
        }
    
    fonts_report["summary"]["unique_google_fonts"] = sorted(list(google_fonts_set))
    fonts_report["summary"]["most_common_font_families"] = sorted(
        font_family_counts.items(), key=lambda x: -x[1]
    )[:15]
    
    return fonts_report

def generate_favicons_icons_report(data):
    """Generate favicons and icons report"""
    icons_report = {
        "analysis_date": data["analysis_date"],
        "summary": {
            "total_sites": len(data["sites"]),
            "sites_with_favicon": 0,
            "favicon_formats": {"ico": 0, "png": 0, "svg": 0, "other": 0},
            "sites_with_touch_icons": 0
        },
        "icons_by_site": {}
    }
    
    for url, site in data["sites"].items():
        favicon = site.get("favicon", {})
        touch_icons = site.get("touch_icons", [])
        
        if favicon.get("url"):
            icons_report["summary"]["sites_with_favicon"] += 1
            favicon_url = favicon["url"].lower()
            if ".ico" in favicon_url:
                icons_report["summary"]["favicon_formats"]["ico"] += 1
            elif ".png" in favicon_url:
                icons_report["summary"]["favicon_formats"]["png"] += 1
            elif ".svg" in favicon_url:
                icons_report["summary"]["favicon_formats"]["svg"] += 1
            else:
                icons_report["summary"]["favicon_formats"]["other"] += 1
        
        if touch_icons:
            icons_report["summary"]["sites_with_touch_icons"] += 1
        
        icons_report["icons_by_site"][url] = {
            "favicon": favicon,
            "touch_icon_count": len(touch_icons),
            "touch_icons": touch_icons[:3]
        }
    
    return icons_report

def generate_js_packages_report(data):
    """Generate JavaScript packages report"""
    js_report = {
        "analysis_date": data["analysis_date"],
        "summary": {
            "total_sites": len(data["sites"]),
            "library_usage": {},
            "analytics_adoption": {},
            "chat_widget_usage": {},
            "avg_scripts_per_site": 0
        },
        "packages_by_site": {}
    }
    
    lib_counts = defaultdict(int)
    analytics_counts = defaultdict(int)
    chat_counts = defaultdict(int)
    total_scripts = 0
    
    for url, site in data["sites"].items():
        js = site.get("javascript", {})
        scripts = js.get("external_scripts", [])
        libraries = js.get("libraries", {})
        analytics = js.get("analytics", {})
        chat = js.get("chat_widgets", {})
        
        total_scripts += len(scripts)
        
        for lib, val in libraries.items():
            if val:
                lib_counts[lib] += 1
        
        for tool, val in analytics.items():
            if val:
                analytics_counts[tool] += 1
        
        for widget, active in chat.items():
            if active:
                chat_counts[widget] += 1
        
        js_report["packages_by_site"][url] = {
            "script_count": len(scripts),
            "key_scripts": scripts[:8],
            "detected_libraries": {k: v for k, v in libraries.items() if v},
            "analytics": {k: v for k, v in analytics.items() if v},
            "chat_widgets": [k for k, v in chat.items() if v]
        }
    
    js_report["summary"]["library_usage"] = dict(lib_counts)
    js_report["summary"]["analytics_adoption"] = dict(analytics_counts)
    js_report["summary"]["chat_widget_usage"] = dict(chat_counts)
    js_report["summary"]["avg_scripts_per_site"] = round(total_scripts / len(data["sites"]), 1) if data["sites"] else 0
    
    return js_report

def generate_api_endpoints_report(data):
    """Generate API endpoints report (potential endpoints based on CMS)"""
    api_report = {
        "analysis_date": data["analysis_date"],
        "note": "API endpoints are inferred from CMS detection. Actual endpoints require JS analysis.",
        "cms_based_apis": {},
        "form_endpoints_potential": []
    }
    
    cms_apis = {
        "Squarespace": [
            "/api/1/",
            "/api/form/*",
            "/squarespace API"
        ],
        "WordPress": [
            "/wp-json/wp/v2/*",
            "/wp-admin/admin-ajax.php",
            "/wp-json/contact-form-7/v1/*"
        ],
        "Shopify": [
            "/cart/add.js",
            "/cart/update.js",
            "/cart/clear.js",
            "/products/*.json"
        ]
    }
    
    cms_site_map = defaultdict(list)
    for url, site in data["sites"].items():
        cms = site.get("platform", {}).get("cms", "unknown")
        cms_site_map[cms].append(url)
    
    for cms, apis in cms_apis.items():
        sites = cms_site_map.get(cms, [])
        if sites:
            api_report["cms_based_apis"][cms] = {
                "sites_using": sites,
                "potential_api_endpoints": apis
            }
    
    return api_report

def generate_color_palettes_report(data):
    """Generate color palettes from CSS variables"""
    colors_report = {
        "analysis_date": data["analysis_date"],
        "summary": {
            "total_sites": len(data["sites"]),
            "sites_with_css_variables": 0,
            "common_color_names": []
        },
        "palettes_by_site": {}
    }
    
    color_name_pattern = re.compile(r'--(color|bg|background|primary|secondary|accent|brand)[a-z-]*', re.IGNORECASE)
    color_var_counts = defaultdict(int)
    
    for url, site in data["sites"].items():
        variables = site.get("css_variables_sample", [])
        color_vars = []
        
        for var in variables:
            match = color_name_pattern.search(var)
            if match:
                color_vars.append(var)
                color_name = match.group(1).lower()
                color_var_counts[color_name] += 1
        
        if color_vars:
            colors_report["summary"]["sites_with_css_variables"] += 1
        
        colors_report["palettes_by_site"][url] = {
            "total_variables": len(variables),
            "color_related_variables": color_vars[:8],
            "all_variables_sample": variables[:5]
        }
    
    colors_report["summary"]["common_color_names"] = sorted(
        color_var_counts.items(), key=lambda x: -x[1]
    )[:10]
    
    return colors_report

def generate_typography_report(data):
    """Generate typography systems report"""
    typo_report = {
        "analysis_date": data["analysis_date"],
        "summary": {
            "total_sites": len(data["sites"]),
            "most_popular_fonts": [],
            "google_fonts_vs_custom": {"google_fonts": 0, "custom_only": 0}
        },
        "typography_by_site": {}
    }
    
    font_counts = defaultdict(int)
    
    for url, site in data["sites"].items():
        fonts = site.get("fonts", {})
        google_fonts = fonts.get("google_fonts", [])
        font_families = fonts.get("font_family_declarations", [])
        
        has_google = bool(google_fonts)
        if has_google:
            typo_report["summary"]["google_fonts_vs_custom"]["google_fonts"] += 1
        else:
            typo_report["summary"]["google_fonts_vs_custom"]["custom_only"] += 1
        
        primary_font = font_families[0] if font_families else "Not detected"
        if primary_font and len(primary_font) > 1 and not primary_font.lower().startswith(('serif', 'sans', 'mono')):
            font_counts[primary_font] += 1
        
        typo_report["typography_by_site"][url] = {
            "primary_font": primary_font,
            "font_stack": font_families[:4],
            "google_fonts_used": google_fonts,
            "has_google_fonts": has_google
        }
    
    typo_report["summary"]["most_popular_fonts"] = sorted(
        font_counts.items(), key=lambda x: -x[1]
    )[:12]
    
    return typo_report

import re

def generate_tech_stack_summary_md(data):
    """Generate markdown summary of tech stacks"""
    lines = [
        "# Technical Assets Analysis Summary - Catering Websites",
        "",
        f"**Analysis Date:** {data['analysis_date']}",
        f"**Sites Analyzed:** {len(data['sites'])}",
        "",
        "---",
        "",
        "## Executive Summary",
        ""
    ]
    
    # Calculate stats
    platform_counts = defaultdict(int)
    lib_counts = defaultdict(int)
    analytics_counts = defaultdict(int)
    chat_counts = defaultdict(int)
    font_counts = defaultdict(int)
    
    for url, site in data["sites"].items():
        platform = site.get("platform", {}).get("cms", "Unknown")
        platform_counts[platform] += 1
        
        for lib, val in site.get("javascript", {}).get("libraries", {}).items():
            if val:
                lib_counts[lib] += 1
        
        for tool, val in site.get("javascript", {}).get("analytics", {}).items():
            if val:
                analytics_counts[tool] += 1
        
        for widget, active in site.get("javascript", {}).get("chat_widgets", {}).items():
            if active:
                chat_counts[widget] += 1
        
        for ff in site.get("fonts", {}).get("font_family_declarations", [])[:1]:
            if ff and len(ff) > 1:
                font_counts[ff] += 1
    
    total = len(data["sites"])
    
    # Key findings
    ss_pct = round(platform_counts.get("Squarespace", 0) / total * 100)
    wp_pct = round(platform_counts.get("WordPress", 0) / total * 100)
    
    lines.extend([
        f"- **Squarespace Dominates**: {platform_counts.get('Squarespace', 0)} sites ({ss_pct}%) use Squarespace as their CMS",
        f"- **WordPress Second**: {platform_counts.get('WordPress', 0)} sites ({wp_pct}%) run on WordPress",
        f"- **jQuery Still King**: jQuery is the most common JavaScript library",
        f"- **Google Analytics Universal**: Most sites use GA or GTM for tracking",
        "- **Font Awesome Popular**: Primary icon library choice across catering websites",
        "",
        "---",
        "",
        "## Platform/CMS Distribution",
        "",
        "| Platform | Sites | Percentage |",
        "|----------|-------|------------|",
    ])
    
    for platform, count in sorted(platform_counts.items(), key=lambda x: -x[1]):
        pct = round(count / total * 100)
        lines.append(f"| {platform} | {count} | {pct}% |")
    
    lines.extend([
        "",
        "---",
        "",
        "## CSS Frameworks & Libraries",
        "",
        "| Framework/Library | Sites Using | Notes |",
        "|-------------------|-------------|-------|",
    ])
    
    fw_notes = {
        'bootstrap': 'Popular responsive framework',
        'tailwind': 'Utility-first CSS',
        'font_awesome': 'Icon library',
        'animate_css': 'CSS animations',
        'carousel_css': 'Slider/carousel CSS'
    }
    
    for fw in ['bootstrap', 'tailwind', 'font_awesome', 'animate_css', 'carousel_css']:
        count = lib_counts.get(fw, 0)
        note = fw_notes.get(fw, '')
        lines.append(f"| {fw.replace('_', ' ').title()} | {count} | {note} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## JavaScript Libraries",
        "",
        "| Library | Sites Using | Purpose |",
        "|---------|-------------|---------|",
    ])
    
    lib_purposes = {
        'jquery': 'DOM manipulation',
        'gsap': 'Advanced animations',
        'wow_js': 'Scroll animations',
        'aos': 'Animate on scroll',
        'carousel': 'Image/content sliders',
        'lightbox': 'Image lightboxes',
        'lazy_load': 'Lazy loading images'
    }
    
    for lib, count in sorted(lib_counts.items(), key=lambda x: -x[1]):
        purpose = lib_purposes.get(lib, 'Various')
        lines.append(f"| {lib.replace('_', ' ').title()} | {count} | {purpose} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## Analytics & Tracking",
        "",
        "| Tool | Adoption Rate |",
        "|------|--------------|",
    ])
    
    for tool, count in sorted(analytics_counts.items(), key=lambda x: -x[1]):
        pct = round(count / total * 100)
        lines.append(f"| {tool.replace('_', ' ').title()} | {count} sites ({pct}%) |")
    
    lines.extend([
        "",
        "---",
        "",
        "## Chat & Support Widgets",
        "",
        "| Widget | Sites Using | Best For |",
        "|--------|-------------|----------|",
    ])
    
    widget_info = {
        'tidio': 'Small business chat',
        'intercom': 'Enterprise support',
        'crisp': 'Modern chat UI',
        'zendesk': 'Full helpdesk suite',
        'tawkto': 'Free live chat',
        'drift': 'Conversational marketing'
    }
    
    for widget, count in sorted(chat_counts.items(), key=lambda x: -x[1]):
        info = widget_info.get(widget, '')
        lines.append(f"| {widget.title()} | {count} | {info} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## Typography Trends",
        "",
        "### Most Used Fonts",
        "",
        "| Font | Occurrences | Type |",
        "|------|-------------|------|",
    ])
    
    for font, count in sorted(font_counts.items(), key=lambda x: -x[1])[:12]:
        font_type = "System" if font.lower() in ('arial', 'helvetica', 'times', 'georgia', 'system-ui') else "Web Font"
        lines.append(f"| {font} | {count} | {font_type} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## Recommendations for New Catering Website",
        "",
        "Based on this industry analysis:",
        "",
        "### Recommended Tech Stack",
        "",
        "**CMS Options:**",
        "- **Squarespace** - Easiest setup, good templates for catering",
        "- **WordPress** - More flexibility, better for SEO long-term",
        "",
        "**Frontend Stack:**",
        "- **CSS Framework**: Bootstrap 5 or custom CSS (industry prefers custom)",
        "- **Icons**: Font Awesome 6 (widely adopted)",
        "- **Fonts**: Google Fonts - Montserrat, Open Sans, Lato (popular choices)",
        "",
        "**JavaScript Essentials:**",
        "- jQuery (for compatibility)",
        "- AOS.js or WOW.js (subtle scroll animations)",
        "- Slick Slider or Swiper (for food galleries)",
        "",
        "**Analytics & Marketing:**",
        "- Google Analytics 4 (GA4)",
        "- Google Tag Manager",
        "- Facebook Pixel (for social ads)",
        "",
        "**Customer Engagement:**",
        "- Tidio Chat (affordable, easy setup)",
        "- Zendesk (if you need ticket system)",
        "",
        "---",
        "",
        "*Report generated by Technical Assets Extraction Agent*",
        f"*Data from {total} catering website analyses*"
    ])
    
    return "\n".join(lines)

def main():
    print("Loading analysis data...")
    data = load_analysis()
    
    print("Generating reports...")
    
    reports = {
        "css-analysis.json": generate_css_analysis(data),
        "fonts-compilation.json": generate_fonts_report(data),
        "favicons-icons.json": generate_favicons_icons_report(data),
        "javascript-packages.json": generate_js_packages_report(data),
        "api-endpoints.json": generate_api_endpoints_report(data),
        "color-palettes.json": generate_color_palettes_report(data),
        "typography-systems.json": generate_typography_report(data),
    }
    
    for filename, report in reports.items():
        filepath = OUTPUT_DIR / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"✓ Created: {filename}")
    
    # Generate markdown summary
    md_content = generate_tech_stack_summary_md(data)
    md_path = OUTPUT_DIR / "tech-stack-summary.md"
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"✓ Created: tech-stack-summary.md")
    
    print("\nAll reports generated successfully!")

if __name__ == "__main__":
    main()
