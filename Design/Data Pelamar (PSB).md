# Data Pelamar (PSB)

## Mission
Create implementation-ready, token-driven UI guidance for Data Pelamar (PSB) that is optimized for consistency, accessibility, and fast delivery across dashboard web app.

## Brand
- Product/brand: Data Pelamar (PSB)
- URL: https://garda.katalangit.com/psb/admin
- Audience: authenticated users and operators
- Product surface: dashboard web app

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=ui-sans-serif`, `font.family.stack=ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji`, `font.size.base=14px`, `font.weight.base=400`, `font.lineHeight.base=20px`
- Typography scale: `font.size.xs=9px`, `font.size.sm=10px`, `font.size.md=12px`, `font.size.lg=14px`, `font.size.xl=16px`, `font.size.2xl=18px`, `font.size.3xl=30px`, `font.size.4xl=36px`
- Color palette: `color.text.primary=#475569`, `color.text.secondary=#9ca3af`, `color.text.tertiary=#94a3b8`, `color.text.inverse=#64748b`, `color.surface.base=#000000`, `color.surface.muted=#ffffff`, `color.surface.raised=#030712`, `color.surface.strong=#111827`, `color.border.default=#e5e7eb`, `color.border.muted=#e2e8f0`
- Spacing scale: `space.1=4px`, `space.2=8px`, `space.3=10px`, `space.4=12px`, `space.5=16px`, `space.6=20px`, `space.7=24px`, `space.8=44px`
- Radius/shadow/motion tokens: `radius.xs=8px`, `radius.sm=12px` | `shadow.1=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`, `shadow.2=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px`, `shadow.3=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(15, 23, 42, 0.2) 0px 20px 25px -5px, rgba(15, 23, 42, 0.2) 0px 8px 10px -6px`, `shadow.4=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px` | `motion.duration.instant=150ms`, `motion.duration.fast=200ms`, `motion.duration.normal=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (48), buttons (2), inputs (2), navigation (1), tables (1).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
