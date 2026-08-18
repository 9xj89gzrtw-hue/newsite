#!/usr/bin/env python3
"""
Extract footer patterns from fetched website JSON files.
Analyzes footer structure, links, copyright, social media, and legal elements.
"""

import json
import os
import re
from pathlib import Path
from collections import defaultdict

OUTPUT_DIR = Path("/home/z/my-project/newsite/docs/footer-library")

# Site mapping
SITES = {
    "site1_concorde.json": "concordecatering.ca",
    "site2_myradish.json": "myradish.com",
    "site3_ridgewells.json": "ridgewells.com",
    "site4_sopranos.json": "sopranoscatering.com",
    "site5_concept.json": "concept-catering.de",
    "site6_talkofthetown.json": "talkofthetownatlanta.com",
    "site7_queenofhearts.json": "queenofheartscatering.com",
    "site8_chicchef.json": "chicchefcatering.com",
    "site9_relish.json": "relishcaterers.com",
    "site10_sterling.json": "sterlingcateringmn.com",
    "site11_tallguy.json": "tallguyandagrill.com",
    "site12_joels.json": "joels.com",
    "site13_gg.json": "ggcatering.com",
    "site14_mculinary.json": "mculinary.com",
    "site15_saltblock.json": "saltblockhospitality.com",
    "site16_jdkgroup.json": "thejdkgroup.com",
    "site17_bywordofmouth.json": "bywordofmouth.co.uk",
    "site18_creativeedge.json": "creativeedgeparties.com",
    "site19_cutandtaste.json": "cutandtastelv.com",
    "site20_elegantaffairs.json": "elegantaffairscaterers.com",
    "site21_gamma.json": "gammacatering.com",
    "site22_wolfgangpuck.json": "wolfgangpuckcatering.com",
}

def extract_footer_html(html_content):
    """Extract footer element from HTML."""
    # Try various footer patterns
    patterns = [
        r'<footer[^>]*>(.*?)</footer>',
        r'<div[^>]*id=["\']footer["\'][^>]*>(.*?)</div>\s*(?=<div|<footer|$)',
        r'<div[^>]*class=["\'][^"\']*footer[^"\']*["\'][^>]*>(.*?)</div>',
        r'role=["\']contentinfo["\'][^>]*>(.*?)</\w+>',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, html_content, re.DOTALL | re.IGNORECASE)
        if match:
            return match.group(0)
    
    # If no footer found, look for common footer classes near end of page
    # Get last portion of HTML that might contain footer
    if len(html_content) > 10000:
        tail = html_content[-10000:]
        for pattern in patterns[:3]:
            match = re.search(pattern, tail, re.DOTALL | re.IGNORECASE)
            if match:
                return match.group(1)
    
    return None

def extract_links(html_content):
    """Extract all links from HTML."""
    links = []
    pattern = r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>([^<]*)</a>'
    for match in re.finditer(pattern, html_content, re.IGNORECASE):
        href = match.group(1).strip()
        text = match.group(2).strip()
        if href and not href.startswith('#') and not href.startswith('javascript:'):
            links.append({"href": href, "text": text})
    return links

def extract_copyright(html_content):
    """Extract copyright notice from HTML."""
    patterns = [
        r'(©|&copy;|\u00a9)\s*\d{4}[\s\-–—]?\d{0,4}[^<]{0,200}',
        r'[Cc]opyright[\s\x00-\x7f]{0,10}\d{4}[^<]{0,150}',
        r'\d{4}[\s\-–—]?.*[Aa]ll\s+[Rr]ights\s+[Rr]eserved[^<]{0,100}',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, html_content, re.IGNORECASE)
        if match:
            text = match.group(0).strip()
            # Clean up HTML entities
            text = re.sub(r'<[^>]+>', '', text)
            text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
            return text[:300]
    
    return None

def extract_social_media(html_content):
    """Extract social media links and platforms."""
    social_patterns = {
        'facebook': [r'facebook\.com', r'fb\.com', r'facebook', r'Facebook'],
        'instagram': [r'instagram\.com', r'Instagram', r'instagram'],
        'twitter': [r'twitter\.com', r'x\.com', r'Twitter', r'X\.com'],
        'linkedin': [r'linkedin\.com', r'LinkedIn'],
        'pinterest': [r'pinterest\.com', r'Pinterest'],
        'youtube': [r'youtube\.com', r'youtu\.be', r'YouTube'],
        'tiktok': [r'tiktok\.com', r'TikTok'],
        'yelp': [r'yelp\.com', r'Yelp'],
        'houzz': [r'houzz\.com', r'Houzz'],
    }
    
    found_platforms = []
    for platform, patterns in social_patterns.items():
        for pattern in patterns:
            if re.search(pattern, html_content, re.IGNORECASE):
                found_platforms.append(platform)
                break
    
    return found_platforms

def extract_address(html_content):
    """Extract address information from footer."""
    address_patterns = [
        r'\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Way|Circle|Cir)[,\s]+[\w\s]+(?:[A-Z]{2})?\s*[\d-]{5}',
        r'(?:Address:?\s*)[\d\w\s,.\-()]+(?:[A-Z]{2}\s*[\d-]{5})',
    ]
    
    addresses = []
    for pattern in address_patterns:
        matches = re.findall(pattern, html_content, re.IGNORECASE)
        addresses.extend(matches)
    
    return list(set(addresses))[:3]  # Return up to 3 unique addresses

def extract_newsletter_signup(html_content):
    """Check for newsletter signup form in footer."""
    patterns = [
        r'(newsletter|email\s*signup|subscribe|join\s*our\s*list)',
        r'<input[^>]*type=["\']email["\']',
        r'<form[^>]*>(?:.(?!<\/form>))*?(?:subscribe|newsletter|signup).(?:.(?!<\/form>))*?<\/form>',
    ]
    
    has_newsletter = False
    newsletter_text = ""
    
    for pattern in patterns:
        if re.search(pattern, html_content, re.DOTALL | re.IGNORECASE):
            has_newsletter = True
            if 'newsletter' in pattern.lower() or 'subscribe' in pattern.lower():
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    newsletter_text = match.group(0)[:200]
            break
    
    return {"has_newsletter": has_newsletter, "text": newsletter_text}

def extract_legal_links(links):
    """Extract legal page links."""
    legal_keywords = {
        'privacy_policy': ['privacy', 'privacy-policy', 'privacypolicy'],
        'terms': ['terms', 'terms-of-service', 'termsofservice', 'terms-conditions', 'termsandconditions'],
        'cookies': ['cookies', 'cookie-policy', 'cookiepolicy'],
        'accessibility': ['accessibility', 'ada', 'wcag'],
    }
    
    legal_urls = {}
    for link in links:
        href = link.get('href', '').lower()
        text = link.get('text', '').lower()
        
        for legal_type, keywords in legal_keywords.items():
            for keyword in keywords:
                if keyword in href or keyword in text:
                    if legal_type not in legal_urls:
                        legal_urls[legal_type] = link
                    break
    
    return legal_urls

def detect_column_structure(footer_html):
    """Detect column structure in footer."""
    if not footer_html:
        return {"columns": 0, "labels": []}
    
    # Look for common column indicators
    col_patterns = [
        r'class="[^"]*col-[^"]*"',
        r'class="[^"]*column[^"]*"',
        r'<ul[^>]*>\s*(<li>)',
    ]
    
    # Count potential columns by looking for heading tags (h3, h4, h5) which often label columns
    headings = re.findall(r'<h[3-5][^>]*>([^<]+)</h[3-5]>', footer_html, re.IGNORECASE)
    
    # Also check for strong/b tags used as labels
    strong_labels = re.findall(r'<(?:strong|b)[^>]*>([^<]+)</(?:strong|b)>', footer_html, re.IGNORECASE)
    
    # Filter to likely column labels (short text, meaningful words)
    all_labels = headings + strong_labels
    filtered_labels = [l.strip() for l in all_labels if len(l.strip()) > 2 and len(l.strip()) < 50]
    
    # Estimate columns based on labels found
    num_columns = min(len(filtered_labels), 6) if filtered_labels else 1
    
    return {
        "columns": num_columns,
        "column_labels": filtered_labels[:8]
    }

def extract_cookie_consent(html_content):
    """Extract cookie consent banner information."""
    cookie_indicators = [
        r'cookie',
        r'consent',
        r'gdpr',
        r'ccpa',
        r'privacy',
        r'track',
        r'we use cookies',
        r'cookie policy',
        r'accept cookies',
        r'decline cookies',
    ]
    
    has_cookie_banner = False
    banner_text = ""
    buttons = []
    
    # Look for cookie consent containers
    consent_patterns = [
        r'<div[^>]*(?:cookie|consent)[^>]*>(.*?)</div>',
        r'id=["\'](?:cookie|consent)["\'][^>]*>(.*?)</\w+>',
        r'class=["\'][^"\']*cookie[^"\']*["\'][^>]*>(.*?)</\w+>',
    ]
    
    for pattern in consent_patterns:
        match = re.search(pattern, html_content, re.DOTALL | re.IGNORECASE)
        if match:
            content = match.group(1)
            # Check if it looks like a consent banner
            for indicator in cookie_indicators[:5]:
                if re.search(indicator, content, re.IGNORECASE):
                    has_cookie_banner = True
                    banner_text = re.sub(r'<[^>]+>', ' ', content)[:500].strip()
                    break
            
            if has_cookie_banner:
                # Extract button text
                button_matches = re.finditer(r'<button[^>*>([^<]*)</button>|<a[^>]*>(Accept|Decline|Reject|Allow|Settings|Preferences|Manage|OK|Got it|Agree)</a>', content, re.IGNORECASE)
                for btn_match in button_matches:
                    btn_text = btn_match.group(1) or btn_match.group(2)
                    if btn_text:
                        buttons.append(btn_text.strip())
                break
    
    # Also check full page for cookie mentions at top level (often in scripts or hidden divs)
    if not has_cookie_banner:
        for indicator in ['we use cookies', 'this site uses cookies', 'cookie consent']:
            if re.search(indicator, html_content, re.IGNORECASE):
                has_cookie_banner = True
                banner_text = f"Cookie consent detected via keyword: {indicator}"
                break
    
    return {
        "has_cookie_banner": has_cookie_banner,
        "banner_text": banner_text[:400],
        "buttons": list(set(buttons))[:6]
    }

def analyze_site(filepath, site_name):
    """Analyze a single site's footer data."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        html_content = data.get('data', {}).get('html', '')
        
        if not html_content:
            return {"site": site_name, "error": "No HTML content found"}
        
        # Extract footer
        footer_html = extract_footer_html(html_content)
        
        # Extract components
        links = extract_links(footer_html) if footer_html else extract_links(html_content[-5000:])
        copyright_text = extract_copyright(html_content)
        social_platforms = extract_social_media(html_content)
        addresses = extract_address(html_content)
        newsletter = extract_newsletter_signup(html_content)
        legal_links = extract_legal_links(links)
        column_structure = detect_column_structure(footer_html)
        cookie_consent = extract_cookie_consent(html_content)
        
        return {
            "site": site_name,
            "columns": column_structure["columns"],
            "column_labels": column_structure["column_labels"],
            "links_count": len(links),
            "links_sample": links[:15],
            "has_newsletter": newsletter["has_newsletter"],
            "has_social": len(social_platforms) > 0,
            "social_platforms": social_platforms,
            "copyright_format": copyright_text,
            "address_display": "full" if addresses else ("partial" if any(a for a in addresses) else "none"),
            "addresses": addresses[:2],
            "legal_urls": {k: v.get('href', '') for k, v in legal_links.items()},
            "cookie_consent": cookie_consent
        }
        
    except Exception as e:
        return {"site": site_name, "error": str(e)}

def main():
    """Main analysis function."""
    results = []
    all_social = defaultdict(int)
    all_legal_urls = {"privacy_policy": {}, "terms": {}, "cookies": {}, "accessibility": {}}
    cookie_patterns = []
    common_links = defaultdict(int)
    
    print("Starting footer analysis...")
    
    for filename, site_name in SITES.items():
        filepath = OUTPUT_DIR / filename
        
        if not filepath.exists():
            print(f"⚠️ Missing: {filename}")
            results.append({"site": site_name, "error": "File not found"})
            continue
        
        print(f"📄 Analyzing: {site_name}")
        analysis = analyze_site(str(filepath), site_name)
        results.append(analysis)
        
        # Aggregate statistics
        if "error" not in analysis:
            # Social media frequency
            for platform in analysis.get("social_platforms", []):
                all_social[platform] += 1
            
            # Legal URLs
            for url_type, url in analysis.get("legal_urls", {}).items():
                if url:
                    all_legal_urls[url_type][site_name] = url
            
            # Cookie consent patterns
            if analysis.get("cookie_consent", {}).get("has_cookie_banner"):
                cookie_patterns.append({
                    "site": site_name,
                    "banner_text": analysis["cookie_consent"].get("banner_text", ""),
                    "buttons": analysis["cookie_consent"].get("buttons", [])
                })
            
            # Common links
            for link in analysis.get("links_sample", []):
                text = link.get("text", "").strip().lower()
                if text and len(text) > 2:
                    common_links[text] += 1
    
    # Create comprehensive output
    output = {
        "metadata": {
            "generated": __import__('datetime').datetime.now().isoformat(),
            "sites_analyzed": len(results),
            "successful_analyses": sum(1 for r in results if "error" not in r)
        },
        "footer_patterns": {
            "link_structures": results,
            "common_elements": {
                "most_common_links": sorted(common_links.items(), key=lambda x: -x[1])[:30],
                "social_platforms_frequency": dict(all_social),
                "newsletter_sites": [r["site"] for r in results if r.get("has_newsletter")]
            }
        },
        "legal_pages": all_legal_urls,
        "cookie_consent_patterns": cookie_patterns
    }
    
    # Save results
    output_path = OUTPUT_DIR / "complete-footer-analysis.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Analysis complete! Results saved to: {output_path}")
    print(f"   Sites analyzed: {len(results)}")
    print(f"   Successful: {sum(1 for r in results if 'error' not in r)}")
    print(f"   Cookie consent patterns found: {len(cookie_patterns)}")
    
    return output

if __name__ == "__main__":
    main()
