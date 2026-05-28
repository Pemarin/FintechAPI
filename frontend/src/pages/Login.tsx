import { useNavigate } from "react-router-dom"
import { Building2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export default function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm mb-8 flex justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span className="text-2xl font-bold tracking-tight uppercase">Blockchain<span className="text-blue-500">Ledger</span></span>
        </div>
      </div>
      
      <div className="w-full max-w-sm space-y-4 bg-[#16161a] border border-[#2d2d33] p-6 rounded-2xl">
        <div className="space-y-2">
          <label className="text-[10px] text-gray-500 uppercase mb-1 block">Email or CPF</label>
          <Input placeholder="Enter email or CPF" className="w-full bg-[#0a0a0c] border border-[#2d2d33] rounded-lg px-3 py-2 text-xs font-mono text-[#f8fafc] placeholder:text-gray-600" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-gray-500 uppercase mb-1 block">Password</label>
          <Input type="password" placeholder="Enter password" className="w-full bg-[#0a0a0c] border border-[#2d2d33] rounded-lg px-3 py-2 text-xs font-mono text-[#f8fafc] placeholder:text-gray-600" />
        </div>
        
        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase mt-2 h-auto" onClick={() => navigate("/app")}>
          Login
        </Button>
        
        <div className="text-center pt-2">
          <a href="#" className="text-[10px] text-gray-500 hover:text-white uppercase transition-colors">Forgot password?</a>
        </div>

        <div className="mt-8 pt-6 border-t border-[#2d2d33]">
          <p className="text-[10px] text-gray-500 mb-4 text-center uppercase tracking-widest">Demo Navigation</p>
          <div className="flex gap-2">
            <Button variant="outline" className="w-full bg-[#0a0a0c] text-blue-400 border border-blue-500/20 hover:bg-white/5 rounded-lg text-xs tracking-wider uppercase h-auto py-2" onClick={() => navigate("/app")}>
              User App
            </Button>
            <Button variant="outline" className="w-full bg-[#2d2d33] text-white hover:bg-white/10 border-none rounded-lg text-xs tracking-wider uppercase h-auto py-2" onClick={() => navigate("/fintech")}>
              Fintech Dash
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
