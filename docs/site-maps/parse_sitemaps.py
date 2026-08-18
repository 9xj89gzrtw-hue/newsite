#!/usr/bin/env python3
"""
Sitemap Parser and Analyzer for Catering Websites
Parses raw sitemap JSON files and generates comprehensive URL structure analysis
"""

import json
import re
import os
from datetime import datetime
from collections import defaultdict

# Site configuration
SITES = {
    "concordecatering": {
        "url": "https://concordecatering.ca",
        "sitemap_file": "concordecatering_sitemap.json",
        "robots_file": "concordecatering_robots.json"
    },
    "myradish": {
        "url": "https://www.myradish.com",
        "sitemap_file": "myradish_sitemap.json",
        "robots_file": "myradish_robots.json"
    },
    "ridgewells": {
        "url": "https://www.ridgewells.com",
        "sitemap_file": "ridgewells_sitemap.json"
    },
    "sopranos": {
        "url": "https://www.sopranoscatering.com",
        "sitemap_file": "sopranos_sitemap.json"
    },
    "conceptcatering": {
        "url": "https://concept-catering.de",
        "sitemap_file": "conceptcatering_sitemap.json"
    },
    "talkofthetown": {
        "url": "https://talkofthetownatlanta.com",
        "sitemap_file": "talkofthetown_sitemap.json"
    },
    "queenofhearts": {
        "url": "https://www.queenofheartscatering.com",
        "sitemap_file": "queenofhearts_sitemap.json"
    },
    "chicchef": {
        "url": "https://chicchefcatering.com",
        "sitemap_file": "chicchef_sitemap.json"
    },
    "relishcaterers": {
        "url": "https://relishcaterers.com",
        "sitemap_file": "relishcaterers_sitemap.json"
    },
    "sterling": {
        "url": "https://sterlingcateringmn.com",
        "sitemap_file": "sterling_sitemap.json"
    },
    "tallguy": {
        "url": "https://www.tallguyandagrill.com",
        "sitemap_file": "tallguy_sitemap.json"
    },
    "joels": {
        "url": "https://joels.com",
        "sitemap_file": "joels_sitemap.json"
    },
    "ggcatering": {
        "url": "https://www.ggcatering.com",
        "sitemap_file": "ggcatering_sitemap.json"
    },
    "mculinary": {
        "url": "https://mculinary.com",
        "sitemap_file": "mculinary_sitemap.json"
    },
    "saltblock": {
        "url": "https://saltblockhospitality.com",
        "sitemap_file": "saltblock_sitemap.json"
    },
    "jdkgroup": {
        "url": "https://thejdkgroup.com",
        "sitemap_file": "jdkgroup_sitemap.json"
    },
    "bywordofmouth": {
        "url": "https://bywordofmouth.co.uk",
        "sitemap_file": "bywordofmouth_sitemap.json"
    },
    "creativeedge": {
        "url": "https://creativeedgeparties.com",
        "sitemap_file": "creativeedge_sitemap.json"
    },
    "cutandtaste": {
        "url": "https://cutandtastelv.com",
        "sitemap_file": "cutandtaste_sitemap.json"
    },
    "elegantaffairs": {
        "url": "https://elegantaffairscaterers.com",
        "sitemap_file": "elegantaffairs_sitemap.json"
    },
    "gammacatering": {
        "url": "https://gammacatering.com/en/",
        "sitemap_file": "gammacatering_sitemap.json"
    },
    "wolfgangpuck": {
        "url": "https://wolfgangpuckcatering.com",
        "sitemap_file": "wolfgangpuck_sitemap.json"
    }
}

# URL categorization patterns
URL_PATTERNS = {
    "services": [
        r"service[s]?",
        r"catering",
        r"menu",
        r"event[s]?",
        r"wedding[s]?",
        r"corporate",
        r"social.event",
        r"private",
        r"buffet",
        r"bar.package",
        r"appetizer",
        r"grill",
        r"bbq",
        r"tray",
        r"breakfast",
        r"brunch",
        r"lunch",
        r"dinner",
        r"drop.off",
        r"delivery",
        r"workplace",
        r"office",
        r"kosher",
        r"venue",
        r"location",
        r"seasonal",
        r"recipe",
        r"food",
        r"cuisine",
        r"station",
        r"plated",
        r"family.style"
    ],
    "gallery": [
        r"galler[yies]",
        r"photo[s]?",
        r"image[s]?",
        r"portfolio",
        r"event.space",
        r".*gallery$"
    ],
    "blog": [
        r"blog",
        r"post[s]?",
        r"news",
        r"article[s]?",
        r"journal[s]?",
        r"story",
        r"update[s]?"
    ],
    "about": [
        r"about",
        r"our.story",
        r"team",
        r"staff",
        r"chef[s]?",
        r"history",
        r"approach",
        r"philosophy",
        r"mission",
        r"value[s]?",
        r"career[s]?",
        r"job[s]?",
        r"sustainability",
        r"green",
        r"eco"
    ],
    "contact": [
        r"contact",
        r"inquir[yies]",
        r"request[s]?",
        r"quote",
        r"estimate",
        r"reach.out",
        r"get.in.touch",
        r"call",
        r"phone",
        r"email",
        r"address"
    ],
    "legal": [
        r"privacy",
        r"term[s]?",
        r"condition[s]?",
        r"policy",
        r"legal",
        r"disclaimer",
        r"accessibility",
        r"cookie",
        r"impressum",
        r"datenschutz",
        r"agb",
        r"faq"
    ]
}


def extract_urls_from_html(html_content):
    """Extract URLs from sitemap HTML content"""
    urls = []
    # Pattern to match URLs in sitemap format: <a href="URL">URL</a>
    pattern = r'<a\s+href="(https?://[^"]+)"'
    matches = re.findall(pattern, html_content)
    
    for url in matches:
        # Filter out non-http URLs (mailto, tel, etc.)
        if url.startswith('http'):
            urls.append(url)
    
    return list(set(urls))  # Remove duplicates


def categorize_url(url):
    """Categorize a URL based on its path"""
    url_lower = url.lower()
    
    for category, patterns in URL_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, url_lower):
                return category
    
    return "other"


def parse_sitemap_file(filepath):
    """Parse a sitemap JSON file and extract information"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        result = {
            "has_sitemap": False,
            "is_valid": False,
            "is_index": False,
            "http_status": None,
            "urls": [],
            "error": None,
            "blocked": False,
            "raw_html": None
        }
        
        # Check HTTP status
        if "data" in data:
            http_status = data["data"].get("httpStatus")
            result["http_status"] = http_status
            
            # Check if blocked by bot protection
            html_content = data["data"].get("html", "")
            if "Robot Challenge Screen" in html_content or "captcha" in html_content.lower():
                result["blocked"] = True
                result["error"] = "Blocked by bot protection"
                return result
            
            # Check for 404 or errors
            if http_status and http_status >= 400:
                result["error"] = f"HTTP {http_status}"
                if http_status == 404:
                    result["has_sitemap"] = False
                return result
            
            result["raw_html"] = html_content
            
            # Check title for sitemap type
            title = data["data"].get("title", "").lower()
            if "sitemap index" in title:
                result["is_index"] = True
                result["has_sitemap"] = True
                result["is_valid"] = True
            elif "sitemap" in title:
                result["has_sitemap"] = True
                result["is_valid"] = True
            
            # Extract URLs
            urls = extract_urls_from_html(html_content)
            result["urls"] = urls
            
            # Check if we got actual URLs (not just empty links)
            valid_urls = [u for u in urls if u and len(u) > 10]
            if valid_urls:
                result["is_valid"] = True
                result["has_sitemap"] = True
        
        return result
    
    except Exception as e:
        return {
            "has_sitemap": False,
            "is_valid": False,
            "is_index": False,
            "http_status": None,
            "urls": [],
            "error": str(e),
            "blocked": False,
            "raw_html": None
        }


def parse_robots_file(filepath):
    """Parse a robots.txt file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if "data" in data and data["data"].get("html"):
            # Extract text content from pre tag
            html = data["data"]["html"]
            match = re.search(r'<pre[^>]*>(.*?)</pre>', html, re.DOTALL | re.IGNORECASE)
            if match:
                content = match.group(1).strip()
                # Find sitemap references
                sitemap_refs = re.findall(r'Sitemap:\s*(https?://\S+)', content, re.IGNORECASE)
                return {
                    "content": content,
                    "sitemap_references": sitemap_refs,
                    "has_sitemap_ref": len(sitemap_refs) > 0
                }
        
        return {"content": None, "sitemap_references": [], "has_sitemap_ref": False}
    
    except Exception as e:
        return {"content": None, "error": str(e), "sitemap_references": [], "has_sitemap_ref": False}


def analyze_site(site_key, site_config, raw_dir):
    """Analyze a single site's sitemap data"""
    site_result = {
        "url": site_config["url"],
        "sitemap_url": None,
        "sitemap_content": {},
        "robots_txt": None,
        "all_urls": [],
        "page_count": 0,
        "url_structure": {
            "services": [],
            "gallery": [],
            "blog": [],
            "about": [],
            "contact": [],
            "legal": [],
            "other": []
        },
        "status": "unknown",
        "notes": []
    }
    
    # Parse sitemap
    sitemap_path = os.path.join(raw_dir, site_config.get("sitemap_file", ""))
    if os.path.exists(sitemap_path):
        sitemap_data = parse_sitemap_file(sitemap_path)
        
        if sitemap_data["blocked"]:
            site_result["status"] = "blocked"
            site_result["notes"].append("Blocked by bot protection (Cloudflare/SG)")
            site_result["sitemap_content"] = {"blocked": True, "reason": "Bot protection"}
        elif sitemap_data["error"] and not sitemap_data["urls"]:
            site_result["status"] = "no_sitemap"
            site_result["notes"].append(f"Sitemap error: {sitemap_data['error']}")
            site_result["sitemap_content"] = {"error": sitemap_data["error"]}
        else:
            site_result["status"] = "success" if sitemap_data["is_valid"] else "invalid"
            site_result["sitemap_url"] = f"{site_config['url']}/sitemap.xml"
            
            # Store sitemap info
            site_result["sitemap_content"] = {
                "is_index": sitemap_data["is_index"],
                "http_status": sitemap_data["http_status"],
                "url_count": len(sitemap_data["urls"])
            }
            
            # Process URLs
            all_urls = sitemap_data["urls"]
            
            # If it's an index, note that these are sub-sitemaps
            if sitemap_data["is_index"]:
                site_result["notes"].append("Sitemap index - contains references to sub-sitemaps")
                site_result["sitemap_content"]["sub_sitemaps"] = all_urls
                # For indexes, we still count the sub-sitemap URLs but mark them
                site_result["all_urls"] = all_urls
            else:
                site_result["all_urls"] = all_urls
            
            # Categorize URLs
            for url in all_urls:
                category = categorize_url(url)
                if url not in site_result["url_structure"][category]:
                    site_result["url_structure"][category].append(url)
            
            site_result["page_count"] = len(all_urls)
    else:
        site_result["status"] = "file_not_found"
        site_result["notes"].append("Sitemap file not found in raw data")
    
    # Parse robots.txt
    robots_path = os.path.join(raw_dir, site_config.get("robots_file", "")) if "robots_file" in site_config else None
    if robots_path and os.path.exists(robots_path):
        robots_data = parse_robots_file(robots_path)
        site_result["robots_txt"] = robots_data.get("content")
        if robots_data.get("has_sitemap_ref"):
            site_result["notes"].append(f"robots.txt references sitemap: {robots_data['sitemap_references']}")
    
    return site_result


def main():
    """Main function to process all sites"""
    raw_dir = "/home/z/my-project/newsite/docs/site-maps/raw-sitemaps"
    output_file = "/home/z/my-project/newsite/docs/site-maps/complete-sitemap-compilation.json"
    
    print("=" * 60)
    print("SITEMAP PARSER AND ANALYZER FOR CATERING WEBSITES")
    print("=" * 60)
    print()
    
    results = {
        "metadata": {
            "generated": datetime.now().isoformat(),
            "sites_analyzed": len(SITES),
            "sites_with_sitemap": 0,
            "sites_without_sitemap": 0,
            "sites_blocked": 0
        },
        "sites": {},
        "analysis": {
            "common_url_patterns": {
                "services_pages": [],
                "gallery_patterns": [],
                "blog_structures": []
            },
            "average_page_count": 0,
            "deepest_site": {"site": "", "count": 0},
            "sitemap_types": {
                "direct_sitemap": 0,
                "sitemap_index": 0,
                "no_sitemap": 0,
                "blocked": 0
            }
        }
    }
    
    total_pages = 0
    max_pages = 0
    deepest_site = ""
    
    # Track patterns across sites
    all_service_urls = []
    all_gallery_urls = []
    all_blog_urls = []
    
    for site_key, site_config in SITES.items():
        print(f"Processing: {site_key} ({site_config['url']})...")
        
        site_result = analyze_site(site_key, site_config, raw_dir)
        results["sites"][site_key] = site_result
        
        # Update statistics
        if site_result["status"] == "success":
            results["metadata"]["sites_with_sitemap"] += 1
            total_pages += site_result["page_count"]
            
            if site_result["page_count"] > max_pages:
                max_pages = site_result["page_count"]
                deepest_site = site_key
            
            # Track sitemap types
            if site_result.get("sitemap_content", {}).get("is_index"):
                results["analysis"]["sitemap_types"]["sitemap_index"] += 1
            else:
                results["analysis"]["sitemap_types"]["direct_sitemap"] += 1
            
            # Collect pattern data
            all_service_urls.extend(site_result["url_structure"]["services"])
            all_gallery_urls.extend(site_result["url_structure"]["gallery"])
            all_blog_urls.extend(site_result["url_structure"]["blog"])
            
        elif site_result["status"] == "blocked":
            results["metadata"]["sites_blocked"] += 1
            results["analysis"]["sitemap_types"]["blocked"] += 1
        else:
            results["metadata"]["sites_without_sitemap"] += 1
            results["analysis"]["sitemap_types"]["no_sitemap"] += 1
        
        print(f"  Status: {site_result['status']}, Pages: {site_result['page_count']}")
    
    # Calculate analysis
    sites_with_pages = results["metadata"]["sites_with_sitemap"]
    results["analysis"]["average_page_count"] = round(total_pages / max(sites_with_pages, 1), 2)
    results["analysis"]["deepest_site"] = {"site": deepest_site, "count": max_pages}
    
    # Extract common patterns
    def extract_path_patterns(urls):
        patterns = defaultdict(int)
        for url in urls:
            # Extract path without domain
            match = re.match(r'https?://[^/]+(/.*)?', url)
            if match and match.group(1):
                path = match.group(1)
                # Get first segment
                segments = [s for s in path.split('/') if s]
                if segments:
                    patterns[segments[0]] += 1
        return sorted(patterns.items(), key=lambda x: -x[1])[:15]
    
    results["analysis"]["common_url_patterns"]["services_pages"] = [
        p[0] for p in extract_path_patterns(all_service_urls)
    ]
    results["analysis"]["common_url_patterns"]["gallery_patterns"] = [
        p[0] for p in extract_path_patterns(all_gallery_urls)
    ]
    results["analysis"]["common_url_patterns"]["blog_structures"] = [
        p[0] for p in extract_path_patterns(all_blog_urls)
    ]
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print()
    print("=" * 60)
    print("ANALYSIS COMPLETE")
    print("=" * 60)
    print(f"Sites analyzed: {results['metadata']['sites_analyzed']}")
    print(f"Sites with sitemap: {results['metadata']['sites_with_sitemap']}")
    print(f"Sites without sitemap: {results['metadata']['sites_without_sitemap']}")
    print(f"Sites blocked: {results['metadata']['sites_blocked']}")
    print(f"Average page count: {results['analysis']['average_page_count']}")
    print(f"Deepest site: {results['analysis']['deepest_site']['site']} ({results['analysis']['deepest_site']['count']} pages)")
    print(f"Output saved to: {output_file}")


if __name__ == "__main__":
    main()
