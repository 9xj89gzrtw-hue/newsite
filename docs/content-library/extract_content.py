#!/usr/bin/env python3
"""
Content Extraction Script for Catering Websites v2
Extracts marketing copy, headlines, CTAs, navigation, and messaging from raw JSON files
"""

import json
import re
import os
from pathlib import Path
from html.parser import HTMLParser
from collections import defaultdict

class TextExtractor(HTMLParser):
    """Extract text content from HTML"""
    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.in_script = False
        self.in_style = False
        
    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.in_script = True
        if tag == 'style':
            self.in_style = True
            
    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False
        if tag == 'style':
            self.in_style = False
            
    def handle_data(self, data):
        if not self.in_script and not self.in_style:
            text = data.strip()
            if text:
                self.text_parts.append(text)
    
    def get_text(self):
        return ' '.join(self.text_parts)

def clean_html_text(raw_text):
    """Clean HTML tags from text"""
    clean = re.sub(r'<[^>]+>', '', raw_text)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def extract_text_from_html(html_content):
    """Extract all text from HTML content"""
    extractor = TextExtractor()
    try:
        extractor.feed(html_content)
        return extractor.get_text()
    except:
        return ""

def find_headings(html_content, site_name):
    """Extract h1-h6 headings with context"""
    headings = {
        'h1': [],
        'h2': [],
        'h3': []
    }
    
    # Pattern for extracting heading text
    patterns = {
        'h1': r'<h1[^>]*>(.*?)</h1>',
        'h2': r'<h2[^>]*>(.*?)</h2>',
        'h3': r'<h3[^>]*>(.*?)</h3>'
    }
    
    for level, pattern in patterns.items():
        matches = re.findall(pattern, html_content, re.DOTALL | re.IGNORECASE)
        for match in matches:
            clean_text = clean_html_text(match)
            if clean_text and len(clean_text) > 2:
                headings[level].append({
                    'site': site_name,
                    'text': clean_text,
                    'char_count': len(clean_text),
                    'word_count': len(clean_text.split())
                })
    
    return headings

def extract_ctas(html_content, site_name):
    """Extract call-to-action buttons and links"""
    ctas = []
    
    # Button text extraction
    button_pattern = r'<button[^>]*>(.*?)</button>'
    matches = re.findall(button_pattern, html_content, re.DOTALL | re.IGNORECASE)
    for match in matches:
        clean_text = clean_html_text(match)
        if clean_text and len(clean_text) > 1:
            ctas.append({
                'site': site_name,
                'text': clean_text,
                'type': 'button',
                'context': 'button element'
            })
    
    # Input submit buttons
    input_pattern = r'<input[^>]*type=["\']?submit["\']?[^>]*(?:value=["\']([^"\']*)["\'])?'
    matches = re.findall(input_pattern, html_content, re.IGNORECASE)
    for match in matches:
        clean_text = match.strip() if match else "Submit"
        if clean_text:
            ctas.append({
                'site': site_name,
                'text': clean_text,
                'type': 'form_submit',
                'context': 'form submission'
            })
    
    # Look for common CTA text patterns in links and buttons
    cta_keywords = ['book', 'get', 'request', 'contact', 'order', 'submit', 'start', 
                   'learn', 'view', 'download', 'schedule', 'reserve', 'call', 'email',
                   'quote', 'proposal', 'menu', 'explore', 'discover', 'plan']
    
    link_pattern = r'<a[^>]*>(.*?)</a>'
    links = re.findall(link_pattern, html_content, re.DOTALL | re.IGNORECASE)
    
    for link in links:
        clean_text = clean_html_text(link)
        if clean_text and 2 < len(clean_text) < 80:
            text_lower = clean_text.lower()
            # Check if it's a CTA-like text
            is_cta = any(kw in text_lower for kw in cta_keywords)
            if is_cta or any(text_lower.startswith(kw) for kw in cta_keywords):
                if not any(c['text'] == clean_text for c in ctas):
                    ctas.append({
                        'site': site_name,
                        'text': clean_text,
                        'type': 'link_cta',
                        'context': 'CTA link'
                    })
    
    return ctas

def extract_navigation(html_content, site_name):
    """Extract navigation menu items"""
    nav_items = []
    seen_items = set()
    
    # Find nav elements
    nav_pattern = r'<nav[^>]*>(.*?)</nav>'
    nav_matches = re.findall(nav_pattern, html_content, re.DOTALL | re.IGNORECASE)
    
    all_nav_content = ' '.join(nav_matches)
    
    # Extract links within nav
    link_pattern = r'<a[^>]*href=["\'][^"\']+["\'][^>]*>(.*?)</a>'
    links = re.findall(link_pattern, all_nav_content, re.DOTALL | re.IGNORECASE)
    
    for link in links:
        clean_text = clean_html_text(link)
        if clean_text and 0 < len(clean_text) < 60:
            if clean_text not in seen_items and not clean_text.startswith('<'):
                seen_items.add(clean_text)
                nav_items.append({
                    'site': site_name,
                    'text': clean_text,
                    'location': 'navigation'
                })
    
    # Also check for header/menu areas
    header_pattern = r'<header[^>]*>(.*?)</header>'
    header_matches = re.findall(header_pattern, html_content, re.DOTALL | re.IGNORECASE)
    
    header_content = ' '.join(header_matches) if header_matches else ''
    links = re.findall(link_pattern, header_content, re.DOTALL | re.IGNORECASE)
    
    for link in links:
        clean_text = clean_html_text(link)
        if clean_text and 0 < len(clean_text) < 60:
            if clean_text not in seen_items and not clean_text.startswith('<'):
                seen_items.add(clean_text)
                nav_items.append({
                    'site': site_name,
                    'text': clean_text,
                    'location': 'header'
                })
    
    return nav_items

def extract_meta_description(data, site_name):
    """Extract meta description"""
    desc = data.get('description', '')
    return {
        'site': site_name,
        'description': desc
    }

def extract_title(html_content, site_name):
    """Extract page title"""
    title_match = re.search(r'<title>(.*?)</title>', html_content, re.IGNORECASE | re.DOTALL)
    if title_match:
        return {
            'site': site_name,
            'title': title_match.group(1).strip()
        }
    return None

def extract_trust_signals(html_content, site_name):
    """Extract trust signals - years, awards, certifications"""
    signals = []
    text_content = extract_text_from_html(html_content).lower()
    
    # Years in business patterns - simplified without complex groups
    year_patterns = [
        (r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|in\s*business|serving)', 'years_experience'),
        (r'since\s+(\d{4})', 'since_year'),
        (r'est(?:ablished)?\.?\s*(?:in)?\s*(\d{4})', 'established_year'),
        (r'over\s*(\d+)\s*years?', 'over_years'),
        (r'more\s*than\s*(\d+)\s*years?', 'more_than_years'),
    ]
    
    for pattern, signal_type in year_patterns:
        try:
            matches = re.findall(pattern, text_content)
            for match in matches:
                signals.append({
                    'site': site_name,
                    'type': signal_type,
                    'value': match
                })
        except:
            pass
    
    # Award mentions - simple word matching
    award_keywords = [
        ('award.winning', 'award_winning'),
        ('best caterer', 'best_caterer'),
        ('best catering', 'best_catering'),
        ('michelin star', 'michelin'),
        ('james beard', 'james_beard'),
        ('forbes', 'forbes'),
        ('zagat', 'zagat'),
        ('certified', 'certified'),
        ('accredited', 'accredited'),
        ('green caterer', 'green_certified'),
        ('premier', 'premier_status'),
    ]
    
    for keyword, signal_type in award_keywords:
        if keyword in text_content:
            signals.append({
                'site': site_name,
                'type': signal_type,
                'value': keyword
            })
    
    # Number of events served - simplified
    event_patterns = [
        (r'(\d[\d,]*)\s*events?\s*(?:served|catered|hosted)?', 'events_served'),
        (r'over\s*(\d[\d,]*)\s*(?:clients?|customers?)', 'clients_served'),
        (r'(\d[\d,]*)\s*(?:happy\s*)?(?:clients?|customers?)', 'happy_clients'),
    ]
    
    for pattern, signal_type in event_patterns:
        try:
            matches = re.findall(pattern, text_content)
            for match in matches:
                signals.append({
                    'site': site_name,
                    'type': signal_type,
                    'value': match
                })
        except:
            pass
    
    return signals

def extract_service_descriptions(html_content, site_name):
    """Extract how services are described"""
    descriptions = []
    
    # Look for service-related sections by class names
    service_section_pattern = r'<(?:section|div)[^>]*class="[^"]*(?:service|what.we.do|offering|about)[^"]*"[^>]*>(.{100,2000}?)</(?:section|div)>'
    sections = re.findall(service_section_pattern, html_content, re.DOTALL | re.IGNORECASE)
    
    for section in sections[:5]:
        text = extract_text_from_html(section)
        if text and len(text) > 30:
            descriptions.append({
                'site': site_name,
                'text': text[:500],
                'source': 'service_section'
            })
    
    return descriptions

def process_site(filepath):
    """Process a single site JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        site_name = Path(filepath).stem
        html_content = data.get('data', {}).get('html', '')
        
        result = {
            'site': site_name,
            'meta_description': extract_meta_description(data.get('data', {}), site_name),
            'title': extract_title(html_content, site_name),
            'headings': find_headings(html_content, site_name),
            'ctas': extract_ctas(html_content, site_name),
            'navigation': extract_navigation(html_content, site_name),
            'trust_signals': extract_trust_signals(html_content, site_name),
            'service_descriptions': extract_service_descriptions(html_content, site_name),
            'all_text_sample': extract_text_from_html(html_content)[:3000]
        }
        
        return result
    
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        import traceback
        traceback.print_exc()
        return {'site': Path(filepath).stem, 'error': str(e)}

def main():
    raw_dir = Path('/home/z/my-project/newsite/docs/reference-assets/raw')
    output_dir = Path('/home/z/my-project/newsite/docs/content-library')
    
    # Process all JSON files
    results = []
    json_files = list(raw_dir.glob('*.json'))
    print(f"Found {len(json_files)} JSON files to process")
    
    for filepath in sorted(json_files):
        print(f"Processing: {filepath.name}")
        result = process_site(filepath)
        results.append(result)
    
    # Save combined raw extraction
    output_file = output_dir / 'raw_extractions.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nRaw extractions saved to: {output_file}")
    print(f"Processed {len(results)} sites")
    
    return results

if __name__ == '__main__':
    main()
