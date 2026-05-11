#!/usr/bin/env node

import { writeFile } from 'node:fs/promises'

const BASE_URL = process.env.SUPERTEAM_BASE_URL ?? 'https://superteam.fun'
const API_KEY = process.env.SUPERTEAM_AGENT_API_KEY ?? ''

const listingSlug = 'lpagentio-or-api-integrate-sidetrack'
const listingId = '32c6fb84-7d3d-4a9e-a348-143e4c59b494'

function usage() {
  console.log(`Usage:
  node scripts/superteam-agent.mjs register <agent-name>
  node scripts/superteam-agent.mjs listings
  node scripts/superteam-agent.mjs details [slug]
  node scripts/superteam-agent.mjs lpagent-payload
  node scripts/superteam-agent.mjs write-lpagent-payload [output-path]
  node scripts/superteam-agent.mjs submit-lpagent --confirm-submit

Environment:
  SUPERTEAM_BASE_URL         Defaults to https://superteam.fun
  SUPERTEAM_AGENT_API_KEY    Required for listings/details/submit
  SUPERTEAM_HUMAN_TELEGRAM   Optional for bounty submissions, required by some project listings
  PROJECT_GITHUB_URL         Required for submit-lpagent
  PROJECT_WEBSITE_URL        Required for submit-lpagent
  PROJECT_DEMO_URL           Optional for submit-lpagent
`)
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  if (API_KEY) {
    headers.Authorization = `Bearer ${API_KEY}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : {}

  if (!response.ok) {
    throw new Error(JSON.stringify({ status: response.status, data }, null, 2))
  }

  return data
}

function requireAgentKey() {
  if (!API_KEY) {
    throw new Error('SUPERTEAM_AGENT_API_KEY is required for this command.')
  }
}

function buildLpAgentPayload() {
  const githubUrl =
    process.env.PROJECT_GITHUB_URL ??
    'https://github.com/nicbstme/meteora-lp-copilot'
  const websiteUrl =
    process.env.PROJECT_WEBSITE_URL ?? 'https://meteora-lp-copilot.vercel.app'
  const demoUrl = process.env.PROJECT_DEMO_URL ?? ''
  const telegram = process.env.SUPERTEAM_HUMAN_TELEGRAM ?? ''
  const demoAnswer = demoUrl || websiteUrl

  const eligibilityAnswers = [
    {
      question: 'Project Title',
      answer: 'Meteora LP Copilot',
    },
    {
      question: 'Project Description',
      answer:
        'A TypeScript app that uses LP Agent pool discovery plus Zap In and Zap Out APIs to help Solana LPs evaluate Meteora pools and prepare one-click liquidity actions without handling private keys.',
    },
    {
      question: 'Project Github Link',
      answer: githubUrl || 'TO_BE_FILLED',
    },
    {
      question: 'Project Website',
      answer: websiteUrl || 'TO_BE_FILLED',
    },
    {
      question:
        'Did you submit this project to the official Frontier Hackathon on Colosseum? (Yes/No)',
      answer: 'No',
    },
  ]

  if (demoAnswer) {
    eligibilityAnswers.push({
      question: 'Link to your Loom / Demo Video',
      answer: demoAnswer,
    })
  }

  return {
    listingId,
    link: githubUrl || websiteUrl || 'TO_BE_FILLED',
    tweet: '',
    otherInfo:
      'Meteora LP Copilot is a TypeScript app that uses LP Agent pool discovery, Zap In transaction generation, Zap Out quotes, and Zap Out transaction generation in one workflow. It runs in dry-run mode without an API key, supports live LP Agent API calls when configured, and does not collect private keys or sign transactions.',
    eligibilityAnswers,
    ask: null,
    telegram,
  }
}

async function main() {
  const [command, arg] = process.argv.slice(2)

  if (!command || command === 'help' || command === '--help') {
    usage()
    return
  }

  if (command === 'register') {
    if (!arg) throw new Error('Provide an agent name.')
    const data = await request('/api/agents', {
      method: 'POST',
      body: JSON.stringify({ name: arg }),
    })
    console.log(JSON.stringify(data, null, 2))
    return
  }

  if (command === 'listings') {
    requireAgentKey()
    const data = await request(
      '/api/agents/listings/live?take=20&deadline=2026-12-31',
    )
    console.log(JSON.stringify(data, null, 2))
    return
  }

  if (command === 'details') {
    requireAgentKey()
    const data = await request(
      `/api/agents/listings/details/${encodeURIComponent(arg ?? listingSlug)}`,
    )
    console.log(JSON.stringify(data, null, 2))
    return
  }

  if (command === 'lpagent-payload') {
    console.log(JSON.stringify(buildLpAgentPayload(), null, 2))
    return
  }

  if (command === 'write-lpagent-payload') {
    const outputPath = arg ?? 'submission.payload.json'
    await writeFile(
      outputPath,
      `${JSON.stringify(buildLpAgentPayload(), null, 2)}\n`,
      'utf8',
    )
    console.log(outputPath)
    return
  }

  if (command === 'submit-lpagent') {
    requireAgentKey()
    if (arg !== '--confirm-submit') {
      throw new Error(
        'Refusing to submit without --confirm-submit. This transmits project data to Superteam Earn.',
      )
    }
    const payload = buildLpAgentPayload()
    if (!process.env.PROJECT_GITHUB_URL || !process.env.PROJECT_WEBSITE_URL) {
      throw new Error('PROJECT_GITHUB_URL and PROJECT_WEBSITE_URL are required.')
    }
    const data = await request('/api/agents/submissions/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    console.log(JSON.stringify(data, null, 2))
    return
  }

  throw new Error(`Unknown command: ${command}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
