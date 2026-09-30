# TravAI Secure Bridge Contract v9.5.5

The Vercel control surface is not trusted to execute Mac actions directly.

## Pairing
1. Browser generates a cryptographically random ephemeral pairing request ID.
2. Request ID alone grants no authority.
3. The Mac-local TravAI runtime must display and explicitly approve the matching request.
4. A future bridge transport must issue short-lived, scoped session credentials only after local approval.
5. Revocation and expiry are local-authority operations.

## Allowed scopes
Read-only health/readiness summaries may be granted separately from command scopes. Consequential actions require explicit per-action approval unless a narrowly bounded local policy already authorizes them.

## Never exposed by default
- arbitrary shell execution
- unrestricted filesystem access
- local secrets or keychain contents
- raw private workspace content
- direct Ollama service exposure
- automatic firewall/IDS mutations
- Assessment Integrity bypass
- silent cloud fallback

The browser stores only the ephemeral request identifier in sessionStorage. No long-lived bridge secret is embedded in the repository or public page.
