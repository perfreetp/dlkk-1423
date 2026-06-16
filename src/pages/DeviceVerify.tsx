import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ShieldCheck, Smartphone, CheckCircle, AlertCircle, Camera, Lock, Unlock, FileText, X, Upload } from "lucide-react"
import type { DeviceVerify as DeviceVerifyType, AccountStatus, BLStatus, BLDifficulty, WarrantyStatus } from "@/types"
import { STATUS_LABELS, STATUS_COLORS } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"
import OrderPicker from "@/components/OrderPicker"

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

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function DeviceVerify() {
  const { orderId } = useParams<{ orderId: string }>()
  const orders = useOrderStore((s) => s.orders)
  const updateVerify = useOrderStore((s) => s.updateVerify)
  const order = orderId ? orders.find((o) => o.id === orderId) : undefined
  const navigate = useNavigate()

  const [form, setForm] = useState<DeviceVerifyType | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (order) {
      setForm({ ...order.verify })
    }
  }, [order?.id, orders.length])

  if (!orderId || !order) {
    return (
      <OrderPicker
        title="设备核验"
        description="请先选择要核验的工单，录入设备 IMEI、账号状态、BL状态、保修状态和外观照片"
        routePrefix="/verify"
      />
    )
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-steel-500">
          <div className="w-5 h-5 border-2 border-steel-400 border-t-transparent rounded-full animate-spin" />
          加载中...
        </div>
      </div>
    )
  }

  const handleSave = () => {
    updateVerify(orderId, form)
    navigate(`/tasks/${orderId}`, { replace: true })
  }

  const handlePhotoUpload = async (files: FileList) => {
    const photos: string[] = []
    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await fileToDataURL(files[i])
        photos.push(dataUrl)
      } catch {
          // ignore
        }
    }
    const nextPhotos = [...form.photos, ...photos]
    const updated = { ...form, photos: nextPhotos }
    setForm(updated)
    updateVerify(orderId, updated)
  }

  const removePhoto = (index: number) => {
    const photos = [...form.photos]
    photos.splice(index, 1)
    const updated = { ...form, photos }
    setForm(updated)
    updateVerify(orderId, updated)
  }

  const totalSlots = 6

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-steel-700" />
          <div>
            <h1 className="text-2xl font-bold text-steel-900">设备核验</h1>
            <p className="text-sm text-steel-500 mt-0.5">请仔细核对设备信息，确保核验数据完整准确</p>
          </div>
        </div>
        <Link
          to="/"
          className="text-sm text-steel-500 hover:text-steel-700 underline underline-offset-2"
        >
          ← 返回工单大厅
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-steel-200 p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-steel-500">工单编号</p>
          <p className="text-lg font-semibold text-steel-900 font-mono">{order.orderNo}</p>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm text-steel-500">设备型号</p>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-steel-500" />
            <p className="text-lg font-semibold text-steel-900">{order.brand} {order.model}</p>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-sm text-steel-500">工单状态</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-steel-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-steel-700" />
          <h2 className="text-lg font-semibold text-steel-900">IMEI 信息</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">IMEI1</label>
            <div className="relative">
              <input
                type="text"
                value={form.imei1}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 15)
                  setForm({ ...form, imei1: v })
                  updateVerify(orderId, { imei1: v })
                }}
                placeholder="请输入15位IMEI号码"
                className="w-full px-3 py-2 border border-steel-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-700 pr-10 bg-white"
              />
              {form.imei1 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidIMEI(form.imei1) ? (
                    <CheckCircle className="w-5 h-5 text-status-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-status-danger" />
                  )}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">IMEI2</label>
            <div className="relative">
              <input
                type="text"
                value={form.imei2}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 15)
                  setForm({ ...form, imei2: v })
                  updateVerify(orderId, { imei2: v })
                }}
                placeholder="双卡设备请输入（选填）"
                className="w-full px-3 py-2 border border-steel-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-700 pr-10 bg-white"
              />
              {form.imei2 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidIMEI(form.imei2) ? (
                    <CheckCircle className="w-5 h-5 text-status-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-status-danger" />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-steel-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-steel-700" />
          <h2 className="text-lg font-semibold text-steel-900">账号状态</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">账号锁定状态</label>
            <select
              value={form.accountStatus}
              onChange={(e) => {
                const v = e.target.value as AccountStatus
                setForm({ ...form, accountStatus: v })
                updateVerify(orderId, { accountStatus: v })
              }}
              className="w-full px-3 py-2 border border-steel-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-700 bg-white"
            >
              {ACCOUNT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">账号信息</label>
            <input
              type="text"
              value={form.accountInfo}
              onChange={(e) => {
                const v = e.target.value
                setForm({ ...form, accountInfo: v })
                updateVerify(orderId, { accountInfo: v })
              }}
              placeholder="关联账号信息"
              className="w-full px-3 py-2 border border-steel-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-700 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-steel-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Unlock className="w-5 h-5 text-steel-700" />
          <h2 className="text-lg font-semibold text-steel-900">BL 状态</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">BL锁定状态</label>
            <select
              value={form.blStatus}
              onChange={(e) => {
                const v = e.target.value as BLStatus
                setForm({ ...form, blStatus: v })
                updateVerify(orderId, { blStatus: v })
              }}
              className="w-full px-3 py-2 border border-steel-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-700 bg-white"
            >
              {BL_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">解锁难度</label>
            <select
              value={form.blDifficulty}
              onChange={(e) => {
                const v = e.target.value as BLDifficulty
                setForm({ ...form, blDifficulty: v })
                updateVerify(orderId, { blDifficulty: v })
              }}
              className="w-full px-3 py-2 border border-steel-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-700 bg-white"
            >
              {BL_DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-steel-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-steel-700" />
          <h2 className="text-lg font-semibold text-steel-900">保修状态</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-steel-700 mb-1">保修情况</label>
          <select
            value={form.warrantyStatus}
            onChange={(e) => {
              const v = e.target.value as WarrantyStatus
              setForm({ ...form, warrantyStatus: v })
              updateVerify(orderId, { warrantyStatus: v })
            }}
            className="w-full px-3 py-2 border border-steel-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-700 bg-white"
          >
            {WARRANTY_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-steel-700 mb-1">保修备注</label>
          <textarea
            value={form.warrantyNote}
            onChange={(e) => {
              const v = e.target.value
              setForm({ ...form, warrantyNote: v })
              updateVerify(orderId, { warrantyNote: v })
            }}
            placeholder="请输入保修相关备注信息"
            rows={3}
            className="w-full px-3 py-2 border border-steel-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-700 resize-none bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-steel-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-steel-700" />
            <h2 className="text-lg font-semibold text-steel-900">外观照片</h2>
            <span className="text-sm text-steel-500 ml-2">（共 {form.photos.length} 张）</span>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber text-white rounded-lg hover:bg-amber-500 transition text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              上传照片
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {form.photos.map((src, i) => (
            <div
              key={`p-${i}`}
              className="aspect-square rounded-lg border border-steel-200 bg-white relative overflow-hidden group"
            >
              <img src={src} alt={`外观照片${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removePhoto(i)}
                  className="p-2 rounded-full bg-red-500 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: Math.max(1, 6 - form.photos.length) }).map((_, i) => (
            <label
              key={`slot-${i}`}
              className="aspect-square border-2 border-dashed border-steel-300 rounded-lg flex flex-col items-center justify-center text-steel-400 hover:border-amber-500 hover:text-amber-600 transition-colors cursor-pointer bg-white"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
              />
              <Camera className="w-7 h-7 mb-1" />
              <span className="text-sm">点击上传</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-steel-800 text-white font-semibold rounded-xl hover:bg-steel-900 transition-colors shadow-sm"
      >
        保存核验信息并进入操作任务
      </button>
    </div>
  )
}
