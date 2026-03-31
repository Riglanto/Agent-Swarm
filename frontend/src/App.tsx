import { useState } from 'react'

const C = { blue: '#3080ff', indigo: '#625fff', purple: '#ac4bff', green: '#00c758', red: '#fb2c36', bg: '#0c0c0e', surface: '#141416', surface2: '#1c1c1f', border: '#2a2a2e', text: '#a1a1aa', bright: '#fafafa' }

const STEPS = ['Created', 'Dispatched', 'Completed', 'Paid'] as const
const STEP_CHAINS = ['Base', 'LayerZero', 'Arbitrum/Optimism', 'Base']

type Task = { id: number; title: string; status: typeof STEPS[number]; reward: string; worker: string; workerAddr: string; capability: string; chain: string; rep: number; escrowStatus: string; resultHash: string }

const TASKS: Task[] = [
  { id: 1, title: 'Analyze token sentiment', status: 'Paid', reward: '0.05 ETH', worker: 'SentimentBot', workerAddr: '0x2e5fEA809Cc4679DdEc0c6cEB5F9f5B34Ce6263F', capability: 'nlp-analysis', chain: 'Arbitrum', rep: 92, escrowStatus: 'Released', resultHash: '0xab12cd34ef56789012345678901234567890abcdef1234567890abcdef123456' },
  { id: 2, title: 'Generate NFT metadata', status: 'Completed', reward: '0.03 ETH', worker: 'MetadataAgent', workerAddr: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', capability: 'content-generation', chain: 'Optimism', rep: 78, escrowStatus: 'Locked', resultHash: '0xcd5678gh9012345678901234567890abcdef1234567890abcdef12345678abcd' },
  { id: 3, title: 'Audit smart contract', status: 'Dispatched', reward: '0.1 ETH', worker: 'AuditBot', workerAddr: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', capability: 'security-audit', chain: 'Arbitrum', rep: 95, escrowStatus: 'Locked', resultHash: '--' },
]

const WORKERS = [
  { name: 'SentimentBot', addr: '0x2e5fEA809Cc4679DdEc0c6cEB5F9f5B34Ce6263F', capability: 'nlp-analysis', chain: 'Arbitrum', rep: 92 },
  { name: 'MetadataAgent', addr: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', capability: 'content-generation', chain: 'Optimism', rep: 78 },
  { name: 'AuditBot', addr: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', capability: 'security-audit', chain: 'Arbitrum', rep: 95 },
]

const HOW = ['Submit Task', 'Discover Workers', 'Dispatch Cross-Chain', 'Execute & Submit', 'Verify & Pay']

const stepIdx = (s: typeof STEPS[number]) => STEPS.indexOf(s)

const Badge = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span style={{ background: color + '22', color, border: `1px solid ${color}44` }} className="px-2 py-0.5 text-xs font-medium">{children}</span>
)

const chainColor = (c: string) => c === 'Base' ? C.blue : c === 'Arbitrum' ? C.indigo : c === 'Optimism' ? C.red : C.purple

export default function App() {
  const [sel, setSel] = useState(0)
  const [search, setSearch] = useState('')
  const [searchError, setSearchError] = useState(false)
  const task = TASKS[sel]
  const si = stepIdx(task.status)

  const doSearch = () => {
    const q = search.trim().toLowerCase()
    const idx = TASKS.findIndex(t => t.workerAddr.toLowerCase() === q)
    if (idx >= 0) { setSel(idx); setSearchError(false) }
    else setSearchError(true)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-sm" style={{ background: C.indigo, color: C.bright }}>AS</div>
          <div>
            <div className="text-sm font-semibold" style={{ color: C.bright }}>Agent Swarm</div>
            <div className="text-xs" style={{ color: C.text }}>Cross-Chain Task Coordination</div>
          </div>
        </div>
        <a href="https://github.com/Riglanto/AgentSwarm" target="_blank" rel="noreferrer" className="text-xs hover:underline" style={{ color: C.text }}>GitHub</a>
      </nav>

      {/* Hero */}
      <section className="px-6 py-10 text-center" style={{ borderBottom: `1px solid ${C.border}` }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: C.bright }}>One task. Many chains. Zero trust assumptions.</h1>
        <p className="text-sm max-w-2xl mx-auto mb-6" style={{ color: C.text }}>Autonomous multi-agent coordination across Base, Arbitrum, and Optimism using LayerZero V2 for trustless cross-chain messaging.</p>
        <div className="flex max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Look up worker by address (0x...)"
            value={search}
            onChange={e => { setSearch(e.target.value); setSearchError(false) }}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            className="flex-1 px-4 py-3 text-sm font-mono focus:outline-none"
            style={{ background: C.surface, border: `1px solid ${searchError ? C.red : C.border}`, color: C.bright, borderRight: 'none' }}
          />
          <button
            onClick={doSearch}
            className="px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 cursor-pointer"
            style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})` }}
          >
            Look up
          </button>
        </div>
        {searchError && <p className="text-xs mt-2" style={{ color: C.red }}>Worker not found</p>}
      </section>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Task List sidebar */}
        <aside className="w-full lg:w-72 shrink-0 p-4 flex flex-col gap-2" style={{ borderRight: `1px solid ${C.border}` }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.text }}>Tasks</div>
          {TASKS.map((t, i) => (
            <button key={t.id} onClick={() => setSel(i)} className="text-left p-3 transition-colors" style={{ background: sel === i ? C.surface2 : C.surface, border: `1px solid ${sel === i ? C.indigo : C.border}` }}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-semibold" style={{ color: C.bright }}>Task #{t.id}</span>
                <Badge color={t.status === 'Paid' ? C.green : t.status === 'Completed' ? C.blue : C.purple}>
                  {t.status}{t.status === 'Paid' ? ' \u2713' : ''}
                </Badge>
              </div>
              <div className="text-xs mb-1" style={{ color: C.text }}>{t.title}</div>
              <code className="text-[10px] block truncate mb-1" style={{ color: '#52525b' }}>{t.workerAddr}</code>
              <div className="text-xs" style={{ color: C.text }}>Reward: {t.reward} &middot; {t.worker} on {t.chain}</div>
            </button>
          ))}
        </aside>

        {/* Task Detail */}
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-1" style={{ color: C.bright }}>Task #{task.id}: {task.title}</h2>
            <div className="flex gap-2"><Badge color={chainColor(task.chain)}>{task.chain}</Badge><Badge color={C.green}>{task.reward}</Badge></div>
          </div>

          {/* Pipeline */}
          <div className="p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="text-xs font-semibold mb-3" style={{ color: C.text }}>STATUS PIPELINE</div>
            <div className="flex items-center gap-1">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className="flex-1 text-center p-2" style={{ background: i <= si ? (i === si ? C.indigo + '33' : C.indigo + '18') : C.surface2, border: `1px solid ${i <= si ? C.indigo : C.border}` }}>
                    <div className="text-xs font-semibold" style={{ color: i <= si ? C.bright : C.text }}>{s}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: C.text }}>{STEP_CHAINS[i]}</div>
                  </div>
                  {i < STEPS.length - 1 && <span style={{ color: i < si ? C.indigo : C.border }}>&rarr;</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Worker + Escrow */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="text-xs font-semibold mb-2" style={{ color: C.text }}>WORKER INFO</div>
              <div className="space-y-1 text-xs">
                <div><span style={{ color: C.text }}>Name:</span> <span style={{ color: C.bright }}>{task.worker}</span></div>
                <div><span style={{ color: C.text }}>Address:</span> <span style={{ color: C.bright, fontFamily: 'monospace' }}>{task.workerAddr}</span></div>
                <div><span style={{ color: C.text }}>Capability:</span> <span style={{ color: C.bright }}>{task.capability}</span></div>
                <div><span style={{ color: C.text }}>Chain:</span> <Badge color={chainColor(task.chain)}>{task.chain}</Badge></div>
                <div><span style={{ color: C.text }}>Reputation:</span> <span style={{ color: task.rep >= 90 ? C.green : C.blue }}>{task.rep}/100</span></div>
              </div>
            </div>
            <div className="p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="text-xs font-semibold mb-2" style={{ color: C.text }}>ESCROW &amp; RESULT</div>
              <div className="space-y-1 text-xs">
                <div><span style={{ color: C.text }}>Amount Locked:</span> <span style={{ color: C.bright }}>{task.reward}</span></div>
                <div><span style={{ color: C.text }}>Escrow Status:</span> <Badge color={task.escrowStatus === 'Released' ? C.green : C.purple}>{task.escrowStatus}</Badge></div>
                <div><span style={{ color: C.text }}>Result Hash:</span> <span style={{ color: C.bright, fontFamily: 'monospace' }}>{task.resultHash}</span></div>
              </div>
              <div className="mt-3 text-xs font-semibold" style={{ color: C.text }}>CROSS-CHAIN PATH</div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <Badge color={C.blue}>Base (TaskManager)</Badge>
                <span style={{ color: C.indigo }}>&rarr;</span>
                <Badge color={C.indigo}>LayerZero</Badge>
                <span style={{ color: C.indigo }}>&rarr;</span>
                <Badge color={chainColor(task.chain)}>{task.chain} (WorkerNode)</Badge>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Worker Registry */}
      <section className="px-6 py-6" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.text }}>Worker Registry</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Worker', 'Address', 'Capability', 'Chain', 'Reputation'].map(h => <th key={h} className="text-left py-2 px-3 font-semibold" style={{ color: C.text }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {WORKERS.map(w => (
                <tr key={w.name} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="py-2 px-3 font-medium" style={{ color: C.bright }}>{w.name}</td>
                  <td className="py-2 px-3 max-w-[180px] truncate" style={{ fontFamily: 'monospace', color: '#52525b', fontSize: '10px' }}>{w.addr}</td>
                  <td className="py-2 px-3" style={{ fontFamily: 'monospace', color: C.text }}>{w.capability}</td>
                  <td className="py-2 px-3"><Badge color={chainColor(w.chain)}>{w.chain}</Badge></td>
                  <td className="py-2 px-3" style={{ color: w.rep >= 90 ? C.green : C.blue }}>{w.rep}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-6" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.text }}>How It Works</div>
        <div className="flex flex-wrap gap-2">
          {HOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="px-4 py-2 text-xs" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.bright }}>
                <span className="font-bold" style={{ color: C.indigo }}>{i + 1}.</span> {s}
              </div>
              {i < HOW.length - 1 && <span style={{ color: C.border }}>&rarr;</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Network Stats */}
      <section className="px-6 py-6" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.text }}>Network Stats</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[['Tasks Completed', '8', C.green], ['Workers Registered', '3', C.blue], ['ETH Escrowed', '0.45', C.indigo], ['Chains Active', '3', C.purple]].map(([label, val, color]) => (
            <div key={label as string} className="p-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="text-xl font-bold" style={{ color: color as string }}>{val}</div>
              <div className="text-xs mt-1" style={{ color: C.text }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs" style={{ borderTop: `1px solid ${C.border}`, color: C.text }}>
        Agent Swarm &mdash; One task. Many chains. &mdash; Powered by LayerZero V2
      </footer>
    </div>
  )
}
