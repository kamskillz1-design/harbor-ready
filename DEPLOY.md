# Harbor — deploy off Base44 (Vercel + Supabase)

## Env (Vercel + local `.env.local`)

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Do not put the service role key in Vite.

## Supabase

1. Run `supabase/schema.sql` **once** in the SQL Editor.
2. If you must re-run: reset the project or drop tables first. `CREATE TABLE IF NOT EXISTS` is safe; policies/triggers use drop-if-exists.
3. Auth URL config: production Vercel URL + `http://localhost:5173`.
4. Enable Email and Google (same providers as Base44).
5. OAuth callback: `https://<project>.supabase.co/auth/v1/callback`.
6. Confirm the `profiles` trigger on first signup.
7. Realtime: not required (no entity subscriptions).
8. Storage: **not required**. This app has no user uploads. If you add them later, create a public bucket named `harbor-media` and apply the commented policies in `schema.sql`.
9. Optional: deploy `supabase/functions/companion-reply` and wire it in `companionService.js` if you restore a hosted LLM. The live app uses a client reply shim.

## Vercel

1. Import the GitHub repo.
2. Framework: Vite. Build: `npm run build`. Output: `dist`.
3. Set the two `VITE_` env vars and **redeploy** (Vite inlines env at build time).
4. `vercel.json` rewrites SPA routes to `index.html`.
5. Add the production domain to the Supabase Auth allow-list.

## CODE

- [ ] No `@base44` packages
- [ ] No `base44Client` / `base44.entities` / `base44.auth` / `media.base44`
- [ ] One `supabaseClient`
- [ ] Façades exist for every table the UI calls
- [ ] AuthContext shape unchanged
- [ ] Uploads: none (bucket only if you add them)
- [ ] schema.sql matches façades
- [ ] vercel.json SPA rewrites
- [ ] `.env.example` only; no secrets in git
- [ ] Lockfile does not pin Base44
- [ ] MCP consent page is unused (not in the router)
- [ ] One i18n system (`src/i18n`); no GTranslate

## GITHUB

- [ ] Source only, no `node_modules`
- [ ] `package.json`, `index.html`, `src/`, `supabase/schema.sql`, `vercel.json`

## SMOKE

- [ ] Register / login / logout / refresh stays logged in
- [ ] Password reset returns to the Vercel URL
- [ ] Google OAuth if enabled
- [ ] Today / journal / toolkit / plan / companion / insights load
- [ ] Create / edit / delete a journal entry
- [ ] Check-in saves once per local date
- [ ] Deep links do not 404
- [ ] Language switcher (es / eu / en) stays in sync with Settings
