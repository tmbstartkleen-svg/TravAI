# TravAI Elite v9.8.1 Release Validation

## Integrated code checks
- Secure short-lived bridge sessions remain local-authority based.
- Mutating Mac actions cannot opt out of explicit approval.
- Approvals are single-use and expire.
- Mac execution uses fixed binaries and argument arrays, not arbitrary shell commands.
- Finder paths remain limited to the user's home directory.
- System Settings access remains allowlisted.
- Task state, schedules, triggers, and approval history persist locally.
- Session tokens are not persisted.
- Approved authority is not restored across restart.
- Scheduler and trigger subsystems create tasks only; they do not execute Mac actions directly.
- Runtime mount/recovery does not create or change listening ports.
- Diagnostics are derived from bounded task state/history.

## Local Mac release checks still required
Run these on the actual TravAI Mac runtime before calling the deployment production-validated:

```bash
npm test
```

Then verify:
1. Start the existing TravAI runtime on 127.0.0.1:4783.
2. Pair the dashboard and confirm a short-lived session is issued.
3. Create a read-only health task and verify it completes.
4. Create a mutating task such as opening an approved application and verify it cannot run before approval.
5. Approve once and confirm the approval cannot be reused.
6. Restart TravAI and confirm tasks/schedules restore while prior approval does not remain granted.
7. Confirm a scheduled task becomes a normal pending task rather than directly executing.
8. Confirm diagnostics display task status without exposing secrets or session tokens.
9. Confirm Vercel remains a control surface only and local Mac actions execute locally.

A failed item should block the production-validated label until corrected.
