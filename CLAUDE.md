# CLAUDE.md

## Scope Rules
- Only make changes directly requested by the user.
- Do NOT add features, refactor code, or make "improvements" beyond what was asked.
- If you discover a related issue while working, mention it but do NOT fix it unless asked.
- When asked to implement something specific (e.g., "add list virtualization"), do exactly that — don't also add memoization, caching, or other optimizations.

## Performance Backlog (approved future work)
These are known issues. Only work on them when explicitly asked:
- [ ] Add useMemo/useCallback for sort-in-render patterns in results/page.tsx
- [ ] Add localStorage caching abstraction to replace scattered getItem calls
- [ ] Add list virtualization for match lists (react-virtual or similar)
- [ ] Add loading="lazy" to <img> tags in account/page.tsx
- [ ] Add Suspense boundaries with skeleton placeholders for dynamic imports
