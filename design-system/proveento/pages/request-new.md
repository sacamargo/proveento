# Request New Page Overrides

> **PROJECT:** Proveento
> **Generated:** 2026-08-23 00:55:19
> **Page Type:** General

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1400px or full-width
- **Grid:** 12-column grid for data flexibility
- **Sections:** Hero > Step 1 (problem) > Step 2 (solution) > Step 3 (action) > CTA progression

### Spacing Overrides

- **Content Density:** High — optimize for information display

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- **Strategy:** Step colors: 1 (Red/Problem), 2 (Orange/Process), 3 (Green/Solution). CTA: Brand color

### Component Overrides

- Avoid: No indication of progress
- Avoid: Expect z-index to work across contexts
- Avoid: No feedback after submit

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: Smooth scroll, reveal on scroll, parallax images, text animations, page-flip transitions
- Feedback: Step indicators or progress bar
- Layout: Understand what creates new stacking context
- Forms: Show loading then success/error state
- CTA Placement: Each step: mini-CTA. Final: main CTA
