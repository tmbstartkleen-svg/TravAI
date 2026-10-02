import crypto from 'node:crypto';

const REQUEST_TTL_MS = 5 * 60_000;
const SESSION_TTL_MS = 15 * 60_000;
const requests = new Map();
const sessions = new Map();
const ALLOWED_SCOPES = new Set(['health:read','readiness:read','command:request']);

const now = () => Date.now();
const token = () => crypto.randomBytes(32).toString('base64url');
const clean = () => {
  const t=now();
  for (const [k,v] of requests) if (v.expiresAt<=t) requests.delete(k);
  for (const [k,v] of sessions) if (v.expiresAt<=t || v.revoked) sessions.delete(k);
};
const normalizeScopes = (scopes=[]) => [...new Set(scopes)].filter(x=>ALLOWED_SCOPES.has(x));

export function createPairingRequest({requestId, label='TravAI browser'}={}) {
  clean();
  if (!/^[a-f0-9]{32}$/i.test(requestId||'')) throw new Error('INVALID_PAIR_REQUEST');
  const id=requestId.toLowerCase();
  const record={id,label:String(label).slice(0,80),status:'pending',createdAt:now(),expiresAt:now()+REQUEST_TTL_MS,scopes:['health:read','readiness:read']};
  requests.set(id,record);
  return {...record};
}

export function listPairingRequests() {
  clean();
  return [...requests.values()].map(({id,label,status,createdAt,expiresAt,scopes})=>({id,label,status,createdAt,expiresAt,scopes}));
}

export function approvePairingRequest(requestId, scopes=['health:read','readiness:read']) {
  clean();
  const r=requests.get(String(requestId||'').toLowerCase());
  if (!r || r.status!=='pending') throw new Error('PAIR_REQUEST_NOT_PENDING');
  const granted=normalizeScopes(scopes);
  if (!granted.length) throw new Error('NO_ALLOWED_SCOPES');
  r.status='approved'; r.approvedAt=now(); r.scopes=granted;
  const sessionToken=token();
  const session={tokenHash:crypto.createHash('sha256').update(sessionToken).digest('hex'),scopes:granted,createdAt:now(),expiresAt:now()+SESSION_TTL_MS,revoked:false};
  sessions.set(session.tokenHash,session);
  return {sessionToken,scopes:granted,expiresAt:session.expiresAt};
}

export function denyPairingRequest(requestId) {
  clean();
  const r=requests.get(String(requestId||'').toLowerCase());
  if (!r) return {ok:false};
  r.status='denied'; r.deniedAt=now();
  return {ok:true};
}

export function authorizeSession(sessionToken, requiredScope) {
  clean();
  const hash=crypto.createHash('sha256').update(String(sessionToken||'')).digest('hex');
  const s=sessions.get(hash);
  if (!s || s.revoked || s.expiresAt<=now()) return {ok:false,reason:'SESSION_INVALID'};
  if (!s.scopes.includes(requiredScope)) return {ok:false,reason:'SCOPE_DENIED'};
  return {ok:true,scopes:[...s.scopes],expiresAt:s.expiresAt};
}

export function revokeSession(sessionToken) {
  const hash=crypto.createHash('sha256').update(String(sessionToken||'')).digest('hex');
  const s=sessions.get(hash);
  if (!s) return {ok:false};
  s.revoked=true;
  sessions.delete(hash);
  return {ok:true};
}

export const bridgePolicy = Object.freeze({
  localAuthority:true,
  explicitPairApproval:true,
  shortLivedSessions:true,
  arbitraryShell:false,
  unrestrictedFilesystem:false,
  secretExport:false,
  automaticSecurityMutation:false,
  assessmentIntegrityBypass:false,
  silentCloudFallback:false
});
