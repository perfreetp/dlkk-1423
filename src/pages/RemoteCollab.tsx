import { useState, useRef, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
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
  Users,
  X,
  Upload,
  Smartphone,
} from "lucide-react"
import { STATUS_LABELS, STATUS_COLORS, type CollaborationMessage, type MessageType } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"
import OrderPicker from "@/components/OrderPicker"

const TRANSFER_OPTIONS = [
  { value: "陈博士-远程专家", label: "陈博士-远程专家" },
  { value: "王强-高级技师", label: "王强-高级技师" },
]

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

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
      <span className="inline-flex items-center gap-1 rounded bg-steel-100 px-1.5 py-0.5 text-[10px] font-medium text-steel-600">
        <Bot className="h-3 w-3" />
        系统
      </span>
    )
  }
  return (
    <span className="inline-flex rounded bg-steel-100 px-1.5 py-0.5 text-[10px] font-medium text-steel-600">
      {role}
    </span>
  )
}

function ChatBubble({ message, onDelete }: { message: CollaborationMessage; onDelete?: () => void }) {
  const isSystem = message.senderRole === "系统"
  const isRemote = message.senderRole === "远程专家"

  if (isSystem) {
    return (
      <div className="flex justify-center py-1">
        <div className="rounded-full bg-steel-100 px-4 py-1.5 text-xs text-steel-500">
          {message.content}
          <span className="ml-2 text-steel-400">
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
    ? "bg-steel-800 text-white"
    : "bg-white border border-steel-200 text-steel-800"

  const isOwn = message.senderRole === "技师"

  return (
    <div className={`flex ${align} gap-2 group`}>
      <div className={`max-w-[75%] ${isRemote ? "order-1" : "order-1"} relative`}>
        <div
          className={`flex items-center gap-2 mb-1 ${isRemote ? "justify-end" : ""}`}
        >
          <span className="text-xs font-medium text-steel-600">
            {message.sender}
          </span>
          <RoleBadge role={message.senderRole} />
        </div>
        <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${bubbleBg} ${isOwn ? "relative" : ""}`}>
          {message.type === "image" ? (
            <img
              src={message.content}
              alt="截图"
              className="max-h-60 rounded-lg shadow object-contain cursor-pointer hover:opacity-90 transition"
            />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
          {isOwn && onDelete && (
            <button
              onClick={onDelete}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p
          className={`mt-1 text-[10px] text-steel-400 ${isRemote ? "text-right" : ""}`}
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
  const updateOrder = useOrderStore((s) => s.updateOrder)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await fileToDataURL(files[i])
        addMessage(orderId, {
          sender: "管理员",
          senderRole: "技师",
          content: dataUrl,
          type: "image",
        })
      } catch {
        // ignore
      }
    }
  }

  const handleDeleteMessage = (msgId: string) => {
    const orders = useOrderStore.getState().orders
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const updatedMessages = order.collaboration.messages.filter((m) => m.id !== msgId)
    updateOrder(orderId, {
      collaboration: {
        ...order.collaboration,
        messages: updatedMessages,
      },
    })
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-steel-200 bg-white shadow-sm">
      <div className="border-b border-steel-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-steel-800">消息记录</h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 px-5 py-4"
        style={{ minHeight: 320, maxHeight: 480 }}
      >
        {messages.length === 0 && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-steel-400">暂无消息</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onDelete={msg.senderRole === "技师" ? () => handleDeleteMessage(msg.id) : undefined}
          />
        ))}
      </div>

      <div className="border-t border-steel-100 px-4 py-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleImageUpload(e.target.files)
            e.target.value = ""
          }}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-lg border border-steel-200 p-2 text-steel-400 transition hover:border-steel-700 hover:text-steel-700 hover:bg-steel-50"
            title="上传截图"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 rounded-lg border border-steel-200 bg-steel-50 px-3 py-2 text-sm text-steel-800 outline-none placeholder-steel-400 focus:border-steel-700 focus:bg-white focus:ring-1 focus:ring-steel-700"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0 rounded-lg bg-steel-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-steel-900 disabled:opacity-40 disabled:cursor-not-allowed"
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
  const addMessage = useOrderStore((s) => s.addMessage)
  const updateOrder = useOrderStore((s) => s.updateOrder)
  const orders = useOrderStore((s) => s.orders)
  const order = orders.find((o) => o.id === orderId)

  const handleTimeoutChange = () => {
    const val = Number(timeoutInput)
    if (val > 0 && order) {
      updateOrder(orderId, {
        collaboration: { ...order.collaboration, timeoutMinutes: val },
      })
    }
  }

  const handleTransferSubmit = () => {
    if (!transferReason.trim() || !order) return
    addTransfer(orderId, {
      from: order?.assignee || "当前技师",
      to: transferTo,
      reason: transferReason.trim(),
    })
    addMessage(orderId, {
      sender: "系统",
      senderRole: "系统",
      content: `工单已转派给 ${transferTo}，原因：${transferReason.trim()}`,
      type: "system",
    })
    setTransferReason("")
    setShowTransferForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-steel-700" />
          <h3 className="text-sm font-semibold text-steel-800">超时设置</h3>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={timeoutInput}
            onChange={(e) => setTimeoutInput(e.target.value)}
            className="w-20 rounded-lg border border-steel-200 bg-steel-50 px-3 py-2 text-sm text-steel-800 outline-none focus:border-steel-700 focus:ring-1 focus:ring-steel-700"
          />
          <span className="text-sm text-steel-500">分钟</span>
          <button
            onClick={handleTimeoutChange}
            className="rounded-lg bg-steel-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-steel-900"
          >
            更新
          </button>
        </div>
        <p className="mt-2 text-xs text-steel-400">
          当前超时阈值：{collaboration.timeoutMinutes} 分钟
        </p>
      </div>

      <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-amber" />
            <h3 className="text-sm font-semibold text-steel-800">疑难转派</h3>
          </div>
          <button
            onClick={() => setShowTransferForm(!showTransferForm)}
            className="flex items-center gap-1 rounded-lg bg-amber px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600"
          >
            <ArrowRightLeft className="h-3 w-3" />
            疑难转派
          </button>
        </div>

        {showTransferForm && (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div>
              <label className="block text-xs font-medium text-steel-600 mb-1">
                接收人
              </label>
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="w-full rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm text-steel-800 outline-none focus:border-steel-700"
              >
                {TRANSFER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-steel-600 mb-1">
                转派原因
              </label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                rows={3}
                placeholder="请输入转派原因..."
                className="w-full rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm text-steel-800 placeholder-steel-400 outline-none focus:border-steel-700 focus:ring-1 focus:ring-steel-700 resize-none"
              />
            </div>
            <button
              onClick={handleTransferSubmit}
              disabled={!transferReason.trim()}
              className="w-full rounded-lg bg-amber py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              提交转派
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-steel-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-steel-800 mb-3">转派记录</h3>
        {collaboration.transfers.length === 0 && (
          <p className="text-xs text-steel-400 py-4 text-center">暂无转派记录</p>
        )}
        <div className="space-y-3">
          {collaboration.transfers.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border border-steel-100 bg-steel-50 p-3"
            >
              <div className="flex items-center gap-2 text-xs text-steel-600">
                <span className="font-medium">{t.from}</span>
                <ChevronRight className="h-3 w-3 text-amber" />
                <span className="font-medium text-steel-800">{t.to}</span>
              </div>
              <p className="mt-1 text-xs text-steel-500">{t.reason}</p>
              <p className="mt-1 text-[10px] text-steel-400">
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
  const orders = useOrderStore((s) => s.orders)
  const order = orderId ? orders.find((o) => o.id === orderId) : undefined
  const navigate = useNavigate()

  if (!orderId || !order) {
    return (
      <OrderPicker
        title="远程协作"
        description="请先选择需要远程协作的工单，与远程专家进行实时沟通、截图上传和疑难转派"
        routePrefix="/collab"
      />
    )
  }

  const { collaboration } = order

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-steel-800 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-steel-900">远程协作</h1>
            <p className="text-sm text-steel-500 mt-0.5">与远程专家实时沟通，上传设备截图，快速解决疑难问题</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/tasks/${orderId}`}
            className="text-sm text-steel-500 hover:text-steel-700 underline underline-offset-2"
          >
            ← 返回操作任务
          </Link>
          <Link
            to="/"
            className="text-sm text-steel-500 hover:text-steel-700 underline underline-offset-2"
          >
            工单大厅
          </Link>
        </div>
      </div>

      {collaboration.lastTimeoutAlert && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 animate-pulse">
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

      <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <p className="text-xs text-steel-500">工单编号</p>
              <p className="text-lg font-semibold text-steel-900 font-mono">
                {order.orderNo}
              </p>
            </div>
            <div className="w-px h-10 bg-steel-200" />
            <div className="space-y-1">
              <p className="text-xs text-steel-500">设备型号</p>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-steel-500" />
                <p className="text-lg font-semibold text-steel-900">
                  {order.brand} {order.model}
                </p>
              </div>
            </div>
            <div className="w-px h-10 bg-steel-200" />
            <div className="space-y-1">
              <p className="text-xs text-steel-500">分配技师</p>
              <p className="text-lg font-semibold text-steel-900">
                {order.assignee || "待分配"}
              </p>
            </div>
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
