import { useEffect, useState } from "react"
import { Activity, CheckCircle, AlertTriangle } from "lucide-react"

export default function FintechDashboard() {
  const [history, setHistory] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/fintech/FINTECH001/history')
        if (!res.ok) throw new Error('API Error')
        
        const data = await res.json()
        if (data && Array.isArray(data)) {
           setHistory(data)
        } else if (data && data.transactions && Array.isArray(data.transactions)) {
           setHistory(data.transactions)
        } else if (data && data.records && Array.isArray(data.records)) {
           setHistory(data.records)
        }
      } catch (e) {
        console.error("Erro ao buscar histórico:", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const displayTxns = history.filter(txn => 
    (txn.id || txn.transactionId || txn.transaction_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (txn.hash || txn.verificationId || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#16161a] border border-[#2d2d33] p-5 rounded-2xl">
          <div className="text-xs text-gray-500 mb-1 font-mono uppercase flex items-center gap-2">
            <Activity size={12} className="text-blue-500" /> Total Volume
          </div>
          <div className="text-2xl font-light tracking-tight">R$ 42,910.00</div>
        </div>

        <div className="bg-[#16161a] border border-[#2d2d33] p-5 rounded-2xl">
          <div className="text-xs text-gray-500 mb-1 font-mono uppercase flex items-center gap-2">
            <CheckCircle size={12} className="text-emerald-500" /> Verification Count
          </div>
          <div className="text-2xl font-light tracking-tight">{isLoading ? "..." : history.length}</div>
        </div>

        <div className="bg-[#16161a] border border-[#2d2d33] p-5 rounded-2xl">
          <div className="text-xs text-gray-500 mb-1 font-mono uppercase flex items-center gap-2">
            <AlertTriangle size={12} className="text-blue-500" /> Active Node
          </div>
          <div className="text-2xl font-light tracking-tight text-blue-400">100.53.212.181</div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-[#16161a] border border-[#2d2d33] rounded-2xl flex flex-col flex-1 overflow-hidden min-h-[400px]">
        <div className="p-5 border-b border-[#2d2d33] flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-semibold text-white">Fintech Transaction Ledger</h3>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search by ID or Hash..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-[#0a0a0c] border border-[#2d2d33] rounded-lg px-3 py-2 text-xs font-mono text-[#f8fafc] placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button className="text-[10px] text-blue-400 uppercase tracking-widest font-bold hover:text-blue-300 whitespace-nowrap">
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] text-gray-500 uppercase font-mono bg-[#0f0f12] sticky top-0 z-10 border-b border-[#2d2d33]">
              <tr>
                <th className="px-6 py-4 font-normal">Transaction ID</th>
                <th className="px-6 py-4 font-normal hidden sm:table-cell">Timestamp</th>
                <th className="px-6 py-4 font-normal hidden md:table-cell">Hash</th>
                <th className="px-6 py-4 font-normal text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Carregando transações do ledger da Blockchain...</td>
                </tr>
              )}
              {!isLoading && displayTxns.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhuma transação encontrada no ledger.</td>
                </tr>
              )}
              {!isLoading && displayTxns.map((txn, idx) => (
                <tr key={idx} className="border-b border-[#2d2d33] hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-400">{txn.id || txn.transactionId || txn.transaction_id}</td>
                  <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                    {txn.timestamp ? new Date(txn.timestamp).toLocaleString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-500 hidden md:table-cell"><span className="px-2 py-1 bg-[#0a0a0c] border border-[#2d2d33] rounded text-[10px]">{txn.hash || txn.verificationId || "N/A"}</span></td>
                  <td className="px-6 py-4 text-right">
                    {txn.status === "VERIFIED" || txn.status === "REGISTERED" ? (
                      <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">
                        ● VERIFIED
                      </span>
                    ) : (
                      <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">
                        ● ALERT
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
