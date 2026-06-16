import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Circle,
  Loader,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { WorkOrder, OperationTask } from "@/types";
import { STATUS_LABELS, STATUS_COLORS, TASK_TYPE_LABELS } from "@/types";
import { useOrderStore } from "@/store/useOrderStore";

function getTaskState(
  task: OperationTask,
  tasks: OperationTask[]
): "completed" | "current" | "pending" {
  if (task.completed) return "completed";
  const firstIncomplete = tasks.find((t) => !t.completed);
  if (firstIncomplete && firstIncomplete.id === task.id) return "current";
  return "pending";
}

function TaskTypeBadge({ type }: { type: OperationTask["type"] }) {
  const colorMap: Record<OperationTask["type"], string> = {
    flash: "bg-orange-100 text-orange-700",
    unbrick: "bg-red-100 text-red-700",
    unlock: "bg-blue-100 text-blue-700",
    backup: "bg-teal-100 text-teal-700",
    repair: "bg-purple-100 text-purple-700",
    other: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colorMap[type]}`}
    >
      {TASK_TYPE_LABELS[type]}
    </span>
  );
}

function TaskNode({
  task,
  tasks,
  orderId,
  isLast,
}: {
  task: OperationTask;
  tasks: OperationTask[];
  orderId: string;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const updateTask = useOrderStore((s) => s.updateTask);
  const state = getTaskState(task, tasks);

  const handleChange = (updates: Partial<OperationTask>) => {
    updateTask(orderId, task.id, updates);
  };

  const circleIcon = () => {
    switch (state) {
      case "completed":
        return (
          <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
        );
      case "current":
        return (
          <span className="relative flex h-6 w-6 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
              <Loader className="h-3.5 w-3.5 text-white" />
            </span>
          </span>
        );
      case "pending":
        return (
          <Circle className="h-6 w-6 text-gray-300 shrink-0" />
        );
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        {circleIcon()}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-8 ${
              state === "completed" ? "bg-green-300" : "bg-gray-200"
            }`}
          />
        )}
      </div>
      <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left group"
        >
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm transition hover:border-gray-200 hover:shadow-md">
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium ${
                  state === "completed"
                    ? "text-green-700"
                    : state === "current"
                    ? "text-blue-700"
                    : "text-gray-500"
                }`}
              >
                {task.label}
              </span>
              <TaskTypeBadge type={task.type} />
              {task.error && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {task.completed && (
                <span className="text-xs text-green-500">已完成</span>
              )}
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </button>

        {expanded && (
          <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) =>
                  handleChange({ completed: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">标记完成</span>
            </label>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                操作结果
              </label>
              <textarea
                value={task.result}
                onChange={(e) => handleChange({ result: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                placeholder="请输入操作结果..."
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
                <Clock className="h-3.5 w-3.5" />
                耗时（分钟）
              </label>
              <input
                type="number"
                min={0}
                value={task.duration || ""}
                onChange={(e) =>
                  handleChange({
                    duration: e.target.value ? Number(e.target.value) : 0,
                  })
                }
                className="w-32 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="0"
              />
            </div>

            {task.error && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-red-500 mb-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  异常信息
                </label>
                <textarea
                  value={task.error}
                  onChange={(e) => handleChange({ error: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 placeholder-red-300 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
                  placeholder="描述异常情况..."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OperationTasks() {
  const { orderId } = useParams<{ orderId: string }>();
  const getOrder = useOrderStore((s) => s.getOrder);

  const order = orderId ? getOrder(orderId) : undefined;

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500 text-lg">未找到该工单</p>
        <Link
          to="/"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return <OrderTaskView order={order} />;
}

function OrderTaskView({ order }: { order: WorkOrder }) {
  const { tasks } = order;
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">操作任务</h1>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-gray-800">
              {order.orderNo}
            </span>
            <span className="text-sm text-gray-500">
              {order.brand} {order.model}
            </span>
          </div>
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${
              STATUS_COLORS[order.status]
            }`}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">任务进度</span>
            <span className="text-xs font-medium text-gray-700">
              {completedCount}/{totalCount} 已完成
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-gray-400">
            {percentage}%
          </p>
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
    </div>
  );
}
