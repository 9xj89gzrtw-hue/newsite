#!/usr/bin/env python3
"""
Direct Technical Assets Extraction from HTML Files
"""
import re
import json
from pathlib import Path
from collections import defaultdict
from html.parser import HTMLParser

OUTPUT_DIR = Path("/home/z/my-project/docs/technical-assets")

# Site mapping
SITES = {
    "site_01": "concordecatering.ca",
    "site_02": "myradish.com",
    "site_03": "ridgewells.com",
    "site_04": "sopranoscatering.com",
    "site_05": "concept-catering.de",
    "site_06": "talkofthetownatlanta.com",
    "site_07": "queenofheartscatering.com",
    "site_08": "chicchefcatering.com",
    "site_09": "relishcaterers.com",
    "site_10": "sterlingcateringmn.com",
    "site_11": "tallguyandagrill.com",
    "site_12": "ggcatering.com",
    "site_14": "mculinary.com",
    "site_15": "saltblockhospitality.com",
    "site_16": "thejdkgroup.com",
    "site_17": "bywordofmouth.co.uk",
    "site_18": "creativeedgeparties.com",
    "site_19": "cutandtastelv.com",
    "site_20": "elegantaffairscaterers.com",
    "site_21": "gammacatering.com/en/",
    "site_22": "wolfgangpuckcatering.com",
}

def extract_css_files(html):
    """Extract CSS file links from HTML"""
    patterns = [
        r'href=["\']([^"\']*\.css[^"\']*)["\']',
        r'@import\s+url?\(["\']?([^"\')]+\.css)',
    ]
    css_files = []
    for pattern in patterns:
        matches = re.findall(pattern, html, re.IGNORECASE)
        css_files.extend(matches)
    return list(set(css_files))[:25]

def detect_css_frameworks(html):
    """Detect CSS frameworks being used"""
    frameworks = {}
    
    # Bootstrap detection
    bs_match = re.search(r'bootstrap[.-]?(\d+\.\d+\.\d+|\d+\.\d+)?', html, re.IGNORECASE)
    frameworks['bootstrap'] = f"v{bs_match.group(1)}" if bs_match else (None if 'bootstrap' not in html.lower() else 'detected')
    
    # Tailwind detection
    frameworks['tailwind'] = 'detected' if 'tailwind' in html.lower() else None
    
    # Font Awesome detection
    fa_match = re.search(r'font-?awesome[^"\'>]*', html, re.IGNORECASE)
    frameworks['font_awesome'] = fa_match.group(0) if fa_match else ('detected' if 'font-awesome' in html.lower() or 'fa-' in html else None)
    
    # Animate.css
    frameworks['animate_css'] = 'detected' if 'animate.css' in html.lower() or 'animate.min.css' in html.lower() else None
    
    # Carousel CSS
    carousel = None
    for lib in ['slick', 'swiper', 'owl.carousel']:
        if lib in html.lower():
            carousel = f'{lib} detected'
            break
    frameworks['carousel_css'] = carousel
    
    return frameworks

def extract_fonts(html):
    """Extract font information"""
    fonts = {
        'google_fonts': [],
        'font_family_declarations': [],
        '@font_face': []
    }
    
    # Google Fonts
    gf_matches = re.findall(r'fonts\.googleapis\.com/css\?family=([^"&]+)', html)
    for match in gf_matches:
        font_name = match.split(':')[0].replace('+', ' ')
        if font_name not in fonts['google_fonts']:
            fonts['google_fonts'].append(font_name)
    
    # Font-family declarations
    ff_matches = re.findall(r'font-family\s*:\s*([^;}{]+)', html, re.IGNORECASE)
    for ff in ff_matches:
        # Clean up and get primary font
        primary = ff.split(',')[0].strip().strip('"\'')
        if primary and len(primary) > 1 and primary not in fonts['font_family_declarations']:
            fonts['font_family_declarations'].append(primary)
    
    # @font-face
    fontface_matches = re.findall(r'@font-face\s*\{[^}]+\}', html, re.IGNORECASE | re.DOTALL)
    fonts['@font_face'] = fontface_matches[:5]
    
    return fonts

def extract_favicon(html):
    """Extract favicon information"""
    favicon = {'url': None, 'type': None}
    
    # Look for icon link tags
    icon_patterns = [
        r'<link[^>]*rel=["\'](?:shortcut\s+)?icon["\'][^>]*href=["\']([^"\']+)["\'][^>]*>',
        r'<link[^>]*href=["\']([^"\']+favicon[^"\']*)["\'][^>]*rel=["\'](?:shortcut\s+)?icon["\'][^>]*>',
    ]
    
    for pattern in icon_patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            favicon['url'] = match.group(1)
            type_match = re.search(r'type=["\']([^"\']+)', match.group(0))
            favicon['type'] = type_match.group(1) if type_match else 'image/x-icon'
            break
    
    if not favicon['url']:
        # Try to find any favicon reference
        fav_match = re.search(r'favicon\.(ico|png|svg|gif)', html, re.IGNORECASE)
        if fav_match:
            favicon['url'] = fav_match.group(0)
            favicon['type'] = f'image/{fav_match.group(1)}'
    
    return favicon

def extract_touch_icons(html):
    """Extract touch icons"""
    icons = []
    pattern = r'<link[^>]*rel=["\']apple-touch-icon[^"\']*["\'][^>]*href=["\']([^"\']+)["\']'
    matches = re.findall(pattern, html, re.IGNORECASE)
    icons.extend(matches)
    return icons

def extract_javascript(html):
    """Extract JavaScript information"""
    js_info = {
        'external_scripts': [],
        'libraries': {},
        'analytics': {},
        'chat_widgets': {}
    }
    
    # External scripts
    script_pattern = r'src=["\']([^"\']*\.js[^"\']*)["\']'
    scripts = re.findall(script_pattern, html)
    js_info['external_scripts'] = list(set(scripts))[:30]
    
    # Library detection
    libraries = {
        'jquery': r'jquery[.-]?(\d[\.\w]*)?',
        'gsap': r'(gsap|TweenMax|TweenLite|TimelineMax)',
        'wow_js': r'wow\.(min\.)?js',
        'aos': r'aos\.(min\.)?js',
        'carousel': r'(slick|swiper|owl)\.[^"\']*\.js',
        'lightbox': r'(lightbox|fancybox|magnific)[^"\']*\.js',
        'lazy_load': r'(lazyload|lozad)[^"\']*\.js'
    }
    
    for lib, pattern in libraries.items():
        match = re.search(pattern, html, re.IGNORECASE)
        js_info['libraries'][lib] = match.group(0) if match else None
    
    # Analytics detection
    analytics = {
        'google_analytics': r'(gtag\(|GA_MEASUREMENT_ID|googletagmanager|google-analytics|G-[A-Z0-9]{10}|UA-\d+-\d+)',
        'facebook_pixel': r'(fbq\(|facebook.*pixel|fbevents\.js)',
        'hotjar': r'(hotjar|hj\()',
        'google_tag_manager': r'(googletagmanager\.com/gtm|gtm\.js)'
    }
    
    for tool, pattern in analytics.items():
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            # Extract GA ID if present
            if tool == 'google_analytics':
                ga_id = re.search(r'(G-[A-Z0-9]{10}|UA-\d+-\d+)', match.group(0))
                js_info['analytics'][tool] = ga_id.group(0) if ga_id else 'detected'
            else:
                js_info['analytics'][tool] = 'detected'
        else:
            js_info['analytics'][tool] = None
    
    # Chat widget detection
    chat_widgets = {
        'tidio': r'(tidio|tidiochat|code\.tidiochat\.com)',
        'intercom': r'(intercom|intercom\.io)',
        'crisp': r'(crisp\.chat|crisp\.im)',
        'zendesk': r'(zendesk|zE\(|ekr\.zendesk)',
        'tawkto': r'(tawk\.to|tawkto)',
        'drift': r'drift\.co'
    }
    
    for widget, pattern in chat_widgets.items():
        match = re.search(pattern, html, re.IGNORECASE)
        js_info['chat_widgets'][widget] = bool(match)
    
    return js_info

def extract_css_variables(html):
    """Extract CSS custom properties (variables)"""
    var_pattern = r'(--[a-zA-Z_][a-zA-Z0-9_-]*\s*:\s*[^;{}]+)'
    variables = re.findall(var_pattern, html)
    return list(set(variables))[:30]

def extract_meta_tags(html):
    """Extract meta tag information"""
    meta = {}
    
    viewport = re.search(r'<meta[^>]*viewport[^>]*content="([^"]*)"', html, re.IGNORECASE)
    meta['viewport'] = viewport.group(1) if viewport else None
    
    description = re.search(r'<meta[^>]*description[^>]*content="([^"]*)"', html, re.IGNORECASE)
    meta['description'] = description.group(1) if description else None
    
    generator = re.search(r'<meta[^>]*generator[^>]*content="([^"]*)"', html, re.IGNORECASE)
    meta['generator'] = generator.group(1) if generator else None
    
    return meta

def detect_platform(html):
    """Detect CMS/Platform"""
    platform = {'cms': 'unknown'}
    
    if 'squarespace' in html.lower():
        platform['cms'] = 'Squarespace'
    elif 'wp-content' in html.lower() or 'wp-json' in html.lower() or 'wordpress' in html.lower():
        platform['cms'] = 'WordPress'
    elif 'shopify' in html.lower():
        platform['cms'] = 'Shopify'
    elif 'wix' in html.lower():
        platform['cms'] = 'Wix'
    elif 'drupal' in html.lower():
        platform['cms'] = 'Drupal'
    elif 'craftcms' in html.lower() or 'craft' in html.lower():
        platform['cms'] = 'CraftCMS'
    
    return platform

def analyze_site(site_file, site_url):
    """Analyze a single site's HTML file"""
    html_path = OUTPUT_DIR / f"{site_file}.html"
    
    if not html_path.exists():
        return None
    
    with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    
    return {
        'css_files': extract_css_files(html),
        'css_frameworks': detect_css_frameworks(html),
        'fonts': extract_fonts(html),
        'favicon': extract_favicon(html),
        'touch_icons': extract_touch_icons(html),
        'javascript': extract_javascript(html),
        'css_variables_sample': extract_css_variables(html),
        'meta': extract_meta_tags(html),
        'platform': detect_platform(html),
        'html_size_bytes': len(html.encode('utf-8'))
    }

def main():
    print("Starting technical assets extraction...")
    
    all_data = {
        'analysis_date': __import__('datetime').datetime.now().isoformat(),
        'sites': {}
    }
    
    for site_file, site_url in SITES.items():
        print(f"Analyzing {site_url}...")
        result = analyze_site(site_file, site_url)
        if result:
            all_data['sites'][site_url] = result
    
    print(f"\nAnalyzed {len(all_data['sites'])} sites")
    
    # Save complete analysis
    output_path = OUTPUT_DIR / "complete_analysis.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    print(f"Saved: {output_path.name}")
    
    return all_data

if __name__ == "__main__":
    main()
