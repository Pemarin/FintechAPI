import { useNavigate } from "react-router-dom"
import { Send, CreditCard, FileText, CheckCircle2 } from "lucide-react"

export default function UserDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <div className="bg-[#16161a] border border-[#2d2d33] p-6 rounded-2xl">
        <p className="text-xs text-gray-500 mb-1 font-mono uppercase">Current Balance</p>
        <h2 className="text-3xl font-light tracking-tight">R$ 12,450.80</h2>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <button 
          onClick={() => navigate("/app/transfer")}
          className="flex flex-col items-center justify-center p-4 bg-[#16161a] border border-[#2d2d33] rounded-2xl hover:bg-white/5 transition"
        >
          <Send className="text-blue-400 mb-2" size={24} />
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">PIX</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-[#16161a] border border-[#2d2d33] rounded-2xl hover:bg-white/5 transition">
          <CreditCard className="text-blue-400 mb-2" size={24} />
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Card</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-[#16161a] border border-[#2d2d33] rounded-2xl hover:bg-white/5 transition">
          <FileText className="text-blue-400 mb-2" size={24} />
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Statement</span>
        </button>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-4">Recent Transactions</h3>
        <div className="bg-[#16161a] border border-[#2d2d33] rounded-2xl overflow-hidden">
          {/* Item 1 */}
          <div className="p-4 border-b border-[#2d2d33] flex justify-between items-center hover:bg-white/5 cursor-pointer transition-colors" onClick={() => navigate("/app/blockchain/TXN-1")}>
            <div>
              <p className="text-sm font-medium text-white mb-1">Grocery Store</p>
              <div className="flex items-center text-[10px] uppercase tracking-wider text-emerald-500 font-bold">
                <CheckCircle2 size={12} className="mr-1" />
                Verified
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">R$ 150.50</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">Mar 10, 2026</p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="p-4 border-b border-[#2d2d33] flex justify-between items-center hover:bg-white/5 cursor-pointer transition-colors" onClick={() => navigate("/app/blockchain/TXN-2")}>
            <div>
              <p className="text-sm font-medium text-white mb-1">Salary Deposit</p>
              <div className="flex items-center text-[10px] uppercase tracking-wider text-emerald-500 font-bold">
                <CheckCircle2 size={12} className="mr-1" />
                Verified
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-emerald-400">+R$ 5000.00</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">Mar 05, 2026</p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="p-4 flex justify-between items-center hover:bg-white/5 cursor-pointer transition-colors" onClick={() => navigate("/app/blockchain/TXN-3")}>
            <div>
              <p className="text-sm font-medium text-white mb-1">PIX Transfer - João Silva</p>
              <div className="flex items-center text-[10px] uppercase tracking-wider text-emerald-500 font-bold">
                <CheckCircle2 size={12} className="mr-1" />
                Verified
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">R$ 200.00</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">Mar 03, 2026</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
