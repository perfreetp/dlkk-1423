import { useRef, useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { ShieldAlert, Database, Lock, Smartphone, PenLine, CheckCircle, AlertTriangle, Trash2 } from "lucide-react"
import type { RiskConfirmItem } from "@/types"
import { STATUS_LABELS, STATUS_COLORS, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"
import OrderPicker from "@/components/OrderPicker"

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
    <div className="bg-white rounded-xl border border-steel-200 p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-steel-100 text-steel-700 flex items-center justify-center">
            {RISK_TYPE_ICONS[item.type] ?? <ShieldAlert className="w-5 h-5" />}
          </div>
          <h3 className="text-base font-semibold text-steel-900">{item.title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${RISK_LEVEL_COLORS[item.riskLevel]}`}>
          {RISK_LEVEL_LABELS[item.riskLevel]}
        </span>
      </div>
      <p className="text-sm text-steel-600 leading-relaxed">{item.description}</p>
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={item.confirmed}
          disabled={disabled}
          onChange={(e) => updateRiskItem(orderId, item.id, e.target.checked)}
          className="w-4 h-4 rounded border-steel-300 text-steel-800 focus:ring-steel-700 disabled:opacity-50"
        />
        <span className={`text-sm font-medium ${disabled ? "text-steel-400" : "text-steel-700"}`}>
          已告知客户并获得确认
        </span>
      </label>
    </div>
  )
}

function SignatureCanvas({
  onConfirm,
  disabled,
  existingSignature,
}: {
  onConfirm: (dataUrl: string) => void
  disabled: boolean
  existingSignature?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const [showExisting, setShowExisting] = useState(!!existingSignature)

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

    if (existingSignature && showExisting) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = existingSignature
    }
  }, [getCtx, existingSignature, showExisting])

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
    if (showExisting) setShowExisting(false)
    drawingRef.current = true
    const ctx = getCtx()
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
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
    ctx.lineWidth = 2.5
    ctx.strokeStyle = "#1B2A4A"
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
    <div className="bg-white rounded-xl border border-steel-200 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-steel-700" />
          <h2 className="text-lg font-semibold text-steel-900">客户签名确认</h2>
        </div>
        {existingSignature && (
          <button
            type="button"
            onClick={() => setShowExisting(!showExisting)}
            className="text-xs text-steel-500 hover:text-steel-700 underline underline-offset-2"
          >
            {showExisting ? "重新签署" : "查看已有签名"}
          </button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="signature-canvas w-full border border-steel-300 rounded-lg cursor-crosshair touch-none"
        style={{ background: "#ffffff" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={clearSignature}
          disabled={disabled}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-steel-600 bg-steel-100 rounded-lg hover:bg-steel-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          清除签名
        </button>
        <button
          onClick={handleConfirm}
          disabled={disabled || isCanvasBlank()}
          className="flex items-center gap-1.5 px-6 py-2 text-sm font-medium text-white bg-steel-800 rounded-lg hover:bg-steel-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          确认签署
        </button>
        {isCanvasBlank() && !disabled && (
          <p className="text-xs text-steel-400 ml-auto">请先在画布上签名后再确认</p>
        )}
      </div>
    </div>
  )
}

export default function RiskConfirm() {
  const { orderId } = useParams<{ orderId: string }>()
  const orders = useOrderStore((s) => s.orders)
  const confirmRisk = useOrderStore((s) => s.confirmRisk)
  const order = orderId ? orders.find((o) => o.id === orderId) : undefined

  const [justConfirmed, setJustConfirmed] = useState(false)

  if (!orderId || !order) {
    return (
      <OrderPicker
        title="风险确认"
        description="请先选择工单，向客户逐条确认数据清除、账号限制、变砖可能和收费标准等风险项"
        routePrefix="/risk"
      />
    )
  }

  const riskConfirm = order.riskConfirm
  const allConfirmed = riskConfirm.items.every((item) => item.confirmed)
  const isAlreadyConfirmed = !!riskConfirm.confirmedAt

  const handleConfirmRisk = (signatureDataUrl: string) => {
    confirmRisk(orderId, signatureDataUrl)
    setJustConfirmed(true)
  }

  const confirmedCount = riskConfirm.items.filter((i) => i.confirmed).length
  const totalCount = riskConfirm.items.length

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-steel-700" />
          <div>
            <h1 className="text-2xl font-bold text-steel-900">风险确认</h1>
            <p className="text-sm text-steel-500 mt-0.5">逐条告知客户风险内容并获得签名确认</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link
            to={`/tasks/${order.id}`}
            className="text-steel-500 hover:text-steel-700 underline underline-offset-2"
          >
            ← 返回操作任务
          </Link>
          <Link
            to="/"
            className="text-steel-500 hover:text-steel-700 underline underline-offset-2"
          >
            工单大厅
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-steel-200 p-5 flex items-center justify-between shadow-sm">
        <div className="space-y-1">
          <p className="text-xs text-steel-500 font-medium">工单编号</p>
          <p className="font-mono text-lg font-semibold text-steel-900">{order.orderNo}</p>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-xs text-steel-500 font-medium">设备型号</p>
          <div className="flex items-center gap-2 justify-center">
            <Smartphone className="w-4 h-4 text-steel-500" />
            <p className="text-lg font-semibold text-steel-900">{order.brand} {order.model}</p>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-xs text-steel-500 font-medium">工单状态</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-steel-50 border border-steel-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-steel-700">风险项确认进度</span>
          <span className="text-sm font-mono font-semibold text-steel-800">{confirmedCount}/{totalCount}</span>
        </div>
        <div className="h-2 rounded-full bg-white overflow-hidden border border-steel-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-steel-700 transition-all duration-500"
            style={{ width: `${(confirmedCount / totalCount) * 100}%` }}
          />
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

      {isAlreadyConfirmed || justConfirmed ? (
        <div className="bg-white rounded-xl border border-green-200 p-5 flex items-start gap-4">
          <CheckCircle className="w-8 h-8 text-status-success flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-base font-semibold text-green-700">风险确认已完成</p>
              <p className="text-sm text-steel-500 mt-1">
                确认时间：{new Date(riskConfirm.confirmedAt!).toLocaleString("zh-CN")}
              </p>
            </div>
            {riskConfirm.customerSignature && (
              <div className="border border-steel-200 rounded-lg p-2 bg-steel-50 inline-block">
                <img
                  src={riskConfirm.customerSignature}
                  alt="客户签名"
                  className="max-h-28 rounded"
                />
              </div>
            )}
          </div>
          <Link
            to={`/archive/${order.id}`}
            className="px-5 py-2.5 bg-steel-800 text-white font-medium rounded-xl hover:bg-steel-900 transition-colors text-sm"
          >
            进入结案档案 →
          </Link>
        </div>
      ) : allConfirmed ? (
        <SignatureCanvas
          onConfirm={handleConfirmRisk}
          disabled={false}
          existingSignature={riskConfirm.customerSignature}
        />
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">请先完成所有风险项确认</p>
            <p className="text-xs text-amber-600 mt-1">勾选每一项后即可进行客户签名确认</p>
          </div>
        </div>
      )}
    </div>
  )
}
