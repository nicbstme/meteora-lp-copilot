#!/usr/bin/env node

import { spawn } from 'node:child_process'

const steps = [
  ['verify artifact', 'npm', ['run', 'verify']],
  ['lint', 'npm', ['run', 'lint']],
  ['build', 'npm', ['run', 'build']],
  ['write submission payload', 'npm', ['run', 'agent:write-payload']],
  ['check wallet success condition', 'npm', ['run', 'wallets:check']],
]

function run(label, command, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n==> ${label}`)
    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${label} failed with exit code ${code}`))
      }
    })
  })
}

for (const [label, command, args] of steps) {
  await run(label, command, args)
}

console.log('\nPreflight completed. Check wallets:check output for successConditionMet.')
