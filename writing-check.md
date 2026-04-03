---
created: 2026-02-17
updated: 2026-04-03
model: gpt-5.4
version: 1.1
---

## Personal site copy checklist

A short rubric for reviewing important sections on a personal site: home intro, about / “what I’m doing now,” and project or case-study pages. It targets **specificity and verifiability**, not a house style. Skip it for microcopy (buttons, captions).

Useful chunk size: **about 100–600 words**.

---

## When to use it

Apply to copy that carries most of the narrative load. Ignore one-line UI strings.

---

## Output format

For each section, produce:

1. **Signal strength**: Low | Medium | High  
   - **Low** — Grounded; easy to defend in conversation  
   - **Medium** — Mostly clear; may invite follow-up questions  
   - **High** — Vague or generic; reads like filler to a careful reader  

2. **Why**: 2–4 brief notes on what weakens the text  
3. **Missing proof**: What detail, link, or evidence would help  
4. **Patch set**: 3–7 small edits (not a full rewrite)  
5. **Interview test**: Two questions this paragraph should answer cleanly  

If signal strength is **Low** and there are no structural problems:

> `No revision required.`

---

## Core questions (in order)

### 1. What did you actually do?

After the first 2–3 sentences, a reader should be able to state what was built, changed, or shipped—concretely.

Look for:
- An app, tool, or workflow  
- A model, analysis, or experiment  
- A migration, integration, or deployment  

If the opening is mostly adjectives, add one identifiable artifact.

---

### 2. Could this belong to anyone?

Replacement test:
- Swap the domain (e.g., climate ↔ fintech).  
- Imagine a different name on the byline.

If the paragraph still reads fine, it is probably too generic.

Improve by naming stack, domain, or a constraint that is specific to this work.

---

### 3. How would someone verify this in a few minutes?

Ask what a skeptical but fair reader would look for:
- Repo, demo, or live link  
- Before/after numbers (approximate is fine)  
- A concrete limitation you worked within  

If a claim cannot be lightly supported, soften it or add minimal proof.

---

### 4. What was hard?

Include at least one real constraint or tradeoff: time, data, budget, compute, access, or a deliberate choice (A over B).

Examples:
- “Ran on a single low-memory VPS”  
- “Optimized for readability over raw speed”  
- “Chose simpler deployment over maximum flexibility”  

If nothing felt constrained, the piece may read as abstract rather than practiced.

---

### 5. Who would notice if it broke?

Name at least one audience with a stake:
- Collaborators or users  
- A team, community, or cohort  

Stakes can be small (“our Discord would notice”) or larger (“wrong numbers could mislead users”). Naming them grounds the work.

---

## Patch set (for suggested edits)

Prefer small, targeted changes:

1. Replace one abstract phrase with a named artifact.  
2. Add a short phrase that states a constraint.  
3. Add a clause that states a tradeoff explicitly.  
4. Add one sentence about who used or relied on the work.  
5. Remove one inflated or vague phrase.  
6. Tighten symmetrical lists into one clear focus (“mostly X, not Y”).  
7. Replace an abstract noun with the mechanism (what actually happened).

Examples:
- “clarity” → “a short doc on how to rerun the analysis”  
- “resilience” → “alerts to a group chat when jobs failed”  
- “optimization” → “cut cloud cost ~40% by batching jobs overnight”  

---

## Short prompt (for tools or AI)

> “Apply the personal site copy checklist. Output exactly five sections (signal strength, why, missing proof, patch set, interview test). Start by identifying what was actually built or shipped. Do not rewrite the whole section; suggest only small, targeted edits.”
