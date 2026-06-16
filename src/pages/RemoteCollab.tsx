import { useState, useRef, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Send,
  ImagePlus,
  Clock,
  ArrowRightLeft,
  AlertTriangle,
  ChevronRight,
  UserCircle,
  Monitor,
  Bot,
} from "lucide-react"
import { STATUS_LABELS, STATUS_COLORS, type CollaborationMessage } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"

const TRANSFER_OPTIONS = [
  { value: "陈博士-远程专家", label: "陈博士-远程专家" },
  { value: "王强-高级技师", label: "王强-高级技师" },
]

function RoleBadge({ role }: { role: string }) {
  if (role === "技师") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
        <UserCircle className="h-3 w-3" />
        技师
      </span>
    )
  }
  if (role === "远程专家") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
        <Monitor className="h-3 w-3" />
        远程专家
      </span>
    )
  }
  if (role === "系统") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
        <Bot className="h-3 w-3" />
        系统
      </span>
    )
  }
  return (
    <span className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
      {role}
    </span>
  )
}

function ChatBubble({ message }: { message: CollaborationMessage }) {
  const isSystem = message.senderRole === "系统"
  const isRemote = message.senderRole === "远程专家"

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <div className="rounded-full bg-gray-100 px-4 py-1.5 text-xs text-gray-500">
          {message.content}
          <span className="ml-2 text-gray-400">
            {new Date(message.timestamp).toLocaleString("zh-CN", {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    )
  }

  const align = isRemote ? "justify-end" : "justify-start"
  const bubbleBg = isRemote
    ? "bg-[#1B2A4A] text-white"
    : "bg-white border border-gray-200 text-gray-800"

  return (
    <div className={`flex ${align} gap-2`}>
      <div className={`max-w-[75%] ${isRemote ? "order-1" : "order-1"}`}>
        <div
          className={`flex items-center gap-2 mb-1 ${isRemote ? "justify-end" : ""}`}
        >
          <span className="text-xs font-medium text-gray-600">
            {message.sender}
          </span>
          <RoleBadge role={message.senderRole} />
        </div>
        <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${bubbleBg}`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <p
          className={`mt-1 text-[10px] text-gray-400 ${isRemote ? "text-right" : ""}`}
        >
          {new Date(message.timestamp).toLocaleString("zh-CN", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}

function MessageBoard({
  orderId,
  messages,
}: {
  orderId: string
  messages: CollaborationMessage[]
}) {
  const [input, setInput] = useState("")
  const addMessage = useOrderStore((s) => s.addMessage)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    addMessage(orderId, {
      sender: "管理员",
      senderRole: "技师",
      content: text,
      type: "text",
    })
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageUpload = () => {
    addMessage(orderId, {
      sender: "系统",
      senderRole: "系统",
      content: "截图已上传",
      type: "system",
    })
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-800">消息记录</h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 px-5 py-4"
        style={{ minHeight: 320, maxHeight: 480 }}
      >
        {messages.length === 0 && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-gray-400">暂无消息</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleImageUpload}
            className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-400 transition hover:border-[#1B2A4A] hover:text-[#1B2A4A]"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none placeholder-gray-400 focus:border-[#1B2A4A] focus:bg-white focus:ring-1 focus:ring-[#1B2A4A]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 rounded-lg bg-[#1B2A4A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2A3D5E] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function CollaborationTools({
  orderId,
  collaboration,
}: {
  orderId: string
  collaboration: {
    messages: CollaborationMessage[]
    transfers: { id: string; from: string; to: string; reason: string; timestamp: string }[]
    timeoutMinutes: number
    lastTimeoutAlert: string | null
  }
}) {
  const [timeoutInput, setTimeoutInput] = useState(String(collaboration.timeoutMinutes))
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [transferTo, setTransferTo] = useState(TRANSFER_OPTIONS[0].value)
  const [transferReason, setTransferReason] = useState("")
  const addTransfer = useOrderStore((s) => s.addTransfer)
  const updateOrder = useOrderStore((s) => s.updateOrder)
  const order = useOrderStore((s) => s.getOrder(orderId))

  const handleTimeoutChange = () => {
    const val = Number(timeoutInput)
    if (val > 0 && order) {
      updateOrder(orderId, {
        collaboration: { ...order.collaboration, timeoutMinutes: val },
      })
    }
  }

  const handleTransferSubmit = () => {
    if (!transferReason.trim()) return
    addTransfer(orderId, {
      from: order?.assignee || "当前技师",
      to: transferTo,
      reason: transferReason.trim(),
    })
    setTransferReason("")
    setShowTransferForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-[#1B2A4A]" />
          <h3 className="text-sm font-semibold text-gray-800">超时设置</h3>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={timeoutInput}
            onChange={(e) => setTimeoutInput(e.target.value)}
            className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]"
          />
          <span className="text-sm text-gray-500">分钟</span>
          <button
            onClick={handleTimeoutChange}
            className="rounded-lg bg-[#1B2A4A] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#2A3D5E]"
          >
            更新
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          当前超时阈值：{collaboration.timeoutMinutes} 分钟
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-[#E8913A]" />
            <h3 className="text-sm font-semibold text-gray-800">疑难转派</h3>
          </div>
          <button
            onClick={() => setShowTransferForm(!showTransferForm)}
            className="flex items-center gap-1 rounded-lg bg-[#E8913A] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#d07e2e]"
          >
            <ArrowRightLeft className="h-3 w-3" />
            疑难转派
          </button>
        </div>

        {showTransferForm && (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                接收人
              </label>
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B2A4A]"
              >
                {TRANSFER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                转派原因
              </label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                rows={3}
                placeholder="请输入转派原因..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A] resize-none"
              />
            </div>
            <button
              onClick={handleTransferSubmit}
              disabled={!transferReason.trim()}
              className="w-full rounded-lg bg-[#E8913A] py-2 text-sm font-medium text-white transition hover:bg-[#d07e2e] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              提交转派
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">转派记录</h3>
        {collaboration.transfers.length === 0 && (
          <p className="text-xs text-gray-400 py-4 text-center">暂无转派记录</p>
        )}
        <div className="space-y-3">
          {collaboration.transfers.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3"
            >
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-medium">{t.from}</span>
                <ChevronRight className="h-3 w-3 text-[#E8913A]" />
                <span className="font-medium text-[#1B2A4A]">{t.to}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{t.reason}</p>
              <p className="mt-1 text-[10px] text-gray-400">
                {new Date(t.timestamp).toLocaleString("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RemoteCollab() {
  const { orderId } = useParams<{ orderId: string }>()
  const getOrder = useOrderStore((s) => s.getOrder)
  const order = orderId ? getOrder(orderId) : undefined

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-gray-300" />
        <p className="text-lg text-gray-500">未找到该工单</p>
        <Link
          to="/"
          className="rounded-lg bg-[#1B2A4A] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#2A3D5E]"
        >
          返回首页
        </Link>
      </div>
    )
  }

  const { collaboration } = order

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {collaboration.lastTimeoutAlert && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 animate-pulse">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            操作超时提醒
          </span>
          <span className="text-xs text-amber-600">
            {new Date(collaboration.lastTimeoutAlert).toLocaleString("zh-CN", {
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#1B2A4A]">远程协作</h1>
            <span className="text-base font-semibold text-gray-800">
              {order.orderNo}
            </span>
            <span className="text-sm text-gray-500">
              {order.brand} {order.model}
            </span>
          </div>
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <MessageBoard
            orderId={order.id}
            messages={collaboration.messages}
          />
        </div>
        <div className="col-span-1">
          <CollaborationTools
            orderId={order.id}
            collaboration={collaboration}
          />
        </div>
      </div>
    </div>
  )
}
