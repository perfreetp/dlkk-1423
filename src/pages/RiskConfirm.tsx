import { useRef, useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { ShieldAlert, Database, Lock, Smartphone, PenLine, CheckCircle, AlertCircle, Trash2 } from "lucide-react"
import type { RiskConfirmItem } from "@/types"
import { STATUS_LABELS, STATUS_COLORS, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"

const RISK_TYPE_ICONS: Record<string, React.ReactNode> = {
  data_clear: <Database className="w-5 h-5" />,
  account_limit: <Lock className="w-5 h-5" />,
  brick_risk: <ShieldAlert className="w-5 h-5" />,
  charge_standard: <Smartphone className="w-5 h-5" />,
}

function RiskCard({
  item,
  orderId,
  disabled,
}: {
  item: RiskConfirmItem
  orderId: string
  disabled: boolean
}) {
  const updateRiskItem = useOrderStore((s) => s.updateRiskItem)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            {RISK_TYPE_ICONS[item.type] ?? <ShieldAlert className="w-5 h-5" />}
          </div>
          <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${RISK_LEVEL_COLORS[item.riskLevel]}`}>
          {RISK_LEVEL_LABELS[item.riskLevel]}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={item.confirmed}
          disabled={disabled}
          onChange={(e) => updateRiskItem(orderId, item.id, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">已告知客户并确认</span>
      </label>
    </div>
  )
}

function SignatureCanvas({
  onConfirm,
  disabled,
}: {
  onConfirm: (dataUrl: string) => void
  disabled: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext("2d")
  }, [])

  useEffect(() => {
    const ctx = getCtx()
    if (!ctx) return
    const canvas = canvasRef.current!
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [getCtx])

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return
    e.preventDefault()
    drawingRef.current = true
    const ctx = getCtx()
    if (!ctx) return
    const pos = getPosition(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current || disabled) return
    e.preventDefault()
    const ctx = getCtx()
    if (!ctx) return
    const pos = getPosition(e)
    ctx.lineWidth = 2
    ctx.strokeStyle = "#000000"
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    drawingRef.current = false
  }

  const clearSignature = () => {
    const ctx = getCtx()
    if (!ctx) return
    const canvas = canvasRef.current!
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleConfirm = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL("image/png")
    onConfirm(dataUrl)
  }

  const isCanvasBlank = () => {
    const canvas = canvasRef.current
    if (!canvas) return true
    const ctx = canvas.getContext("2d")!
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    for (let i = 0; i < pixelData.length; i += 4) {
      if (pixelData[i] !== 255 || pixelData[i + 1] !== 255 || pixelData[i + 2] !== 255) {
        return false
      }
    }
    return true
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <PenLine className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">客户签名确认</h2>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="signature-canvas w-full border border-gray-300 rounded-lg cursor-crosshair touch-none"
        style={{ background: "#ffffff" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={clearSignature}
          disabled={disabled}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          清除签名
        </button>
        <button
          onClick={handleConfirm}
          disabled={disabled}
          className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          确认签署
        </button>
      </div>
    </div>
  )
}

export default function RiskConfirm() {
  const { orderId } = useParams<{ orderId: string }>()
  const getOrder = useOrderStore((s) => s.getOrder)
  const confirmRisk = useOrderStore((s) => s.confirmRisk)
  const [confirmed, setConfirmed] = useState(false)

  const order = orderId ? getOrder(orderId) : undefined

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

  const riskConfirm = order.riskConfirm
  const allConfirmed = riskConfirm.items.every((item) => item.confirmed)
  const isAlreadyConfirmed = !!riskConfirm.confirmedAt

  const handleConfirmRisk = (signatureDataUrl: string) => {
    confirmRisk(orderId, signatureDataUrl)
    setConfirmed(true)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">风险确认</h1>
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

      <div className="space-y-4">
        {riskConfirm.items.map((item) => (
          <RiskCard
            key={item.id}
            item={item}
            orderId={orderId}
            disabled={isAlreadyConfirmed}
          />
        ))}
      </div>

      {isAlreadyConfirmed ? (
        <div className="bg-white rounded-xl border border-green-200 p-5 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-base font-semibold text-green-700">已确认</p>
            <p className="text-sm text-gray-500">
              确认时间：{new Date(riskConfirm.confirmedAt!).toLocaleString("zh-CN")}
            </p>
          </div>
        </div>
      ) : allConfirmed ? (
        <SignatureCanvas onConfirm={handleConfirmRisk} disabled={false} />
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">请确认所有风险项后再进行签名确认</p>
        </div>
      )}
    </div>
  )
}
