# Interview Anki — modest portfolio improvements

Reviewed 5 September 2026. Source inspection only; no application tests or builds were run. This document does not assert that the project was written at a particular career level or without AI assistance.

## Recommendation
Useful personal learning-tool example; its development age and independent authorship were not established in this review.

## What is present
src/utils/srs.ts implements review timing and state transitions. src/services/storage.ts uses IndexedDB and an in-memory fallback; a separate src/utils/storage.ts also exists. package.json has build/typecheck-like scripts but no general test script.

## Small improvement plan
1. Add deterministic tests for review ratings, new/relearning/review transitions, minimum ease and due timestamps using the existing injectable time argument.
2. Inspect both storage modules and their callers before merging anything. Make failed persistence visible so users know when progress exists only in memory. Test reload persistence and corrupted stored values.
3. Write a short README with one study-session demo and the real storage limits. Replace the generic package name if safe; remove unused dependencies only after checking runtime imports.

## Stop when
One study session can be demonstrated, its progress survives reload, and scheduler rules have focused tests. Keep the existing UI scope.

## Resume evidence
**Current candidate wording (confirm your personal ownership before use):** Built a React interview-study tool with review scheduling and IndexedDB-backed progress storage.

**Future wording — not yet an achievement:** Added deterministic scheduler tests and clearer persistence failure handling. Use only after the work is complete.

## Working limits
Make the smallest useful improvement. Preserve working behavior and existing user changes. Avoid a redesign, wholesale framework upgrade or extra architecture. Verify actual scripts and dependencies before running commands. Use local/isolated fixtures, not real accounts or shared production data. Do not commit, push, deploy, publish or change the resume without a separate request.

## README checklist
Include purpose, real features, setup, one usage example, verified test commands, known limits and what you personally learned. Add screenshots/demo links only after checking them. Do not claim production scale, performance gains, users or comprehensive tests without evidence.
