# TravAI Elite v9.5.4

TravAI is an offline-first local AI workstation with a web-safe Vercel control surface.

## Architecture
- **Mac-local runtime:** authoritative TravAI server at `127.0.0.1:4783`, local models, workspace, security/IDS/firewall controls, recovery, and privileged operations.
- **Vercel control surface:** public dashboard only. It does not host Ollama, local files, secrets, privileged Mac operations, or unrestricted shell execution.
- **Bridge model:** future remote actions require a scoped authenticated bridge and explicit local approval for consequential mutations.

## Safety boundaries
- No arbitrary shell execution from the public web surface.
- No silent cloud fallback.
- No automatic security mutations.
- Assessment Integrity remains authoritative in the local runtime.
- Local paths, raw private workspace content, and secrets are not published by the control surface.

## Local runtime
The certified local source baseline is TravAI Elite v9.5.4 (`9540000000.0.0`). Run the local package with `npm start` and open `http://127.0.0.1:4783/`.

## Vercel
`vercel.json` serves `vercel-index.html` as the web-safe production control surface and applies restrictive browser security headers.

The Vercel repository intentionally contains the public control surface rather than exposing the full private Mac runtime.