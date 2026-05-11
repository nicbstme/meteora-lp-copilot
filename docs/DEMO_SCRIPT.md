# Demo Script

Target length: 2-3 minutes.

## Opening

This is Meteora LP Copilot, a TypeScript app built for the LPAgent.io API
integration sidetrack. It helps Solana liquidity providers move from LP Agent
pool discovery to concrete Zap In and Zap Out transaction preparation without
handling private keys.

## Scene 1: Safety and setup

Show the header and setup panel.

Say:

The app is deliberately non-custodial. It never asks for a private key and
never signs transactions. It can run in dry-run mode without an LP Agent API key,
which makes the request payloads reviewable before any live API call.

## Scene 2: Pool discovery

Click `Discover pools` with no API key.

Say:

The first LP Agent integration is pool discovery. In dry-run mode, the execution
log shows the exact `GET /pools/discover` request, including Solana chain,
sorting, page size, and organic score filtering.

If an API key is available, paste it and run discovery again.

Say:

With an API key, this same control calls LP Agent directly and populates the
candidate Meteora pools. Selecting a pool copies its address into the Zap In
builder.

## Scene 3: Zap In

Fill or keep the sample Zap In settings, then click `Generate Zap In`.

Say:

The second integration is LP Agent Zap In. The app prepares a
`POST /pools/{poolId}/add-tx` request with the owner wallet, SOL input amount,
strategy, bin range, slippage, provider, and `zap-in` mode. The result is a
serialized transaction payload for user review and wallet signing.

## Scene 4: Zap Out

Enter a sample position ID. Click `Quote exit`, then `Generate exit tx`.

Say:

The third and fourth LP Agent flows are Zap Out quote and Zap Out transaction
generation. `Quote exit` prepares `POST /position/decrease-quotes`; `Generate
exit tx` prepares `POST /position/decrease-tx` with the owner wallet, close bps,
slippage, output token preference, provider, and Meteora position type.

## Closing

Say:

Meteora LP Copilot combines LP Agent discovery, Zap In, Zap Out quote, and Zap
Out transaction preparation in one focused LP workflow. The app is ready for
public deployment, and the repository includes a Superteam agent payload helper,
CI checks, and a local wallet success checker.

## Recording checklist

- Show the deployed app URL in the browser address bar.
- Show dry-run mode.
- Show the `Discover pools` payload.
- Show the `Generate Zap In` payload.
- Show the `Quote exit` payload.
- Show the `Generate exit tx` payload.
- Mention that no private keys are collected or signed by the app.
- Keep the video under 3 minutes if possible.
