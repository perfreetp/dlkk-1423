export type OrderStatus = "pending" | "verifying" | "processing" | "collaborating" | "confirming" | "completed" | "abnormal"

export type LockType = "pattern" | "pin" | "password" | "frp" | "bl" | "mi_account" | "huawei_account" | "samsung_account"

export type TaskType = "flash" | "unbrick" | "unlock" | "backup" | "repair" | "other"

export type AccountStatus = "locked" | "unlocked" | "frp_locked" | "unknown"

export type BLStatus = "locked" | "unlocked" | "unlockable" | "unknown"

export type BLDifficulty = "easy" | "medium" | "hard" | "unknown"

export type WarrantyStatus = "in_warranty" | "out_of_warranty" | "unknown"

export type RiskType = "data_clear" | "account_limit" | "brick_risk" | "charge_standard"

export type RiskLevel = "low" | "medium" | "high"

export type MessageType = "text" | "image" | "system"

export interface DeviceVerify {
  imei1: string
  imei2: string
  accountStatus: AccountStatus
  accountInfo: string
  blStatus: BLStatus
  blDifficulty: BLDifficulty
  warrantyStatus: WarrantyStatus
  warrantyNote: string
  photos: string[]
}

export interface OperationTask {
  id: string
  type: TaskType
  label: string
  completed: boolean
  result: string
  duration: number
  error: string
}

export interface CollaborationMessage {
  id: string
  sender: string
  senderRole: string
  content: string
  timestamp: string
  type: MessageType
}

export interface TransferRecord {
  id: string
  from: string
  to: string
  reason: string
  timestamp: string
}

export interface CollaborationData {
  messages: CollaborationMessage[]
  transfers: TransferRecord[]
  timeoutMinutes: number
  lastTimeoutAlert: string | null
}

export interface RiskConfirmItem {
  id: string
  type: RiskType
  title: string
  description: string
  confirmed: boolean
  riskLevel: RiskLevel
}

export interface RiskConfirmData {
  items: RiskConfirmItem[]
  customerSignature: string
  confirmedAt: string | null
}

export interface TestItem {
  name: string
  passed: boolean
}

export interface ArchiveData {
  flashPackageVersion: string
  toolVersion: string
  successScreenshots: string[]
  testItems: TestItem[]
  chargeAmount: number
  paymentMethod: string
  receiptInfo: string
  warrantyMonths: number
  warrantyNote: string
  completedAt: string | null
}

export interface WorkOrder {
  id: string
  orderNo: string
  brand: string
  model: string
  systemVersion: string
  lockType: LockType
  customerRequest: string
  keepData: boolean
  authCredential: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
  creator: string
  assignee: string
  verify: DeviceVerify
  tasks: OperationTask[]
  collaboration: CollaborationData
  riskConfirm: RiskConfirmData
  archive: ArchiveData
}

export interface BrandStats {
  brand: string
  totalOrders: number
  successOrders: number
  successRate: number
  avgDurationMinutes: number
  highRiskModels: string[]
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "待处理",
  verifying: "核验中",
  processing: "操作中",
  collaborating: "协作中",
  confirming: "确认中",
  completed: "已完成",
  abnormal: "异常",
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-300",
  verifying: "bg-blue-100 text-blue-700 border-blue-300",
  processing: "bg-indigo-100 text-indigo-700 border-indigo-300",
  collaborating: "bg-purple-100 text-purple-700 border-purple-300",
  confirming: "bg-teal-100 text-teal-700 border-teal-300",
  completed: "bg-green-100 text-green-700 border-green-300",
  abnormal: "bg-red-100 text-red-700 border-red-300",
}

export const STATUS_DOT_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-400",
  verifying: "bg-blue-400",
  processing: "bg-indigo-400",
  collaborating: "bg-purple-400",
  confirming: "bg-teal-400",
  completed: "bg-green-400",
  abnormal: "bg-red-400",
}

export const LOCK_TYPE_LABELS: Record<LockType, string> = {
  pattern: "图案锁",
  pin: "PIN锁",
  password: "密码锁",
  frp: "FRP锁",
  bl: "BL锁",
  mi_account: "小米账号锁",
  huawei_account: "华为账号锁",
  samsung_account: "三星账号锁",
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  flash: "刷机",
  unbrick: "救砖",
  unlock: "解锁",
  backup: "资料备份",
  repair: "分区修复",
  other: "其他操作",
}

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
}

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: "text-green-600 bg-green-50",
  medium: "text-amber-600 bg-amber-50",
  high: "text-red-600 bg-red-50",
}
