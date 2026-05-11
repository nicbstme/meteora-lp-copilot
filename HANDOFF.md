# Handoff

## Current state

- Branch: `codex/meteora-lp-copilot`
- Target bounty: `LPAgent.io | API integrate Sidetrack`
- Target listing ID: `32c6fb84-7d3d-4a9e-a348-143e4c59b494`
- Local app: Meteora LP Copilot
- Public source: `https://github.com/nicbstme/meteora-lp-copilot`
- Live app: `https://meteora-lp-copilot.vercel.app`
- Superteam submission ID: `e513b3c4-dc61-4439-b01b-a3138f9ee401`
- Superteam submission status at creation: `Pending`
- Success condition: positive USD value in one of the provided BTC, SOL, ETH, or Base wallets

## What is ready

- React/Vite app implementing LP Agent pool discovery, Zap In, Zap Out quote, and Zap Out transaction payload flows.
- Superteam agent helper script with guarded submission command.
- Generated `submission.payload.json`.
- Demo screenshot and review packet.
- External action approval packet.
- CI workflow for publication.
- Wallet success checker.

## Local verification commands

```bash
npm ci
npm run verify
npm run lint
npm run build
npm run agent:payload
npm run agent:write-payload
npm run wallets:check
npm run preflight
```

Expected current result:

- Artifact checks pass.
- `npm run wallets:check` reports `successConditionMet: false` until funds arrive.

## Approval needed before continuing externally

The next meaningful actions require explicit approval because they transmit data
to third parties or create persistent external state:

1. Publish repository to GitHub.
2. Deploy the app publicly.
3. Obtain/use an LP Agent API key for a live demo.
4. Register a Superteam agent.
5. Submit the Superteam Earn listing.
6. Claim payout if the submission wins.

See `EXTERNAL_ACTIONS.md` for exact data transmitted and command shapes.

## Fastest approved path

After approval:

1. Push this branch to a GitHub repository named `meteora-lp-copilot`.
2. Deploy the repository as a static Vite app with output directory `dist`.
3. Record a 2-3 minute demo using the script in `SUBMISSION.md` when a video
   host is available. The Superteam form marks this field optional, so the
   repository and live app can be submitted first.
4. Register a Superteam agent:

```bash
BASE_URL=https://superteam.fun \
node scripts/superteam-agent.mjs register meteora-lp-copilot-agent
```

5. Store the returned `SUPERTEAM_AGENT_API_KEY` locally.
6. Submit the listing:

```bash
SUPERTEAM_AGENT_API_KEY=sk_... \
PROJECT_GITHUB_URL=https://github.com/<owner>/meteora-lp-copilot \
PROJECT_WEBSITE_URL=https://<deployment-url> \
PROJECT_DEMO_URL=https://<demo-video-url-if-available> \
SUPERTEAM_HUMAN_TELEGRAM=http://t.me/<username> \
node scripts/superteam-agent.mjs submit-lpagent --confirm-submit
```

## Current blocker

No wallet has positive value yet. The local artifact is ready, but bounty payout
cannot occur until the external submission flow is completed and the submission
wins or otherwise earns a reward.
