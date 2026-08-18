#!/usr/bin/env python3
"""
Footer and URL Extraction Script for Catering Sites
Extracts footer content, legal text, and URL structure from raw JSON files
"""

import json
import re
import os
from pathlib import Path
from collections import defaultdict
from bs4 import BeautifulSoup

RAW_DIR = Path("/home/z/my-project/newsite/docs/reference-assets/raw")
OUTPUT_DIR = Path("/home/z/my-project/newsite/docs/footer-library")

def load_json_file(filepath):
    """Load and parse a raw JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_footer_content(html_content, site_name):
    """Extract footer content from HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    result = {
        "name": site_name,
        "columns": [],
        "contact": {},
        "social": {},
        "legal": {},
        "copyright": "",
        "paymentMethods": [],
        "certifications": [],
        "newsletter": False,
        "uniqueElements": []
    }
    
    # Find footer element(s)
    footers = soup.find_all('footer')
    if not footers:
        # Try to find footer by common classes/ids
        footers = soup.find_all(['div', 'section'], class_=re.compile(r'footer|Foot', re.I))
    
    for footer in footers:
        footer_text = footer.get_text(separator=' ', strip=True)
        
        # Extract navigation columns (typically lists in footer)
        nav_sections = footer.find_all(['ul', 'nav'])
        for section in nav_sections:
            links = section.find_all('a')
            if links:
                column_data = {"heading": "", "links": []}
                # Try to get heading from previous sibling or parent header
                parent = section.parent
                if parent:
                    heading_elem = parent.find(['h2', 'h3', 'h4', 'h5', 'h6', 'span', 'strong', 'p'], recursive=False)
                    if heading_elem:
                        column_data["heading"] = heading_elem.get_text(strip=True)
                
                for link in links:
                    href = link.get('href', '')
                    text = link.get_text(strip=True)
                    if text and href:
                        column_data["links"].append({"text": text, "url": href})
                
                if column_data["links"]:
                    result["columns"].append(column_data)
        
        # Extract contact information
        contact_patterns = {
            'phone': re.compile(r'[\+]?[\d\s\-\(\)]{7,}', re.I),
            'email': re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', re.I),
            'address': re.compile(r'\d+[\s\w]*\s(street|st|avenue|ave|boulevard|blvd|road|rd|drive|dr|lane|ln|way|court|ct|place|pl)[\s\w,.-]*', re.I)
        }
        
        for match in contact_patterns['phone'].finditer(footer_text):
            phone = match.group().strip()
            if len(phone) >= 10:
                result["contact"]["phone"] = phone
                
        for match in contact_patterns['email'].finditer(footer_text):
            email = match.group().strip()
            if '@' in email and '.' in email.split('@')[-1]:
                result["contact"]["email"] = email
        
        # Extract social media links
        social_patterns = {
            'facebook': re.compile(r'facebook\.com|fb\.com', re.I),
            'instagram': re.compile(r'instagram\.com|instagr\.am', re.I),
            'twitter': re.compile(r'twitter\.com|x\.com', re.I),
            'linkedin': re.compile(r'linkedin\.com', re.I),
            'pinterest': re.compile(r'pinterest\.com|pin\.it', re.I),
            'youtube': re.compile(r'youtube\.com|youtu\.be', re.I),
            'tiktok': re.compile(r'tiktok\.com', re.I),
            'yelp': re.compile(r'yelp\.com', re.I)
        }
        
        for link in footer.find_all('a', href=True):
            href = link.get('href', '')
            for platform, pattern in social_patterns.items():
                if pattern.search(href) and platform not in result["social"]:
                    result["social"][platform] = href
        
        # Extract legal links
        legal_keywords = ['privacy', 'terms', 'cookie', 'accessibility', 'sitemap', 'legal', 'policy']
        for link in footer.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text(strip=True).lower()
            for keyword in legal_keywords:
                if keyword in href or keyword in text:
                    if keyword == 'privacy':
                        result["legal"]["privacy"] = {"text": link.get_text(strip=True), "url": href}
                    elif keyword == 'terms':
                        result["legal"]["terms"] = {"text": link.get_text(strip=True), "url": href}
                    elif keyword == 'cookie':
                        result["legal"]["cookies"] = {"text": link.get_text(strip=True), "url": href}
                    elif keyword == 'accessibility':
                        result["legal"]["accessibility"] = {"text": link.get_text(strip=True), "url": href}
        
        # Extract copyright notice
        copyright_pattern = re.compile(r'[©©]\s*[\d]{4}[\s\w\-.,]*', re.I)
        copyright_matches = copyright_pattern.findall(footer_text)
        if copyright_matches:
            result["copyright"] = copyright_matches[0]
        
        # Check for newsletter signup
        if footer.find('input', type=re.compile(r'email|text', re.I)) or \
           re.search(r'newsletter|subscribe|sign.?up', footer_text, re.I):
            result["newsletter"] = True
    
    # Look for payment method indicators in full HTML
    payment_keywords = ['visa', 'mastercard', 'amex', 'american express', 'discover', 
                       'paypal', 'apple pay', 'google pay', 'credit card']
    full_text_lower = soup.get_text().lower()
    for payment in payment_keywords:
        if payment in full_text_lower:
            result["paymentMethods"].append(payment.title())
    
    # Look for certifications/badges
    cert_patterns = [
        ('BBB', re.compile(r'bbb|better business bureau', re.I)),
        ('Food Safety', re.compile(r'servsafe|haccp|food safety|iso 22000', re.I)),
        ('Certified Caterer', re.compile(r'certified caterer|nace|iaca', re.I)),
        ('Award Winner', re.compile(r'award|winner|best of', re.I))
    ]
    for cert_name, pattern in cert_patterns:
        if pattern.search(full_text_lower):
            result["certifications"].append(cert_name)
    
    return result

def extract_urls(html_content, site_name):
    """Extract all internal URLs from the page"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    urls = {
        "name": site_name,
        "pages": [],
        "blogPosts": [],
        "landingPages": [],
        "downloads": [],
        "categories": [],
        "allUrls": []
    }
    
    base_domain_pattern = None
    
    for link in soup.find_all('a', href=True):
        href = link.get('href', '')
        text = link.get_text(strip=True)
        
        if not href or href.startswith('#') or href.startswith('javascript:'):
            continue
            
        # Classify URLs
        url_lower = href.lower()
        
        # Internal URLs (relative or same domain)
        if href.startswith('/') or (not href.startswith('http')):
            url_entry = {"url": href, "text": text[:100] if text else ""}
            
            # Categorize
            if any(x in url_lower for x in ['/blog/', '/post/', '/news/', '/article/']):
                urls["blogPosts"].append(url_entry)
            elif any(x in url_lower for x in ['/download/', '.pdf', '.doc', '.xls']):
                urls["downloads"].append(url_entry)
            elif any(x in url_lower for x in ['/category/', '/filter/', '/type/', '/cuisine/']):
                urls["categories"].append(url_entry)
            elif any(x in url_lower for x in ['/event/', '/service/', '/wedding/', '/corporate/']):
                urls["landingPages"].append(url_entry)
            
            urls["pages"].append(url_entry)
            urls["allUrls"].append(href)
    
    # Deduplicate while preserving order
    seen = set()
    for key in ["pages", "blogPosts", "landingPages", "downloads", "categories", "allUrls"]:
        unique_list = []
        for item in urls[key]:
            url_key = item.get("url", item) if isinstance(item, dict) else item
            if url_key not in seen:
                seen.add(url_key)
                unique_list.append(item)
        urls[key] = unique_list
    
    return urls

def main():
    """Main processing function"""
    sites_data = []
    url_maps = []
    
    json_files = sorted(RAW_DIR.glob("*.json"))
    print(f"Found {len(json_files)} JSON files to process")
    
    for filepath in json_files:
        site_name = filepath.stem
        print(f"\nProcessing: {site_name}")
        
        try:
            data = load_json_file(filepath)
            html_content = data.get("data", {}).get("html", "")
            
            if html_content:
                # Extract footer content
                footer_data = extract_footer_content(html_content, site_name)
                sites_data.append(footer_data)
                
                # Extract URLs
                url_data = extract_urls(html_content, site_name)
                url_maps.append(url_data)
                
                print(f"  - Found {len(footer_data['columns'])} footer columns")
                print(f"  - Social platforms: {list(footer_data['social'].keys())}")
                print(f"  - Legal links: {list(footer_data['legal'].keys())}")
                print(f"  - Total pages: {len(url_data['pages'])}")
            else:
                print(f"  - WARNING: No HTML content found")
                
        except Exception as e:
            print(f"  - ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Generate common patterns analysis
    common_patterns = analyze_common_patterns(sites_data)
    
    # Create final output
    output = {
        "sites": sites_data,
        "commonPatterns": common_patterns,
        "metadata": {
            "totalSitesProcessed": len(sites_data),
            "extractionDate": __import__('datetime').datetime.now().isoformat()
        }
    }
    
    # Save footer compilation
    footer_output_path = OUTPUT_DIR / "footer-compilation.json"
    with open(footer_output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Footer compilation saved to: {footer_output_path}")
    
    # Save URL maps
    url_output_path = OUTPUT_DIR / "../site-maps/complete-url-structure.json"
    url_output = {
        "sites": url_maps,
        "summary": {
            "totalSites": len(url_maps),
            "totalUniquePages": sum(len(u["pages"]) for u in url_maps)
        }
    }
    with open(url_output_path, 'w', encoding='utf-8') as f:
        json.dump(url_output, f, indent=2, ensure_ascii=False)
    print(f"✓ URL structure saved to: {url_output_path}")
    
    return output

def analyze_common_patterns(sites_data):
    """Analyze common patterns across all sites"""
    patterns = {
        "columnCount": defaultdict(int),
        "columnHeadings": defaultdict(int),
        "socialPlatforms": defaultdict(int),
        "legalLinksPresent": defaultdict(int),
        "hasContactInfo": {"phone": 0, "email": 0, "address": 0},
        "hasNewsletter": 0,
        "copyrightFormats": defaultdict(int),
        "commonColumnLinks": defaultdict(int)
    }
    
    for site in sites_data:
        # Column count
        col_count = len(site.get("columns", []))
        patterns["columnCount"][col_count] += 1
        
        # Column headings
        for col in site.get("columns", []):
            heading = col.get("heading", "").lower()
            if heading:
                patterns["columnHeadings"][heading] += 1
            
            # Links within columns
            for link in col.get("links", []):
                link_text = link.get("text", "").lower()
                if link_text:
                    patterns["commonColumnLinks"][link_text] += 1
        
        # Social platforms
        for platform in site.get("social", {}):
            patterns["socialPlatforms"][platform] += 1
        
        # Legal links
        for legal_type in site.get("legal", {}):
            patterns["legalLinksPresent"][legal_type] += 1
        
        # Contact info
        if site.get("contact", {}).get("phone"):
            patterns["hasContactInfo"]["phone"] += 1
        if site.get("contact", {}).get("email"):
            patterns["hasContactInfo"]["email"] += 1
        
        # Newsletter
        if site.get("newsletter"):
            patterns["hasNewsletter"] += 1
    
    # Convert defaultdicts to regular dicts and sort by frequency
    result = {}
    for key, value in patterns.items():
        if isinstance(value, defaultdict):
            result[key] = dict(sorted(value.items(), key=lambda x: x[1], reverse=True)[:20])
        else:
            result[key] = value
    
    return result

if __name__ == "__main__":
    main()
