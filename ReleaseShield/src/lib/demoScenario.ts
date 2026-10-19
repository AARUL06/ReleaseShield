import { assessReleaseRisk, type HealthFinding } from './riskAssessment.js'

export const demoFindings: HealthFinding[] = [
  {
    checkId: 'SEC-001',
    name: 'Apex security validation',
    status: 'fail',
    severity: 'critical',
    impact: 'Potential security exposure in the release',
    fixGuidance: 'Review Apex sharing and CRUD/FLS enforcement, then rerun security validation.',
  },
  {
    checkId: 'TEST-002',
    name: 'Apex test coverage validation',
    status: 'fail',
    severity: 'high',
    impact: 'Deployment may fail release quality requirements',
    fixGuidance: 'Review failing tests and coverage, correct the underlying issues, and rerun tests.',
  },
  {
    checkId: 'CONFIG-003',
    name: 'Configuration consistency',
    status: 'warn',
    severity: 'medium',
    impact: 'Environment differences may cause unexpected behavior',
    fixGuidance: 'Compare source and target configuration before deployment.',
  },
]

export function runDemoScenario() {
  return {
    product: 'ReleaseShield',
    mode: 'DEMO — SYNTHETIC DATA',
    risk: assessReleaseRisk(demoFindings),
    generatedAt: new Date().toISOString(),
  }
}