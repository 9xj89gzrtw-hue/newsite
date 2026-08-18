#!/usr/bin/env python3
"""
Enhanced Footer Extraction - Deep analysis of HTML for footer content
"""

import json
import re
from pathlib import Path
from collections import defaultdict
from bs4 import BeautifulSoup

RAW_DIR = Path("/home/z/my-project/newsite/docs/reference-assets/raw")
OUTPUT_DIR = Path("/home/z/my-project/newsite/docs/footer-library")

def load_json_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def deep_footer_extraction(html_content, site_name):
    """Deep extraction of footer content from full page HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    result = {
        "name": site_name,
        "footerHTML": "",
        "columns": [],
        "contact": {},
        "social": {},
        "legal": {},
        "copyright": "",
        "paymentMethods": [],
        "certifications": [],
        "newsletter": False,
        "uniqueElements": [],
        "fullPageLinks": []
    }
    
    # Strategy 1: Find <footer> tag
    footer = soup.find('footer')
    
    # Strategy 2: Find elements with footer-related classes/ids
    if not footer:
        for selector in ['footer', 'Footer', 'site-footer', 'main-footer', 'page-footer']:
            footer = soup.find(class_=re.compile(selector, re.I))
            if footer:
                break
    
    # Strategy 3: Find last major section before </body>
    if not footer:
        body = soup.find('body')
        if body:
            all_sections = body.find_all(['section', 'div'], class_=re.compile(r'foot|bottom|legal', re.I))
            if all_sections:
                footer = all_sections[-1]
    
    if footer:
        result["footerHTML"] = str(footer)[:5000]  # Store truncated HTML for reference
        
        # Extract ALL links from footer
        all_links = footer.find_all('a', href=True)
        
        # Categorize links into columns based on parent structure
        current_column = {"heading": "", "links": []}
        columns = []
        
        # Look for column structure (lists, divs with multiple links)
        list_elements = footer.find_all(['ul', 'ol', 'nav'])
        nav_divs = footer.find_all('div', class_=re.compile(r'nav|menu|column|col-', re.I))
        
        processed_links = set()
        
        # Process lists as columns
        for list_elem in list_elements:
            col_links = list_elem.find_all('a', href=True)
            if len(col_links) >= 2:  # Only treat as column if has multiple links
                column = {"heading": "", "links": []}
                
                # Get heading
                parent = list_elem.parent
                if parent:
                    for tag in ['h2', 'h3', 'h4', 'h5', 'h6', 'span', 'strong', 'p']:
                        heading = parent.find(tag, recursive=False)
                        if heading and heading.get_text(strip=True):
                            column["heading"] = heading.get_text(strip=True)
                            break
                
                for link in col_links:
                    href = link.get('href', '')
                    text = link.get_text(strip=True)
                    if text and href and href not in processed_links:
                        column["links"].append({"text": text, "url": href})
                        processed_links.add(href)
                
                if column["links"]:
                    columns.append(column)
        
        # Process remaining standalone links
        for link in all_links:
            href = link.get('href', '')
            if href not in processed_links:
                text = link.get_text(strip=True)
                if text:
                    result["uniqueElements"].append({"text": text, "url": href})
        
        result["columns"] = columns
        
        # Extract contact info from footer
        footer_text = footer.get_text()
        
        # Phone patterns
        phones = re.findall(r'[\+]?[\d\s\-\(\)]{7,}', footer_text)
        for phone in phones:
            clean_phone = phone.strip()
            if len(re.sub(r'\D', '', clean_phone)) >= 10:
                result["contact"]["phone"] = clean_phone
                break
        
        # Email patterns
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', footer_text)
        for email in emails:
            if '@' in email and not any(x in email.lower() for x in ['example', 'test']):
                result["contact"]["email"] = email.strip()
                break
        
        # Address patterns (more comprehensive)
        address_patterns = [
            r'\d+[\s\w]*\s(street|st|avenue|ave|boulevard|blvd|road|rd|drive|dr|lane|ln|way|court|ct|place|pl)[\s\w,.-]*',
            r'[\d]+\s+[\w\s]+,(?:\s*[\w\s]+){1,3}\s+\d{5}',
            r'(?:P\.?O\.?\s*Box\s*\d+)'
        ]
        for pattern in address_patterns:
            addr_match = re.search(pattern, footer_text, re.I)
            if addr_match:
                result["contact"]["address"] = addr_match.group().strip()
                break
        
        # Social media extraction
        social_domains = {
            'facebook': ['facebook.com', 'fb.com'],
            'instagram': ['instagram.com', 'instagr.am'],
            'twitter': ['twitter.com', 'x.com'],
            'linkedin': ['linkedin.com'],
            'pinterest': ['pinterest.com', 'pin.it'],
            'youtube': ['youtube.com', 'youtu.be'],
            'tiktok': ['tiktok.com'],
            'yelp': ['yelp.com'],
            'houzz': ['houzz.com'],
            'tripadvisor': ['tripadvisor.com']
        }
        
        for platform, domains in social_domains.items():
            for link in footer.find_all('a', href=True):
                href = link.get('href', '')
                for domain in domains:
                    if domain in href.lower():
                        result["social"][platform] = href
                        break
            if platform in result["social"]:
                break
        
        # Legal links extraction
        legal_keywords = {
            'privacy': [r'privacy', r'confidential'],
            'terms': [r'terms', r'conditions', r't&c'],
            'cookies': [r'cookie', r'tracking'],
            'accessibility': [r'accessib', r'a11y', r'ada', r'wcag'],
            'sitemap': [r'sitemap'],
            'legal': [r'legal']
        }
        
        for link in footer.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text(strip=True).lower()
            
            for legal_type, patterns in legal_keywords.items():
                for pattern in patterns:
                    if re.search(pattern, href) or re.search(pattern, text):
                        if legal_type not in result["legal"]:
                            result["legal"][legal_type] = {
                                "text": link.get_text(strip=True),
                                "url": link.get('href', '')
                            }
                        break
        
        # Copyright extraction
        copyright_patterns = [
            r'[©©]\s*[\d]{4}[\s\w\-.,®™©]*',
            r'copyright\s*[\s©©]*[\d]{4}',
            r'all\s*rights?\s*reserved'
        ]
        for pattern in copyright_patterns:
            match = re.search(pattern, footer_text, re.I)
            if match:
                result["copyright"] = match.group().strip()
                break
        
        # Newsletter signup detection
        newsletter_indicators = [
            footer.find('input', type=re.compile(r'email', re.I)),
            footer.find('form', action=re.compile(r'subscribe|newsletter|signup', re.I)),
            re.search(r'newsletter|subscribe|sign\s*-?\s*up.*email|join\s*our\s*(list|mail)', footer_text, re.I)
        ]
        if any(newsletter_indicators):
            result["newsletter"] = True
    
    # Full page analysis for payment methods and certifications
    full_page_text = soup.get_text().lower()
    
    # Payment methods
    payment_keywords = {
        'Visa': r'\bvisa\b',
        'Mastercard': r'\bmaster(?:card)?\b|\bmc\b',
        'American Express': r'amex|american\s*express',
        'Discover': r'\bdiscover\b',
        'PayPal': r'\bpaypal\b',
        'Apple Pay': r'apple\s*pay',
        'Google Pay': r'google\s*pay',
        'Cash': r'\bcash\b',
        'Check': r'\bcheck\b|cheque',
        'Credit Card': r'credit\s*card'
    }
    
    for payment, pattern in payment_keywords.items():
        if re.search(pattern, full_page_text):
            result["paymentMethods"].append(payment)
    
    # Certifications and badges
    cert_patterns = {
        'BBB Accredited': r'bbb|better\s*business\s*bureau',
        'ServSafe': r'servsafe|food\s*safety',
        'HACCP': r'haccp',
        'ISO Certified': r'iso\s*\d+',
        'Award Winner': r'award\s*winner|winner\s*of|best\s*of',
        'NACE Member': r'nace',
        'IACP': r'iacp',
        'Green Business': r'green\s*business|sustainable|eco.?friendly',
        'Women Owned': r'women\s*owned|female.?owned',
        'Minority Owned': r'minority\s*owned',
        'Veteran Owned': r'veteran\s*owned'
    }
    
    for cert, pattern in cert_patterns.items():
        if re.search(pattern, full_page_text):
            result["certifications"].append(cert)
    
    return result

def main():
    sites_data = []
    
    json_files = sorted(RAW_DIR.glob("*.json"))
    print(f"Processing {len(json_files)} files with enhanced extraction...\n")
    
    for filepath in json_files:
        site_name = filepath.stem
        print(f"Processing: {site_name}")
        
        try:
            data = load_json_file(filepath)
            html_content = data.get("data", {}).get("html", "")
            
            if html_content:
                footer_data = deep_footer_extraction(html_content, site_name)
                sites_data.append(footer_data)
                
                print(f"  ✓ Columns: {len(footer_data['columns'])}")
                print(f"  ✓ Social: {list(footer_data['social'].keys())}")
                print(f"  ✓ Legal: {list(footer_data['legal'].keys())}")
                print(f"  ✓ Contact: {list(footer_data['contact'].keys())}")
                print(f"  ✓ Certifications: {footer_data['certifications'][:3]}")
            else:
                print(f"  ✗ No HTML content")
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    # Generate enhanced common patterns
    patterns = generate_enhanced_patterns(sites_data)
    
    output = {
        "sites": sites_data,
        "commonPatterns": patterns,
        "metadata": {
            "totalSitesProcessed": len(sites_data),
            "extractionType": "enhanced",
            "extractionDate": __import__('datetime').datetime.now().isoformat()
        },
        "templateRecommendations": get_template_recommendations(sites_data)
    }
    
    output_path = OUTPUT_DIR / "footer-compilation.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Enhanced footer compilation saved!")
    return output

def generate_enhanced_patterns(sites_data):
    """Generate comprehensive pattern analysis"""
    patterns = {
        "socialPlatformFrequency": defaultdict(int),
        "legalLinkFrequency": defaultdict(int),
        "paymentMethodFrequency": defaultdict(int),
        "certificationFrequency": defaultdict(int),
        "columnCountDistribution": defaultdict(int),
        "hasContactPhone": 0,
        "hasContactEmail": 0,
        "hasNewsletter": 0,
        "hasCopyright": 0,
        "commonColumnHeadings": defaultdict(int),
        "copyrightFormats": []
    }
    
    for site in sites_data:
        # Social platforms
        for platform in site.get('social', {}):
            patterns["socialPlatformFrequency"][platform] += 1
        
        # Legal links
        for legal_type in site.get('legal', {}):
            patterns["legalLinkFrequency"][legal_type] += 1
        
        # Payment methods
        for method in site.get('paymentMethods', []):
            patterns["paymentMethodFrequency"][method] += 1
        
        # Certifications
        for cert in site.get('certifications', []):
            patterns["certificationFrequency"][cert] += 1
        
        # Column count
        patterns["columnCountDistribution"][len(site.get('columns', []))] += 1
        
        # Column headings
        for col in site.get('columns', []):
            heading = col.get('heading', '').lower()
            if heading:
                patterns["commonColumnHeadings"][heading] += 1
        
        # Flags
        if site.get('contact', {}).get('phone'):
            patterns["hasContactPhone"] += 1
        if site.get('contact', {}).get('email'):
            patterns["hasContactEmail"] += 1
        if site.get('newsletter'):
            patterns["hasNewsletter"] += 1
        if site.get('copyright'):
            patterns["hasCopyright"] += 1
            patterns["copyrightFormats"].append(site['copyright'])
    
    # Convert and sort
    result = {}
    for key, value in patterns.items():
        if isinstance(value, defaultdict):
            result[key] = dict(sorted(value.items(), key=lambda x: x[1], reverse=True))
        elif key == "copyrightFormats":
            result[key] = value[:5]  # Top 5 formats
        else:
            result[key] = value
    
    return result

def get_template_recommendations(sites_data):
    """Generate template recommendations based on extracted data"""
    
    # Find most common structure
    social_platforms_used = set()
    legal_links_used = set()
    column_headings_seen = set()
    
    for site in sites_data:
        social_platforms_used.update(site.get('social', {}).keys())
        legal_links_used.update(site.get('legal', {}).keys())
        for col in site.get('columns', []):
            if col.get('heading'):
                column_headings_seen.add(col['heading'])
    
    return {
        "recommendedSocialPlatforms": ["instagram", "facebook", "linkedin", "youtube"],
        "recommendedLegalPages": ["privacy-policy", "terms-of-service", "cookie-policy", "accessibility-statement"],
        "recommendedFooterColumns": [
            {"heading": "Services", "links": ["Corporate Events", "Social Events", "Weddings", "Menus"]},
            {"heading": "Company", "links": ["About Us", "Our Team", "Careers", "Blog"]},
            {"heading": "Resources", "links": ["Gallery", "Testimonials", "FAQ", "Contact"]}
        ],
        "recommendedContactElements": ["phone", "email", "address", "hours"],
        "recommendedCertifications": ["Food Safety Certified", "Award Winning Caterer"],
        "industryBestPractices": {
            "alwaysInclude": ["Privacy Policy", "Terms of Service", "Copyright Notice"],
            "highlyRecommended": ["Cookie Policy", "Accessibility Statement", "Newsletter Signup"],
            "niceToHave": ["Payment Icons", "Trust Badges", "Awards Strip"]
        }
    }

if __name__ == "__main__":
    main()
