---
created: 2026-02-17
updated: 2026-04-03
model: gpt-5.4
version: 1.0
---

## Personal Website Writing Check (Friend Mode)

This is a lightweight check for your personal site copy.  
It’s designed for **you and your friends**, not for a corporate content team.

Use it when you want your site to:
- **Sound like you**
- **Show real things you’ve built**
- **Make it easy for visitors to see why your work matters**

This is a **signal check**, not a style police.  
If something here doesn’t fit your vibe, ignore it.

---

## When to Use This

Run this on sections that carry real weight:
- Home page intro
- About / “What I’m doing now”
- Project and case study sections

Skip tiny bits of copy (button labels, one-line captions, etc.).

Good length for this check: **100–600 words**.

---

## What You Get Back

For each section you run through this check, you’ll get:

1. **Signal Strength**: Low | Medium | High  
   - **Low** → Feels grounded and easy to defend in conversation  
   - **Medium** → Mostly good, but invites follow-up questions  
   - **High** → Likely to feel vague or “AI-ish” to a careful reader

2. **Why**: 2–4 short notes on what’s getting in the way  
3. **Missing Proof**: what evidence, link, or detail would help  
4. **Patch Set**: 3–7 small, surgical edits (not a full rewrite)  
5. **Interview Test**: 2 questions this paragraph should comfortably survive

If Signal Strength = Low and there are no structural issues, the answer is:

> `No revision required.`

---

## Core Questions

Run these in order.

### 1. “What did you actually do?”

After reading the first 2–3 sentences, a friend should be able to answer:

> “Grant built / changed / shipped **what**, exactly?”

Look for concrete things:
- An app, tool, or workflow
- A model, analysis, or experiment
- A migration, integration, or deployment

If the first paragraph is mostly adjectives and vibes, add one clear artifact.

---

### 2. “Could this belong to anyone?”

Do a quick replacement test:
- Swap the domain (e.g., climate ↔ fintech, geospatial ↔ SaaS).
- Imagine a different person’s name at the top.

If the paragraph still works almost unchanged, it’s probably too generic.

Helpful fixes:
- Name the specific stack, tool, domain, or constraint you dealt with.
- Mention one detail that would never appear in a template.

---

### 3. “How would we check this in 5 minutes?”

Imagine a skeptical but fair friend asking:

> “If I wanted to see this in the real world, where would I look?”

Examples of easy-to-check proof:
- Link to a repo, demo, or live app
- Before/after numbers (even rough)
- A concrete limitation you had to work within

If a claim can’t be explained or lightly backed up, soften it or add a tiny bit of proof.

---

### 4. “What was hard about this?”

Add at least one real constraint or tradeoff:
- Time, data, budget, compute, or access
- You picked A instead of B for a reason

Examples:
- “Ran everything on a single low-memory VPS”
- “Optimized for readability over raw speed”
- “Traded flexibility for a simpler deployment”

If nothing in the paragraph felt hard, the project may read as more academic than lived.

---

### 5. “Who would have noticed if it broke?”

Name at least one person or group who would care:
- A specific friend, collaborator, or user group
- A team, community, or cohort

Concrete stakes might be small (“people in our Discord would be annoyed”) or big (“households could get the wrong cost estimate”), but naming them helps the work feel real.

---

## Patch Set Suggestions

When generating edits, keep them **small and targeted**. Prefer:

1. Replace one abstract phrase with a named artifact.  
2. Add one short phrase naming a constraint (time, data, compute, etc.).  
3. Add one clause that makes a tradeoff explicit.  
4. Add one short sentence about who actually used or saw this.  
5. Remove one inflated or vague phrase.  
6. Collapse symmetrical lists into a clear focus (“I mostly do X, not Y”).  
7. Turn one abstract noun into a mechanism (what you actually did).

Examples:
- “clarity” → “a short doc that explains how to rerun the analysis”  
- “resilience” → “alerts that pinged our group chat when jobs failed”  
- “optimization” → “cut cloud costs by ~40% by batching jobs overnight”

---

## Simple Prompt (for Tools or AI)

> “Run the Personal Website Writing Check (Friend Mode). Output exactly five fields. Start by asking what I actually built. Do not rewrite the whole section. Suggest only small, targeted edits.”

