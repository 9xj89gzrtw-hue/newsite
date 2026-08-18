#!/usr/bin/env python3
"""
Generate organized content library files from raw extractions
"""

import json
from pathlib import Path
from collections import defaultdict

def load_raw_extractions():
    """Load the raw extraction data"""
    input_file = Path('/home/z/my-project/newsite/docs/content-library/raw_extractions.json')
    with open(input_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def categorize_headline(text):
    """Categorize a headline by its likely section type"""
    text_lower = text.lower()
    
    # Hero/Headlines patterns
    hero_patterns = ['welcome', 'experience', 'celebrate', 'extraordinary', 'exceptional', 
                     'finest', 'premier', 'world.class', 'award.winning', 'catering at its',
                     'fresh', 'delicious', 'culinary', 'standard for']
    
    # About patterns
    about_patterns = ['about', 'our story', 'who we are', 'our legacy', 'our history',
                      'since ', 'established', 'founded', 'family owned', 'meet the',
                      'behind the', 'our team', 'our philosophy', 'our approach']
    
    # Services patterns
    service_patterns = ['service', 'what we do', 'what we offer', 'offerings', 
                        'how we cater', 'our expertise', 'full.service', 'event types',
                        'we cater', 'catering for', 'events we cater']
    
    # Menu patterns  
    menu_patterns = ['menu', 'cuisine', 'food', 'dishes', 'tasting', 'selections',
                     'our food', 'culinary offerings', 'menu options']
    
    # Gallery patterns
    gallery_patterns = ['gallery', 'portfolio', 'our work', 'photos', 'images',
                        'event gallery', 'lookbook', 'inspiration']
    
    # Testimonial patterns
    testimonial_patterns = ['testimonial', 'review', 'what clients say', 'client love',
                           'rave reviews', 'testimonials', 'feedback', 'words from',
                           'client stories']
    
    # Contact patterns
    contact_patterns = ['contact', 'get in touch', 'reach us', 'let\'s talk', 'connect',
                       'inquiry', 'request a quote', 'start planning', 'book now',
                       'get started', 'plan your event']
    
    # Check each category
    for pattern in hero_patterns:
        if pattern.replace('.', ' ') in text_lower or pattern in text_lower:
            return 'hero'
    
    for pattern in about_patterns:
        if pattern in text_lower:
            return 'about'
            
    for pattern in service_patterns:
        if pattern in text_lower:
            return 'services'
            
    for pattern in menu_patterns:
        if pattern in text_lower:
            return 'menu'
            
    for pattern in gallery_patterns:
        if pattern in text_lower:
            return 'gallery'
            
    for pattern in testimonial_patterns:
        if pattern in text_lower:
            return 'testimonials'
            
    for pattern in contact_patterns:
        if pattern in text_lower:
            return 'contact'
    
    return 'other'

def determine_style(text):
    """Determine the style/tone of a headline"""
    text_lower = text.lower()
    
    # Bold/confident style indicators
    bold_words = ['best', 'finest', 'premier', 'ultimate', 'unmatched', 'unparalleled',
                  'extraordinary', 'exceptional', 'world.class', 'standard', 'leading']
    
    # Warm/friendly style indicators
    warm_words = ['welcome', 'family', 'love', 'happy', 'together', 'celebrate',
                  'memories', 'special', 'heart', 'passion', 'care']
    
    # Professional style indicators
    professional_words = ['professional', 'excellence', 'quality', 'premium', 'luxury',
                          'executive', 'corporate', 'business', 'impeccable', 'seamless']
    
    # Playful/creative style indicators
    playful_words = ['fun', 'delicious', 'yummy', 'tasty', 'craving', 'feast',
                     'indulge', 'treat', 'flavor', 'fresh', 'farm']
    
    scores = {
        'bold_confident': sum(1 for w in bold_words if w in text_lower),
        'warm_friendly': sum(1 for w in warm_words if w in text_lower),
        'professional': sum(1 for w in professional_words if w in text_lower),
        'playful_creative': sum(1 for w in playful_words if w in text_lower)
    }
    
    max_score = max(scores.values())
    if max_score == 0:
        return 'neutral'
    
    for style, score in scores.items():
        if score == max_score:
            return style
    
    return 'neutral'

def generate_headlines_json(data):
    """Generate organized headlines by category"""
    headlines = {
        'heroHeadlines': [],
        'aboutHeadlines': [],
        'serviceHeadlines': [],
        'menuHeadlines': [],
        'galleryHeadlines': [],
        'testimonialHeadlines': [],
        'contactHeadlines': [],
        'otherHeadlines': []
    }
    
    seen_texts = set()
    
    for site_data in data:
        site_name = site_data.get('site', 'unknown')
        headings = site_data.get('headings', {})
        
        for level in ['h1', 'h2', 'h3']:
            for heading in headings.get(level, []):
                text = heading.get('text', '')
                clean_text = text.replace('&nbsp;', ' ').replace('&amp;', '&').strip()
                
                if not clean_text or len(clean_text) < 2:
                    continue
                    
                # Skip duplicates (same text within same site)
                key = f"{site_name}:{clean_text}"
                if key in seen_texts:
                    continue
                seen_texts.add(key)
                
                category = categorize_headline(clean_text)
                style = determine_style(clean_text)
                
                entry = {
                    'site': site_name,
                    'text': clean_text,
                    'level': level,
                    'style': style,
                    'charCount': heading.get('char_count', len(clean_text)),
                    'wordCount': heading.get('word_count', len(clean_text.split()))
                }
                
                # Map category to output key
                category_map = {
                    'hero': 'heroHeadlines',
                    'about': 'aboutHeadlines',
                    'services': 'serviceHeadlines',
                    'menu': 'menuHeadlines',
                    'gallery': 'galleryHeadlines',
                    'testimonials': 'testimonialHeadlines',
                    'contact': 'contactHeadlines',
                    'other': 'otherHeadlines'
                }
                
                output_key = category_map.get(category, 'otherHeadlines')
                headlines[output_key].append(entry)
    
    return headlines

def generate_cta_library(data):
    """Generate comprehensive CTA library"""
    cta_categories = {
        'primaryAction': [],  # Main CTAs like Book Now, Get Started
        'secondaryAction': [],  # Learn More, View Menu
        'contactCTA': [],  # Contact Us, Get in Touch
        'quoteRequest': [],  # Request Quote, Get Pricing
        'formSubmission': [],  # Submit, Send Message
        'navigationCTA': [],  # Menu navigation items that act as CTAs
        'phoneCTA': [],  # Call us type CTAs
        'emailCTA': []  # Email us type CTAs
    }
    
    seen_ctas = set()
    
    for site_data in data:
        site_name = site_data.get('site', 'unknown')
        
        for cta in site_data.get('ctas', []):
            text = cta.get('text', '').strip()
            text_lower = text.lower().replace('&nbsp;', ' ')
            
            if not text or len(text) < 2:
                continue
            
            key = f"{site_name}:{text}"
            if key in seen_ctas:
                continue
            seen_ctas.add(key)
            
            entry = {
                'site': site_name,
                'text': text,
                'type': cta.get('type', 'unknown'),
                'context': cta.get('context', '')
            }
            
            # Categorize based on text content
            primary_keywords = ['book', 'order', 'reserve', 'schedule', 'hire', 'get started', 'start planning']
            secondary_keywords = ['learn', 'view', 'see', 'explore', 'discover', 'read', 'more info']
            contact_keywords = ['contact', 'touch', 'reach', 'call', 'talk', 'connect', 'speak']
            quote_keywords = ['quote', 'proposal', 'pricing', 'estimate', 'bid', 'request']
            form_keywords = ['submit', 'send', 'message', 'apply', 'register']
            phone_keywords = ['call', 'phone', 'dial']
            email_keywords = ['email', 'mail']
            
            categorized = False
            for keywords, category in [
                (primary_keywords, 'primaryAction'),
                (secondary_keywords, 'secondaryAction'),
                (contact_keywords, 'contactCTA'),
                (quote_keywords, 'quoteRequest'),
                (form_keywords, 'formSubmission'),
                (phone_keywords, 'phoneCTA'),
                (email_keywords, 'emailCTA')
            ]:
                if any(kw in text_lower for kw in keywords):
                    cta_categories[category].append(entry)
                    categorized = True
                    break
            
            if not categorized:
                cta_categories['navigationCTA'].append(entry)
    
    return cta_categories

def generate_nav_structures(data):
    """Generate navigation structures library"""
    nav_structures = []
    
    for site_data in data:
        site_name = site_data.get('site', 'unknown')
        nav_items = site_data.get('navigation', [])
        
        if nav_items:
            # Get unique nav items for this site
            unique_items = []
            seen = set()
            for item in nav_items:
                text = item.get('text', '')
                if text and text not in seen:
                    seen.add(text)
                    unique_items.append({
                        'label': text,
                        'location': item.get('location', 'unknown')
                    })
            
            nav_structures.append({
                'site': site_name,
                'menuItems': unique_items,
                'itemCount': len(unique_items)
            })
    
    return nav_structures

def generate_messaging_frameworks(data):
    """Generate markdown document with brand positioning analysis"""
    frameworks = []
    
    for site_data in data:
        site_name = site_data.get('site', 'unknown')
        
        # Get meta description
        meta_desc = site_data.get('meta_description', {}).get('description', '')
        
        # Get title
        title = site_data.get('title', {}).get('title', '') if site_data.get('title') else ''
        
        # Get sample text
        text_sample = site_data.get('all_text_sample', '')
        
        # Get trust signals
        trust_signals = site_data.get('trust_signals', [])
        
        # Analyze positioning
        framework = {
            'site': site_name,
            'title': title,
            'metaDescription': meta_desc,
            'positioningAnalysis': analyze_positioning(meta_desc + ' ' + text_sample),
            'trustSignals': [s['value'] for s in trust_signals[:10]],
            'keyDifferentiators': extract_differentiators(text_sample),
            'toneOfVoice': determine_tone(text_sample)
        }
        
        frameworks.append(framework)
    
    return frameworks

def analyze_positioning(text):
    """Analyze how a brand positions itself"""
    text_lower = text.lower()
    
    positioning = []
    
    # Check for luxury/premium positioning
    if any(w in text_lower for w in ['luxury', 'premium', 'high.end', 'exclusive', 'elegant', 'sophisticated']):
        positioning.append('Luxury/Premium')
    
    # Check for quality-focused positioning
    if any(w in text_lower for w in ['quality', 'finest', 'best', 'excellent', 'exceptional', 'superior']):
        positioning.append('Quality-Focused')
    
    # Check for experience-focused positioning
    if any(w in text_lower for w in ['experience', 'memorable', 'unforgettable', 'extraordinary', 'remarkable']):
        positioning.append('Experience-Focused')
    
    # Check for local/community positioning
    if any(w in text_lower for w in ['local', 'community', 'neighborhood', 'family', 'homegrown']):
        positioning.append('Local/Community')
    
    # Check for sustainable positioning
    if any(w in text_lower for w in ['sustainable', 'organic', 'farm.to.table', 'green', 'eco.friendly', 'locally.sourced']):
        positioning.append('Sustainable/Eco-Conscious')
    
    # Check for convenience positioning
    if any(w in text_lower for w in ['easy', 'simple', 'seamless', 'hassle.free', 'stress.free', 'convenient']):
        positioning.append('Convenience-Focused')
    
    # Check for innovation positioning
    if any(w in text_lower for w in ['innovative', 'creative', 'unique', 'original', 'cutting.edge', 'modern']):
        positioning.append('Innovative/Creative')
    
    # Check for heritage/trust positioning
    if any(w in text_lower for w in ['years', 'since', 'established', 'legacy', 'tradition', 'history']):
        positioning.append('Heritage/Trust-Based')
    
    return positioning if positioning else ['General Catering']

def extract_differentiators(text):
    """Extract key differentiators mentioned"""
    text_lower = text.lower()
    
    differentiators = []
    
    diff_patterns = [
        ('Farm-to-table/Fresh ingredients', ['farm', 'fresh', 'local ingredient', 'seasonal']),
        ('Celebrity/Chef-driven', ['chef', 'culinary', 'wolfgang', 'james beard', 'michelin']),
        ('Full-service/All-inclusive', ['full.service', 'all.inclusive', 'end.to.end', 'complete']),
        ('Custom/Personalized', ['custom', 'personalized', 'tailored', 'bespoke', 'unique']),
        ('Award-winning', ['award', 'best', 'recognized', 'acclaimed']),
        ('Eco-friendly/Sustainable', ['sustainable', 'green', 'organic', 'eco', 'certified']),
        ('Large-scale capable', ['large', 'thousands', 'major events', 'corporate', 'nationwide']),
        ('Family-owned', ['family', 'family.owned', 'family.run']),
        ('Experienced/Veteran', ['years', 'experience', 'since', 'established'])
    ]
    
    for label, keywords in diff_patterns:
        if any(kw in text_lower for kw in keywords):
            differentiators.append(label)
    
    return differentiators

def determine_tone(text):
    """Determine overall tone of voice"""
    text_lower = text.lower()
    
    tone_scores = {}
    
    tone_indicators = {
        'Professional/Formal': ['professional', 'excellence', 'impeccable', 'premium', 'executive', 'corporate'],
        'Warm/Friendly': ['love', 'passion', 'care', 'family', 'happy', 'celebrate', 'together'],
        'Bold/Confident': ['best', 'finest', 'leading', 'premier', 'ultimate', 'unparalleled'],
        'Playful/Creative': ['fun', 'delicious', 'yummy', 'craving', 'feast', 'indulge'],
        'Sophisticated/Elegant': ['elegant', 'sophisticated', 'refined', 'luxury', 'boutique'],
        'Approachable/Down-to-earth': ['simple', 'easy', 'friendly', 'helpful', 'your neighbor']
    }
    
    for tone, words in tone_indicators.items():
        score = sum(1 for w in words if w in text_lower)
        tone_scores[tone] = score
    
    if max(tone_scores.values()) == 0:
        return 'Neutral/Balanced'
    
    return max(tone_scores.keys(), key=lambda k: tone_scores[k])

def generate_service_descriptions(data):
    """Generate service descriptions markdown"""
    descriptions = []
    
    for site_data in data:
        site_name = site_data.get('site', 'unknown')
        
        # Get service descriptions
        svc_descs = site_data.get('service_descriptions', [])
        
        # Get text sample for additional context
        text_sample = site_data.get('all_text_sample', '')
        
        # Extract event types mentioned
        event_types = extract_event_types(text_sample)
        
        desc_entry = {
            'site': site_name,
            'metaDescription': site_data.get('meta_description', {}).get('description', ''),
            'extractedDescriptions': [d['text'] for d in svc_descs[:3]],
            'eventTypesMentioned': event_types,
            'valuePropositions': extract_value_props(text_sample)
        }
        
        descriptions.append(desc_entry)
    
    return descriptions

def extract_event_types(text):
    """Extract event types mentioned in text"""
    text_lower = text.lower()
    
    event_types = []
    
    events = [
        ('Weddings', ['wedding', 'reception', 'bridal', 'nuptial']),
        ('Corporate Events', ['corporate', 'business', 'company', 'office', 'meeting', 'conference']),
        ('Social Events', ['social', 'party', 'birthday', 'anniversary', 'celebration']),
        ('Private Events', ['private', 'intimate', 'exclusive', 'vip']),
        ('Galas/Fundraisers', ['gala', 'fundraiser', 'charity', 'benefit', 'auction']),
        ('Holiday Events', ['holiday', 'christmas', 'thanksgiving', 'new year', 'festive']),
        ('Outdoor/Garden Events', ['outdoor', 'garden', 'backyard', 'patio', 'terrace']),
        ('Film/Production', ['film', 'production', 'crew', 'set', 'shoot']),
        ('Sporting Events', ['sporting', 'game', 'tournament', 'championship', 'stadium'])
    ]
    
    for event_type, keywords in events:
        if any(kw in text_lower for kw in keywords):
            event_types.append(event_type)
    
    return event_types

def extract_value_props(text):
    """Extract value propositions"""
    text_lower = text.lower()
    
    value_props = []
    
    props = [
        ('Quality Ingredients', ['quality', 'fresh', 'premium', 'finest', 'ingredient']),
        ('Exceptional Service', ['service', 'staff', 'team', 'attentive', 'professional']),
        ('Customization', ['custom', 'personalized', 'tailored', 'bespoke', 'unique menu']),
        ('Stress-free Experience', ['stress.free', 'seamless', 'easy', 'worry.free', 'handle everything']),
        ('Competitive Pricing', ['budget', 'affordable', 'value', 'competitive', 'pricing']),
        ('Experience/Expertise', ['experience', 'expert', 'years', 'skilled', 'trained']),
        ('Local Sourcing', ['local', 'farm', 'sourced', 'sustainable', 'organic']),
        ('Full-service Offering', ['full.service', 'everything', 'all.inclusive', 'end.to.end'])
    ]
    
    for prop, keywords in props:
        if any(kw in text_lower for kw in keywords):
            value_props.append(prop)
    
    return value_props

def main():
    print("Loading raw extractions...")
    data = load_raw_extractions()
    output_dir = Path('/home/z/my-project/newsite/docs/content-library')
    
    print("Generating headlines.json...")
    headlines = generate_headlines_json(data)
    with open(output_dir / 'headlines.json', 'w', encoding='utf-8') as f:
        json.dump(headlines, f, indent=2, ensure_ascii=False)
    print(f"  Hero headlines: {len(headlines['heroHeadlines'])}")
    print(f"  About headlines: {len(headlines['aboutHeadlines'])}")
    print(f"  Service headlines: {len(headlines['serviceHeadlines'])}")
    
    print("Generating cta-library.json...")
    ctas = generate_cta_library(data)
    with open(output_dir / 'cta-library.json', 'w', encoding='utf-8') as f:
        json.dump(ctas, f, indent=2, ensure_ascii=False)
    total_ctas = sum(len(v) for v in ctas.values())
    print(f"  Total CTAs: {total_ctas}")
    
    print("Generating nav-structures.json...")
    navs = generate_nav_structures(data)
    with open(output_dir / 'nav-structures.json', 'w', encoding='utf-8') as f:
        json.dump(navs, f, indent=2, ensure_ascii=False)
    print(f"  Sites with nav: {len(navs)}")
    
    print("Generating messaging-frameworks.md...")
    frameworks = generate_messaging_frameworks(data)
    md_content = "# Messaging Frameworks Analysis\n\n"
    md_content += "This document analyzes how each catering brand positions itself in the market.\n\n"
    md_content += "---\n\n"
    
    for fw in frameworks:
        md_content += f"## {fw['site'].upper()}\n\n"
        md_content += f"**Title:** {fw['title']}\n\n"
        md_content += f"**Meta Description:** {fw['metaDescription']}\n\n"
        md_content += f"**Positioning:** {', '.join(fw['positioningAnalysis'])}\n\n"
        md_content += f"**Tone of Voice:** {fw['toneOfVoice']}\n\n"
        if fw['trustSignals']:
            md_content += f"**Trust Signals:** {', '.join(fw['trustSignals'])}\n\n"
        if fw['keyDifferentiators']:
            md_content += f"**Key Differentiators:**\n"
            for d in fw['keyDifferentiators']:
                md_content += f"- {d}\n"
            md_content += "\n"
        md_content += "---\n\n"
    
    with open(output_dir / 'messaging-frameworks.md', 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"  Frameworks generated: {len(frameworks)}")
    
    print("Generating service-descriptions.md...")
    svc_descs = generate_service_descriptions(data)
    md_content = "# Service Descriptions Library\n\n"
    md_content += "This document catalogs how each catering company describes their services.\n\n"
    md_content += "---\n\n"
    
    for sd in svc_descs:
        md_content += f"## {sd['site'].upper()}\n\n"
        md_content += f"**Meta Description:** {sd['metaDescription']}\n\n"
        
        if sd['eventTypesMentioned']:
            md_content += f"**Event Types Mentioned:** {', '.join(sd['eventTypesMentioned'])}\n\n"
        
        if sd['valuePropositions']:
            md_content += f"**Value Propositions:**\n"
            for vp in sd['valuePropositions']:
                md_content += f"- {vp}\n"
            md_content += "\n"
        
        if sd['extractedDescriptions']:
            md_content += "**Service Description Excerpts:**\n"
            for desc in sd['extractedDescriptions']:
                clean_desc = desc.replace('&nbsp;', ' ').replace('&amp;', '&').strip()
                if len(clean_desc) > 50:
                    md_content += f"> {clean_desc[:300]}...\n\n"
        md_content += "---\n\n"
    
    with open(output_dir / 'service-descriptions.md', 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"  Service descriptions generated: {len(svc_descs)}")
    
    print("\n✅ All content library files generated successfully!")

if __name__ == '__main__':
    main()
