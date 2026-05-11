#!/usr/bin/env node

import { access, readFile, stat } from 'node:fs/promises'

const checks = []

async function fileContains(path, patterns) {
  const text = await readFile(path, 'utf8')
  return patterns.every((pattern) => text.includes(pattern))
}

async function exists(path) {
  await access(path)
  return true
}

function isUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

async function record(name, fn) {
  try {
    await fn()
    checks.push({ name, ok: true })
  } catch (error) {
    checks.push({
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

await record('LP Agent endpoints are implemented', async () => {
  const ok = await fileContains('src/App.tsx', [
    '/pools/discover',
    '/pools/',
    '/add-tx',
    '/position/decrease-quotes',
    '/position/decrease-tx',
  ])
  if (!ok) throw new Error('Missing one or more required LP Agent endpoints.')
})

await record('Zap In and Zap Out submission notes exist', async () => {
  const ok = await fileContains('SUBMISSION.md', [
    'Zap In',
    'Zap Out',
    'Superteam Earn',
    'LPAgent.io | API integrate Sidetrack',
  ])
  if (!ok) throw new Error('Submission notes do not cover the target bounty.')
})

await record('Agent helper refuses implicit submission', async () => {
  const ok = await fileContains('scripts/superteam-agent.mjs', [
    '--confirm-submit',
    'Refusing to submit without --confirm-submit',
    'PROJECT_GITHUB_URL and PROJECT_WEBSITE_URL are required',
  ])
  if (!ok) throw new Error('Agent helper submission guard is incomplete.')
})

await record('Generated Superteam payload has required answers', async () => {
  const text = await readFile('submission.payload.json', 'utf8')
  const payload = JSON.parse(text)
  const questions = payload.eligibilityAnswers?.map((item) => item.question)
  const required = [
    'Project Title',
    'Project Description',
    'Project Github Link',
    'Project Website',
    'Did you submit this project to the official Frontier Hackathon on Colosseum? (Yes/No)',
    'Link to your Loom / Demo Video',
  ]

  if (payload.listingId !== '32c6fb84-7d3d-4a9e-a348-143e4c59b494') {
    throw new Error('Payload listingId does not match LPAgent sidetrack.')
  }

  for (const question of required) {
    if (!questions?.includes(question)) {
      throw new Error(`Missing eligibility answer: ${question}`)
    }
  }

  const answers = new Map(
    payload.eligibilityAnswers?.map((item) => [item.question, item.answer]),
  )
  const urlQuestions = [
    'Project Github Link',
    'Project Website',
    'Link to your Loom / Demo Video',
  ]

  if (!isUrl(payload.link)) {
    throw new Error('Payload link is not a valid HTTPS URL.')
  }

  for (const question of urlQuestions) {
    const answer = answers.get(question)
    if (!isUrl(answer)) {
      throw new Error(`${question} is not a valid HTTPS URL.`)
    }
  }
})

await record('Review packet maps bounty requirements to evidence', async () => {
  const ok = await fileContains('docs/REVIEW_PACKET.md', [
    'Requirement mapping',
    'Project must use one or more LP Agent endpoints',
    'Project must use Zap In or Zap Out API',
    'Known blockers',
  ])
  if (!ok) throw new Error('Review packet is missing requirement evidence.')
})

await record('Demo screenshot exists and is non-empty', async () => {
  await exists('docs/meteora-lp-copilot-demo.png')
  const info = await stat('docs/meteora-lp-copilot-demo.png')
  if (info.size < 50_000) {
    throw new Error(`Screenshot is unexpectedly small: ${info.size} bytes.`)
  }
})

await record('Environment template does not contain secrets', async () => {
  const text = await readFile('.env.example', 'utf8')
  const forbidden = [/sk_[A-Za-z0-9]/, /api[_-]?key=.{8,}/i, /secret=.{8,}/i]
  const hasSecret = forbidden.some((pattern) => pattern.test(text))
  if (hasSecret) throw new Error('.env.example appears to contain a secret.')
})

await record('Wallet success checker is available', async () => {
  const ok = await fileContains('scripts/check-wallets.mjs', [
    'successConditionMet',
    'blockchain.info/q/addressbalance',
    'api.mainnet-beta.solana.com',
    'api.blockcypher.com/v1/eth/main',
    'base.blockscout.com',
  ])
  if (!ok) throw new Error('Wallet checker does not cover all target chains.')
})

await record('External action approval packet exists', async () => {
  const ok = await fileContains('EXTERNAL_ACTIONS.md', [
    'Publish repository',
    'Deploy web app',
    'Register Superteam agent',
    'Submit LPAgent sidetrack',
    '--confirm-submit',
    'Human payout claim',
  ])
  if (!ok) throw new Error('External action packet is incomplete.')
})

const failed = checks.filter((check) => !check.ok)

for (const check of checks) {
  if (check.ok) {
    console.log(`PASS ${check.name}`)
  } else {
    console.log(`FAIL ${check.name}: ${check.error}`)
  }
}

if (failed.length > 0) {
  process.exitCode = 1
}
