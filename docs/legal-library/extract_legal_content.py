#!/usr/bin/env python3
"""
Extract key legal content from fetched legal pages for pattern analysis.
"""

import json
import re
from pathlib import Path

LEGAL_DIR = Path("/home/z/my-project/newsite/docs/legal-library")

def extract_text_content(html):
    """Extract plain text from HTML."""
    # Remove scripts and styles
    text = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
    
    # Convert common tags to newlines or spaces
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</h[1-6]>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</li>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<li>', '• ', text, flags=re.IGNORECASE)
    
    # Remove remaining HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Clean up whitespace and entities
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&amp;', '&')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&#39;', "'")
    text = text.replace('&quot;', '"')
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    return text.strip()

def extract_sections(text, max_length=5000):
    """Extract main sections from legal text."""
    sections = []
    
    # Common section headers in legal documents
    section_patterns = [
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Information\s+(?:We|We)\s+(?:Collect|collect))[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(How\s+(?:We|we)\s+(?:Use|use)[^\n]{0,80})',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Data\s+(?:Sharing|sharing)|Sharing\s+(?:Information|information))[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Cookies?)[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Your\s+(?:Rights|rights))[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Contact\s+(?:Us|us))[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Security)[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Third(?:-|\s+)Party)[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Terms?\s+(?:of)\s+(?:Use|Service))[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Limitation\s+(?:of)\s+(?:Liability|Responsibility))[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Intellectual\s+Property)[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Governing\s+Law)[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Indemnification)[^\n]{0,100}',
        r'(?:^|\n)\s*(?:\d+[\.\)]\s*)?(Privacy)[^\n]{0,100}',
    ]
    
    found_sections = set()
    for pattern in section_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            section_title = match.group(1) if match.lastindex else match.group(0).strip()
            if section_title.lower() not in [s.lower() for s in found_sections]:
                start = match.start()
                end = min(start + 800, len(text))
                section_text = text[start:end].strip()
                sections.append({
                    "title": section_title[:80],
                    "content_preview": section_text[:300]
                })
                found_sections.add(section_title)
    
    return sections[:12]

def analyze_legal_page(filepath, page_type="unknown"):
    """Analyze a single legal page."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        html = data.get('data', {}).get('html', '')
        if not html:
            return {"error": "No HTML content"}
        
        text = extract_text_content(html)
        sections = extract_sections(text)
        
        # Look for specific patterns
        patterns_found = {
            "gdpr_mentions": len(re.findall(r'(?i)(GDPR|General Data Protection|European Union|EU residents)', text)) > 0,
            "ccpa_mentions": len(re.findall(r'(?i)(CCPA|California Consumer Privacy|California residents|"Do Not Sell"|"Shine the Light")', text)) > 0,
            "cookie_consent_mentioned": len(re.findall(r'(?i)(cookie consent|consent to cookies|accept cookies)', text)) > 0,
            "data_retention": len(re.findall(r'(?i)(data retention|how long we keep|retention period)', text)) > 0,
            "children_privacy": len(re.findall(r'(?i)(children under|COPPA|minors under 13|under age 13)', text)) > 0,
            "opt_out_options": len(re.findall(r'(?i)(opt.?out|unsubscribe|do not sell|privacy rights)', text)) > 0,
            "has_contact_email": bool(re.search(r'[\w.-]+@[\w.-]+\.\w+', text)),
        }
        
        return {
            "page_type": page_type,
            "text_length": len(text),
            "sections_found": sections,
            "patterns": patterns_found,
            "full_text_sample": text[:2000]
        }
        
    except Exception as e:
        return {"error": str(e)}

def main():
    """Main extraction function."""
    results = {}
    
    legal_files = {
        "wolfgang_privacy.json": ("Wolfgang Puck", "privacy_policy"),
        "wolfgang_terms.json": ("Wolfgang Puck", "terms"),
        "relish_privacy.json": ("Relish Caterers", "privacy_policy"),
        "cutandtaste_privacy.json": ("Cut & Taste", "privacy_policy"),
        "cutandtaste_accessibility.json": ("Cut & Taste", "accessibility"),
        "queenofhearts_privacy.json": ("Queen of Hearts", "privacy_terms"),
    }
    
    print("Extracting legal content...")
    
    for filename, (company, page_type) in legal_files.items():
        filepath = LEGAL_DIR / filename
        if filepath.exists():
            print(f"📄 Analyzing: {filename}")
            analysis = analyze_legal_page(filepath, page_type)
            results[f"{company}_{page_type}"] = analysis
        else:
            print(f"⚠️ Missing: {filename}")
    
    # Save extracted content
    output_path = LEGAL_DIR / "legal-content-extracted.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Legal content extraction complete! Saved to: {output_path}")
    
    return results

if __name__ == "__main__":
    main()
