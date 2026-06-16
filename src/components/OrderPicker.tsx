import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ClipboardList,
  Search,
  ChevronRight,
  Smartphone,
} from "lucide-react"
import { useOrderStore } from "@/store/useOrderStore"
import { STATUS_LABELS, STATUS_COLORS, LOCK_TYPE_LABELS } from "@/types"

interface OrderPickerProps {
  title: string
  description: string
  routePrefix: string
}

export default function OrderPicker({ title, description, routePrefix }: OrderPickerProps) {
  const orders = useOrderStore((s) => s.orders)
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const filtered = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        o.orderNo.toLowerCase().includes(q) ||
        o.brand.toLowerCase().includes(q) ||
        o.model.toLowerCase().includes(q) ||
        o.assignee.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-7 h-7 text-steel-700" />
          <h1 className="text-2xl font-bold text-steel-900">{title}</h1>
        </div>
        <p className="text-sm text-steel-600">{description}</p>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
          <input
            type="text"
            placeholder="搜索工单号、品牌、型号、负责人..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-steel-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-steel-700 focus:ring-1 focus:ring-steel-700"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-steel-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-steel-700"
        >
          <option value="">全部状态</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-steel-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-steel-50">
              <th className="px-5 py-3.5 text-left font-semibold text-steel-700">工单号</th>
              <th className="px-5 py-3.5 text-left font-semibold text-steel-700">品牌/型号</th>
              <th className="px-5 py-3.5 text-left font-semibold text-steel-700">锁定类型</th>
              <th className="px-5 py-3.5 text-left font-semibold text-steel-700">状态</th>
              <th className="px-5 py-3.5 text-left font-semibold text-steel-700">负责人</th>
              <th className="px-5 py-3.5 text-left font-semibold text-steel-700">创建时间</th>
              <th className="px-5 py-3.5 text-left font-semibold text-steel-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr
                key={order.id}
                onClick={() => navigate(`${routePrefix}/${order.id}`)}
                className="border-b border-steel-100 transition hover:bg-amber-50/40 cursor-pointer last:border-b-0"
              >
                <td className="px-5 py-4 font-mono text-steel-800">{order.orderNo}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-steel-400" />
                    <span className="text-steel-800">{order.brand} {order.model}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-steel-600">{LOCK_TYPE_LABELS[order.lockType]}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-steel-600">{order.assignee || "—"}</td>
                <td className="px-5 py-4 text-steel-500">
                  {new Date(order.createdAt).toLocaleString("zh-CN", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-5 py-4">
                  <button className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium">
                    选择工单
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-steel-400">
                  暂无匹配工单，请返回工单大厅创建新工单
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
