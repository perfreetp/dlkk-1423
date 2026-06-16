import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  AlertCircle,
  Archive,
  Cpu,
  ImagePlus,
  CheckCircle2,
  XCircle,
  CreditCard,
  ShieldCheck,
  BarChart3,
  AlertTriangle,
  Save,
  FileCheck,
} from "lucide-react";
import type { ArchiveData, TestItem } from "@/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/types";
import { useOrderStore } from "@/store/useOrderStore";

const PAYMENT_OPTIONS = [
  { value: "现金", label: "现金" },
  { value: "微信", label: "微信" },
  { value: "支付宝", label: "支付宝" },
  { value: "银行卡", label: "银行卡" },
];

export default function CaseArchive() {
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

  return <ArchiveView orderId={order.id} />;
}

function ArchiveView({ orderId }: { orderId: string }) {
  const getOrder = useOrderStore((s) => s.getOrder);
  const completeArchive = useOrderStore((s) => s.completeArchive);
  const getBrandStats = useOrderStore((s) => s.getBrandStats);

  const order = getOrder(orderId)!;
  const isCompleted = order.status === "completed";
  const brandStats = getBrandStats();

  const [form, setForm] = useState<ArchiveData>({ ...order.archive });

  const updateField = <K extends keyof ArchiveData>(key: K, value: ArchiveData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTestItem = (index: number) => {
    setForm((prev) => {
      const items = [...prev.testItems];
      items[index] = { ...items[index], passed: !items[index].passed };
      return { ...prev, testItems: items };
    });
  };

  const handleComplete = () => {
    completeArchive(orderId, {
      ...form,
      completedAt: new Date().toISOString(),
    });
  };

  const allTestsPassed = form.testItems.length > 0 && form.testItems.every((t) => t.passed);

  const inputCls =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Archive className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-bold text-gray-900">结案档案</h1>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-gray-800">{order.orderNo}</span>
            <span className="text-sm text-gray-500">
              {order.brand} {order.model}
            </span>
          </div>
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-2/3 space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">刷机记录</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>刷机包版本</label>
                <input
                  type="text"
                  value={form.flashPackageVersion}
                  onChange={(e) => updateField("flashPackageVersion", e.target.value)}
                  disabled={isCompleted}
                  className={inputCls}
                  placeholder="请输入刷机包版本号"
                />
              </div>
              <div>
                <label className={labelCls}>工具版本</label>
                <input
                  type="text"
                  value={form.toolVersion}
                  onChange={(e) => updateField("toolVersion", e.target.value)}
                  disabled={isCompleted}
                  className={inputCls}
                  placeholder="请输入工具版本号"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">成功截图</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-gray-300"
                >
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-1 text-xs text-gray-400">上传截图</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">检测项目</h2>
            </div>
            <div className="space-y-2">
              {form.testItems.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                >
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isCompleted}
                      onClick={() => {
                        if (!item.passed) toggleTestItem(index);
                      }}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        item.passed
                          ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                          : "bg-gray-50 text-gray-400 ring-1 ring-gray-200 hover:bg-green-50 hover:text-green-600"
                      } disabled:cursor-not-allowed`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      通过
                    </button>
                    <button
                      type="button"
                      disabled={isCompleted}
                      onClick={() => {
                        if (item.passed) toggleTestItem(index);
                      }}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        !item.passed
                          ? "bg-red-100 text-red-700 ring-1 ring-red-300"
                          : "bg-gray-50 text-gray-400 ring-1 ring-gray-200 hover:bg-red-50 hover:text-red-600"
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

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">收费记录</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>收费金额（元）</label>
                <input
                  type="number"
                  min={0}
                  value={form.chargeAmount || ""}
                  onChange={(e) =>
                    updateField("chargeAmount", e.target.value ? Number(e.target.value) : 0)
                  }
                  disabled={isCompleted}
                  className={inputCls}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelCls}>支付方式</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => updateField("paymentMethod", e.target.value)}
                  disabled={isCompleted}
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
                  value={form.receiptInfo}
                  onChange={(e) => updateField("receiptInfo", e.target.value)}
                  disabled={isCompleted}
                  className={inputCls}
                  placeholder="请输入收据编号或信息"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">质保信息</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>质保时长（月）</label>
                <input
                  type="number"
                  min={0}
                  value={form.warrantyMonths || ""}
                  onChange={(e) =>
                    updateField("warrantyMonths", e.target.value ? Number(e.target.value) : 0)
                  }
                  disabled={isCompleted}
                  className={inputCls}
                  placeholder="3"
                />
              </div>
              <div>
                <label className={labelCls}>质保备注</label>
                <textarea
                  value={form.warrantyNote}
                  onChange={(e) => updateField("warrantyNote", e.target.value)}
                  disabled={isCompleted}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="请输入质保说明..."
                />
              </div>
            </div>
          </div>

          {!isCompleted && (
            <button
              type="button"
              onClick={handleComplete}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              完成结案
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-6 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              该工单已结案归档
            </div>
          )}
        </div>

        <div className="w-1/3 space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">品牌成功率</h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">品牌</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">工单数</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">成功率</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">平均耗时</th>
                  </tr>
                </thead>
                <tbody>
                  {brandStats.map((stat) => (
                    <tr key={stat.brand} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2.5 text-gray-700 font-medium">{stat.brand}</td>
                      <td className="px-3 py-2.5 text-gray-600">{stat.totalOrders}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500"
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
                      <td className="px-3 py-2.5 text-right text-gray-600">
                        {stat.avgDurationMinutes > 0 ? `${stat.avgDurationMinutes}分钟` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-800">高风险机型</h2>
            </div>
            {brandStats.some((s) => s.highRiskModels.length > 0) ? (
              <div className="space-y-2">
                {brandStats
                  .filter((s) => s.highRiskModels.length > 0)
                  .flatMap((s) =>
                    s.highRiskModels.map((model) => (
                      <div
                        key={model}
                        className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <span className="text-sm text-amber-800">{model}</span>
                      </div>
                    ))
                  )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">暂无高风险机型</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
