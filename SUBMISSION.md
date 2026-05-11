# Superteam Earn Submission Packet

## Target bounty

- Bounty: `LPAgent.io | API integrate Sidetrack`
- Platform: Superteam Earn
- Listing: <https://superteam.fun/earn/listing/lpagentio-or-api-integrate-sidetrack>
- Prize pool: `900 USDC`
- Deadline: `2026-05-12T11:59:59.999Z`
- Required integration: LP Agent endpoint plus Zap In or Zap Out API

## Form answers

### Project Title

Meteora LP Copilot

### Project Description

Meteora LP Copilot is a TypeScript app that uses LP Agent pool discovery plus Zap In and Zap Out APIs to help Solana liquidity providers evaluate Meteora pools and prepare one-click liquidity actions without handling private keys. It turns LP Agent data into a practical flow: discover candidate pools, prepare a Zap In transaction, quote a Zap Out, and prepare an exit transaction for wallet review and signing.

### Project Github Link

To be filled after publishing the repository.

### Project Website

To be filled after deployment.

### Did you submit this project to the official Frontier Hackathon on Colosseum? (Yes/No)

No, unless you choose to submit it to Colosseum before submitting this side track.

### Link to your project's Colosseum profile

Leave blank unless submitted to Colosseum.

### Link to your Loom / Demo Video

To be filled after recording the demo.

### Presentation Link

Optional. The README and demo should be enough for this scoped API integration.

### Project Twitter Profile Link

Optional. Leave blank unless you create a project account.

## Demo script

1. Open the deployed app and show the Solana payout wallet in the header.
2. Explain that the app never collects private keys and only prepares transactions for wallet review.
3. Show dry-run mode with no API key and click `Discover pools` to display the exact `/pools/discover` request.
4. Paste an LP Agent API key, run `Discover pools`, and select one returned Meteora pool.
5. Click `Generate Zap In` and show the generated `/pools/{poolId}/add-tx` request or response.
6. Enter a sample position ID, click `Quote exit`, then `Generate exit tx` to show `/position/decrease-quotes` and `/position/decrease-tx`.
7. Close by stating the app uses LP Agent discovery, Zap In, and Zap Out flows in one interface.

## External actions still needed

- Optionally register a Superteam Earn agent and keep the returned API key/claim code private.
- Obtain an LP Agent API key from <https://portal.lpagent.io/>.
- Publish this local repository to GitHub.
- Deploy the app publicly.
- Record a 2-3 minute demo.
- Submit the form on Superteam Earn.

These actions transmit account/project data externally and should be done only after explicit approval.

## Agent API helper

Prepare the exact local submission payload without transmitting it:

```bash
npm run agent:payload
npm run agent:write-payload
```

The generated JSON file is [`submission.payload.json`](./submission.payload.json).

After public GitHub and demo URLs exist, the helper can submit through the
Superteam agent API, but it intentionally requires the explicit
`--confirm-submit` flag:

```bash
SUPERTEAM_AGENT_API_KEY=... \
PROJECT_GITHUB_URL=... \
PROJECT_WEBSITE_URL=... \
PROJECT_DEMO_URL=... \
node scripts/superteam-agent.mjs submit-lpagent --confirm-submit
```
