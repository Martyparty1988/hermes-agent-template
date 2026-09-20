# Hermes Control — Vercel

Frontend control panel for the Railway-hosted Hermes runtime.

## Required Vercel environment variables

- `HERMES_API_KEY` — same secret as Railway `API_SERVER_KEY`
- `CONTROL_PASSWORD` — password used to unlock the control UI

`HERMES_API_BASE` is optional and defaults to:
`https://hermes-runtime-production-c91c.up.railway.app`

## Architecture

Browser -> Vercel /api/chat -> Railway Hermes /v1/chat/completions

The Hermes API key stays server-side on Vercel and is never returned to the browser.
