import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function PixTransfer() {
  const navigate = useNavigate()
  const [recipient, setRecipient] = useState("11988889999")
  const [amount, setAmount] = useState("2500")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTransfer = async () => {
    setIsLoading(true)
    setError("")
    // Generate a mock ID
    const txnId = `TXN-HIST-${Math.floor(Math.random() * 1000)}`
    
    try {
      // Intentionally matching the API payload from documentation
      const payload = {
        transaction_id: txnId,
        fintech_id: "FINTECH001",
        transaction_data: {
            amount: parseFloat(amount),
            recipient: recipient,
            type: "PIX"
        }
      }

      // Try making real request to backend mock proxy
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error('Falha ao registrar transação na API')
      }

      // Store locally so it can be verified on the next screen
      sessionStorage.setItem('last_txn', JSON.stringify(payload))
      
      navigate(`/app/transfer/success/${txnId}`)
    } catch (e) {
      console.error(e)
      setError("Ocorreu um erro ao processar a transferência. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-between">
      <div className="space-y-6">
        <div className="bg-[#16161a] border border-[#2d2d33] p-6 rounded-2xl space-y-6">
          <div>
            <label className="text-[10px] text-gray-500 uppercase mb-2 block">Recipient PIX Key</label>
            <Input 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="CPF, Email or Phone" 
              className="w-full bg-[#0a0a0c] border border-[#2d2d33] rounded-lg px-3 py-4 text-base font-mono text-[#f8fafc] placeholder:text-gray-600"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase mb-2 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono">R$</span>
              <Input 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-[#2d2d33] rounded-lg pl-9 pr-3 py-4 text-base font-mono text-[#f8fafc] placeholder:text-gray-600" 
                type="number"
              />
            </div>
          </div>
        </div>
        {error && <p className="text-red-400 text-xs text-center font-medium mt-2">{error}</p>}
      </div>

      <div className="pb-8">
        <Button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-xs tracking-wider uppercase h-auto" onClick={handleTransfer}>
          {isLoading ? "Processando..." : "Confirm Transfer"}
        </Button>
      </div>
    </div>
  )
}
