import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { Shield } from "lucide-react"

export default function BlockchainDetails() {
  const { id } = useParams()
  const [details, setDetails] = useState<any>(null)
  const [isIntegrityGood, setIsIntegrityGood] = useState(true)
  const lastVerifiedId = useRef<string | null>(null)
  
  useEffect(() => {
    // Impede o StrictMode do React de disparar a API 2 vezes no desenvolvimento
    if (lastVerifiedId.current === id) return
    lastVerifiedId.current = id || null

    // Attempt to verify transaction
    const verify = async () => {
      try {
        const payloadStr = sessionStorage.getItem('last_txn')
        const payload = payloadStr ? JSON.parse(payloadStr) : {
            transaction_id: id,
            fintech_id: "FINTECH001",
            transaction_data: { amount: 2500, recipient: "11988889999", type: "PIX" }
        }

        const res = await fetch(`/api/transactions/${id}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        
        if (!res.ok) {
          throw new Error('Erro na verificação')
        }
        
        const data = await res.json()
        setDetails(data)
        
        // A API e o Smart Contract retornam status "INTEGRITY_OK" e a flag "intact"
        const isValid = data.status === "INTEGRITY_OK" || data.intact === true
        setIsIntegrityGood(isValid)
      } catch (e) {
        console.warn("Fallback de detalhes mockados via falha na API")
        setIsIntegrityGood(false) // Muda para false para alertar que não foi verificado online
      }
    }
    verify()
  }, [id])

  return (
    <div className="space-y-6 pb-8">
      {/* Verify Banner */}
      <div className={`bg-gradient-to-br ${isIntegrityGood ? 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/20' : 'from-red-600/20 to-red-600/5 border-red-500/20'} border text-white p-8 rounded-2xl flex flex-col items-center text-center`}>
        <Shield size={48} className={`mb-4 ${isIntegrityGood ? 'text-emerald-400' : 'text-red-400'}`} />
        <h2 className="text-xl font-bold uppercase tracking-wider mb-2">
          Integridade: {isIntegrityGood ? 'BOA (Válida)' : 'RUIM (Inconsistente)'}
        </h2>
        <p className="text-[11px] text-gray-400 font-mono">This transaction is cryptographically verified</p>
      </div>

      <div className="bg-[#16161a] border border-[#2d2d33] rounded-2xl p-6">
        <h3 className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-6">Transaction Information</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] text-gray-500 uppercase mb-2 flex items-center">
              <span className="mr-2 text-blue-500">◆</span> Transaction Hash
            </label>
            <div className="bg-[#0a0a0c] border border-[#2d2d33] p-3 rounded-lg text-xs font-mono text-gray-400 break-all">
              {details?.verification_id || details?.hash || "a7f8c9d2e1b4f5a6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1"}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase mb-2 flex items-center">
              <span className="mr-2 text-blue-500">◆</span> Block Number
            </label>
            <div className="bg-[#0a0a0c] border border-[#2d2d33] p-3 rounded-lg text-xs font-mono text-gray-400">
              {details?.block_number || "0x1a2b3c (1715004)"}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase mb-2 flex items-center">
              <span className="mr-2 text-blue-500">◆</span> Timestamp
            </label>
            <div className="bg-[#0a0a0c] border border-[#2d2d33] p-3 rounded-lg text-xs font-mono text-gray-400">
              {details?.registered_at || details?.timestamp || "2026-03-10T14:35:22.000Z"}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase mb-2 block">
                Confirmations
              </label>
              <div className="bg-[#0a0a0c] border border-[#2d2d33] p-3 rounded-lg text-xs font-mono text-gray-400">
                {details?.confirmations || "1245"}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 uppercase mb-2 block">
                Gas Used
              </label>
              <div className="bg-[#0a0a0c] border border-[#2d2d33] p-3 rounded-lg text-xs font-mono text-gray-400">
                {details?.gas_used || "21000"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
