import { Command } from '@oclif/core'
import { runDemoScenario } from '../../lib/demoScenario.js'

export default class ReleaseDemo extends Command {
  static override description =
    'Run a ReleaseShield risk assessment using clearly labeled synthetic demo data'

  static override examples = ['<%= config.bin %> release demo']

  public async run() {
    const report = runDemoScenario()

    this.log('ReleaseShield — Demonstration Mode')
    this.log('Data source: SYNTHETIC — not a live Salesforce assessment')
    this.log('')
    this.log(`Risk score: ${report.risk.score}/100`)
    this.log(`Decision: ${report.risk.decision}`)
    this.log(`Failed checks: ${report.risk.failedChecks}`)
    this.log(`Warnings: ${report.risk.warningChecks}`)
    this.log('')

    for (const finding of report.risk.findings) {
      this.log(`[${finding.status.toUpperCase()}] ${finding.name}`)
      this.log(`  Severity: ${finding.severity ?? 'unspecified'}`)
      this.log(`  Impact: ${finding.impact ?? 'Not provided'}`)
      this.log(
        `  Recommended action: ${
          finding.fixGuidance ?? 'Review the check documentation.'
        }`,
      )
      this.log('')
    }

    this.log(`Generated at: ${report.generatedAt}`)

    return report
  }
}