# Meteora LP Copilot

Submission artifact for the Superteam Earn `LPAgent.io | API integrate Sidetrack`.
The exact Superteam form copy and demo checklist are in [`SUBMISSION.md`](./SUBMISSION.md).
Local review evidence is in [`docs/REVIEW_PACKET.md`](./docs/REVIEW_PACKET.md).
External publish/deploy/submit gates are documented in
[`EXTERNAL_ACTIONS.md`](./EXTERNAL_ACTIONS.md).

- Live app: https://meteora-lp-copilot.vercel.app
- Public source: https://github.com/nicbstme/meteora-lp-copilot

## What it does

Meteora LP Copilot turns LP Agent data into a focused liquidity workflow:

- discovers Meteora pools through `GET /open-api/v1/pools/discover`
- prepares Zap In transactions through `POST /open-api/v1/pools/{poolId}/add-tx`
- prepares Zap Out quotes through `POST /open-api/v1/position/decrease-quotes`
- prepares Zap Out exit transactions through `POST /open-api/v1/position/decrease-tx`

The app does not collect private keys or sign transactions. LP Agent-generated transactions must be reviewed and signed in the user's wallet.

## Target users

Solana LPs who want a faster way to evaluate Meteora pools and move from pool discovery to a concrete Zap In or Zap Out action without copying payloads between docs, scripts, and wallets.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL, paste an LP Agent API key, and run the pool discovery or Zap actions. Without an API key, the app runs in dry-run mode and shows the exact request payloads it will send.

## Build checks

```bash
npm run lint
npm run build
npm run verify
npm run wallets:check
npm run preflight
```

The repository also includes a GitHub Actions workflow at
`.github/workflows/ci.yml` for the non-wallet artifact gates once the repo is
published.

## Superteam agent helper

Superteam Earn exposes an agent API for listings marked `AGENT_ALLOWED`.
This repo includes a local helper for preparing, inspecting, and, only when
explicitly confirmed, submitting the LPAgent sidetrack payload.

```bash
cp .env.example .env
npm run agent:payload
npm run agent:write-payload
```

The helper refuses to submit unless it is called directly with
`node scripts/superteam-agent.mjs submit-lpagent --confirm-submit` and the
required public links are present in the environment.

## Submission checklist

- Project title: `Meteora LP Copilot`
- Project description: `A TypeScript app that uses LP Agent pool discovery plus Zap In and Zap Out APIs to help Solana LPs evaluate Meteora pools and prepare one-click liquidity actions without handling private keys.`
- Primary wallet for Solana payout: `E8E47syw7oRGzuPmz7KiD137BRJwVNJoiA1zFRAxbxwA`
- Required external steps: publish this repo, deploy the app, record a short demo, and submit through Superteam Earn.
