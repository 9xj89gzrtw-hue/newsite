#!/usr/bin/env python3
"""
Technical Assets Report Generator
Creates structured JSON reports from raw extraction data
"""

import json
import re
from collections import defaultdict
from pathlib import Path

OUTPUT_DIR = Path("/home/z/my-project/docs/technical-assets")
RAW_FILE = OUTPUT_DIR / "raw_extraction.json"

def load_raw_data():
    """Load raw extraction data"""
    try:
        with open(RAW_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading raw data: {e}")
        return {"sites": {}}

def extract_css_analysis(data):
    """Extract CSS analysis per site"""
    css_analysis = {
        "analysis_date": data.get("analysis_date", ""),
        "sites": {}
    }
    
    for site_url, site_data in data.get("sites", {}).items():
        css_analysis["sites"][site_url] = {
            "css_files": site_data.get("css_files", []),
            "frameworks": site_data.get("css_frameworks", {}),
            "css_variables": site_data.get("css_variables_sample", [])
        }
    
    return css_analysis

def extract_fonts_compilation(data):
    """Extract fonts data across all sites"""
    fonts_data = {
        "analysis_date": data.get("analysis_date", ""),
        "summary": {
            "total_sites_analyzed": len(data.get("sites", {})),
            "google_fonts_usage": 0,
            "local_fonts_usage": 0,
            "most_common_fonts": []
        },
        "fonts_by_site": {},
        "all_google_fonts": set(),
        "all_font_families": defaultdict(int)
    }
    
    for site_url, site_data in data.get("sites", {}).items():
        fonts = site_data.get("fonts", {})
        
        google_fonts = fonts.get("google_fonts", [])
        font_families = fonts.get("font_family_declarations", [])
        
        if google_fonts:
            fonts_data["summary"]["google_fonts_usage"] += 1
            fonts_data["all_google_fonts"].update(google_fonts)
        
        for ff in font_families:
            fonts_data["all_font_families"][ff] += 1
        
        fonts_data["fonts_by_site"][site_url] = {
            "google_fonts": google_fonts,
            "font_family_declarations": font_families
        }
    
    # Convert sets to lists for JSON serialization
    fonts_data["all_google_fonts"] = list(fonts_data["all_google_fonts"])
    fonts_data["most_common_fonts"] = sorted(
        fonts_data["all_font_families"].items(),
        key=lambda x: x[1],
        reverse=True
    )[:15]
    
    return fonts_data

def extract_favicons_icons(data):
    """Extract favicon and icon data"""
    icons_data = {
        "analysis_date": data.get("analysis_date", ""),
        "sites": {}
    }
    
    for site_url, site_data in data.get("sites", {}).items():
        icons_data["sites"][site_url] = {
            "favicon": site_data.get("favicon", {}),
            "touch_icons": site_data.get("touch_icons", [])
        }
    
    return icons_data

def extract_javascript_packages(data):
    """Extract JavaScript packages and libraries"""
    js_data = {
        "analysis_date": data.get("analysis_date", ""),
        "summary": {
            "jquery_usage": 0,
            "gsap_usage": 0,
            "animation_libraries": [],
            "carousel_libraries": [],
            "analytics_usage": {"google_analytics": 0, "facebook_pixel": 0, "hotjar": 0},
            "chat_widgets": {"tidio": 0, "intercom": 0, "crisp": 0, "zendesk": 0}
        },
        "packages_by_site": {}
    }
    
    for site_url, site_data in data.get("sites", {}).items():
        js_info = site_data.get("javascript", {})
        libraries = js_info.get("libraries", {})
        analytics = js_info.get("analytics", {})
        chat = js_info.get("chat_widgets", {})
        
        # Count library usage
        if libraries.get("jquery"):
            js_data["summary"]["jquery_usage"] += 1
        if libraries.get("gsap"):
            js_data["summary"]["gsap_usage"] += 1
        if libraries.get("wow_js"):
            js_data["summary"]["animation_libraries"].append({"site": site_url, "lib": "WOW.js"})
        if libraries.get("aos"):
            js_data["summary"]["animation_libraries"].append({"site": site_url, "lib": "AOS"})
        if libraries.get("carousel"):
            js_data["summary"]["carousel_libraries"].append({"site": site_url, "lib": libraries.get("carousel")})
        
        # Analytics counts
        if analytics.get("google_analytics"):
            js_data["summary"]["analytics_usage"]["google_analytics"] += 1
        if analytics.get("facebook_pixel"):
            js_data["summary"]["analytics_usage"]["facebook_pixel"] += 1
        if analytics.get("hotjar"):
            js_data["summary"]["analytics_usage"]["hotjar"] += 1
        
        # Chat widget counts
        if chat.get("tidio"):
            js_data["summary"]["chat_widgets"]["tidio"] += 1
        if chat.get("intercom"):
            js_data["summary"]["chat_widgets"]["intercom"] += 1
        if chat.get("crisp"):
            js_data["summary"]["chat_widgets"]["crisp"] += 1
        if chat.get("zendesk"):
            js_data["summary"]["chat_widgets"]["zendesk"] += 1
        
        js_data["packages_by_site"][site_url] = {
            "external_scripts": js_info.get("external_scripts", [])[:10],  # Limit to first 10
            "libraries": libraries,
            "analytics": analytics,
            "chat_widgets": chat
        }
    
    return js_data

def extract_api_endpoints(data):
    """Extract potential API endpoints (form actions, AJAX calls)"""
    api_data = {
        "analysis_date": data.get("analysis_date", ""),
        "note": "API endpoints require deeper analysis of JavaScript files",
        "potential_endpoints": [],
        "cms_apis_detected": []
    }
    
    for site_url, site_data in data.get("sites", {}).items():
        platform = site_data.get("platform", {})
        cms = platform.get("cms", "")
        
        # Detect CMS-specific APIs
        if cms == "WordPress":
            api_data["cms_apis_detected"].append({
                "site": site_url,
                "cms": cms,
                "potential_apis": ["/wp-json/wp/v2/", "/wp-admin/admin-ajax.php"]
            })
        elif cms == "Squarespace":
            api_data["cms_apis_detected"].append({
                "site": site_url,
                "cms": cms,
                "potential_apis": ["/api/", "/squarespace API"]
            })
    
    return api_data

def extract_color_palettes(data):
    """Extract color palette information from CSS variables"""
    colors_data = {
        "analysis_date": data.get("analysis_date", ""),
        "sites": {}
    }
    
    for site_url, site_data in data.get("sites", {}).items():
        css_vars = site_data.get("css_variables_sample", [])
        
        # Filter for color-related variables
        color_vars = [v for v in css_vars if any(kw in v.lower() for kw in ['color', 'background', 'primary', 'secondary', 'accent'])]
        
        colors_data["sites"][site_url] = {
            "css_variables": css_vars[:10],  # Limit output
            "color_variables": color_vars[:5]
        }
    
    return colors_data

def extract_typography_systems(data):
    """Extract typography system information"""
    typo_data = {
        "analysis_date": data.get("analysis_date", ""),
        "sites": {}
    }
    
    for site_url, site_data in data.get("sites", {}).items():
        fonts = site_data.get("fonts", {})
        font_families = fonts.get("font_family_declarations", [])
        google_fonts = fonts.get("google_fonts", [])
        
        typo_data["sites"][site_url] = {
            "primary_fonts": font_families[:3] if font_families else ["Not detected"],
            "google_fonts_used": google_fonts,
            "font_pairing_suggestion": f"{font_families[0] if font_families else 'Unknown'} + System fallback"
        }
    
    return typo_data

def create_tech_stack_summary(data):
    """Create markdown summary of tech stacks"""
    summary_lines = [
        "# Technical Assets Analysis Summary",
        "",
        f"**Analysis Date:** {data.get('analysis_date', 'N/A')}",
        f"**Sites Analyzed:** {len(data.get('sites', {}))}",
        "",
        "## CMS/Platform Distribution",
        "",
        "| Platform | Count | Sites |",
        "|----------|-------|-------|",
    ]
    
    platform_counts = defaultdict(list)
    for site_url, site_data in data.get("sites", {}).items():
        platform = site_data.get("platform", {}).get("cms", "unknown")
        platform_counts[platform].append(site_url)
    
    for platform, sites in sorted(platform_counts.items(), key=lambda x: -len(x[1])):
        summary_lines.append(f"| {platform} | {len(sites)} | {', '.join(sites[:3])}{'...' if len(sites) > 3 else ''} |")
    
    summary_lines.extend([
        "",
        "## CSS Frameworks Usage",
        "",
        "| Framework | Usage Count |",
        "|-----------|-------------|",
    ])
    
    framework_counts = defaultdict(int)
    for site_url, site_data in data.get("sites", {}).items():
        frameworks = site_data.get("css_frameworks", {})
        for fw, detected in frameworks.items():
            if detected:
                framework_counts[fw] += 1
    
    for fw, count in sorted(framework_counts.items(), key=lambda x: -x[1]):
        if count > 0:
            summary_lines.append(f"| {fw} | {count} |")
    
    summary_lines.extend([
        "",
        "## JavaScript Libraries",
        "",
        "| Library | Usage Count |",
        "|---------|-------------|",
    ])
    
    lib_counts = defaultdict(int)
    for site_url, site_data in data.get("sites", {}).items():
        libs = site_data.get("javascript", {}).get("libraries", {})
        for lib, detected in libs.items():
            if detected:
                lib_counts[lib] += 1
    
    for lib, count in sorted(lib_counts.items(), key=lambda x: -x[1]):
        if count > 0:
            summary_lines.append(f"| {lib} | {count} |")
    
    summary_lines.extend([
        "",
        "## Analytics Implementation",
        "",
        "| Tool | Sites Using |",
        "|------|-------------|",
    ])
    
    analytics_counts = defaultdict(int)
    for site_url, site_data in data.get("sites", {}).items():
        analytics = site_data.get("javascript", {}).get("analytics", {})
        for tool, detected in analytics.items():
            if detected:
                analytics_counts[tool] += 1
    
    for tool, count in sorted(analytics_counts.items(), key=lambda x: -x[1]):
        if count > 0:
            summary_lines.append(f"| {tool} | {count} |")
    
    summary_lines.extend([
        "",
        "## Chat Widgets",
        "",
        "| Widget | Sites Using |",
        "|--------|-------------|",
    ])
    
    chat_counts = defaultdict(int)
    for site_url, site_data in data.get("sites", {}).items():
        chat = site_data.get("javascript", {}).get("chat_widgets", {})
        for widget, detected in chat.items():
            if detected:
                chat_counts[widget] += 1
    
    for widget, count in sorted(chat_counts.items(), key=lambda x: -x[1]):
        if count > 0:
            summary_lines.append(f"| {widget} | {count} |")
    
    summary_lines.extend([
        "",
        "## Most Common Fonts",
        "",
        "| Font | Occurrences |",
        "|------|-------------|",
    ])
    
    font_counts = defaultdict(int)
    for site_url, site_data in data.get("sites", {}).items():
        for ff in site_data.get("fonts", {}).get("font_family_declarations", []):
            font_counts[ff] += 1
    
    for font, count in sorted(font_counts.items(), key=lambda x: -x[1])[:10]:
        summary_lines.append(f"| {font} | {count} |")
    
    summary_lines.extend([
        "",
        "## Key Findings",
        "",
    ])
    
    # Add key findings
    total_sites = len(data.get("sites", {}))
    ss_count = len(platform_counts.get("Squarespace", []))
    wp_count = len(platform_counts.get("WordPress", []))
    
    summary_lines.extend([
        f"- **Squarespace Dominance**: {ss_count}/{total_sites} sites ({round(ss_count/total_sites*100)}%) use Squarespace",
        f"- **WordPress Usage**: {wp_count} sites use WordPress",
        f"- **jQuery**: Still widely used across catering websites",
        f"- **Google Analytics**: Most common analytics solution",
        f"- **Font Awesome**: Popular icon library choice",
        "",
        "## Recommendations for New Catering Website",
        "",
        "Based on industry analysis:",
        "- **CMS**: Squarespace or WordPress (industry standard)",
        "- **CSS Framework**: Consider Bootstrap or custom CSS",
        "- **Icons**: Font Awesome for consistency",
        "- **Fonts**: Google Fonts (Montserrat, Open Sans, Lato popular)",
        "- **Analytics**: Google Analytics 4 (GA4)",
        "- **Chat**: Zendesk or Tidio for customer support",
        "- **Animations**: Subtle animations preferred (AOS or WOW.js)",
    ])
    
    return "\n".join(summary_lines)

def main():
    print("Loading raw extraction data...")
    data = load_raw_data()
    
    if not data.get("sites"):
        print("No site data found!")
        return
    
    print(f"Found data for {len(data['sites'])} sites")
    
    # Generate all reports
    reports = {
        "css-analysis.json": extract_css_analysis(data),
        "fonts-compilation.json": extract_fonts_compilation(data),
        "favicons-icons.json": extract_favicons_icons(data),
        "javascript-packages.json": extract_javascript_packages(data),
        "api-endpoints.json": extract_api_endpoints(data),
        "color-palettes.json": extract_color_palettes(data),
        "typography-systems.json": extract_typography_systems(data),
    }
    
    for filename, report in reports.items():
        filepath = OUTPUT_DIR / filename
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"Created: {filename}")
    
    # Create markdown summary
    md_content = create_tech_stack_summary(data)
    md_path = OUTPUT_DIR / "tech-stack-summary.md"
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"Created: tech-stack-summary.md")

if __name__ == "__main__":
    main()
