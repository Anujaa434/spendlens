# DevLog — SpendLens

## Day 1 — 2026-05-06
**Hours worked:** 2

**What I did:** Set up Next.js project with TypeScript, Tailwind CSS, and shadcn/ui. Created GitHub repo and pushed first commit. Built the spend input form with tool selector (Cursor, Copilot, Claude, ChatGPT, Gemini, Windsurf), plan dropdown, seats, monthly spend input, team size, and use case. Added localStorage persistence so form survives page reloads.

**What I learned:** shadcn/ui v4 has a new preset-based initialization flow — different from the docs I'd seen before. Tailwind v4 no longer uses tailwind.config.js by default, configuration is handled differently.

**Blockers / what I'm stuck on:** Need to apply for Anthropic API free credits. Also need to finalize audit engine rules — specifically how to handle edge cases like 1-seat Team plans.

**Plan for tomorrow:** Build the audit engine — TypeScript logic that takes the form data and outputs per-tool recommendations with savings calculations. No UI yet, just the pure logic. Also start reaching out for user interviews.

## Day 2 — 2026-05-07
**Hours worked:** 2

**What I did:** Built the audit engine — pure TypeScript logic that takes form input and outputs per-tool savings recommendations with defensible reasoning.

**What I learned:** How to structure pure TypeScript business logic separately from UI components. Keeping audit engine in lib/ makes it independently testable.

**Blockers / what I'm stuck on:** Hero savings shows $0 when monthly spend input is left blank — need to remind users to fill in their actual spend. Will add placeholder text tomorrow.

**Plan for tomorrow:** Build the results page UI — wire the audit engine output to a visual breakdown with per-tool cards and hero savings number.


## Day 3 — 2026-05-08
**Hours worked:** 0

**What I did:** Took a rest day to recharge.

**What I learned:** N/A

**Blockers / what I'm stuck on:** N/A

**Plan for tomorrow:** Set up Supabase, build lead capture form, implement shareable audit URLs. Also set up Anthropic API key and Resend account.