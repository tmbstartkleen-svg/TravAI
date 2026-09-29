// TravAI Elite v7.0 — Daily Driver Control Plane
export const VERSION='7000000000.0.0';
export const CAPABILITIES=Object.freeze([
 'Think','Code','Know','Operate','Automate','Evaluate','Recover'
]);
export const POLICY=Object.freeze({
 offlineFirst:true,
 localhostByDefault:true,
 approvalBeforeConsequentialMutation:true,
 noArbitraryShell:true,
 evidenceBasedRouting:true,
 recoveryBeforeUpgrade:true,
 legacyCompatibility:true
});
export function classifyTask(text=''){
 const s=String(text).toLowerCase();
 if(/restore|backup|snapshot|recover/.test(s))return 'Recover';
 if(/benchmark|evaluate|best model|compare model/.test(s))return 'Evaluate';
 if(/schedule|automation|recurring|background/.test(s))return 'Automate';
 if(/finder|application|process|workspace|notify/.test(s))return 'Operate';
 if(/memory|knowledge|document|retrieve|search local/.test(s))return 'Know';
 if(/code|debug|repository|repo|test|build|fix/.test(s))return 'Code';
 return 'Think';
}
