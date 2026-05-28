import { useNavigate, useParams } from "react-router-dom"
import { CheckCircle2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function TransferSuccess() {
  const navigate = useNavigate()
  const { id } = useParams()

  const payloadStr = sessionStorage.getItem('last_txn')
  const payload = payloadStr ? JSON.parse(payloadStr) : null
  const amount = payload?.transaction_data?.amount || "2.500"
  const recipient = payload?.transaction_data?.recipient || "11988889999"

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-between">
      <div className="bg-[#16161a] border border-[#2d2d33] rounded-2xl p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="text-blue-400" size={32} />
        </div>
        <h2 className="text-2xl font-light tracking-tight text-white mb-8">Transfer Successful</h2>

        <div className="w-full space-y-4 mb-8">
          <div className="flex justify-between border-b border-[#2d2d33] pb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Amount</span>
            <span className="text-sm font-semibold text-emerald-400">R$ {amount}</span>
          </div>
          <div className="flex justify-between border-b border-[#2d2d33] pb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Recipient</span>
            <span className="text-sm font-semibold text-white">{recipient}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Transaction ID</span>
            <span className="text-sm font-mono text-gray-400">{id}</span>
          </div>
        </div>

        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center text-emerald-400 font-bold mb-1 space-x-2 text-xs uppercase tracking-wider">
            <ShieldCheck size={16} />
            <span>Blockchain Verified</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            This transaction has been registered on the blockchain
          </p>
        </div>
      </div>

      <div className="space-y-3 pb-8">
        <Button variant="outline" className="w-full bg-[#0a0a0c] text-blue-400 border border-blue-500/20 hover:bg-white/5 rounded-xl text-xs tracking-wider uppercase h-auto py-3.5" onClick={() => navigate(`/app/blockchain/${id}`)}>
          Verificar Transação
        </Button>
        <Button className="w-full bg-[#2d2d33] text-white hover:bg-white/10 border-none rounded-xl text-xs tracking-wider uppercase h-auto py-3.5" onClick={() => navigate("/app")}>
          Back to Home
        </Button>
      </div>
    </div>
  )
}
