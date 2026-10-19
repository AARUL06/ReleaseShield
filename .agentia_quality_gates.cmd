
@echo off
setlocal

REM ReleaseShield quality gates for Windows.
REM Run from the outer repository root.

echo ## ReleaseShield Quality Gates

echo.
echo ## Building TypeScript plugin
pushd "%~dp0ReleaseShield"
if errorlevel 1 exit /b 1

call npm run build
if errorlevel 1 (
    popd
    exit /b 1
)

echo.
echo ## Testing risk assessment engine
node --input-type=module -e "import { strict as assert } from 'node:assert'; import { assessReleaseRisk } from './dist/lib/riskAssessment.js'; const clean = assessReleaseRisk([]); assert.equal(clean.score, 0); assert.equal(clean.decision, 'NO HEALTH BLOCKERS DETECTED'); const warning = assessReleaseRisk([{checkId:'W1',name:'Warning',status:'warn'}]); assert.equal(warning.score, 10); assert.equal(warning.decision, 'REVIEW REQUIRED'); const failed = assessReleaseRisk([{checkId:'F1',name:'Failure',status:'fail'}]); assert.equal(failed.score, 25); assert.equal(failed.decision, 'BLOCKED'); const capped = assessReleaseRisk(Array.from({length:5},(_,i)=>({checkId:'F'+i,name:'Failure '+i,status:'fail'}))); assert.equal(capped.score, 100); assert.equal(capped.decision, 'BLOCKED'); console.log('All risk assessment tests passed.');"
if errorlevel 1 (
    popd
    exit /b 1
)

echo.
echo ## Validating synthetic demo scenario
node --input-type=module -e "import { strict as assert } from 'node:assert'; import { runDemoScenario } from './dist/lib/demoScenario.js'; const demo = runDemoScenario(); assert.equal(demo.risk.score, 60); assert.equal(demo.risk.decision, 'BLOCKED'); assert.equal(demo.risk.failedChecks, 2); assert.equal(demo.risk.warningChecks, 1); console.log('Demo scenario passed.');"
if errorlevel 1 (
    popd
    exit /b 1
)

popd
echo.
echo All ReleaseShield quality gates passed.
exit /b 0
