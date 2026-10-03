# TravAI Elite v10.9.0 Final Release Validation

## Release-candidate status
Feature scope is frozen for this release candidate. Repository validation and the Mac-side checks below must complete before TravAI is labeled production-validated.

## Integrated policy checks
- Short-lived bridge sessions remain local-authority based.
- Consequential Mac actions derive approval requirements from the action itself.
- Restored mutating task state has approval requirements re-enforced.
- Approved or consumed approval authority requires a fresh decision after restart.
- Approvals are scoped, single-use, explicit, and expiring.
- Mac execution uses fixed binaries and argument arrays, not arbitrary shell commands.
- Finder paths remain limited to the current user's home directory.
- System Settings access remains allowlisted.
- Session tokens are not persisted.
- Scheduler and trigger subsystems create tasks only; they do not directly execute Mac actions.
- Runtime mount/recovery does not create or change listening ports.
- Diagnostics and queue intelligence are read-only views of bounded task state.

## Required Mac validation
From the TravAI repository on the actual Mac:

```bash
npm test
```

Then perform these smoke checks:

1. Start the existing TravAI runtime on `127.0.0.1:4783`.
2. Confirm the health endpoint responds from the local runtime.
3. Pair the dashboard and confirm a short-lived scoped session is issued.
4. Run a read-only health/readiness task and confirm it completes without a consequential-action approval.
5. Create a mutating task such as opening an approved application. Confirm execution fails before explicit approval.
6. Approve that exact task/step once and confirm it executes.
7. Attempt to reuse the same approval and confirm reuse fails.
8. Restart TravAI. Confirm task/schedule state restores, but prior approved/consumed authority returns to pending and requires a fresh decision.
9. Confirm a scheduled or trigger-created consequential task becomes a normal pending task rather than executing directly.
10. Confirm the dashboard shows task progress, queue state, recovery errors, and offline/degraded state accurately.
11. Confirm diagnostics do not expose session tokens or secrets.
12. Confirm Vercel remains only the control/request surface and Mac actions execute locally.

## Release gate
Any failed automated test or smoke check blocks the production-validated label until corrected. A dashboard label such as READY is not evidence that these checks passed.
