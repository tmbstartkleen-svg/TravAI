# TravAI Elite v13.4.0

TravAI is an offline-first local AI workstation with a web-safe Vercel control surface.

## v13.4.0 — Local Runtime Doctor & Recovery Intelligence
TravAI combines a bounded macOS action executor, explicit local approval queue, persistent task recovery, and a web-safe control surface.

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


## v9.8.1 release status
- Final cross-module policy regression test added at `tests/release-validation-v981.test.mjs`.
- A concrete Mac validation checklist is included in `RELEASE_VALIDATION_V981.md`.
- Repository integration is release-candidate complete.
- Production validation is intentionally not claimed until `npm test` and the local `127.0.0.1:4783` smoke checks pass on the actual TravAI Mac runtime.


## v9.9.0 quick actions
- `local-bridge/task-templates-v990.mjs` provides fixed, inspectable task templates.
- Initial templates include Health Check, Open Privacy Settings, Mute Mac, and Open Downloads.
- Templates create ordinary TravAI tasks; they do not execute Mac actions directly.
- Mutating templates remain subject to the normal explicit local approval flow.
- The dashboard displays quick actions and creates template tasks through the existing local API.
- No arbitrary shell command or unrestricted task composer is introduced.


## v9.9.1 favorites
- Quick-action templates can be favorited from the dashboard.
- Favorites are browser-local preferences and only reference fixed template IDs.
- Favoriting does not grant approval or change task execution permissions.
- The fixed-template execution path from v9.9.0 remains unchanged.


## v9.9.2 task bundles
- Added fixed multi-step templates without introducing arbitrary task composition.
- **System Check** runs health/readiness checks and then requests approval to open Privacy & Security.
- **Quiet Work** requests approval to mute audio and open the user's Downloads folder.
- Every consequential step remains independently approval-gated by the existing orchestrator/executor policy.
- Bundles use the same template API and dashboard quick-action surface as v9.9.0.


## v10.0.0 large capability bundle
- Added **Work Start**, **Focus Mode**, and **System Review** fixed multi-step workflows.
- Quick Actions now include explicit categories: workflow, diagnostics, system, audio, and files.
- The dashboard supports quick-action search and category filtering.
- Favorites still sort to the top and remain browser-local.
- Larger bundles still create ordinary TravAI tasks; they do not bypass the task engine.
- Every consequential step remains approval-gated by the existing orchestrator/executor rules.
- Template regression coverage now verifies category metadata and larger multi-step bundle structure.


## v10.1.0 smart workspace bundle
- Added **Workspace Ready**: health + readiness checks followed by opening Downloads.
- Added **Audio Reset**: unmute audio and set output volume to 50%.
- Added **Workspace** as a Quick Action category.
- Added live task filtering by status: pending, running, retry-pending, completed, failed, and cancelled.
- Workspace and audio routines remain fixed, inspectable templates.
- Mutating steps still require explicit local approval.
- Regression coverage now includes workspace/audio templates and workspace policy metadata.


## v10.2.0 operations and productivity bundle
- Added **Work Wrap** for a final health check, audio reset, and Downloads review.
- Added **Meeting Ready** for readiness checking and a moderate audio reset.
- Added a **Productivity** Quick Action category.
- Live tasks can now be sorted newest-first or oldest-first in addition to status filtering.
- Productivity routines remain fixed templates and use only the existing allowlisted actions.
- Every audio/Finder mutation remains explicitly approval-gated.
- Regression coverage includes both new productivity bundles and policy metadata.


## v10.3.0 reliability and control bundle
- Added manual retry support for failed and retry-pending tasks.
- Retrying clears only the current step's transient error and returns the task to pending.
- Added a local task retry API route that persists the updated state.
- Added Retry buttons for eligible tasks in the dashboard.
- Added live task search by label, ID, or status.
- Existing bounded retry limits, approval requirements, and allowlisted action policy remain unchanged.
- Added a dedicated reliability regression test.


## v10.4.0 recovery and queue intelligence
- Added a read-only task queue summary derived from local task state.
- Queue intelligence reports total tasks, actionable workload, pending/running, retry/failed, and completed/cancelled counts.
- Added a local read-only queue-summary API endpoint.
- Added a dashboard Queue Intelligence card with offline/degraded messaging.
- Existing manual retry, search, status filtering, and sorting remain available.
- Queue intelligence cannot execute Mac actions or grant approvals.
- Added dedicated queue-summary regression coverage.


## v10.5.0 security hardening and state recovery
- Restored task state is revalidated against the current action allowlist before it is accepted.
- Unknown or obsolete restored actions are discarded rather than trusted.
- Every restored consequential action has `requiresApproval` forced back to `true`, even if legacy/tampered state stored it as false.
- Read-only health/readiness steps retain their explicit approval setting.
- A task restored while running returns to pending, and a running active step returns to pending.
- Restored current-step indexes are clamped to the validated step list.
- Added a regression test covering legacy/tampered persisted task state.


## v10.6.0 runtime integration and test bundle
- Runtime execution now derives approval requirements independently from the action class.
- Mutating actions cannot become implicitly approved because persisted or in-memory task metadata says otherwise.
- Read-only health/readiness actions may execute without a consequential-action approval unless explicitly configured to require one.
- Scoped approvals remain single-use and bound to the task and step.
- Added a cross-module regression test covering tampered task metadata at the live runtime execution boundary.
- The full npm test chain now includes restored-state and runtime-approval hardening checks.


## v10.7.0 dashboard and recovery polish
- Live tasks display completed-step progress as completed/total.
- Step failures expose their bounded error message inline for faster recovery diagnosis.
- The task toolbar shows visible versus total task counts after search/status filters.
- Added one-click Reset Filters to restore all tasks, newest-first.
- Offline/degraded messaging remains explicit instead of implying successful local execution.
- No new privileged action types or approval shortcuts were introduced.
- Added dashboard recovery regression coverage to the full test chain.


## v10.8.0 security and persistence finalization
- Restored approved or consumed approval records are downgraded to pending and require a fresh local decision.
- Restored authority timestamps are cleared before the approval can be reconsidered.
- Favorites now validate dynamically against the current fixed template catalog instead of a stale hardcoded subset.
- Current workspace/productivity templates can be safely favorited while unknown template IDs remain rejected.
- Added approval-restore regression coverage and expanded favorites regression coverage.
- Session tokens remain excluded from persistent state and consequential actions remain locally approval-gated.


## v10.9.0 final release candidate
- Feature scope is frozen for this release candidate.
- Final policy validation now covers restored-task approval enforcement, fresh decisions after restored approval authority, and action-derived runtime approval requirements.
- The Mac release checklist now verifies single-use approval behavior, restart recovery, scheduler/trigger boundaries, dashboard degraded states, and secret-free diagnostics.
- Added release consistency coverage for package, dashboard, README, and validation documentation.
- Production validation is not claimed until the full npm test suite and Mac smoke checklist pass on the actual TravAI runtime.


## v11.0.0 production runtime certification
- Added a local-only production certification evidence engine.
- Certification fails closed unless the local runtime is reachable and every required Mac/runtime smoke check is explicitly satisfied.
- Evidence is written under `~/.travai/certifications` with restrictive local permissions when the certifier is run locally.
- Certification records contain bounded status evidence only; session tokens and approval IDs are never stored.
- Portable CI validates the certifier logic but cannot itself claim Mac production validation.
- The production-validated label remains unavailable until an actual Mac runtime produces a passing local certification record.


## v11.1.0 certification automation
- Added `npm run certify:local` as the single local certification entry point.
- The runner executes repository policy validation, probes the loopback TravAI runtime, and writes a restrictive local certification record.
- Optional manually verified smoke evidence can be supplied through `TRAVAI_CERT_EVIDENCE`; only explicit true checks count.
- Missing runtime evidence fails closed with a non-zero exit status rather than producing a false production-valid result.
- The local certification artifact remains under `~/.travai/certifications` and does not contain session tokens or approval IDs.


## v11.2.0 local runtime host
- Added the missing Node runtime entry point on loopback-only `127.0.0.1:4783`.
- The host mounts the existing hardened task runtime, restores persistent state, and starts the bounded scheduler loop.
- It never binds to `0.0.0.0`, does not add arbitrary shell execution, and does not bypass macOS security controls.
- Start locally with `npm run runtime`.

## v11.3.0 live runtime smoke certification
- Release consistency now validates the current runtime release instead of pinning the obsolete v10.9.0 package version.
- The local-runtime boundary test is included in the production-certifier CI command.
- Vercel remains only the web control surface; local execution remains authoritative and approval-gated.
- Production validation still requires the actual Mac runtime and explicit evidence for consequential-action checks.


## v11.4.0 automated certification harness
- `npm run certify:local` now runs the v11.4 evidence harness.
- Live runtime health is combined with existing hardened regression proofs for pairing scope, approval blocking, restart authority reset, scheduling, dashboard recovery, diagnostics, and execution boundaries.
- Certification records identify each check's evidence source instead of storing raw responses or credentials.
- Optional manual local evidence remains explicit; the harness does not self-approve consequential Mac actions.
- Certification remains fail-closed when required evidence is unavailable.


## v11.5.0 runtime lifecycle and self-diagnostics
- Added `npm run runtime:status` for a read-only check of the loopback runtime before starting another instance.
- `EADDRINUSE` is now classified as an already-running-or-port-busy condition instead of surfacing only as an unhandled Node error.
- Lifecycle diagnostics never kill a PID automatically and never treat an occupied port as permission to terminate another process.
- Runtime status remains restricted to the local `127.0.0.1:4783` authority boundary.
- Lifecycle regression coverage is included in the production-certifier test command.


## v11.6.0 runtime identity and certification binding
- Added a secret-free release identity contract containing service, package version, release, and local protocol identifiers.
- New certification records bind to the exact repository release identity instead of relying on health reachability alone.
- Identity regression tests reject mismatched package versions.
- Identity metadata contains no session token, approval authority, or secret material.
- An already-running older runtime is not treated as upgraded until it is restarted from the newer checkout.


## Hosting resilience
- GitHub Pages is configured as a static fallback control-surface host from `.github/workflows/deploy-pages.yml`.
- The workflow publishes `vercel-index.html` as `index.html` together with the task-control client on each push to `main`.
- Vercel remains optional; TravAI release validation and the local Mac runtime do not depend on Vercel availability.
- Local Mac authority remains on `127.0.0.1:4783`; the hosted surface only requests local actions through the existing bounded runtime.


## v11.7.0 hosting independence
- Every main-branch release builds and verifies a portable static control-surface artifact.
- Core release health no longer depends on Vercel quotas or GitHub Pages repository configuration.
- The static bundle can be published by any ordinary static host while the privileged runtime remains local on 127.0.0.1:4783.
- Hosting-independence regression coverage prevents provider-specific deployment code from becoming a core release dependency.


## v11.8.0 portable release manifest
- Every portable control-surface artifact now includes a secret-free `release.json` manifest.
- The manifest identifies the package version, exact Git commit, portable artifact type, and local runtime authority.
- This gives any static hosting provider a deterministic release identity without making the provider part of TravAI's trust boundary.
- Portable-release regression coverage verifies the manifest is generated on every artifact build.


## v11.9.0 verified artifact integrity
- Portable releases now include `integrity.json` with SHA-256 hashes for the control surface files.
- The integrity verifier detects file changes after an artifact is built, independent of the static hosting provider.
- Integrity metadata is secret-free and requires no signing key or cloud-provider credential.
- Regression coverage verifies an unchanged bundle passes and a tampered bundle fails.


## v12.0.0 attested portable releases
- Portable artifacts now contain release identity, SHA-256 file integrity, and a deterministic release attestation binding version, commit, runtime authority, and integrity metadata.
- Added `npm run release:verify -- <directory>` to validate a downloaded or deployed portable bundle end to end.
- Added `npm run release:health` to summarize local package version, runtime status, and latest production certification state.
- Runtime human-readable release identity is derived from the encoded package version instead of a stale literal.
- CI now exposes release-stack checks independently so failures are diagnosable instead of hidden inside one composite job.
- Hosting remains provider-independent; Vercel, GitHub Pages, Cloudflare Pages, Netlify, or another static host can serve the same verified bundle.


## v12.1.0 local readiness and self-diagnostics
- Added `npm run ready` for one-command runtime, certification freshness, and package-version readiness.
- Certification freshness fails closed when evidence is missing, stale, or bound to a different package version.
- Added `npm run diagnose` for runtime reachability, loopback authority, package identity, and secret-free identity checks.
- Validation CI no longer writes redundant per-matrix commit statuses; native job conclusions are the release signal.
- v12.0's final matrix contained 30 passing component jobs despite a misleading overall workflow failure; v12.1 removes that status-reporting side effect.


## v12.2.0 runtime operations and certification UX
- Added `npm run runtime:ensure` to safely start the local runtime only when it is not already reachable.
- Runtime ensure never kills an existing PID or binds outside the loopback authority.
- Added `npm run certifications` to inspect recent local production-certification records.
- Added `npm run ops` for one-command runtime, readiness, diagnostics, and recent-certification status.
- Hosting-independence regression logic now checks for provider-specific deployment commands rather than rejecting the legacy source filename.
- Added dedicated runtime-ensure and certificate-history regression coverage.


## v12.3.0 release authority and operations hardening
- Certification display versions are now derived from the current package-bound release identity; the stale hard-coded 11.6.0 certificate label is removed.
- Added `npm run certifications:audit` to require an exact match across production validation, release, package version, and local protocol.
- Certification history now retains the protocol and internal record needed for local audit while the normal operations output keeps raw records hidden.
- `npm run ops` now includes an exact certificate-authority result and a direct recommendation.
- Added CI regressions that reject stale release labels, mismatched package bindings, and mismatched protocols.


## v12.4.0 local control plane and recovery center
- Added `npm run control` for one machine-readable snapshot of runtime, release identity, certificate authority, and recovery state.
- Added `npm run recover` for bounded human-readable recovery guidance; it never kills processes, self-certifies, or executes privileged actions.
- Added `npm run release:drift` to detect package, README, dashboard, and protocol release drift.
- Control-plane authority is read-only and explicitly reports that it executes no actions and bypasses no security boundary.
- Added dedicated CI gates for control-plane recovery, recovery guidance, and release drift.


## v13.0.0 safe pairing and browser-to-local control plane
- The loopback runtime now exposes browser-safe pairing request, pairing-status, and session-check routes.
- Browser routes cannot approve or deny pairing. Pairing authority remains local-only through `npm run pair:list`, `npm run pair:approve -- <request-id>`, and `npm run pair:deny -- <request-id>`.
- Approved sessions are short-lived and scoped to the existing command-request boundary.
- Pairing does not bypass the separate single-use approval required for consequential Mac actions.
- No arbitrary shell, unrestricted filesystem access, remote bind, or macOS security-control bypass was introduced.
- Because v13 changes the runtime handler, an already-running pre-v13 local runtime must be manually restarted after pulling this release.


## v13.1.0 pairing lifecycle and session UX
- Local pairing approval no longer prints the browser session token. It produces a short-lived one-time claim secret instead.
- The loopback browser gateway can exchange that claim exactly once for the scoped session after local approval.
- Replayed or invalid claims fail closed.
- The browser can revoke its own session but still cannot approve or deny pairing.
- Existing command-request scope and separate one-time consequential-action approval remain unchanged.


## v13.2.0 pairing dashboard and session control center
- Added a visible Local Pairing & Session dashboard panel.
- The dashboard can create a cryptographically random pairing request, accept the one-time claim secret, exchange it for the scoped session, display session expiry, detect expiry/revocation, and revoke its own session.
- Session tokens remain in browser sessionStorage and disappear with the browser session.
- The dashboard has no pairing approval or denial action; local terminal approval remains mandatory.
- Added a regression gate proving the browser control surface does not contain a pairing approval route.


## v13.3.0 session resilience and pairing diagnostics
- Added secret-free pairing diagnostics with pending/approved/denied counts and pending request TTLs.
- Added `npm run pair:diagnostics` for local inspection without exposing session tokens or claim secrets.
- Dashboard sessions now show a live remaining-time countdown and clear expired/revoked credentials from sessionStorage.
- Dashboard pairing diagnostics explicitly show that local approval is required.
- Added dedicated CI gates for diagnostics privacy and session-resilience UX.


## v13.4.0 local runtime doctor and recovery intelligence
- Added `npm run doctor` to inspect runtime reachability, readiness, exact certification, release drift, and secret-free pairing state in one report.
- Recovery intelligence converts failures into ordered commands that require explicit user action.
- Doctor/recovery authority is read-only and advisory: no process killing, automatic restart, shell execution, or macOS security-boundary mutation.
- Added dedicated CI gates for the doctor safety boundary and recovery intelligence.
