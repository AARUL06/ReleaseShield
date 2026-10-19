
export type HealthStatus =
  | 'fail'
  | 'warn'
  | 'pending'
  | 'unknown'
  | 'pass'

export interface HealthFinding {
  checkId: string
  name: string
  status: HealthStatus
  severity?: string
  impact?: string
  fixGuidance?: string
  lastRun?: string
}

export interface RiskAssessment {
  score: number
  decision: 'BLOCKED' | 'REVIEW REQUIRED' | 'NO HEALTH BLOCKERS DETECTED'
  failedChecks: number
  warningChecks: number
  pendingChecks: number
  unknownChecks: number
  findings: readonly HealthFinding[]
}

export function assessReleaseRisk(
  findings: readonly HealthFinding[],
): RiskAssessment {
  const failedChecks = findings.filter(
    (finding) => finding.status === 'fail',
  ).length

  const warningChecks = findings.filter(
    (finding) => finding.status === 'warn',
  ).length

  const pendingChecks = findings.filter(
    (finding) => finding.status === 'pending',
  ).length

  const unknownChecks = findings.filter(
    (finding) => finding.status === 'unknown',
  ).length

  const score = Math.min(
    100,
    failedChecks * 25 +
      warningChecks * 10 +
      pendingChecks * 5 +
      unknownChecks * 5,
  )

  const decision =
    failedChecks > 0
      ? 'BLOCKED'
      : warningChecks > 0 || pendingChecks > 0 || unknownChecks > 0
        ? 'REVIEW REQUIRED'
        : 'NO HEALTH BLOCKERS DETECTED'

  return {
    score,
    decision,
    failedChecks,
    warningChecks,
    pendingChecks,
    unknownChecks,
    findings,
  }
}
