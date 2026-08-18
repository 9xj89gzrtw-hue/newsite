# Local SEO Patterns — Catering Industry

## Local SEO Elements Analysis

### Address Schema Implementation

Sites with proper LocalBusiness/Organization schema including address:

#### Concept Catering
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 8
- **Email Addresses:** 1
- **Google Maps Embeds:** 0

#### Concordecatering
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 1
- **Email Addresses:** 1
- **Google Maps Embeds:** 0

#### Creativeedge
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 2
- **Email Addresses:** 1
- **Google Maps Embeds:** 0

#### Cutandtaste
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 23
- **Email Addresses:** 2
- **Google Maps Embeds:** 0

#### Elegantaffairs
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 23
- **Email Addresses:** 1
- **Google Maps Embeds:** 0

#### Gammacatering
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 54
- **Email Addresses:** 10
- **Google Maps Embeds:** 0

#### Ggcatering
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 2
- **Email Addresses:** 0
- **Google Maps Embeds:** 0

#### Jdkgroup
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 8
- **Email Addresses:** 1
- **Google Maps Embeds:** 0

#### Myradish
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 2
- **Email Addresses:** 1
- **Google Maps Embeds:** 0

#### Queenofhearts
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 3
- **Email Addresses:** 0
- **Google Maps Embeds:** 0

#### Ridgewells
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 11
- **Email Addresses:** 7
- **Google Maps Embeds:** 0

#### Saltblock
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 28
- **Email Addresses:** 4
- **Google Maps Embeds:** 6

#### Sopranos
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 8
- **Email Addresses:** 1
- **Google Maps Embeds:** 0

#### Tallguy
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 1
- **Email Addresses:** 1
- **Google Maps Embeds:** 0

#### Wolfgangpuck
- **Schema Address:** ❌ Missing
- **Schema Phone:** ❌ Missing
- **Phone Numbers Found:** 1
- **Email Addresses:** 0
- **Google Maps Embeds:** 0


---

## Complete LocalBusiness Schema Template for Catering

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "FoodEstablishment"],
  "@id": "https://example.com/#organization",
  "name": "[Your Catering Company Name]",
  "alternateName": "[DBA or Short Name]",
  "url": "https://example.com",
  "logo": "https://example.com/images/logo.png",
  "description": "[Company description with primary keywords]",
  "telephone": "+1-XXX-XXX-XXXX",
  "email": "info@example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street, Suite 100",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "XX.XXXXXX",
    "longitude": "-XX.XXXXXX"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "17:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "14:00"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/yourcompany",
    "https://www.instagram.com/yourcompany",
    "https://www.pinterest.com/yourcompany",
    "https://www.linkedin.com/company/yourcompany"
  ],
  "areaServed": [
    {
      "@type": "City",
      "name": "City 1"
    },
    {
      "@type": "City", 
      "name": "City 2"
    },
    {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "XX.XXXXXX",
        "longitude": "-XX.XXXXXX"
      },
      "geoRadius": "50000"
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Catering Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Wedding Catering",
          "description": "Full-service wedding catering..."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Corporate Event Catering",
          "description": "Corporate catering services..."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Social Event Catering",
          "description": "Private party and social event catering..."
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127",
    "bestRating": "5"
  }
}
```

---

## Google Business Profile Optimization Checklist

### Core Information
- [ ] **Business Name**: Exact match to brand, no keyword stuffing
- [ ] **Primary Category**: Caterer / Food & Drink / Restaurant
- [ ] **Additional Categories**: Event Planner, Wedding Planner (if applicable)
- [ ] **Address**: Physical location (or service area if home-based)
- [ ] **Service Areas**: List cities/regions served
- [ ] **Phone**: Local area code, tracked number
- [ ] **Website**: Canonical homepage URL
- [ ] **Hours**: Accurate operating hours
- [ ] **Attributes**: Women-owned, Veteran-owned, etc.

### Visual Assets
- [ ] **Profile Photo**: Logo or hero image (minimum 250x250)
- [ ] **Cover Photo**: Professional event photo (minimum 1080x608)
- [ ] **Additional Photos**: 10+ photos showing:
  - Food presentations
  - Event setups
  - Team in action
  - Venue examples
  - Happy clients (with permission)

### Content Optimization
- [ ] **Business Description**: 750 characters, primary keywords naturally included
- [ ] **Posts**: Weekly updates featuring:
  - Menu highlights
  - Event spotlights
  - Seasonal offerings
  - Behind-the-scenes content
- [ ] **Q&A**: Pre-populate common questions
- [ ] **Reviews**: Active review generation strategy

---

## NAP Consistency (Name, Address, Phone)

### Format Standards:

**Business Name:**
```
Official: [Your Catering Company], Inc.
Display: Your Catering Company
Short: Your Catering
```

**Address Format:**
```
123 Main Street, Suite 100
City, State ZIP
```

**Phone Format:**
```
(XXX) XXX-XXXX
+1-XXX-XXX-XXXX
```

### Citations to Build:
| Citation Type | Priority | DA |
|---------------|----------|-----|
| Google Business Profile | Critical | - |
| Yelp | High | 94 |
| TripAdvisor | High | 93 |
| WeddingWire | High | 78 |
| The Knot | High | 82 |
| Facebook Business | High | 96 |
| LinkedIn Company | Medium | 98 |
| Yellow Pages | Medium | 92 |
| Local Chambers of Commerce | Medium | Varies |
| Industry Associations | Medium | Varies |

---

## Service Area Pages Strategy

### When to Create Service Area Pages:
- You serve multiple distinct cities/regions
- Each area has significant search volume
- You can create unique content for each location

### Service Page Template:

**URL:** `/catering-[city-name]/` or `/locations/[city-name]/`

**Title:** `[City] Catering Services | [Brand Name] - [Event Types]`

**Meta Description:**
```
Premier catering services in [City], [State]. [Brand] provides 
[event types] throughout [City] and [surrounding areas]. 
Get your custom quote today!
```

**Page Content Sections:**
1. H1: `[City] Catering Services by [Brand]`
2. Introduction paragraph mentioning city 2-3 times
3. Popular venues in that city (with links if possible)
4. Event types commonly catered in that city
5. Testimonials from clients in that city
6. City-specific menu suggestions
7. CTA to quote form

### Example Cities Content:
```
We've had the pleasure of catering at [City]'s premier venues including:
- [Venue 1] in [Neighborhood]
- [Venue 2] in [Downtown/Area]
- [Venue 3] near [Landmark]

Whether you're planning a wedding at [Popular Venue] or a corporate 
event in [Business District], [Brand] brings the same level of 
excellence to every [City] event.
```
