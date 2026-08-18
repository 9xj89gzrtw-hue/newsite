# About Us Page Outline (Best Practices)

> **Purpose:** Complete page structure for an effective About Us page  
> **Based On:** Analysis of 23 top catering websites' About/Story pages

---

## Page Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ABOUT US PAGE STRUCTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [1] HERO SECTION                                           │
│      - Page title                                          │
│      - Tagline/Mission statement                           │
│      - Hero image (team/founder/kitchen)                    │
│                                                              │
│  [2] OUR STORY (Origin Narrative)                           │
│      - Founding story                                      │
│      - Key milestones/timeline                             │
│      - Evolution to today                                  │
│                                                              │
│  [3] MISSION & VALUES                                       │
│      - Mission statement (prominent)                       │
│      - Core values (visual cards)                          │
│      - Philosophy/approach                                 │
│                                                              │
│  [4] THE TEAM                                               │
│      - Leadership/Founders (featured)                      │
│      - Key team members                                    │
│      - Photos + bios                                       │
│                                                              │
│  [5] OUR APPROACH / PHILOSOPHY                              │
│      - Food philosophy                                     │
│      - Sourcing commitments                                │
│      - Service style                                       │
│                                                              │
│  [6] BY THE NUMBERS (Stats)                                 │
│      - Key metrics in visual format                        │
│      - Social proof through data                            │
│                                                              │
│  [7] TRUST SIGNALS                                          │
│      - Awards & certifications                             │
│      - Client logos / "Trusted by"                         │
│      - Media mentions                                      │
│                                                              │
│  [8] COMMUNITY / IMPACT                                     │
│      - Local involvement                                   │
│      - Sustainability initiatives                          │
│      - Charitable work                                     │
│                                                              │
│  [9] CALL TO ACTION                                         │
│      - Invitation to connect                               │
│      - Contact information                                 │
│      - Links to portfolio/testimonials                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Section-by-Section Detail

### Section 1: HERO

**Purpose:** Immediate emotional connection, set tone

**Elements:**
```html
<section class="about-hero">
  <div class="hero-content">
    <h1>About [Company Name]</h1>
    <p class="tagline">[Mission Statement or Key Differentiator]</p>
    <p class="subheading">[Brief 1-line description of who you serve]</p>
  </div>
  <div class="hero-image">
    <!-- Team photo, founder portrait, or kitchen action shot -->
    <img src="[image].jpg" alt="[Company] team in action">
  </div>
</section>
```

**Best Practices Found:**
- Wolfgang Puck: Uses chef imagery prominently
- Gamma Catering: Clean, elegant hero with tagline
- JDK Group: "Celebrating you" mission front and center

**Image Recommendations:**
- **Option A:** Founder/chef portrait (personal connection)
- **Option B:** Team group photo (shows scale/capability)
- **Option C:** Kitchen/action shot (shows craft)
- **Option D:** Event moment with guests (shows results)

---

### Section 2: OUR STORY

**Purpose:** Build authenticity through narrative

**Structure:**

```
┌─────────────────────────────────────────────────────────┐
│  OUR STORY                                              │
│                                                         │
│  [Photo: Early days or founder]        [Narrative text]  │
│                                                         │
│  "It started in [YEAR] when..."                         │
│                                                         │
│  [2-3 paragraphs of founding story]                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              TIMELINE                             │   │
│  ├──────────┬──────────┬──────────┬─────────────────┤   │
│  │  YEAR 1  │  YEAR 2  │  YEAR 3  │    YEAR 4       │   │
│  │ Founded  │ Milestone│ Growth   │  Now            │   │
│  └──────────┴──────────┴──────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Content Template:**

```markdown
## Our Story

### How It All Began

[Founder name(s)] founded [Company] in [year] with a simple 
idea: [original vision].

What started as [humble beginning - e.g., a small kitchen/a 
catering operation from home/a passion project] has grown into 
[a brief description of current state].

But one thing hasn't changed: our commitment to [core value].

### Our Journey

**[Year]** - Founded in [location]
**[Year]** - [Major milestone - first big event, expansion, etc.]
**[Year]** - [Another milestone - award, new service, growth]
**[Year]** - [Current state - where you are now]

Today, we're proud to [current accomplishment], serving 
[client types] throughout [region].
```

**Timeline Design Options:**

**Option A: Vertical Timeline**
```
    [Year] ─── [Milestone]
                 │
    [Year] ─── [Milestone]
                 │
    [Year] ─── [Milestone]
```

**Option B: Horizontal Scrolling**
```
← [1998] — [2005] — [2010] — [2015] — [2020] →
   🏠     📈     🏆     🌍     ✨
 Started  Grew    Award  Expand  Now
```

**Option C: Card Grid**
```
┌─────────┐  ┌─────────┐  ┌─────────┐
│  1998   │  │  2005   │  │  2010   │
│ Founded │  │ 1,000th │  │ Award   │
│         │  │  event  │  │  won    │
└─────────┘  └─────────┘  └─────────┘
```

---

### Section 3: MISSION & VALUES

**Purpose:** Connect with values-aligned clients

**Layout:**

```html
<section class="mission-values">
  
  <!-- Mission Statement - Prominent -->
  <div class="mission-statement">
    <blockquote>
      "[Mission Statement]"
    </blockquote>
    <cite>— [Company Name]</cite>
  </div>
  
  <!-- Values as Visual Cards -->
  <div class="values-grid">
    
    <div class="value-card">
      <div class="value-icon">🎯</div>
      <h3>[Value 1 Name]</h3>
      <p>[2-3 sentence explanation of what this means in practice]</p>
    </div>
    
    <div class="value-card">
      <div class="value-icon">❤️</div>
      <h3>[Value 2 Name]</h3>
      <p>[Explanation]</p>
    </div>
    
    <div class="value-card">
      <div class="value-icon">💡</div>
      <h3>[Value 3 Name]</h3>
      <p>[Explanation]</p>
    </div>
    
    <div class="value-card">
      <div class="value-icon">🤝</div>
      <h3>[Value 4 Name]</h3>
      <p>[Explanation]</p>
    </div>
    
  </div>
  
</section>
```

**Value Categories Commonly Used:**

| Value Category | Example Phrasing |
|----------------|------------------|
| Quality | "Excellence in every detail" |
| Service | "White-glove, stress-free" |
| Innovation | "Creative, custom approach" |
| Integrity | "Transparent, honest" |
| Community | "Locally invested" |
| Sustainability | "Environmentally conscious" |
| Team | "People-first culture" |

---

### Section 4: THE TEAM

**Purpose:** Humanize the business, show expertise

**Layout Options:**

**Option A: Featured Leader(s) + Grid**

```
┌─────────────────────────────────────────────────────────┐
│  FOUNDER / LEADERSHIP                                    │
│                                                         │
│  [Large Portrait]          [Bio Text Block]              │
│                            Name, Title                  │
│                            2-3 paragraph bio            │
│                            Fun fact or quote             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  MEET THE TEAM                                          │
│                                                         │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │ Photo  │  │ Photo  │  │ Photo  │  │ Photo  │        │
│  │ Name   │  │ Name   │  │ Name   │  │ Name   │        │
│  │ Title  │  │ Title  │  │ Title  │  │ Title  │        │
│  │ Brief  │  │ Brief  │  │ Brief  │  │ Brief  │        │
│  └────────┘  └────────┘  └────────┘  └────────┘        │
└─────────────────────────────────────────────────────────┘
```

**Option B: Equal Grid (Collaborative Feel)**

**Option C: By Department (For Larger Teams)**
- Culinary Team
- Event Coordination Team
- Sales/Client Services

**Team Member Card Content:**

```html
<div class="team-member">
  <img src="[photo].jpg" alt="[Name], [Title]">
  <h3>[Name]</h3>
  <span class="title">[Title]</span>
  <p class="bio">
    [2-3 sentences: background, experience, specialty, 
     approach, fun fact]
  </p>
  <ul class="credentials">
    <li>[Certification/Degree]</li>
    <li>[Years of experience]</li>
    <li>[Specialty area]</li>
  </ul>
</div>
```

**Bio Writing Tips:**
- Lead with relevant experience
- Include personality details
- Mention specific expertise areas
- Add a "fun fact" for memorability
- Keep it scannable (not a novel)

---

### Section 5: OUR APPROACH / PHILOSOPHY

**Purpose:** Explain your methodology and standards

**Subsections to Consider:**

**Food Philosophy:**
```markdown
### Our Food Philosophy

[Paragraph on sourcing approach]

**What This Means For You:**
- Seasonal menus that reflect the best of each season
- Local partnerships with [number]+ farms and producers
- From-scratch preparation - nothing pre-made
- Dietary accommodations without sacrificing flavor
```

**Service Philosophy:**
```markdown
### Our Service Approach

We don't just cater events - we [unique framing].

From first consultation to final cleanup:

1. **Discovery** - We learn your vision
2. **Design** - We create custom proposals
3. **Execution** - We deliver flawlessly
4. **Follow-up** - We ensure satisfaction
```

**Sustainability Commitment (if applicable):**
```markdown
### Our Commitment to Sustainability

[Details on green practices, certifications, etc.]
```

---

### Section 6: BY THE NUMBERS

**Purpose:** Quick-scanning social proof through data

**Design:**

```html
<section class="stats-section">
  <h2>[Company Name] By The Numbers</h2>
  
  <div class="stats-grid">
    
    <div class="stat-item">
      <span class="stat-number">25+</span>
      <span class="stat-label">Years of Excellence</span>
    </div>
    
    <div class="stat-item">
      <span class="stat-number">5,000+</span>
      <span class="stat-label">Events Catered</span>
    </div>
    
    <div class="stat-item">
      <span class="stat-number">500,000+</span>
      <span class="stat-label">Guests Served</span>
    </div>
    
    <div class="stat-item">
      <span class="stat-number">4.9</span>
      <span class="stat-label">Average Star Rating</span>
    </div>
    
    <div class="stat-item">
      <span class="stat-number">15+</span>
      <span class="stat-label">Awards Won</span>
    </div>
    
    <div class="stat-item">
      <span class="stat-number">40+</span>
      <span class="stat-label">Team Members</span>
    </div>
    
  </div>
</section>
```

**Stat Selection Guidance:**

| If You Have... | Display It As... |
|----------------|------------------|
| 10+ years experience | "X+ Years of Excellence" |
| 1000+ events | "X,000+ Events Catered" |
| High review score | "X.X ★ Average Rating" |
| Notable awards | "X+ Awards Won" |
| Large client list | "Trusted by X+ Organizations" |
| Big team | "X+ Dedicated Professionals" |
| Specific milestones | Custom stat (e.g., "Served 3 US Presidents") |

---

### Section 7: TRUST SIGNALS

**Purpose:** Third-party validation

**Components:**

```html
<section class="trust-signals">
  
  <!-- Awards -->
  <div class="awards-subsection">
    <h3>Awards & Recognition</h3>
    <div class="award-badges">
      <!-- Official badge images -->
      <img src="knot-2025.svg" alt="The Knot Best of Weddings 2025">
      <img src="best-caterer.svg" alt="Voted Best Caterer">
      <!-- etc. -->
    </div>
  </div>
  
  <!-- Certifications -->
  <div class="certifications-subsection">
    <h3>Certifications & Credentials</h3>
    <ul>
      <li>ServSafe Certified Team</li>
      <li>Fully Licensed & Insured</li>
      <li>[Other certifications]</li>
    </ul>
  </div>
  
  <!-- Client Logos -->
  <div class="clients-subsection">
    <h3>Trusted By Leading Organizations</h3>
    <div class="logo-grid">
      <!-- Client logos -->
    </div>
  </div>
  
  <!-- Media/Press -->
  <div class="press-subsection">
    <h3>As Seen In</h3>
    <div class="media-logos">
      <!-- Publication logos -->
    </div>
  </div>
  
</section>
```

---

### Section 8: COMMUNITY / IMPACT (Optional but Recommended)

**Purpose:** Show values in action, local connection

**Content Ideas:**

```markdown
### Our Community

We're proud to call [City/Region] home.

**Ways We Give Back:**
- [Charitable partnership or program]
- [Local organization support]
- [Community event participation]
- [Sustainability initiative]

**Our Sustainability Commitment:**
- [Specific environmental practices]
- [Certifications if applicable]
- [Future goals]
```

---

### Section 9: CALL TO ACTION

**Purpose:** Convert page visit into next step

**Options:**

**Option A - Direct Inquiry:**
```html
<section class="about-cta">
  <h2>Ready to Create Something Amazing?</h2>
  <p>We'd love to hear about your upcoming event.</p>
  <a href="/contact" class="btn-primary">Start Planning Your Event</a>
  <p class="secondary-cta">
    Or call us at [phone] • Email [email]
  </p>
</section>
```

**Option B - Explore More:**
```html
<section class="about-cta">
  <h2>Explore Our Work</h2>
  <div class="cta-links">
    <a href="/portfolio" class="btn">View Our Portfolio →</a>
    <a href="/testimonials" class="btn">Read Client Stories →</a>
    <a href="/menus" class="btn">Sample Our Menus →</a>
  </div>
</section>
```

**Option C - Personal Connection:**
```html
<section class="about-cta">
  <h2>Let's Talk Food</h2>
  <p>Whether you have a clear vision or need guidance, we're here to help.</p>
  <a href="/contact" class="btn">Schedule a Consultation</a>
</section>
```

---

## Technical Implementation Notes

### SEO Optimization:

```html
<!-- Meta Tags -->
<title>About Us | [Company Name] - [Location] Catering</title>
<meta name="description" content="[Compelling 150-char about us description including location and key differentiators]">

<!-- Schema Markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["Organization", "FoodEstablishment"],
  "name": "[Company Name]",
  "description": "[Description]",
  "url": "[website-url]",
  "foundingDate": "[year]",
  "founders": [
    {
      "@type": "Person",
      "name": "[Founder Name]"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[City]",
    "addressRegion": "[State]",
    "addressCountry": "US"
  },
  "sameAs": [
    "[Instagram URL]",
    "[Facebook URL]"
  ]
}
</script>
```

### Performance:
- Lazy load images below fold
- Compress team photos appropriately
- Use WebP format with fallbacks
- Consider loading stats section on scroll

### Accessibility:
- Proper heading hierarchy (single h1)
- Alt text on all images
- Sufficient color contrast
- Keyboard navigable
- Screen reader friendly structure

---

## Content Length Guidelines

| Section | Recommended Word Count |
|---------|----------------------|
| Hero | 20-50 words |
| Our Story | 200-400 words |
| Mission & Values | 150-250 words |
| The Team | 50-100 words per person |
| Approach/Philosophy | 150-300 words |
| Stats | Visual (minimal text) |
| Trust Signals | Visual + captions |
| Community | 100-200 words (optional) |
| CTA | 25-50 words |
| **Total Page** | **800-1,500 words** |

---

*Part of the Social Proof Library | Deep-6 Extraction*
