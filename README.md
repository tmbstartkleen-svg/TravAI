# TravAI Elite v9.7

TravAI is an offline-first local AI workstation with a web-safe Vercel control surface.

## v9.7 — Autonomous Agent Expansion
- Multi-step task plans with explicit step state.
- Allowlisted local actions only.
- Verification-aware execution.
- Bounded retry/recovery logic.
- Task history and cancellation.
- Consequential actions remain local-approval gated.
- No arbitrary shell execution, unrestricted filesystem access, security-boundary bypass, or silent cloud fallback.

## Architecture
- **Mac-local runtime:** authoritative TravAI server at `127.0.0.1:4783`, local models, workspace, security controls, recovery, and privileged operations.
- **Vercel control surface:** public dashboard only. It does not host Ollama, local files, secrets, privileged Mac operations, or unrestricted shell execution.
- **Bridge model:** remote requests require a scoped authenticated bridge and explicit local approval for consequential mutations.
- **Agent orchestrator:** `local-bridge/task-orchestrator-v970.mjs` tracks multi-step tasks, retries, verification state, and completion locally.

## Safety boundaries
- No arbitrary shell execution from the public web surface.
- No unrestricted filesystem control.
- No silent cloud fallback.
- No automatic security mutation or SIP/TCC/MDM bypass.
- Assessment Integrity remains authoritative in the local runtime.
- Local paths, raw private workspace content, and secrets are not published by the control surface.

## Tests
Run:

```bash
npm test
```

This executes both the secure pairing authority regression test and the v9.7 autonomous task orchestrator test.

## Vercel
`vercel.json` serves `vercel-index.html` as the web-safe production control surface and applies restrictive browser security headers.
