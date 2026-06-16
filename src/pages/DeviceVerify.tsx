import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ShieldCheck, Smartphone, CheckCircle, AlertCircle, Camera, Lock, Unlock, FileText } from "lucide-react"
import type { DeviceVerify as DeviceVerifyType, AccountStatus, BLStatus, BLDifficulty, WarrantyStatus } from "@/types"
import { STATUS_LABELS, STATUS_COLORS } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"

const ACCOUNT_STATUS_OPTIONS: { value: AccountStatus; label: string }[] = [
  { value: "locked", label: "已锁定" },
  { value: "unlocked", label: "已解锁" },
  { value: "frp_locked", label: "FRP锁定" },
  { value: "unknown", label: "未知" },
]

const BL_STATUS_OPTIONS: { value: BLStatus; label: string }[] = [
  { value: "locked", label: "已锁定" },
  { value: "unlocked", label: "已解锁" },
  { value: "unlockable", label: "可解锁" },
  { value: "unknown", label: "未知" },
]

const BL_DIFFICULTY_OPTIONS: { value: BLDifficulty; label: string }[] = [
  { value: "easy", label: "简单" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困难" },
  { value: "unknown", label: "未知" },
]

const WARRANTY_STATUS_OPTIONS: { value: WarrantyStatus; label: string }[] = [
  { value: "in_warranty", label: "保修期内" },
  { value: "out_of_warranty", label: "已过保修" },
  { value: "unknown", label: "未知" },
]

function isValidIMEI(value: string) {
  return /^\d{15}$/.test(value)
}

export default function DeviceVerify() {
  const { orderId } = useParams<{ orderId: string }>()
  const getOrder = useOrderStore((s) => s.getOrder)
  const updateVerify = useOrderStore((s) => s.updateVerify)
  const order = orderId ? getOrder(orderId) : undefined

  const [form, setForm] = useState<DeviceVerifyType>(
    order?.verify ?? {
      imei1: "",
      imei2: "",
      accountStatus: "unknown",
      accountInfo: "",
      blStatus: "unknown",
      blDifficulty: "unknown",
      warrantyStatus: "unknown",
      warrantyNote: "",
      photos: [],
    }
  )

  if (!orderId || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <p className="text-lg text-gray-600">未找到对应工单，请返回工单大厅选择工单</p>
        <Link
          to="/"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回工单大厅
        </Link>
      </div>
    )
  }

  const handleSave = () => {
    updateVerify(orderId, form)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">设备核验</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">工单编号</p>
          <p className="text-lg font-semibold text-gray-900">{order.orderNo}</p>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm text-gray-500">设备型号</p>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gray-500" />
            <p className="text-lg font-semibold text-gray-900">{order.brand} {order.model}</p>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-sm text-gray-500">工单状态</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">IMEI 信息</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IMEI1</label>
            <div className="relative">
              <input
                type="text"
                value={form.imei1}
                onChange={(e) => setForm({ ...form, imei1: e.target.value.replace(/\D/g, "").slice(0, 15) })}
                placeholder="请输入15位IMEI号码"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              {form.imei1 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidIMEI(form.imei1) ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IMEI2</label>
            <div className="relative">
              <input
                type="text"
                value={form.imei2}
                onChange={(e) => setForm({ ...form, imei2: e.target.value.replace(/\D/g, "").slice(0, 15) })}
                placeholder="双卡设备请输入（选填）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              {form.imei2 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidIMEI(form.imei2) ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">账号状态</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">账号锁定状态</label>
            <select
              value={form.accountStatus}
              onChange={(e) => setForm({ ...form, accountStatus: e.target.value as AccountStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {ACCOUNT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">账号信息</label>
            <input
              type="text"
              value={form.accountInfo}
              onChange={(e) => setForm({ ...form, accountInfo: e.target.value })}
              placeholder="关联账号信息"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Unlock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">BL 状态</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BL锁定状态</label>
            <select
              value={form.blStatus}
              onChange={(e) => setForm({ ...form, blStatus: e.target.value as BLStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {BL_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">解锁难度</label>
            <select
              value={form.blDifficulty}
              onChange={(e) => setForm({ ...form, blDifficulty: e.target.value as BLDifficulty })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {BL_DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">保修状态</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">保修情况</label>
          <select
            value={form.warrantyStatus}
            onChange={(e) => setForm({ ...form, warrantyStatus: e.target.value as WarrantyStatus })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {WARRANTY_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">保修备注</label>
          <textarea
            value={form.warrantyNote}
            onChange={(e) => setForm({ ...form, warrantyNote: e.target.value })}
            placeholder="请输入保修相关备注信息"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">外观照片</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-sm">点击上传</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        保存核验信息
      </button>
    </div>
  )
}
