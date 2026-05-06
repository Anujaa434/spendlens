# DevLog — SpendLens

## Day 1 — 2026-05-06
**Hours worked:** 3

**What I did:** Set up Next.js project with TypeScript, Tailwind CSS, and shadcn/ui. Created GitHub repo and pushed first commit. Built the spend input form with tool selector (Cursor, Copilot, Claude, ChatGPT, Gemini, Windsurf), plan dropdown, seats, monthly spend input, team size, and use case. Added localStorage persistence so form survives page reloads.

**What I learned:** shadcn/ui v4 has a new preset-based initialization flow — different from the docs I'd seen before. Tailwind v4 no longer uses tailwind.config.js by default, configuration is handled differently.

**Blockers / what I'm stuck on:** Need to apply for Anthropic API free credits. Also need to finalize audit engine rules — specifically how to handle edge cases like 1-seat Team plans.

**Plan for tomorrow:** Build the audit engine — TypeScript logic that takes the form data and outputs per-tool recommendations with savings calculations. No UI yet, just the pure logic. Also start reaching out for user interviews.