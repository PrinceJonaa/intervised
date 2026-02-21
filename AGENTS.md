# Repository Guardrails

## Git Safety
- After creating a commit on `main`, always run `git push origin main` in the same turn.
- After pushing, verify sync with `git status -sb` and confirm `main...origin/main` has no `ahead` count.
- Never run `git reset` (especially to `origin/main`) unless the user explicitly asks for it.

## Deployment Reliability
- If deployment visibility is in question, verify the latest commit SHA on both local `HEAD` and `origin/main`.
- For Vercel-connected pushes, check commit status and report whether deployment is `pending`, `success`, or `failure`.
