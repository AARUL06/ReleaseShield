import { strict as assert } from 'node:assert'
import { assessReleaseRisk } from './riskAssessment.js'

const clean = assessReleaseRisk([])

assert.equal(clean.score, 0)
assert.equal(clean.decision, 'NO HEALTH BLOCKERS DETECTED')

const warning = assessReleaseRisk([
  {
    checkId: 'W1',
    name: 'Test warning',
    status: 'warn',
  },
])

assert.equal(warning.score, 10)
assert.equal(warning.decision, 'REVIEW REQUIRED')

const failed = assessReleaseRisk([
  {
    checkId: 'F1',
    name: 'Test failure',
    status: 'fail',
  },
])

assert.equal(failed.score, 25)
assert.equal(failed.decision, 'BLOCKED')

const capped = assessReleaseRisk(
  Array.from({ length: 5 }, (_, index) => ({
    checkId: `F${index + 1}`,
    name: `Failure ${index + 1}`,
    status: 'fail' as const,
  })),
)

assert.equal(capped.score, 100)
assert.equal(capped.decision, 'BLOCKED')

console.log('All ReleaseShield risk assessment tests passed.')