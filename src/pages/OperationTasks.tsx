import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  CheckCircle,
  Circle,
  Loader,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  ListChecks,
} from "lucide-react"
import type { OperationTask } from "@/types"
import { STATUS_LABELS, STATUS_COLORS, TASK_TYPE_LABELS } from "@/types"
import { useOrderStore } from "@/store/useOrderStore"
import OrderPicker from "@/components/OrderPicker"

function getTaskState(task: OperationTask, tasks: OperationTask[]): "completed" | "current" | "pending" {
  if (task.completed) return "completed"
  const firstIncomplete = tasks.find((t) => !t.completed)
  if (firstIncomplete && firstIncomplete.id === task.id) return "current"
  return "pending"
}

const TASK_TYPE_COLORS: Record<OperationTask["type"], string> = {
  flash: "bg-amber-100 text-amber-700",
  unbrick: "bg-red-100 text-red-700",
  unlock: "bg-blue-100 text-blue-700",
  backup: "bg-teal-100 text-teal-700",
  repair: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-700",
}

function TaskNode({ task, tasks, orderId, isLast }: {
  task: OperationTask
  tasks: OperationTask[]
  orderId: string
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(getTaskState(task, tasks) === "current")
  const updateTask = useOrderStore((s) => s.updateTask)
  const state = getTaskState(task, tasks)

  const handleChange = (updates: Partial<OperationTask>) => {
    updateTask(orderId, task.id, updates)
  }

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        {state === "completed" ? (
          <CheckCircle className="h-6 w-6 text-status-success shrink-0" />
        ) : state === "current" ? (
          <span className="relative flex h-6 w-6 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-status-progress">
              <Loader className="h-3.5 w-3.5 text-white animate-spin" />
            </span>
          </span>
        ) : (
          <Circle className="h-6 w-6 text-steel-300 shrink-0" />
        )}
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-10 ${state === "completed" ? "bg-green-300" : "bg-steel-200"}`} />
        )}
      </div>

      <div className="flex-1 pb-6">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left group"
        >
          <div className="flex items-center justify-between rounded-lg border border-steel-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-steel-400 hover:shadow">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${
                state === "completed" ? "text-green-700" :
                state === "current" ? "text-blue-700" :
                "text-steel-500"
              }`}>
                {task.label}
              </span>
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${TASK_TYPE_COLORS[task.type]}`}>
                {TASK_TYPE_LABELS[task.type]}
              </span>
              {task.error && <AlertCircle className="h-4 w-4 text-status-danger" />}
            </div>
            <div className="flex items-center gap-2">
              {task.completed && <span className="text-xs text-green-600 font-medium">已完成</span>}
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-steel-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-steel-400" />
              )}
            </div>
          </div>
        </button>

        {expanded && (
          <div className="mt-2 rounded-lg border border-steel-200 bg-steel-50/70 p-4 space-y-4 animate-slide-in">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => handleChange({ completed: e.target.checked })}
                className="h-4 w-4 rounded border-steel-300 text-steel-800 focus:ring-steel-700"
              />
              <span className="text-sm text-steel-700 font-medium">标记此步骤完成</span>
            </label>

            <div>
              <label className="block text-xs font-semibold text-steel-600 mb-1.5">操作结果</label>
              <textarea
                value={task.result}
                onChange={(e) => handleChange({ result: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-steel-200 bg-white px-3 py-2 text-sm text-steel-800 placeholder-steel-400 focus:border-steel-600 focus:outline-none focus:ring-1 focus:ring-steel-600 resize-none"
                placeholder="记录此步骤的具体操作结果、关键信息等..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-steel-600 mb-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  耗时（分钟）
                </label>
                <input
                  type="number"
                  min={0}
                  value={task.duration || ""}
                  onChange={(e) =>
                    handleChange({ duration: e.target.value ? Number(e.target.value) : 0 })
                  }
                  className="w-full rounded-md border border-steel-200 bg-white px-3 py-2 text-sm text-steel-800 focus:border-steel-600 focus:outline-none focus:ring-1 focus:ring-steel-600"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-steel-600 mb-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  异常描述（选填）
                </label>
                <input
                  type="text"
                  value={task.error}
                  onChange={(e) => handleChange({ error: e.target.value })}
                  className="w-full rounded-md border border-steel-200 bg-white px-3 py-2 text-sm text-steel-800 focus:border-steel-600 focus:outline-none focus:ring-1 focus:ring-steel-600"
                  placeholder="遇到的异常情况..."
                />
              </div>
            </div>

            {task.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-600 mb-1">当前异常</p>
                <p className="text-sm text-red-700">{task.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OperationTasks() {
  const { orderId } = useParams<{ orderId: string }>()
  const orders = useOrderStore((s) => s.orders)
  const order = orderId ? orders.find((o) => o.id === orderId) : undefined

  if (!orderId || !order) {
    return (
      <OrderPicker
        title="操作任务"
        description="请先选择工单，按步骤节点执行刷机、解锁、救砖等操作，每一步填写结果和耗时"
        routePrefix="/tasks"
      />
    )
  }

  const { tasks } = order
  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ListChecks className="w-6 h-6 text-steel-700" />
          <div>
            <h1 className="text-2xl font-bold text-steel-900">操作任务</h1>
            <p className="text-sm text-steel-500 mt-0.5">按节点顺序执行，每步完成后勾选并记录结果</p>
          </div>
        </div>
        <Link
          to="/"
          className="text-sm text-steel-500 hover:text-steel-700 underline underline-offset-2"
        >
          ← 返回工单大厅
        </Link>
      </div>

      <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-semibold text-steel-800">{order.orderNo}</span>
            <span className="text-sm text-steel-500">{order.brand} {order.model}</span>
          </div>
          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-steel-500 font-medium">任务进度</span>
            <span className="text-xs font-semibold text-steel-700">{completedCount}/{totalCount} 步骤完成</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-steel-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-status-progress to-status-success transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-steel-500 font-medium">{percentage}%</p>
        </div>
      </div>

      <div className="space-y-0">
        {tasks.map((task, index) => (
          <TaskNode
            key={task.id}
            task={task}
            tasks={tasks}
            orderId={order.id}
            isLast={index === tasks.length - 1}
          />
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to={`/verify/${order.id}`}
          className="flex-1 py-2.5 border border-steel-300 text-steel-700 font-medium rounded-xl hover:bg-steel-50 transition-colors text-center text-sm"
        >
          ← 返回设备核验
        </Link>
        <Link
          to={`/collab/${order.id}`}
          className="flex-1 py-2.5 bg-steel-800 text-white font-medium rounded-xl hover:bg-steel-900 transition-colors text-center text-sm"
        >
          进入远程协作 →
        </Link>
      </div>
    </div>
  )
}
