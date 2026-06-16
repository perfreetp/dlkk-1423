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
  Archive,
  ListTodo,
  ShieldCheck,
  Image as ImageIcon,
  ExternalLink,
  X,
} from "lucide-react"
import type { WorkOrder, OrderStatus, LockType } from "@/types"
import { STATUS_LABELS, STATUS_COLORS, LOCK_TYPE_LABELS } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"

type ViewMode = "list" | "archive"

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

function getCurrentStageLabel(order: WorkOrder): string {
  if (order.archive.completedAt) return "已结案"
  if (order.riskConfirm.confirmedAt) return "待结案归档"
  if (order.status === "confirming") return "风险确认"
  if (order.status === "collaborating") return "远程协作"
  if (order.tasks.some((t) => t.completed || t.result || t.error)) return "操作任务"
  if (order.verify.imei1 || order.verify.photos.length > 0) return "设备核验"
  return "待开始"
}

export default function OrderHall() {
  const { orders, loadOrders, addOrder, getCurrentStagePath } = useOrderStore()
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("")
  const [brandFilter, setBrandFilter] = useState("")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState<FormState>(initialForm)

  // 归档视图专属筛选
  const [riskSignedFilter, setRiskSignedFilter] = useState<"all" | "yes" | "no">("all")
  const [hasScreenshotsFilter, setHasScreenshotsFilter] = useState<"all" | "yes" | "no">("all")

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
    // 归档视图筛选
    if (viewMode === "archive") {
      if (riskSignedFilter === "yes" && !o.riskConfirm.confirmedAt) return false
      if (riskSignedFilter === "no" && o.riskConfirm.confirmedAt) return false
      if (hasScreenshotsFilter === "yes" && o.archive.successScreenshots.length === 0) return false
      if (hasScreenshotsFilter === "no" && o.archive.successScreenshots.length > 0) return false
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
    <div className="min-h-screen bg-steel-50/50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-steel-900">工单大厅</h1>
            <p className="mt-1 text-sm text-steel-500">
              {viewMode === "list" ? "管理所有刷机解锁工单" : "归档质检视图 - 按多维度筛选查看工单进度"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-steel-200 bg-white p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === "list"
                    ? "bg-steel-800 text-white shadow-sm"
                    : "text-steel-600 hover:text-steel-800"
                }`}
              >
                <ListTodo className="w-4 h-4" />
                工单列表
              </button>
              <button
                onClick={() => setViewMode("archive")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === "archive"
                    ? "bg-steel-800 text-white shadow-sm"
                    : "text-steel-600 hover:text-steel-800"
                }`}
              >
                <Archive className="w-4 h-4" />
                归档视图
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-amber px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-500"
            >
              <Plus className="h-4 w-4" />
              创建工单
            </button>
          </div>
        </div>

        {/* 统计卡片 - 仅列表视图显示 */}
        {viewMode === "list" && (
          <div className="mb-6 grid grid-cols-4 gap-4">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.key} className="rounded-lg border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg p-2.5 ${card.bg}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <span className="text-3xl font-bold text-steel-900">{counts[card.key] ?? 0}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-steel-600">{card.label}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* 筛选栏 */}
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
            <input
              type="text"
              placeholder="搜索工单号、品牌、型号、负责人..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-steel-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
            className="rounded-lg border border-steel-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
          >
            <option value="">全部状态</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-lg border border-steel-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
          >
            <option value="">全部品牌</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* 归档视图专属筛选 */}
          {viewMode === "archive" && (
            <>
              <select
                value={riskSignedFilter}
                onChange={(e) => setRiskSignedFilter(e.target.value as "all" | "yes" | "no")}
                className="rounded-lg border border-steel-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
              >
                <option value="all">风险确认：全部</option>
                <option value="yes">✅ 已签风险</option>
                <option value="no">❌ 未签风险</option>
              </select>
              <select
                value={hasScreenshotsFilter}
                onChange={(e) => setHasScreenshotsFilter(e.target.value as "all" | "yes" | "no")}
                className="rounded-lg border border-steel-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
              >
                <option value="all">结案截图：全部</option>
                <option value="yes">✅ 已传截图</option>
                <option value="no">❌ 未传截图</option>
              </select>
            </>
          )}

          {(statusFilter || brandFilter || search || riskSignedFilter !== "all" || hasScreenshotsFilter !== "all") && (
            <button
              onClick={() => {
                setStatusFilter("")
                setBrandFilter("")
                setSearch("")
                setRiskSignedFilter("all")
                setHasScreenshotsFilter("all")
              }}
              className="inline-flex items-center gap-1 px-3 py-2.5 text-sm text-steel-500 hover:text-steel-700 transition"
            >
              <X className="w-3.5 h-3.5" />
              清除筛选
            </button>
          )}
        </div>

        {/* 表格 */}
        <div className="overflow-hidden rounded-xl border border-steel-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-steel-200 bg-steel-800/5">
                <th className="px-5 py-3.5 text-left font-semibold text-steel-800">工单号</th>
                <th className="px-5 py-3.5 text-left font-semibold text-steel-800">品牌/型号</th>
                <th className="px-5 py-3.5 text-left font-semibold text-steel-800">锁定类型</th>
                <th className="px-5 py-3.5 text-left font-semibold text-steel-800">状态</th>
                {viewMode === "archive" && (
                  <>
                    <th className="px-5 py-3.5 text-left font-semibold text-steel-800">当前环节</th>
                    <th className="px-5 py-3.5 text-center font-semibold text-steel-800">
                      <ShieldCheck className="w-4 h-4 inline mr-1" />
                      风险确认
                    </th>
                    <th className="px-5 py-3.5 text-center font-semibold text-steel-800">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      结案截图
                    </th>
                  </>
                )}
                <th className="px-5 py-3.5 text-left font-semibold text-steel-800">负责人</th>
                <th className="px-5 py-3.5 text-left font-semibold text-steel-800">创建时间</th>
                <th className="px-5 py-3.5 text-left font-semibold text-steel-800">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const stagePath = getCurrentStagePath(order)
                const stageLabel = getCurrentStageLabel(order)
                return (
                  <tr key={order.id} className="border-b border-steel-100 transition hover:bg-steel-50/50">
                    <td className="px-5 py-3.5 font-mono text-sm text-steel-900 font-semibold">{order.orderNo}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-steel-400" />
                        <span className="text-steel-800">{order.brand} {order.model}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-steel-600">{LOCK_TYPE_LABELS[order.lockType]}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    {viewMode === "archive" && (
                      <>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            stageLabel === "已结案"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-steel-100 text-steel-700 border border-steel-200"
                          }`}>
                            {stageLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {order.riskConfirm.confirmedAt ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                              <CheckCircle2 className="w-4 h-4" />
                              已签署
                              <span className="text-steel-400 font-normal ml-1">
                                {new Date(order.riskConfirm.confirmedAt).toLocaleDateString("zh-CN")}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-steel-400 text-xs">
                              <AlertTriangle className="w-4 h-4" />
                              待确认
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {order.archive.successScreenshots.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                              <ImageIcon className="w-4 h-4" />
                              {order.archive.successScreenshots.length} 张
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-steel-400 text-xs">
                              <ImageIcon className="w-4 h-4" />
                              未上传
                            </span>
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-5 py-3.5 text-steel-600">{order.assignee || "—"}</td>
                    <td className="px-5 py-3.5 text-steel-500">
                      {new Date(order.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {viewMode === "archive" ? (
                          <Link
                            to={stagePath}
                            className="inline-flex items-center gap-1 text-amber hover:text-amber-500 text-sm font-medium hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            跳转{stageLabel}
                          </Link>
                        ) : (
                          <Link
                            to={`/verify/${order.id}`}
                            className="text-amber hover:text-amber-500 text-sm font-medium hover:underline"
                          >
                            查看详情
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={viewMode === "archive" ? 10 : 7}
                    className="px-5 py-16 text-center text-steel-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Filter className="w-10 h-10 text-steel-300" />
                      <p>暂无匹配工单</p>
                      <p className="text-xs">尝试调整筛选条件</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 筛选结果统计 */}
        <div className="mt-4 text-sm text-steel-500 flex items-center justify-between">
          <span>共 <span className="font-semibold text-steel-800">{filtered.length}</span> 条工单</span>
          {viewMode === "archive" && (
            <span>
              归档视图：按风险确认状态、结案截图上传情况进行质检流转
            </span>
          )}
        </div>
      </div>

      {/* 创建工单模态框 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-steel-900">创建工单</h2>

            <div className="mt-5 space-y-5">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-steel-800">设备信息</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-steel-500">品牌</label>
                    <select
                      value={form.brand}
                      onChange={(e) => updateForm("brand", e.target.value)}
                      className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
                    >
                      <option value="">请选择</option>
                      {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-steel-500">型号</label>
                    <input
                      value={form.model}
                      onChange={(e) => updateForm("model", e.target.value)}
                      className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
                      placeholder="如 Mate 60 Pro"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-steel-500">系统版本</label>
                    <input
                      value={form.systemVersion}
                      onChange={(e) => updateForm("systemVersion", e.target.value)}
                      className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
                      placeholder="如 HarmonyOS 4.0"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-steel-500">锁定类型</label>
                    <select
                      value={form.lockType}
                      onChange={(e) => updateForm("lockType", e.target.value as LockType)}
                      className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
                    >
                      {Object.entries(LOCK_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-steel-800">客户信息</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-steel-500">客户需求</label>
                    <textarea
                      value={form.customerRequest}
                      onChange={(e) => updateForm("customerRequest", e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800 resize-none"
                      placeholder="请描述客户的解锁需求..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="keepData"
                      checked={form.keepData}
                      onChange={(e) => updateForm("keepData", e.target.checked)}
                      className="h-4 w-4 rounded border-steel-300 text-steel-800 focus:ring-steel-700"
                    />
                    <label htmlFor="keepData" className="text-sm text-steel-700">保留数据</label>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-steel-500">授权凭证</label>
                    <input
                      value={form.authCredential}
                      onChange={(e) => updateForm("authCredential", e.target.value)}
                      className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm outline-none focus:border-steel-800 focus:ring-1 focus:ring-steel-800"
                      placeholder="如 购机发票、账号验证等"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-steel-200 px-4 py-2 text-sm text-steel-600 hover:bg-steel-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.brand || !form.model || !form.customerRequest}
                className="rounded-lg bg-amber px-5 py-2 text-sm font-medium text-white transition hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber"
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
