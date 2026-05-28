import { Outlet, Link, useLocation } from "react-router-dom"
import { Home, LayoutDashboard, List, Code2 } from "lucide-react"

export default function SidebarLayout() {
  const location = useLocation()
  
  const navItems = [
    { name: "HOME", icon: Home, path: "/fintech/home" },
    { name: "OVERVIEW", icon: LayoutDashboard, path: "/fintech" },
    { name: "TRANSACTIONS", icon: List, path: "/fintech/transactions" },
    { name: "API", icon: Code2, path: "/fintech/api" },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f8fafc] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2d2d33] bg-[#0f0f12] p-6 flex flex-col gap-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <span className="text-lg font-bold tracking-tight uppercase">Blockchain<span className="text-blue-500">Ledger</span></span>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-4">Core Functions</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/fintech" && location.pathname === "/fintech");
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="mt-auto">
          <div className="p-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/5 border border-blue-500/20 rounded-xl">
            <div className="text-xs text-blue-400 font-bold mb-1">PROJECT SPECS</div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Blockchain integrity verified via hash-chaining protocol. System processing 10ms per block.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-[#2d2d33] bg-[#0f0f12] flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase">Fintech Dashboard</h1>
            <p className="text-[10px] text-gray-500 font-normal uppercase tracking-wider hidden sm:block">Monitor and manage blockchain transaction verification</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-6 mt-2 sm:mt-0">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#16161a] border border-[#2d2d33] rounded-md hidden sm:flex">
              <span className="text-[10px] text-gray-500 font-mono">FINTECH_ID:</span>
              <span className="text-[11px] font-mono text-blue-400 font-semibold">FINTECH001</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#16161a] border border-[#2d2d33] rounded-md">
              <span className="text-[10px] text-gray-500 font-mono uppercase">API STATUS:</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
              <span className="text-[11px] font-mono text-emerald-400">CONNECTED</span>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
