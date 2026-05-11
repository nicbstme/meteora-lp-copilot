import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const API_BASE = 'https://api.lpagent.io/open-api/v1'
const SOL_WALLET = 'E8E47syw7oRGzuPmz7KiD137BRJwVNJoiA1zFRAxbxwA'

type ApiResult = {
  label: string
  endpoint: string
  payload?: unknown
  response?: unknown
  error?: string
  dryRun: boolean
}

type Pool = {
  pool: string
  token0_symbol?: string
  token1_symbol?: string
  tvl?: number
  vol_24h?: number
  fee?: number
  organic_score?: number
  bin_step?: number
}

type PoolResponse = {
  status?: string
  data?: Pool[]
  pagination?: {
    totalCount?: number
  }
}

function safeNumber(value: string, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function shortAddress(value: string) {
  if (value.length < 14) return value
  return `${value.slice(0, 6)}...${value.slice(-6)}`
}

function formatUsd(value?: number) {
  if (typeof value !== 'number') return '-'
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatCompact(value?: number) {
  if (typeof value !== 'number') return '-'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

async function callLpAgent(
  apiKey: string,
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...(init?.headers ?? {}),
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : {}
  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `${response.status} ${response.statusText}`,
    )
  }
  return data
}

function App() {
  const [apiKey, setApiKey] = useState('')
  const [wallet, setWallet] = useState(SOL_WALLET)
  const [poolSearch, setPoolSearch] = useState('SOL USDC')
  const [poolId, setPoolId] = useState('')
  const [positionId, setPositionId] = useState('')
  const [inputSol, setInputSol] = useState('0.25')
  const [closeBps, setCloseBps] = useState('5000')
  const [fromBin, setFromBin] = useState('-20')
  const [toBin, setToBin] = useState('20')
  const [slippage, setSlippage] = useState('500')
  const [strategy, setStrategy] = useState('Spot')
  const [pools, setPools] = useState<Pool[]>([])
  const [result, setResult] = useState<ApiResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const dryRun = apiKey.trim().length === 0

  const zapInPayload = useMemo(
    () => ({
      stratergy: strategy,
      owner: wallet.trim(),
      inputSOL: safeNumber(inputSol, 0.25),
      percentX: 0.5,
      fromBinId: Math.trunc(safeNumber(fromBin, -20)),
      toBinId: Math.trunc(safeNumber(toBin, 20)),
      slippage_bps: Math.trunc(safeNumber(slippage, 500)),
      provider: 'JUPITER_ULTRA',
      mode: 'zap-in',
    }),
    [fromBin, inputSol, slippage, strategy, toBin, wallet],
  )

  const zapOutQuotePayload = useMemo(
    () => ({
      id: positionId.trim() || 'encrypted-position-id',
      bps: Math.trunc(safeNumber(closeBps, 5000)),
    }),
    [closeBps, positionId],
  )

  const zapOutTxPayload = useMemo(
    () => ({
      position_id: positionId.trim() || 'position-id',
      bps: Math.trunc(safeNumber(closeBps, 5000)),
      owner: wallet.trim(),
      slippage_bps: Math.trunc(safeNumber(slippage, 500)),
      output: 'allBaseToken',
      provider: 'JUPITER_ULTRA',
      type: 'meteora',
      fromBinId: Math.trunc(safeNumber(fromBin, -20)),
      toBinId: Math.trunc(safeNumber(toBin, 20)),
    }),
    [closeBps, fromBin, positionId, slippage, toBin, wallet],
  )

  async function runAction(label: string, endpoint: string, payload?: unknown) {
    setIsLoading(true)
    try {
      if (dryRun) {
        setResult({ label, endpoint, payload, dryRun: true })
        return
      }

      const response = await callLpAgent(apiKey.trim(), endpoint, {
        method: payload ? 'POST' : 'GET',
        body: payload ? JSON.stringify(payload) : undefined,
      })

      setResult({ label, endpoint, payload, response, dryRun: false })
      if (label === 'Discover pools') {
        const parsed = response as PoolResponse
        setPools(parsed.data?.slice(0, 6) ?? [])
      }
    } catch (error) {
      setResult({
        label,
        endpoint,
        payload,
        error: error instanceof Error ? error.message : String(error),
        dryRun,
      })
    } finally {
      setIsLoading(false)
    }
  }

  function discoverPools(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams({
      chain: 'SOL',
      sortBy: 'tvl',
      sortOrder: 'desc',
      pageSize: '6',
      min_organic_score: '30',
    })
    if (poolSearch.trim()) params.set('search', poolSearch.trim())
    void runAction('Discover pools', `/pools/discover?${params.toString()}`)
  }

  function prepareZapIn(event: FormEvent) {
    event.preventDefault()
    void runAction(
      'Generate Zap In transaction',
      `/pools/${encodeURIComponent(poolId.trim() || 'pool-address')}/add-tx`,
      zapInPayload,
    )
  }

  function quoteZapOut() {
    void runAction(
      'Get Zap Out quote',
      '/position/decrease-quotes',
      zapOutQuotePayload,
    )
  }

  function prepareZapOut() {
    void runAction(
      'Generate Zap Out transaction',
      '/position/decrease-tx',
      zapOutTxPayload,
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">LP Agent sidetrack submission</p>
          <h1>Meteora LP Copilot</h1>
        </div>
        <div className="wallet-pill" title={wallet}>
          SOL payout wallet {shortAddress(wallet)}
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <h2>Turn LP Agent data into one-click liquidity actions.</h2>
          <p>
            This app discovers high-liquidity Meteora pools, prepares LP Agent
            Zap In transactions, and produces Zap Out quote/exit payloads from a
            single risk console.
          </p>
        </div>
        <div className="metric-strip" aria-label="Submission strengths">
          <div>
            <strong>3</strong>
            <span>LP Agent flows</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Zap APIs</span>
          </div>
          <div>
            <strong>0</strong>
            <span>private key handling</span>
          </div>
        </div>
      </section>

      <section className="control-grid">
        <form className="panel settings-panel" onSubmit={discoverPools}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Setup</p>
              <h2>API and wallet</h2>
            </div>
            <span className={dryRun ? 'status dry' : 'status live'}>
              {dryRun ? 'Dry run' : 'Live API'}
            </span>
          </div>

          <label>
            LP Agent API key
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Paste an API key to call LP Agent"
              autoComplete="off"
            />
          </label>

          <label>
            Solana wallet
            <input
              value={wallet}
              onChange={(event) => setWallet(event.target.value)}
              placeholder="Wallet address"
            />
          </label>

          <label>
            Pool search
            <input
              value={poolSearch}
              onChange={(event) => setPoolSearch(event.target.value)}
              placeholder="SOL USDC, JUP, BONK..."
            />
          </label>

          <button disabled={isLoading} type="submit">
            Discover pools
          </button>
        </form>

        <form className="panel" onSubmit={prepareZapIn}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Entry</p>
              <h2>Zap In builder</h2>
            </div>
          </div>

          <label>
            Pool address
            <input
              value={poolId}
              onChange={(event) => setPoolId(event.target.value)}
              placeholder="Meteora pool address"
            />
          </label>

          <div className="split">
            <label>
              SOL amount
              <input
                value={inputSol}
                onChange={(event) => setInputSol(event.target.value)}
                inputMode="decimal"
              />
            </label>
            <label>
              Strategy
              <select
                value={strategy}
                onChange={(event) => setStrategy(event.target.value)}
              >
                <option>Spot</option>
                <option>Curve</option>
                <option>BidAsk</option>
              </select>
            </label>
          </div>

          <div className="split">
            <label>
              From bin
              <input
                value={fromBin}
                onChange={(event) => setFromBin(event.target.value)}
                inputMode="numeric"
              />
            </label>
            <label>
              To bin
              <input
                value={toBin}
                onChange={(event) => setToBin(event.target.value)}
                inputMode="numeric"
              />
            </label>
          </div>

          <label>
            Slippage bps
            <input
              value={slippage}
              onChange={(event) => setSlippage(event.target.value)}
              inputMode="numeric"
            />
          </label>

          <button disabled={isLoading} type="submit">
            Generate Zap In
          </button>
        </form>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Exit</p>
              <h2>Zap Out planner</h2>
            </div>
          </div>

          <label>
            Position ID
            <input
              value={positionId}
              onChange={(event) => setPositionId(event.target.value)}
              placeholder="Encrypted LP Agent position id"
            />
          </label>

          <label>
            Close percentage bps
            <input
              value={closeBps}
              onChange={(event) => setCloseBps(event.target.value)}
              inputMode="numeric"
            />
          </label>

          <div className="button-row">
            <button disabled={isLoading} type="button" onClick={quoteZapOut}>
              Quote exit
            </button>
            <button disabled={isLoading} type="button" onClick={prepareZapOut}>
              Generate exit tx
            </button>
          </div>
        </div>
      </section>

      <section className="data-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Pool shortlist</p>
              <h2>Candidate Meteora pools</h2>
            </div>
          </div>

          {pools.length === 0 ? (
            <div className="empty-state">
              Run discovery with an API key to populate live pool data. Dry-run
              mode still shows the exact LP Agent request that will be made.
            </div>
          ) : (
            <div className="pool-list">
              {pools.map((pool) => (
                <button
                  type="button"
                  key={pool.pool}
                  onClick={() => setPoolId(pool.pool)}
                  className="pool-row"
                >
                  <span>
                    <strong>
                      {pool.token0_symbol ?? 'TOKEN0'} /{' '}
                      {pool.token1_symbol ?? 'TOKEN1'}
                    </strong>
                    <small>{shortAddress(pool.pool)}</small>
                  </span>
                  <span>{formatUsd(pool.tvl)}</span>
                  <span>{formatCompact(pool.vol_24h)} vol</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel result-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Execution log</p>
              <h2>{result?.label ?? 'Ready'}</h2>
            </div>
          </div>
          <pre>
            {JSON.stringify(
              result ?? {
                status: 'ready',
                note: 'No private keys are collected. Generated transactions must be reviewed and signed in a wallet.',
              },
              null,
              2,
            )}
          </pre>
        </div>
      </section>

      <section className="submission-panel">
        <div>
          <p className="eyebrow">Bounty fit</p>
          <h2>Submission notes</h2>
        </div>
        <ul>
          <li>Uses LP Agent pool discovery endpoint for pool selection.</li>
          <li>Uses LP Agent Zap In transaction generation endpoint.</li>
          <li>Uses LP Agent Zap Out quote and transaction generation endpoints.</li>
          <li>
            Keeps signing out of the app so funds never move without explicit
            wallet approval.
          </li>
        </ul>
      </section>
    </main>
  )
}

export default App
