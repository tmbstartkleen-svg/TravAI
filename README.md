# TravAI Elite v9.7.2

TravAI is an offline-first local AI workstation with a web-safe Vercel control surface.

## v9.7.2 — Live Task Control Center
v9.7.2 adds a live dashboard layer on top of the bounded macOS action executor and local approval queue.

Supported action types:
- Read local health and readiness.
- Open or quit a named Mac application.
- Open approved System Settings panes.
- Set output volume or mute state.
- Open a Finder path limited to the current user's home directory.
- Run a named Apple Shortcut.

The executor uses Node `execFile` with fixed Apple binaries and argument arrays. It never constructs a general shell command. Mutating actions require local approval unless the task explicitly classifies a step as non-consequential.

## Agent execution
- `local-bridge/task-orchestrator-v970.mjs` — plans, state, retries, cancellation.
- `local-bridge/mac-action-executor-v971.mjs` — validated macOS actions.
- `local-bridge/task-runner-v971.mjs` — runs one approved task step and records verification/results.

## Safety boundaries
- No arbitrary shell execution.
- No arbitrary command binary selection.
- Finder path operations are constrained to the user's home directory.
- System Settings panes use an allowlist.
- No SIP, TCC, MDM, admin-authentication, or other Apple security bypass.
- No silent cloud fallback.
- Consequential actions remain subject to local approval.

## Tests
Run:

```bash
npm test
```

This runs pairing-authority, task-orchestrator, and Mac-action-executor regression tests.

## Vercel
The Vercel surface remains a control/request interface. Actual Mac actions execute only in the local TravAI runtime on macOS.


## Live Task Control Center
- `task-control-client-v972.js` polls the local task and approval endpoints.
- The dashboard renders task status, step status, retries/errors, cancellation, and pending approvals.
- Approve/Deny controls are request controls only; the browser does not execute Mac actions.
- If the local v9.7.2 API is unavailable, the dashboard reports that state instead of reporting false success.
- Approval state remains bounded and local through `local-bridge/approval-queue-v972.mjs`.
