import { Outlet } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isDashboard = location.pathname === "/app"
  const title = isDashboard ? "Hello, Maria" : 
                location.pathname.includes("transfer") ? "PIX Transfer" :
                location.pathname.includes("blockchain") ? "Blockchain Details" : ""

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] font-sans flex flex-col">
      <header className="h-16 border-b border-[#2d2d33] bg-[#0f0f12] flex items-center px-8 flex-shrink-0">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-3">
          {!isDashboard && (
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
              <ArrowLeft size={20} />
            </button>
          )}
          <span className="text-lg font-bold tracking-tight uppercase">{title}</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto w-full p-4 py-8 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
