import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Plus,
  Search,
  Filter,
  ClipboardList,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
} from "lucide-react"
import type { WorkOrder, OrderStatus, LockType } from "@/types"
import { STATUS_LABELS, STATUS_COLORS, LOCK_TYPE_LABELS } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"

const STAT_CARDS: { key: OrderStatus; label: string; icon: typeof ClipboardList; color: string; bg: string }[] = [
  { key: "pending", label: "待处理", icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "processing", label: "进行中", icon: Loader2, color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "completed", label: "已完成", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  { key: "abnormal", label: "异常", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
]

const BRANDS = ["华为", "小米", "三星", "OPPO", "vivo", "一加", "荣耀", "realme"]

type FormState = {
  brand: string
  model: string
  systemVersion: string
  lockType: LockType
  customerRequest: string
  keepData: boolean
  authCredential: string
}

const initialForm: FormState = {
  brand: "",
  model: "",
  systemVersion: "",
  lockType: "pattern",
  customerRequest: "",
  keepData: false,
  authCredential: "",
}

export default function OrderHall() {
  const { orders, loadOrders, addOrder } = useOrderStore()
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("")
  const [brandFilter, setBrandFilter] = useState("")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState<FormState>(initialForm)

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const filtered = orders.filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false
    if (brandFilter && o.brand !== brandFilter) return false
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

  const counts = STAT_CARDS.reduce(
    (acc, c) => {
      acc[c.key] = orders.filter((o) => o.status === c.key).length
      return acc
    },
    {} as Record<string, number>
  )

  const processingCount = orders.filter(
    (o) => o.status === "verifying" || o.status === "processing" || o.status === "collaborating" || o.status === "confirming"
  ).length
  counts["processing"] = processingCount

  function handleCreate() {
    addOrder({
      ...form,
      status: "pending" as OrderStatus,
      creator: "管理员",
      assignee: "",
    })
    setForm(initialForm)
    setShowModal(false)
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">工单大厅</h1>
          <p className="mt-1 text-sm text-gray-500">管理所有刷机解锁工单</p>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.key} className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2.5 ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <span className="text-3xl font-bold text-[#1B2A4A]">{counts[card.key] ?? 0}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-gray-600">{card.label}</p>
              </div>
            )
          })}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工单号、品牌、型号、负责人..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1B2A4A]"
          >
            <option value="">全部状态</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1B2A4A]"
          >
            <option value="">全部品牌</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#E8913A] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#d07e2e]"
          >
            <Plus className="h-4 w-4" />
            创建工单
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-[#1B2A4A]/5">
                <th className="px-5 py-3.5 text-left font-semibold text-[#1B2A4A]">工单号</th>
                <th className="px-5 py-3.5 text-left font-semibold text-[#1B2A4A]">品牌/型号</th>
                <th className="px-5 py-3.5 text-left font-semibold text-[#1B2A4A]">锁定类型</th>
                <th className="px-5 py-3.5 text-left font-semibold text-[#1B2A4A]">状态</th>
                <th className="px-5 py-3.5 text-left font-semibold text-[#1B2A4A]">负责人</th>
                <th className="px-5 py-3.5 text-left font-semibold text-[#1B2A4A]">创建时间</th>
                <th className="px-5 py-3.5 text-left font-semibold text-[#1B2A4A]">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b transition hover:bg-gray-50/80">
                  <td className="px-5 py-3.5 font-mono text-sm text-[#1B2A4A]">{order.orderNo}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <span>{order.brand} {order.model}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{LOCK_TYPE_LABELS[order.lockType]}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{order.assignee || "—"}</td>
                  <td className="px-5 py-3.5 text-gray-500">{new Date(order.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/verify/${order.id}`}
                      className="text-[#E8913A] hover:underline"
                    >
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">暂无匹配工单</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#1B2A4A]">创建工单</h2>

            <div className="mt-5 space-y-5">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#1B2A4A]">设备信息</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">品牌</label>
                    <select
                      value={form.brand}
                      onChange={(e) => updateForm("brand", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B2A4A]"
                    >
                      <option value="">请选择</option>
                      {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">型号</label>
                    <input
                      value={form.model}
                      onChange={(e) => updateForm("model", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B2A4A]"
                      placeholder="如 Mate 60 Pro"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">系统版本</label>
                    <input
                      value={form.systemVersion}
                      onChange={(e) => updateForm("systemVersion", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B2A4A]"
                      placeholder="如 HarmonyOS 4.0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">锁定类型</label>
                    <select
                      value={form.lockType}
                      onChange={(e) => updateForm("lockType", e.target.value as LockType)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B2A4A]"
                    >
                      {Object.entries(LOCK_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#1B2A4A]">客户信息</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">客户需求</label>
                    <textarea
                      value={form.customerRequest}
                      onChange={(e) => updateForm("customerRequest", e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B2A4A]"
                      placeholder="请描述客户的解锁需求..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="keepData"
                      checked={form.keepData}
                      onChange={(e) => updateForm("keepData", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#E8913A] focus:ring-[#E8913A]"
                    />
                    <label htmlFor="keepData" className="text-sm text-gray-700">保留数据</label>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">授权凭证</label>
                    <input
                      value={form.authCredential}
                      onChange={(e) => updateForm("authCredential", e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1B2A4A]"
                      placeholder="如 购机发票、账号验证等"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.brand || !form.model || !form.customerRequest}
                className="rounded-lg bg-[#E8913A] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#d07e2e] disabled:opacity-50 disabled:hover:bg-[#E8913A]"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
