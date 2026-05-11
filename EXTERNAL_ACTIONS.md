# External Action Approval Packet

This project is ready locally, but the remaining steps transmit data to third
parties. Do not run these steps without explicit approval.

## 1. Publish repository

Destination: GitHub or another public Git remote.

Data transmitted:

- Full source code in this repository
- Demo screenshot in `docs/meteora-lp-copilot-demo.png`
- Generated Superteam payload in `submission.payload.json`
- Public Solana payout wallet already present in the app and docs

Suggested repository name:

```text
meteora-lp-copilot
```

## 2. Deploy web app

Destination: Vercel, Netlify, GitHub Pages, or another static host.

Data transmitted:

- Built Vite app
- App metadata from `index.html`
- No private keys
- No API keys

Build command:

```bash
npm ci
npm run build
```

Static output directory:

```text
dist
```

## 3. Obtain LP Agent API key

Destination: <https://portal.lpagent.io/>

Data transmitted:

- Whatever account/email/wallet details LP Agent requires

Local handling:

- API key should only be pasted into the app at runtime or stored in a local,
  uncommitted `.env` file if a demo script needs it.
- Do not commit the API key.

## 4. Register Superteam agent

Destination: <https://superteam.fun/api/agents>

Data transmitted:

- Agent name

Command:

```bash
BASE_URL=https://superteam.fun \
node scripts/superteam-agent.mjs register meteora-lp-copilot-agent
```

Response contains:

- `apiKey`: secret, store locally only
- `claimCode`: give to the human claimant for payout if the agent wins
- `agentId`
- `username`

## 5. Submit LPAgent sidetrack

Destination: <https://superteam.fun/api/agents/submissions/create>

Data transmitted:

- `listingId`: `32c6fb84-7d3d-4a9e-a348-143e4c59b494`
- Public GitHub URL
- Public deployed app URL
- Public demo video URL
- Project description and eligibility answers from `submission.payload.json`
- Optional human Telegram URL, if provided

Command shape:

```bash
SUPERTEAM_AGENT_API_KEY=sk_... \
PROJECT_GITHUB_URL=https://github.com/<owner>/meteora-lp-copilot \
PROJECT_WEBSITE_URL=https://<deployment-url> \
PROJECT_DEMO_URL=https://<demo-video-url> \
SUPERTEAM_HUMAN_TELEGRAM=http://t.me/<username> \
node scripts/superteam-agent.mjs submit-lpagent --confirm-submit
```

The helper refuses to submit unless `--confirm-submit`,
`PROJECT_GITHUB_URL`, and `PROJECT_DEMO_URL` are present.

## 6. Human payout claim

Destination: `https://superteam.fun/earn/claim/<claimCode>`

Data transmitted:

- Human account login data
- Talent profile details required by Superteam
- Any KYC/payment information Superteam requires after a win

This step must be completed by the human operator.
