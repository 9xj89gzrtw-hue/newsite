# Accessibility Statement Template
## For Catering & Event Services Websites

**Last Updated:** [DATE]  
**Effective Date:** [DATE]  
**Website:** [www.company.com]

---

## Our Commitment to Accessibility

**[Company Name]** is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

### Our Vision

We believe that everyone deserves equal access to information about our catering services. Whether you're planning a wedding, corporate event, or social gathering, our website should be usable by all potential clients regardless of ability.

---

## 1. Conformance Status

### 1.1 Current Compliance Level

The **[Company Name]** website strives to conform to:

| Standard | Version | Target Level | Current Status |
|----------|---------|--------------|----------------|
| **Web Content Accessibility Guidelines (WCAG)** | 2.1 | Level AA | **Partially Conformant** |
| **Section 508** | Revised | - | **Substantially Compliant** |
| **EN 301 549** | V3.2.1 | - | **Partially Conformant** |

**Partially conformant** means that some parts of the content do not fully meet accessibility standards.

### 1.2 Scope of This Statement

This accessibility statement applies to:
- **Primary domain:** [www.company.com]
- **Subdomains:** [menu.company.com, quotes.company.com]
- **Mobile version:** [m.company.com or responsive site]
- **Content types:**
  - All public-facing web pages
  - Online quote request forms
  - Menu galleries and image content
  - Blog posts and articles
  - PDF downloads (menus, contracts)

---

## 2. Accessible Features

### 2.1 Navigation & Structure

✅ **Implemented Features:**

- **Semantic HTML** - Proper heading structure (h1 → h6 hierarchy)
- **Skip Navigation Links** - "Skip to main content" link at page top
- **Consistent Navigation** - Menu structure consistent across pages
- **Breadcrumb Trails** - Clear path indication on inner pages
- **Descriptive Page Titles** - Unique, meaningful titles per page
- **Logical Tab Order** - Sensible navigation via keyboard

### 2.2 Content Presentation

✅ **Text & Reading:**
- Minimum text contrast ratio of 4.5:1 (normal text) and 3:1 (large text)
- Resizable text up to 200% without loss of functionality
- Line height minimum 1.5 for body text
- Paragraph spacing for readability
- No justified text alignment (affects dyslexic readers)

✅ **Images & Media:**
- Meaningful alternative text (alt text) for all informative images
- Decorative images marked as presentational (empty alt)
- Captions for video content (where available)
- Transcripts available for audio content

✅ **Forms & Input:**
- Labels associated with all form fields
- Error messages clearly identified and descriptive
- Required fields indicated
- Instructions provided where complex input needed
- Sufficient time to complete forms (no unexpected timeouts)

### 2.3 Interactive Elements

✅ **Links & Buttons:**
- Descriptive link text (not "click here")
- Visible focus indicators on interactive elements
- Adequate click/touch target sizes (minimum 44x44 CSS pixels)
- No reliance on color alone to convey meaning

✅ **Keyboard Navigation:**
- All functionality accessible via keyboard
- No keyboard traps
- Visible focus states
- Logical focus order

---

## 3. Known Limitations

We are aware of the following accessibility limitations and are working to address them:

### 3.1 Currently Being Addressed

| Issue | Impact | Planned Fix Date |
|-------|--------|------------------|
| Some legacy PDF menus without proper tagging | Screen reader users may have difficulty | [Q1 202X] |
| Third-party booking widget not fully keyboard accessible | Keyboard-only users | Working with vendor ([Vendor Name]) |
| Some image carousels missing ARIA labels | Screen reader confusion | [Q2 202X] |
| Color contrast issues in certain design elements | Low vision users | [Q1 202X] |

### 3.2 Third-Party Content

Some content is hosted or controlled by third parties:

| Third Party | Content | Their Accessibility |
|-------------|---------|---------------------|
| **Google Maps** | Location/maps | Partially accessible |
| **YouTube/Vimeo** | Video content | Varies by video |
| **Social media embeds** | Instagram feed, etc. | Platform dependent |
| **Booking system** | Online reservations | See their statement |

*For third-party content, we select accessible options where possible but cannot control their full compliance.*

### 3.3 Assistive Technology Compatibility

Our site tested with:
- **Screen Readers:** JAWS, NVDA, VoiceOver (Mac/iOS), TalkBack (Android)
- **Browsers:** Chrome, Firefox, Safari, Edge (current + previous version)
- **Devices:** Desktop, tablet, mobile (iOS, Android)

---

## 4. Formal Complaints & Feedback

### 4.1 We Want to Hear From You

Your feedback helps us improve. Please report accessibility barriers:

**Contact Options:**

| Method | Details |
|--------|---------|
| **Email** | [accessibility@company.com] |
| **Phone** | [PHONE] (relay service welcome) |
| **Mail** | [Company Name, ATTN: Accessibility, Address] |
| **Online Form** | [Link to feedback form] |

### 4.2 What to Include in Your Report

To help us address your concern efficiently, please share:
- The page URL where you encountered the issue
- Description of the problem
- The assistive technology you're using (if applicable)
- What you expected to happen vs. what actually happened
- Your contact info if you'd like a response

### 4.3 Response Timeline

- **Acknowledgment:** Within [2] business days
- **Initial Response:** Within [5] business days
- **Resolution/Action Plan:** Within [15] business days
- **Follow-up:** As needed until resolved

### 4.4 Escalation Process

If unsatisfied with our response:

1. **Internal Review:** Request review by [Title/Role]
2. **External Filing:**
   - **USA:** Department of Justice Civil Rights Division
   - **UK:** Equality Advisory Support Service (EASS)
   - **Canada:** Canadian Human Rights Commission
   - **Other:** Contact your local disability rights organization

---

## 5. Alternative Access Options

If you cannot access information through our website, we're happy to provide it in alternate formats:

### 5.1 Available Formats

| Format | Available For | Request Method |
|--------|---------------|----------------|
| **Large Print (16pt+)** | Menus, contracts, policies | Email or phone |
| **Audio Recording** | Key pages, menu descriptions | Email request |
| **Plain Language** | Contracts, policies | Email or phone |
| **Braille** | Menus (limited) | Phone request |
| **Electronic Documents** | Accessible PDFs, Word docs | Email request |
| **In-Person Assistance** | Quote consultations, menu reviews | Schedule appointment |

### 5.2 How to Request Alternate Formats

```
┌─────────────────────────────────────────────────────┐
│        REQUEST ALTERNATE FORMAT                     │
├─────────────────────────────────────────────────────┤
│ Call: [PHONE NUMBER]                                │
│ Email: [accessibility@company.com]                  │
│ Subject: "Accessibility Request"                    │
│                                                     │
│ Include:                                            │
│ • What information you need                         │
│ • Preferred format                                  │
│ • Contact information                               │
│ • Timeframe (if urgent)                             │
└─────────────────────────────────────────────────────┘
```

**Response time for format requests:** [3-5] business days

---

## 6. Technical Specifications

### 6.1 Accessibility Technologies Used

| Technology | Purpose |
|------------|---------|
| **ARIA landmarks** | Page region identification |
| **ARIA labels** | Interactive element description |
| **ARIA live regions** | Dynamic content announcements |
| **Semantic HTML5** | Native element meaning |
| **CSS flexbox/grid** | Flexible layouts |
| **Media queries** | Responsive design |
| **Focus management** | Keyboard navigation support |

### 6.2 Testing Approach

Our accessibility testing includes:
- Automated testing using [axe-core, WAVE, Lighthouse]
- Manual keyboard-only testing
- Screen reader testing (multiple readers)
- User testing with people with disabilities (when possible)
- Code review against WCAG criteria

### 6.3 Testing Frequency

- **New content/pages:** Tested before publication
- **Existing pages:** Audited quarterly
- **Full site audit:** Annually minimum
- **After major updates:** Re-tested within [30] days

---

## 7. Training & Awareness

### 7.1 Staff Training

Our team receives training on:
- Digital accessibility fundamentals
- Creating accessible documents (Word, PDF)
- Writing accessible web content
- Assisting customers with disabilities
- Using accessibility features of our tools

### 7.2 Development Standards

Our developers follow:
- WCAG 2.1 AA success criteria
- Accessible coding guidelines
- Accessibility code review checklist
- Accessibility requirements in acceptance criteria

---

## 8. Ongoing Improvement Plan

### 8.1 Short-Term Goals (Next 6 Months)

- [ ] Remediate known PDF accessibility issues
- [ ] Improve video caption coverage
- [ ] Enhance form error messaging
- [ ] Conduct user testing session
- [ ] Train content team on alt text best practices

### 8.2 Medium-Term Goals (6-12 Months)

- [ ] Achieve full WCAG 2.1 AA compliance
- [ ] Implement accessibility monitoring dashboard
- [ ] Create accessible template library
- [ ] Establish accessibility review workflow
- [ ] Publish accessibility style guide

### 8.3 Long-Term Goals (12+ Months)

- [ ] Exceed WCAG standards where beneficial
- [ ] Implement AI-powered accessibility tools
- [ ] Regular usability testing with disabled users
- [ ] Industry leadership in catering industry accessibility

---

## 9. Regulatory References

### 9.1 Applicable Laws & Standards

Depending on our operating locations, we consider:

| Jurisdiction | Law/Standard | Requirements |
|--------------|--------------|--------------|
| **USA** | Americans with Disabilities Act (ADA) | Public accommodation access |
| **USA** | Section 508 | Federal contractor requirements |
| **EU** | European Accessibility Act (EAA) | Product/service accessibility |
| **UK** | Equality Act 2010 | Reasonable adjustments |
| **Canada** | AODA (Ontario) | Accessible digital content |
| **Australia** | DDA / Disability Discrimination Act | Unlawful discrimination |
| **International** | WCAG 2.1 | Technical standard |

### 9.2 Voluntary Commitments

Beyond legal requirements, we commit to:
- Universal Design principles
- Inclusive user experience
- Proactive barrier removal
- Community engagement

---

## 10. Statement History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Original Date] | Initial publication |
| 1.1 | [Date] | Added third-party content section |
| 1.2 | [Date] | Updated testing procedures |
| 1.3 | [Current Date] | Comprehensive revision |

---

## 11. Approval & Authority

This accessibility statement has been approved by:

**[Name]**  
[Title]  
[Company Name]

**Date:** [Date]

**Review Schedule:** This statement is reviewed and updated at least annually, or when significant changes occur.

---

## Contact Us

### Accessibility Coordinator

**[Name]**  
**Title:** [Accessibility Coordinator / Web Manager]  
**Email:** [accessibility@company.com]  
**Phone:** [PHONE]  
**Relay Service:** [711 (US) or local equivalent]

### General Inquiries

**[Company Name]**  
[Address]  
[City, State ZIP]  
**Website:** [www.company.com]  
**Main Phone:** [PHONE]  
**Email:** [info@company.com]

---

## Appendix A: WCAG 2.1 Quick Reference

### Level A (Minimum)

- Non-text content has text alternative
- Captions provided for prerecorded audio
- Audio descriptions or transcript for video
- Information not conveyed by color alone
- Text can be resized to 200%
- Keyboard accessible
- No seizures-causing content
- Page titles descriptive
- Link purpose clear from link text or context

### Level AA (Recommended Target)

- Contrast ratio 4.5:1 (text), 3:1 (large text)
- Text can be resized to 200% without scrolling horizontally
- Multiple ways to find pages
- Consistent navigation
- Consistent identification
- Error suggestions provided
- Labels or instructions provided

### Level AAA (Enhanced)

- Contrast ratio 7:1
- No background audio
- Interrupt controls for moving content
- Log-in exceptions don't apply

---

## Appendix B: Assistive Technology Compatibility Matrix

| Browser + Screen Reader | Status | Notes |
|-------------------------|--------|-------|
| Chrome + NVDA | ✅ Supported | Primary test combination |
| Chrome + JAWS | ✅ Supported | |
| Firefox + NVDA | ✅ Supported | |
| Safari + VoiceOver (Mac) | ✅ Supported | |
| Safari + VoiceOver (iOS) | ⚠️ Mostly supported | Some carousel issues |
| Edge + Narrator | ✅ Supported | |

---

*This accessibility statement demonstrates good faith effort toward compliance. We continuously work to improve and welcome feedback from all users.*

**Last Reviewed:** [DATE]  
**Next Scheduled Review:** [DATE + 1 YEAR]
