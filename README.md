# TravAI Elite v9.7.1

TravAI is an offline-first local AI workstation with a web-safe Vercel control surface.

## v9.7.1 — Local Action Executor
v9.7.1 connects the v9.7 task orchestrator to a bounded macOS action executor.

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
