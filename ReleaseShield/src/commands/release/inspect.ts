
import { AgentiaCommand, getAgentiaHost } from '@copado/agentia-plugin-sdk'
import { assessReleaseRisk } from '../../lib/riskAssessment.js'

export default class ReleaseInspect extends AgentiaCommand {
  static override description =
    'Assess Salesforce release risk using organization health checks and work-item context'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --json',
  ]

  public async run() {
    const host = getAgentiaHost({
      requires: [
        'organization.healthCheck',
        'work.getWorkItem',
        'format.table',
      ],
    })

    const [health, workItem] = await Promise.all([
      host.organization.healthCheck(),
      host.work.getWorkItem(),
    ])

    const risk = assessReleaseRisk(health.checks)

const {
  score: riskScore,
  decision,
  failedChecks,
  warningChecks,
  pendingChecks,
  unknownChecks,
} = risk

    const report = {
      product: 'ReleaseShield',
      generatedAt: new Date().toISOString(),
      workItem: {
        id: workItem.id,
        name: workItem.name ?? 'Unknown',
        title: workItem.title ?? 'Untitled work item',
        status: workItem.status ?? 'Unknown',
        priority: workItem.priority ?? null,
        targetContext: workItem.sourceEnvironmentName ?? 'Not provided',
      },
      organizationHealth: health.summary,
        risk: {
        score: riskScore,
        decision,
        failedChecks,
        warningChecks,
        pendingChecks,
        unknownChecks,
      },
      findings: health.checks.map((check) => ({
  checkId: check.checkId,
  name: check.name,
  status: check.status,
  severity: check.severity ?? 'unspecified',
  impact: check.impact ?? 'No impact description provided',
  recommendation:
    check.fixGuidance ??
    (check.status === 'fail'
      ? 'Investigate the failed check, fix the root cause, and rerun validation before deployment.'
      : check.status === 'warn'
        ? 'Review the warning and assess its potential impact before deployment.'
        : check.status === 'pending'
          ? 'Wait for this check to complete before making a release decision.'
          : check.status === 'unknown'
            ? 'Verify the check status and gather evidence before proceeding.'
            : 'Review the check documentation if additional context is needed.'),
  lastRun: check.lastRun ?? null,
})),
    }

    this.log('ReleaseShield — Release Risk Assessment')
    this.log('')

    this.log(
      host.format.table(
        [
          { field: 'field', header: 'Work Item Field' },
          { field: 'value', header: 'Value', wrap: true },
        ],
        [
          { field: 'ID', value: report.workItem.id },
          { field: 'Name', value: report.workItem.name },
          { field: 'Title', value: report.workItem.title },
          { field: 'Status', value: report.workItem.status },
          { field: 'Environment', value: report.workItem.targetContext },
        ],
      ),
    )

    this.log('')
    this.log(`Risk score: ${riskScore}/100`)
    this.log(`Decision: ${decision}`)
    this.log(
      `Health checks: ${health.summary.total} total, ` +
        `${health.summary.fail} failed, ${health.summary.warn} warnings`,
    )
    this.log('')

    if (health.checks.length > 0) {
      this.log(
        host.format.table(
          [
            { field: 'name', header: 'Health Check', wrap: true },
            { field: 'status', header: 'Status' },
            { field: 'severity', header: 'Severity' },
            { field: 'impact', header: 'Impact', wrap: true },
            {
              field: 'fixGuidance',
              header: 'Recommended Action',
              wrap: true,
            },
          ],
          health.checks.map((check) => ({
            name: check.name,
            status: check.status,
            severity: check.severity ?? '-',
            impact: check.impact ?? '-',
            fixGuidance: check.fixGuidance ?? '-',
          })),
        ),
      )
    } else {
      this.log('No organization health checks were returned.')
    }

    return report
  }
}
