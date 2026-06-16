import { useRef } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Archive,
  Cpu,
  ImagePlus,
  CheckCircle2,
  XCircle,
  CreditCard,
  ShieldCheck,
  BarChart3,
  AlertTriangle,
  FileCheck,
  X,
  ArrowLeft,
  Home,
  Smartphone,
  PenLine,
  Clock,
  Lock,
  Edit3,
} from "lucide-react"
import type { ArchiveData, TestItem } from "@/types"
import { STATUS_LABELS, STATUS_COLORS } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"
import OrderPicker from "@/components/OrderPicker"

const PAYMENT_OPTIONS = [
  { value: "现金", label: "现金" },
  { value: "微信支付", label: "微信支付" },
  { value: "支付宝", label: "支付宝" },
  { value: "银行卡", label: "银行卡" },
]

const fileToDataURL = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(f)
  })

export default function CaseArchive() {
  const { orderId } = useParams<{ orderId: string }>()
  const orders = useOrderStore((s) => s.orders)
  const order = orderId ? orders.find((o) => o.id === orderId) : undefined

  if (!orderId || !order) {
    return (
      <OrderPicker
        title="结案档案"
        description="请先选择要结案归档的工单，录入刷机记录、成功截图、检测项目、收费记录和质保信息"
        routePrefix="/archive"
      />
    )
  }

  return <ArchiveView orderId={orderId} order={order} />
}

function ArchiveView({ orderId, order }: { orderId: string; order: ReturnType<typeof useOrderStore.getState>["orders"][number] }) {
  const updateArchive = useOrderStore((s) => s.updateArchive)
  const finalizeArchive = useOrderStore((s) => s.finalizeArchive)
  const getBrandStats = useOrderStore((s) => s.getBrandStats)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const archive = order.archive
  const risk = order.riskConfirm
  const isFinalized = !!archive.completedAt
  const brandStats = getBrandStats()

  const updateField = <K extends keyof ArchiveData>(key: K, value: ArchiveData[K]) => {
    if (isFinalized) return
    updateArchive(orderId, { [key]: value })
  }

  const toggleTestItem = (index: number) => {
    if (isFinalized) return
    const items = [...archive.testItems]
    items[index] = { ...items[index], passed: !items[index].passed }
    updateField("testItems", items)
  }

  const handleScreenshotUpload = async (files: FileList) => {
    if (isFinalized) return
    const newShots: string[] = []
    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await fileToDataURL(files[i])
        newShots.push(dataUrl)
      } catch {
        // ignore
      }
    }
    const next = [...archive.successScreenshots, ...newShots]
    updateField("successScreenshots", next)
  }

  const removeScreenshot = (index: number) => {
    if (isFinalized) return
    const next = [...archive.successScreenshots]
    next.splice(index, 1)
    updateField("successScreenshots", next)
  }

  const handleFinalize = () => {
    if (isFinalized) return
    finalizeArchive(orderId)
  }

  const allTestsPassed = archive.testItems.length > 0 && archive.testItems.every((t) => t.passed)
  const totalSlots = 6

  const inputCls =
    "w-full rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm text-steel-800 placeholder-steel-400 focus:border-steel-700 focus:outline-none focus:ring-1 focus:ring-steel-700 disabled:bg-steel-50 disabled:text-steel-400 disabled:cursor-not-allowed"
  const labelCls = "block text-sm font-semibold text-steel-700 mb-1.5"

  const riskConfirmedAt = risk.confirmedAt
    ? new Date(risk.confirmedAt).toLocaleString("zh-CN")
    : "未完成"

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Archive className="h-7 w-7 text-steel-700" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-steel-900">结案档案</h1>
              {isFinalized ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold border border-green-300">
                  <Lock className="w-3.5 h-3.5" />
                  已结案 · 不可编辑
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold border border-amber-300">
                  <Edit3 className="w-3.5 h-3.5" />
                  草稿状态 · 编辑中
                </span>
              )}
            </div>
            <p className="text-sm text-steel-500 mt-0.5">
              {isFinalized
                ? "此工单已完成结案归档，所有内容已锁定"
                : "请完整填写归档信息，确认无误后点击「完成结案归档」锁定"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/risk/${order.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-steel-600 hover:text-steel-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            返回风险确认
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-steel-600 hover:text-steel-800 transition"
          >
            <Home className="w-4 h-4" />
            工单大厅
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-steel-200 bg-white p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <p className="text-sm text-steel-500">工单编号</p>
            <p className="text-lg font-semibold text-steel-900 font-mono">{order.orderNo}</p>
          </div>
          <div className="w-px h-10 bg-steel-200 mx-2" />
          <div className="space-y-1">
            <p className="text-sm text-steel-500">设备型号</p>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-steel-500" />
              <p className="text-lg font-semibold text-steel-900">{order.brand} {order.model}</p>
            </div>
          </div>
        </div>
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* 风险确认信息卡 - Feature 3 */}
      <div className={`rounded-xl border p-5 mb-6 ${
        risk.confirmedAt
          ? "bg-green-50/50 border-green-200"
          : "bg-amber-50/50 border-amber-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              risk.confirmedAt ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {risk.confirmedAt ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-semibold text-steel-900">风险确认状态</p>
              <p className="text-sm text-steel-500 mt-0.5">
                {risk.confirmedAt
                  ? `客户已完成风险确认 · 确认时间：${riskConfirmedAt}`
                  : "尚未完成风险确认，请先在风险确认页获得客户签名"}
              </p>
            </div>
          </div>
          {risk.customerSignature && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium text-steel-500 mb-1">客户签名</p>
                <div className="border border-steel-300 rounded-lg p-1.5 bg-white shadow-sm">
                  <img
                    src={risk.customerSignature}
                    alt="客户签名"
                    className="h-12 object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-2/3 space-y-6">
          {/* 刷机记录 */}
          <div className="rounded-xl border border-steel-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-steel-700" />
                <h2 className="text-lg font-semibold text-steel-900">刷机记录</h2>
              </div>
              {!isFinalized && (
                <span className="text-xs text-steel-400">草稿 · 自动保存</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>刷机包版本</label>
                <input
                  type="text"
                  value={archive.flashPackageVersion}
                  onChange={(e) => updateField("flashPackageVersion", e.target.value)}
                  disabled={isFinalized}
                  className={inputCls}
                  placeholder="例：PixelExperience_Plus_14.0_oneplus12"
                />
              </div>
              <div>
                <label className={labelCls}>工具版本</label>
                <input
                  type="text"
                  value={archive.toolVersion}
                  onChange={(e) => updateField("toolVersion", e.target.value)}
                  disabled={isFinalized}
                  className={inputCls}
                  placeholder="例：TWRP 3.7.1 + fastboot"
                />
              </div>
            </div>
          </div>

          {/* 成功截图 */}
          <div className="rounded-xl border border-steel-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-steel-700" />
                <h2 className="text-lg font-semibold text-steel-900">成功截图</h2>
                <span className="text-sm text-steel-500 ml-2">（共 {archive.successScreenshots.length} 张）</span>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleScreenshotUpload(e.target.files)}
                />
                {!isFinalized && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber text-white rounded-lg hover:bg-amber-500 transition text-sm font-medium"
                  >
                    <ImagePlus className="w-4 h-4" />
                    上传截图
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {archive.successScreenshots.map((src, i) => (
                <div
                  key={`s-${i}`}
                  className="aspect-square rounded-lg border border-steel-200 bg-white relative overflow-hidden group"
                >
                  <img src={src} alt={`成功截图${i + 1}`} className="w-full h-full object-cover" />
                  {!isFinalized && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeScreenshot(i)}
                        className="p-2 rounded-full bg-red-500 text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!isFinalized &&
                Array.from({ length: Math.max(1, totalSlots - archive.successScreenshots.length) }).map((_, i) => (
                  <label
                    key={`slot-${i}`}
                    className="aspect-square border-2 border-dashed border-steel-300 rounded-lg flex flex-col items-center justify-center text-steel-400 hover:border-amber-500 hover:text-amber-600 transition-colors cursor-pointer bg-white"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleScreenshotUpload(e.target.files)}
                    />
                    <ImagePlus className="w-8 h-8 mb-1" />
                    <span className="text-sm">点击上传</span>
                  </label>
                ))}
              {isFinalized && archive.successScreenshots.length === 0 && (
                <div className="col-span-3 py-8 text-center text-steel-400 text-sm">
                  未上传截图
                </div>
              )}
            </div>
            {!isFinalized && archive.successScreenshots.length === 0 && (
              <p className="mt-3 text-xs text-steel-400">
                提示：结案前建议至少上传 1 张设备正常运行的成功截图
              </p>
            )}
          </div>

          {/* 检测项目 */}
          <div className="rounded-xl border border-steel-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-steel-700" />
                <h2 className="text-lg font-semibold text-steel-900">检测项目</h2>
                {allTestsPassed && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    全部通过
                  </span>
                )}
              </div>
              {!isFinalized && (
                <span className="text-xs text-steel-400">
                  {archive.testItems.filter((t) => t.passed).length}/{archive.testItems.length} 已通过
                </span>
              )}
            </div>
            <div className="space-y-2">
              {archive.testItems.map((item: TestItem, index: number) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-steel-200 px-4 py-3 bg-steel-50/50"
                >
                  <span className="text-sm font-medium text-steel-800">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isFinalized}
                      onClick={() => {
                        if (!item.passed && !isFinalized) toggleTestItem(index)
                      }}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        item.passed
                          ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                          : "bg-white text-steel-400 ring-1 ring-steel-200 hover:bg-green-50 hover:text-green-600"
                      } disabled:cursor-not-allowed`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      通过
                    </button>
                    <button
                      type="button"
                      disabled={isFinalized}
                      onClick={() => {
                        if (item.passed && !isFinalized) toggleTestItem(index)
                      }}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                        !item.passed
                          ? "bg-red-100 text-red-700 ring-1 ring-red-300"
                          : "bg-white text-steel-400 ring-1 ring-steel-200 hover:bg-red-50 hover:text-red-600"
                      } disabled:cursor-not-allowed`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      未通过
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 收费记录 */}
          <div className="rounded-xl border border-steel-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-steel-700" />
                <h2 className="text-lg font-semibold text-steel-900">收费记录</h2>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>收费金额（元）</label>
                <input
                  type="number"
                  min={0}
                  value={archive.chargeAmount || ""}
                  onChange={(e) =>
                    updateField("chargeAmount", e.target.value ? Number(e.target.value) : 0)
                  }
                  disabled={isFinalized}
                  className={inputCls}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelCls}>支付方式</label>
                <select
                  value={archive.paymentMethod}
                  onChange={(e) => updateField("paymentMethod", e.target.value)}
                  disabled={isFinalized}
                  className={inputCls}
                >
                  <option value="">请选择支付方式</option>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>收据信息</label>
                <input
                  type="text"
                  value={archive.receiptInfo}
                  onChange={(e) => updateField("receiptInfo", e.target.value)}
                  disabled={isFinalized}
                  className={inputCls}
                  placeholder="请输入收据编号或信息"
                />
              </div>
            </div>
          </div>

          {/* 质保信息 */}
          <div className="rounded-xl border border-steel-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-steel-700" />
              <h2 className="text-lg font-semibold text-steel-900">质保信息</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>质保时长（月）</label>
                <input
                  type="number"
                  min={0}
                  value={archive.warrantyMonths || ""}
                  onChange={(e) =>
                    updateField("warrantyMonths", e.target.value ? Number(e.target.value) : 0)
                  }
                  disabled={isFinalized}
                  className={inputCls}
                  placeholder="3"
                />
              </div>
              <div>
                <label className={labelCls}>质保备注</label>
                <textarea
                  value={archive.warrantyNote}
                  onChange={(e) => updateField("warrantyNote", e.target.value)}
                  disabled={isFinalized}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="例：同一问题3个月内免费返修，仅针对本次解锁/刷机操作"
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          {!isFinalized ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-steel-50 border border-steel-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-steel-800">结案前请确认</p>
                    <ul className="text-xs text-steel-600 mt-1.5 space-y-1">
                      <li>• 所有必填项已完整填写</li>
                      <li>• 已至少上传 1 张成功截图</li>
                      <li>• 所有检测项目结果已标记</li>
                      <li>• 点击后内容将锁定，无法再修改</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFinalize}
                disabled={!risk.confirmedAt}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-steel-800 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-steel-900 active:scale-[0.99] disabled:bg-steel-400 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4" />
                {!risk.confirmedAt ? "请先完成风险确认" : "完成结案归档（内容将锁定）"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 px-6 py-4 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <div className="text-center">
                <p>该工单已结案归档</p>
                <p className="text-xs text-green-600 mt-0.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  结案时间：{archive.completedAt && new Date(archive.completedAt).toLocaleString("zh-CN")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 右侧统计栏 */}
        <div className="w-1/3 space-y-6">
          <div className="rounded-xl border border-steel-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-steel-700" />
              <h2 className="text-lg font-semibold text-steel-900">品牌成功率</h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-steel-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-steel-200 bg-steel-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-steel-600">品牌</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-steel-600">工单数</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-steel-600">成功率</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-steel-600">平均耗时</th>
                  </tr>
                </thead>
                <tbody>
                  {brandStats.map((stat) => (
                    <tr key={stat.brand} className="border-b border-steel-100 last:border-0">
                      <td className="px-3 py-2.5 text-steel-800 font-medium">{stat.brand}</td>
                      <td className="px-3 py-2.5 text-steel-600">{stat.totalOrders}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-steel-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-green-500"
                              style={{ width: `${stat.successRate}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              stat.successRate >= 80
                                ? "text-green-600"
                                : stat.successRate >= 50
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}
                          >
                            {stat.successRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right text-steel-600">
                        {stat.avgDurationMinutes > 0 ? `${stat.avgDurationMinutes}分钟` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-steel-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-steel-900">高风险机型</h2>
            </div>
            {brandStats.some((s) => s.highRiskModels.length > 0) ? (
              <div className="space-y-2">
                {brandStats
                  .filter((s) => s.highRiskModels.length > 0)
                  .flatMap((s) =>
                    s.highRiskModels.map((model) => (
                      <div
                        key={model}
                        className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <span className="text-sm text-amber-800 font-medium">{model}</span>
                      </div>
                    ))
                  )}
              </div>
            ) : (
              <p className="text-sm text-steel-400 text-center py-4">暂无高风险机型</p>
            )}
          </div>

          {/* 签名信息卡 */}
          {risk.customerSignature && (
            <div className="rounded-xl border border-steel-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <PenLine className="h-5 w-5 text-steel-700" />
                <h2 className="text-lg font-semibold text-steel-900">客户签名</h2>
              </div>
              <div className="border border-steel-200 rounded-lg p-3 bg-steel-50 flex items-center justify-center">
                <img
                  src={risk.customerSignature}
                  alt="客户签名"
                  className="max-h-24 object-contain"
                />
              </div>
              {risk.confirmedAt && (
                <p className="text-xs text-steel-500 mt-2 text-center">
                  签署时间：{new Date(risk.confirmedAt).toLocaleString("zh-CN")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
