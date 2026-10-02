# TravAI Elite v9.8.0

TravAI is an offline-first local AI workstation with a web-safe Vercel control surface.

## v9.8.0 — Permissions & Policy Hardening
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


## v9.7.4 runtime integration
- `local-bridge/runtime-mount-v974.mjs` plugs task routes into the existing local `127.0.0.1:4783` runtime.
- It does not open another listener or port.
- Requests reuse the existing short-lived `command:request` session scope.
- Approved task steps consume one scoped approval before the local action runner proceeds.
- The dashboard now uses the `/api/v974/...` task routes and refreshes the resulting task state.
- Existing macOS permission checks and local security boundaries remain authoritative.


## v9.7.5 runtime supervisor
- `local-bridge/runtime-supervisor-v975.mjs` wraps the existing local request handler during startup.
- `autoMountRuntime(runtime)` replaces only the in-process handler reference; it does not open a new port.
- Transient handler failures trigger bounded recovery/remount state.
- The supervisor exposes local status including mount time, last success/failure, and consecutive failures.
- Recovery never grants approvals, changes macOS permissions, or bypasses SIP/TCC/MDM.
- After repeated failures, the supervisor reports a degraded state instead of looping indefinitely.


## v9.7.6 persistence
- Local state is stored atomically in `~/.travai/state/runtime-state-v976.json`.
- The state directory/file are created with restrictive local permissions.
- Task state, task history, approval history, and runtime recovery status are persisted.
- Session tokens are never persisted.
- An approval that was already granted before a restart is restored as pending and requires a fresh decision.
- A task that was mid-step when the process stopped is restored to a safe pending state rather than assumed successful.
- Runtime startup restores state before mounting the task handler, and mutations are saved after task/approval changes and step execution.


## v9.7.7 scheduler
- `local-bridge/task-scheduler-v977.mjs` manages delayed, recurring, paused, resumed, cancelled, and dependency-gated schedules.
- Recurring schedules have a minimum interval of 60 seconds.
- Schedules create normal TravAI tasks; they never execute Mac actions directly.
- Consequential task steps still require the existing local approval flow.
- `local-bridge/scheduler-loop-v977.mjs` advances due schedules automatically from the local runtime.
- Schedule state is persisted alongside task/history state and survives restart.
- The dashboard now displays schedules and exposes Pause, Resume, and Cancel controls.
- Dependency checks can reference another schedule's most recent task or a specific task ID.


## v9.7.8 event triggers
- `local-bridge/event-triggers-v978.mjs` adds bounded local condition triggers.
- Supported conditions are limited to runtime health, user-home file existence/change, and injected app-running state.
- File conditions are restricted to the current user's home directory.
- Triggers create ordinary TravAI tasks and never execute Mac actions directly.
- Consequential actions still require the existing local approval path.
- Trigger state persists across restart.


## v9.7.9 observability
- Task diagnostics are derived from existing task state/history rather than a separate raw audit log.
- The local diagnostics endpoint reports task totals, status counts, retries, failed/completed steps, and recent task-history events.
- The dashboard displays a compact read-only diagnostics panel.
- No session tokens, secrets, or raw task inputs are added to diagnostics.


## v9.8.0 policy hardening
- Mutating Mac actions can no longer disable approval through task metadata.
- The executor independently fails closed when a mutating action lacks explicit approval.
- Read-only health/readiness steps may remain non-consequential.
- Existing fixed-binary execution, home-directory path scope, settings-pane allowlist, and SIP/TCC/MDM protections remain unchanged.
- Regression tests verify the approval rule cannot be bypassed by setting `requiresApproval:false`.
