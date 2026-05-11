#!/usr/bin/env node

const WALLETS = {
  bitcoin: 'bc1qmd4y3mjcewp54epetvtxzcy8vamgtf75r5nevr',
  solana: 'E8E47syw7oRGzuPmz7KiD137BRJwVNJoiA1zFRAxbxwA',
  ethereum: '0x8185516f07D0c8C7C7C9E43bf36da0434100278F',
  base: '0x8185516f07D0c8C7C7C9E43bf36da0434100278F',
}

function toUsd(amount, price) {
  return Number((amount * price).toFixed(8))
}

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`)
  }
  return text ? JSON.parse(text) : {}
}

async function fetchText(url) {
  const response = await fetch(url)
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`)
  }
  return text
}

async function prices() {
  const data = await fetchJson(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd',
  )
  return {
    BTC: data.bitcoin?.usd ?? 0,
    ETH: data.ethereum?.usd ?? 0,
    SOL: data.solana?.usd ?? 0,
  }
}

async function bitcoin(price) {
  const sats = Number(
    await fetchText(
      `https://blockchain.info/q/addressbalance/${WALLETS.bitcoin}`,
    ),
  )
  const amount = sats / 100_000_000
  return {
    chain: 'bitcoin',
    address: WALLETS.bitcoin,
    unit: 'BTC',
    rawBalance: String(sats),
    amount,
    usd: toUsd(amount, price),
  }
}

async function solana(price) {
  const data = await fetchJson('https://api.mainnet-beta.solana.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [WALLETS.solana],
    }),
  })
  const lamports = Number(data.result?.value ?? 0)
  const amount = lamports / 1_000_000_000
  return {
    chain: 'solana',
    address: WALLETS.solana,
    unit: 'SOL',
    rawBalance: String(lamports),
    amount,
    usd: toUsd(amount, price),
  }
}

async function ethereum(price) {
  const data = await fetchJson(
    `https://api.blockcypher.com/v1/eth/main/addrs/${WALLETS.ethereum}/balance`,
  )
  const wei = BigInt(data.final_balance ?? 0)
  const amount = Number(wei) / 1e18
  return {
    chain: 'ethereum',
    address: WALLETS.ethereum,
    unit: 'ETH',
    rawBalance: wei.toString(),
    amount,
    usd: toUsd(amount, price),
  }
}

async function base(price) {
  const native = await fetchJson(
    `https://base.blockscout.com/api/v2/addresses/${WALLETS.base}`,
  )
  const wei = BigInt(native.coin_balance ?? 0)
  const amount = Number(wei) / 1e18
  const tokens = await fetchJson(
    `https://base.blockscout.com/api/v2/addresses/${WALLETS.base}/tokens?type=ERC-20`,
  ).catch(() => ({ items: [] }))

  return {
    chain: 'base',
    address: WALLETS.base,
    unit: 'ETH',
    rawBalance: wei.toString(),
    amount,
    usd: toUsd(amount, price),
    tokenCount: Array.isArray(tokens.items) ? tokens.items.length : 0,
  }
}

async function main() {
  const priceMap = await prices()
  const balances = await Promise.all([
    bitcoin(priceMap.BTC),
    solana(priceMap.SOL),
    ethereum(priceMap.ETH),
    base(priceMap.ETH),
  ])
  const totalUsd = Number(
    balances.reduce((total, balance) => total + balance.usd, 0).toFixed(8),
  )

  console.log(
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        pricesUsd: priceMap,
        balances,
        totalUsd,
        successConditionMet: totalUsd > 0,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
