import { useEffect } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ShieldCheck,
  ListChecks,
  Users,
  AlertTriangle,
  Archive,
  Smartphone,
} from "lucide-react"
import { useOrderStore } from "@/store/useOrderStore"

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "工单大厅" },
  { to: "/verify", icon: ShieldCheck, label: "设备核验" },
  { to: "/tasks", icon: ListChecks, label: "操作任务" },
  { to: "/collab", icon: Users, label: "远程协作" },
  { to: "/risk", icon: AlertTriangle, label: "风险确认" },
  { to: "/archive", icon: Archive, label: "结案档案" },
]

export default function Layout() {
  const location = useLocation()
  const loadOrders = useOrderStore((s) => s.loadOrders)

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const activeNav = navItems.find((item) => {
    if (item.to === "/") return location.pathname === "/"
    return location.pathname.startsWith(item.to)
  })

  return (
    <div className="flex h-screen overflow-hidden bg-steel-50">
      <aside className="w-60 flex-shrink-0 bg-steel-900 text-white flex flex-col">
        <div className="px-5 py-6 border-b border-steel-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide">FlashForge</h1>
              <p className="text-xs text-steel-300 mt-0.5">刷机解锁工单平台</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeNav?.to === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to === "/" ? "/" : item.to}
                end={item.to === "/"}
                className={() =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-steel-700 text-white font-medium"
                      : "text-steel-300 hover:bg-steel-800 hover:text-white"
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-steel-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-steel-600 flex items-center justify-center text-xs font-bold">
              管
            </div>
            <div>
              <p className="text-sm font-medium">管理员</p>
              <p className="text-xs text-steel-400">admin@flashforge.cn</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
