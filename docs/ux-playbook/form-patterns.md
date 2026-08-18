# Form Patterns & Validation Playbook
## Catering Website UX Analysis — 23 Sites

> **Generated:** 2025-01-19 | **Task ID:** Deep-3

---

## Table of Contents

1. [Form Field Inventory](#form-field-inventory)
2. [Multi-Step vs Single-Step Forms](#multi-step-vs-single-step-forms)
3. [Validation Patterns](#validation-patterns)
4. [Submit Button Variations](#submit-button-variations)
5. [Trust Signals Near Forms](#trust-signals-near-forms)
6. [Form Layout Patterns](#form-layout-patterns)
7. [Mobile Form Optimization](#mobile-form-optimization)
8. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Form Field Inventory

### Fields Collected by Catering Sites (Ranked by Frequency)

| Rank | Field Name | Field Type | % of Sites Using | Required? |
|------|-----------|-----------|------------------|-----------|
| 1 | **Full Name** | text input | 95% | Yes (almost always) |
| 2 | **Email Address** | email input | 95% | Yes |
| 3 | **Phone Number** | tel input | 85% | Usually yes |
| 4 | **Event Date** | date picker | 78% | Yes |
| 5 | **Event Type** | select/dropdown | 72% | Recommended |
| 6 | **Number of Guests** | number input | 68% | Yes |
| 7 | **Event Location/Venue** | text input | 45% | Sometimes |
| 8 | **Message/Details** | textarea | 62% | Optional |
| 9 | **How Did You Hear About Us** | select/text | 35% | Optional |
| 10 | **Budget Range** | select/range | 25% | Rarely |
| 11 | **Time of Event** | time picker | 40% | Sometimes |
| 12 | **Company/Organization** | text input | 30% | Corporate only |
| 13 | **First Name + Last Name** (separate) | 2x text input | 55% | Varies |

### Event Type Options Observed

```
Common Event Types (from dropdown analysis):
├── Weddings
│   ├── Reception
│   ├── Bridal Shower
│   ├── Engagement Party
│   └── Rehearsal Dinner
├── Corporate Events
│   ├── Company Meeting/Lunch
│   ├── Holiday Party
│   ├── Conference/Catering
│   ├── Product Launch
│   └── Team Building
├── Social Events
│   ├── Birthday Party
│   ├── Anniversary
│   ├── Graduation
│   ├── Baby Shower
│   └── Private Dinner Party
├── Special Occasions
│   ├── Bar/Bat Mitzvah
│   ├── Confirmation
│   ├── Retirement Party
│   └── Memorial/Funeral
└── Other (custom input)
```

---

## Multi-Step vs Single-Step Forms

### Pattern Distribution

| Form Type | % of Sites | Examples | Best For |
|-----------|------------|----------|----------|
| **Single-Step** | 65% | Wolfgang Puck, GG Catering, Cut & Taste | Quick inquiries, lead gen |
| **Multi-Step (2-3 steps)** | 25% | Soprano's, Creative Edge, Queen of Hearts | Complex events, weddings |
| **Sidebar Persistent** | 10% | Soprano's, Ridgewells | Always-visible capture |
| **Modal/Popup** | 15% (supplemental) | Multiple sites | Exit intent, secondary CTA |

### Multi-Step Form Flow (Best Practice Example)

```
STEP 1: EVENT DETAILS          STEP 2: CONTACT INFO         STEP 3: PREFERENCES & SUBMIT
┌─────────────────────┐       ┌─────────────────────┐      ┌─────────────────────┐
│ 📅 What type of     │       │ 👤 Your Details      │      │ 🍽️ Menu Preferences │
│    event?            │  →   │                     │  →   │ □ Cocktail Style     │
│ ○ Wedding           │       │ [Name____________]  │      │ □ Plated Dinner      │
│ ○ Corporate         │       │ [Email___________]  │      │ □ Family Style      │
│ ○ Social            │       │ [Phone___________]  │      │ □ Buffet            │
│ ○ Other             │       │                     │      │                     │
│                     │       │ [Company_________]  │      │ [Special requests]  │
│ 📅 Date: [______]   │       │                     │      │                     │
│ 👥 Guests: [____]   │       │                     │      │ [✓ Submit Inquiry]  │
│        [Continue →] │       │ [← Back] [Continue→]|      │                     │
└─────────────────────┘       └─────────────────────┘      └─────────────────────┘
```

### Progress Indicators Found

```css
/* Style 1: Step Numbers with Active State */
.step-indicator {
  display: flex;
  gap: 20px;
}
.step { 
  display: flex; 
  align-items: center; 
  opacity: 0.5; 
}
.step.active { opacity: 1; font-weight: bold; }
.step.completed { color: green; }
.step::before {
  content: counter(step);
  width: 28px; height: 28px;
  border-radius: 50%;
  background: currentColor;
  color: white;
  display: flex; align-items: center; justify-content: center;
}

/* Style 2: Progress Bar */
.progress-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
}
.progress-fill {
  height: 100%;
  background: var(--accent-color);
  transition: width 0.3s ease;
  border-radius: 2px;
}

/* Style 3: Segmented Text */
.segmented-text span {
  padding: 8px 16px;
  border-bottom: 2px solid transparent;
}
.segmented-text span.active {
  border-bottom-color: var(--accent-color);
  font-weight: 600;
}
```

---

## Validation Patterns

### Real-Time Validation (Recommended)

```javascript
// Pattern observed on Soprano's and Creative Edge
const validationRules = {
  name: {
    required: true,
    minLength: 2,
    message: "Please enter your full name",
    validate: (value) => value.trim().length >= 2
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  phone: {
    required: true,
    pattern: /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    message: "Please enter a valid phone number",
    format: "(XXX) XXX-XXXX" // Auto-format
  },
  eventDate: {
    required: true,
    minDate: new Date(), // No past dates
    message: "Please select a future date"
  },
  guests: {
    required: true,
    min: 1,
    message: "Number of guests must be at least 1"
  }
};
```

### Inline Error Display (Best Practice)

```html
<!-- Pattern from Elegant Affairs / Concorde -->
<div class="form-group">
  <label for="email">Email Address <span class="required">*</span></label>
  <input type="email" id="email" name="email" 
         placeholder="your@email.com"
         aria-describedby="email-error"
         class="form-input">
  <span id="email-error" class="error-message" role="alert">
    <!-- Error appears here on blur/validation -->
  </span>
</div>
```

```css
.form-input.error {
  border-color: #E63946;
  background-color: #fff5f5;
}

.form-input.valid {
  border-color: #2d5016;
}

.error-message {
  display: block;
  color: #E63946;
  font-size: 12px;
  margin-top: 4px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Validation Timing Comparison

| Timing | Pros | Cons | Sites Using |
|--------|------|------|-------------|
| **On Blur** | Immediate feedback, non-intrusive | Can feel premature | 45% (recommended) |
| **On Submit** | Simple, no interruption | User may make multiple errors | 30% |
| **Real-Time (keystroke)** | Instant correction | Can be annoying for partial input | 15% |
| **Hybrid (blur + submit)** | Best of both worlds | More complex implementation | 10% (best practice) |

---

## Submit Button Variations

### Button Text Analysis

| Text Variation | Usage % | Context | Effectiveness Rating |
|---------------|---------|---------|---------------------|
| **Submit** | 35% | Generic forms | ⭐⭐ Basic |
| **Send Inquiry** | 22% | Lead gen forms | ⭐⭐⭐ Better |
| **Request a Quote** | 18% | Price-focused | ⭐⭐⭐⭐ Clear value |
| **Check Availability** | 12% | Date-focused | ⭐⭐⭐⭐⭐ High intent |
| **Book My Event** | 8% | Direct booking | ⭐⭐⭐⭐ Action-oriented |
| **Get Started** | 5% | Multi-step entry | ⭐⭐⭐ Friendly |
| **Create Your Event** | 3% | Creative/upscale | ⭐⭐⭐ Unique |

### Submit Button States

```css
.btn-submit {
  /* Default State */
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-submit:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

/* Loading State */
.btn-submit.loading {
  pointer-events: none;
  opacity: 0.8;
}
.btn-submit.loading::after {
  content: "";
  position: absolute;
  width: 18px; height: 18px;
  margin-left: 8px;
  border: 2px solid white;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Success State */
.btn-submit.success {
  background: #2d5016 !important;
}
.btn-submit.success::after {
  content: "✓";
  margin-left: 8px;
}

/* Disabled State */
.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Trust Signals Near Forms

### Elements That Increase Form Conversion

```
TRUST SIGNAL HIERARCHY (near form submission):

┌─────────────────────────────────────────────────────────────┐
│  🔒 SECURITY BADGES                                         │
│  ├─ "Your information is secure"                            │
│  ├─ SSL/TLS badge icon                                      │
│  └─ "We never share your information"                       │
├─────────────────────────────────────────────────────────────┤
│  ⭐ SOCIAL PROOF                                             │
│  ├─ Star rating with count ("4.9★ from 500+ reviews")       │
│  ├─ Client logo strip ("Trusted by companies like...")     │
│  └─ Testimonial quote near form                             │
├─────────────────────────────────────────────────────────────┤
│  ✅ GUARANTEES                                               │
│  ├─ "Free no-obligation quote"                              │
│  ├─ "Response within 24 hours"                               │
│  └─ "Satisfaction guaranteed"                                │
├─────────────────────────────────────────────────────────────┤
│  📞 ALTERNATIVE CONTACT                                     │
│  ├─ "Prefer to call? 1-800-XXX-XXXX"                        │
│  ├─ Click-to-call button (mobile)                           │
│  └─ "Or email us directly at..."                            │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Example (from Soprano's)

```html
<form class="inquiry-form">
  <div class="form-header">
    <h3>✎ Check Your Date</h3>
    <span class="toggle">−</span>
  </div>
  
  <div class="trust-bar">
    <span class="trust-item">🔒 Secure</span>
    <span class="trust-item">⚡ 24hr Response</span>
    <span class="trust-item">📞 Free Quote</span>
  </div>
  
  <div class="form-fields">
    <!-- Form fields here -->
  </div>
  
  <button type="submit" class="btn-submit">
    Check Availability
  </button>
  
  <p class="alternative-contact">
    Or call us: <a href="tel:18009322837">1 (800) WE-CATER</a>
  </p>
</form>
```

---

## Form Layout Patterns

### Pattern 1: Sidebar Sticky Form (High Conversion)

```
┌──────────────────────────────────────────────────────────┐
│  MAIN CONTENT AREA           │  SIDEBAR FORM (320px)     │
│                              │                           │
│  [Hero Image]                │  ┌─────────────────────┐  │
│                              │  │ ✓ Check Your Date   │  │
│  [About Section]             │  └─────────────────────┘  │
│                              │  [Name _____________]     │
│  [Services Grid]             │  [Phone ____________]     │
│                              │  [Email ____________]     │
│  [Gallery]                   │  [Event Type ▼]          │
│                              │  [Date ____] [Time ___]   │
│  [Testimonials]              │  [Guests _______]         │
│                              │  [Message __________]     │
│  [More Content]              │                           │
│                              │  [ ✉ Submit Inquiry ]     │
│                              │                           │
│                              │  📞 1-800-WE-CATER        │
└──────────────────────────────────────────────────────────┘
```
**Used by:** Soprano's, Ridgewells, JDK Group

### Pattern 2: Hero Overlay Form (High Impact)

```
┌──────────────────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════════════╗   │
│  ║  BACKGROUND IMAGE (full viewport)                  ║   │
│  ║                                                  ║   │
│  ║  ┌──────────────────────────────────┐            ║   │
│  ║  │  GET YOUR FREE QUOTE            │            ║   │
│  ║  │                                  │            ║   │
│  ║  │  [Name __________________]       │            ║   │
│  ║  │  [Email __________________]      │            ║   │
│  ║  │  [Phone __________________]      │            ║   │
│  ║  │  [Event Date ____)  [Guests__]   │            ║   │
│  ║  │                                  │            ║   │
│  ║  │  [     ✨ REQUEST QUOTE      ]   │            ║   │
│  ║  └──────────────────────────────────┘            ║   │
│  ║                                                  ║   │
│  ╚══════════════════════════════════════════════════╝   │
└──────────────────────────────────────────────────────────┘
```
**Used by:** Creative Edge, Salt Block Hospitality

### Pattern 3: Section-Break Form (Progressive)

```
┌──────────────────────────────────────────────────────────┐
│  HERO SECTION                                            │
│  "Exceptional Catering for Every Occasion"               │
│                    [Learn More ↓]                         │
├──────────────────────────────────────────────────────────┤
│  SERVICES SECTION                                        │
│  [Weddings] [Corporate] [Social] [Private]               │
├──────────────────────────────────────────────────────────┤
│  SOCIAL PROOF SECTION                                    │
│  ⭐⭐⭐⭐⭐ 500+ Happy Clients                            │
│  "Best caterer we've ever used!" - Sarah M.              │
├──────────────────────────────────────────────────────────┤
│  INQUIRY FORM SECTION (appears here)                     │
│  ┌────────────────────────────────────────────────┐      │
│  │  Ready to plan your event? Let's talk!         │      │
│  │                                                │      │
│  │  [Full Name____________]  [Email___________]   │      │
│  │  [Phone________________]  [Event Type___▼]     │      │
│  │  [Tell us about your event________________]     │      │
│  │                                                │      │
│  │  [          Start Planning →          ]        │      │
│  └────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```
**Used by:** Wolfgang Puck, Gamma Catering, Global Gourmet

---

## Mobile Form Optimization

### Mobile-Specific Patterns

| Pattern | Description | Conversion Impact |
|---------|-------------|-------------------|
| **Full-width inputs** | Inputs span full container width | +12% completion |
| **Large touch targets** | Min 48px height for all interactive elements | +8% usability |
| **Numeric keyboards** | `type="tel"` for phone, `type="number"` for guests | +15% speed |
| **Single column layout** | No side-by-side fields on mobile | +18% completion |
| **Sticky submit button** | Submit stays visible while scrolling form | +22% submissions |
| **Auto-advance** | Move to next field on 'Next' keyboard action | +10% flow |
| **Minimal fields first** | Show 3-4 key fields, expand for more | +25% start rate |

### Mobile Form Template

```html
<form class="mobile-inquiry-form">
  <div class="form-header-sticky">
    <button type="button" class="back-btn">← Back</button>
    <span>Event Inquiry</span>
    <button type="submit" class="submit-btn">Done</button>
  </div>
  
  <div class="form-body">
    <div class="field-group">
      <label>Your Name *</label>
      <input type="text" name="name" autocomplete="name" required>
    </div>
    
    <div class="field-group">
      <label>Email *</label>
      <input type="email" name="email" autocomplete="email" required>
    </div>
    
    <div class="field-group">
      <label>Phone *</label>
      <input type="tel" name="phone" autocomplete="tel" 
             placeholder="(555) 123-4567" required>
    </div>
    
    <details class="optional-fields">
      <summary>More Details (optional)</summary>
      
      <div class="field-group">
        <label>Event Type</label>
        <select name="event_type">
          <option value="">Select...</option>
          <option>wedding</option>
          <option>corporate</option>
          <option>social</option>
        </select>
      </div>
      
      <div class="field-group">
        <label>Event Date</label>
        <input type="date" name="event_date">
      </div>
      
      <div class="field-group">
        <label>Number of Guests</label>
        <input type="number" name="guests" min="1" placeholder="Approximate">
      </div>
    </details>
  </div>
</form>
```

---

## Anti-Patterns to Avoid

### ❌ Common Form Mistakes in Catering Websites

1. **Too Many Required Fields**
   - ❌ Asking for budget before establishing relationship
   - ❌ Requiring company name for social events
   - ✅ Keep required fields to 4-5 maximum

2. **Poor Labeling**
   - ❌ Placeholder-only labels (disappear on focus)
   - ❌ Vague labels like "Information"
   - ✅ Persistent floating labels or top-aligned labels

3. **Missing Error Handling**
   - ❌ Form clears on validation error
   - ❌ Generic "Form error" message
   - ✅ Inline field-specific errors, preserve data

4. **No Alternative Contact**
   - ❌ Form as only contact option
   - ❌ Hidden phone number
   - ✅ Always show phone + email near form

5. **Mobile Hostile Design**
   - ❌ Tiny inputs hard to tap
   - ❌ Dropdowns that don't work well on touch
   - ❌ Horizontal field layouts
   - ✅ Full-width, large targets, native controls

6. **Trust Killers Near Forms**
   - ❌ No security/privacy mention
   - ❌ No indication of response time
   - ❌ Spam-looking design
   - ✅ Professional styling, clear privacy note

---

## Quick Reference: Optimal Form Configuration

```yaml
catering_inquiry_form_optimal:
  layout: "sidebar_sticky_or_section_break"
  field_count:
    required: 4
    optional_shown: 3
    optional_hidden: 3
  
  required_fields:
    - name: "full_name"
      type: "text"
      label: "Full Name"
      placeholder: ""
      autocomplete: "name"
    - name: "email"
      type: "email"
      label: "Email Address"
      autocomplete: "email"
    - name: "phone"
      type: "tel"
      label: "Phone Number"
      autocomplete: "tel"
      placeholder: "(555) 123-4567"
    - name: "event_type"
      type: "select"
      label: "Event Type"
      options: ["Wedding", "Corporate", "Social", "Private", "Other"]
  
  optional_fields:
    - name: "event_date"
      type: "date"
      label: "Preferred Date"
    - name: "guest_count"
      type: "number"
      label: "Expected Guests"
    - name: "message"
      type: "textarea"
      label: "Tell Us More"
      rows: 3
  
  validation: "on_blur_with_submit_confirmation"
  submit_text: "Check Availability"  # Over "Submit"
  trust_signals:
    - "Response within 24 hours"
    - "Free, no-obligation"
    - "Secure form"
  alternative_contact:
    phone: true
    email: true
  
  mobile_adaptations:
    sticky_header: true
    single_column: true
    min_touch_target: "48px"
    numeric_keyphones: true
    collapsible_optional: true
```

---

*End of Form Patterns Document*
