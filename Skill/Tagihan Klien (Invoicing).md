---
name: design-system-tagihan-klien-invoicing
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Tagihan Klien (Invoicing)

## Mission
Deliver implementation-ready design-system guidance for Tagihan Klien (Invoicing) that can be applied consistently across dashboard web app interfaces.

## Brand
- Product/brand: Tagihan Klien (Invoicing)
- URL: https://garda.katalangit.com/finance/invoices
- Audience: authenticated users and operators
- Product surface: dashboard web app

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=ui-sans-serif`, `font.family.stack=ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji`, `font.size.base=14px`, `font.weight.base=700`, `font.lineHeight.base=20px`
- Typography scale: `font.size.xs=9px`, `font.size.sm=10px`, `font.size.md=12px`, `font.size.lg=14px`, `font.size.xl=16px`, `font.size.2xl=30px`
- Color palette: `color.text.primary=#9ca3af`, `color.text.secondary=#64748b`, `color.text.tertiary=#f3f4f6`, `color.text.inverse=#475569`, `color.surface.base=#000000`, `color.surface.muted=#030712`, `color.surface.raised=#111827`, `color.surface.strong=#0f172a`, `color.border.default=#e5e7eb`, `color.border.muted=#1f2937`
- Spacing scale: `space.1=4px`, `space.2=6px`, `space.3=8px`, `space.4=10px`, `space.5=12px`, `space.6=16px`, `space.7=24px`
- Radius/shadow/motion tokens: `radius.xs=8px`, `radius.sm=12px` | `shadow.1=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`, `shadow.2=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px`, `shadow.3=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px`, `shadow.4=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px` | `motion.duration.instant=150ms`, `motion.duration.fast=200ms`, `motion.duration.normal=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
