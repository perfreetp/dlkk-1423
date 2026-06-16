import { create } from "zustand"
import type {
  WorkOrder,
  DeviceVerify,
  OperationTask,
  CollaborationData,
  RiskConfirmData,
  ArchiveData,
  BrandStats,
  CollaborationMessage,
  TransferRecord,
  RiskConfirmItem,
  OrderStatus,
} from "@/types"

const STORAGE_KEY = "flashforge_orders"

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

function generateOrderNo(maxIndex: number): string {
  return `FF${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(maxIndex).padStart(4, "0")}`
}

function getMaxOrderIndex(orders: WorkOrder[]): number {
  let max = 0
  for (const o of orders) {
    const m = /^FF\d{6}(\d{4})$/.exec(o.orderNo)
    if (m) {
      const n = parseInt(m[1], 10)
      if (n > max) max = n
    }
  }
  return max
}

function createDefaultVerify(): DeviceVerify {
  return {
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
}

function createDefaultTasks(): OperationTask[] {
  return [
    { id: generateId(), type: "backup", label: "资料备份", completed: false, result: "", duration: 0, error: "" },
    { id: generateId(), type: "unlock", label: "解锁操作", completed: false, result: "", duration: 0, error: "" },
    { id: generateId(), type: "flash", label: "刷机写入", completed: false, result: "", duration: 0, error: "" },
    { id: generateId(), type: "unbrick", label: "救砖修复", completed: false, result: "", duration: 0, error: "" },
    { id: generateId(), type: "repair", label: "分区修复", completed: false, result: "", duration: 0, error: "" },
  ]
}

function createDefaultCollaboration(): CollaborationData {
  return {
    messages: [],
    transfers: [],
    timeoutMinutes: 30,
    lastTimeoutAlert: null,
  }
}

function createDefaultRiskConfirm(keepData: boolean): RiskConfirmData {
  const items: RiskConfirmItem[] = [
    {
      id: generateId(),
      type: "data_clear",
      title: "数据清除风险",
      description: keepData
        ? "虽已选择保留资料，但刷机/解锁过程中仍存在数据丢失可能，平台不保证100%数据完整性。"
        : "本次操作将清除设备全部数据，包括联系人、短信、照片、应用等所有用户数据，此操作不可逆。",
      confirmed: false,
      riskLevel: keepData ? "medium" : "high",
    },
    {
      id: generateId(),
      type: "account_limit",
      title: "账号功能限制",
      description: "解锁后部分品牌云服务功能可能受限，包括但不限于：云同步、查找手机、应用市场等。部分账号锁可能在系统更新后重新锁定。",
      confirmed: false,
      riskLevel: "medium",
    },
    {
      id: generateId(),
      type: "brick_risk",
      title: "变砖风险评估",
      description: '刷机/解锁操作存在导致设备无法正常启动的风险（即"变砖"）。不同机型风险等级不同，具体以技师现场评估为准。',
      confirmed: false,
      riskLevel: "medium",
    },
    {
      id: generateId(),
      type: "charge_standard",
      title: "收费标准确认",
      description: "本次服务收费依据品牌、机型、锁定类型和操作难度确定。如操作未能成功解决客户问题，将按实际工时收取检测费用。",
      confirmed: false,
      riskLevel: "low",
    },
  ]
  return {
    items,
    customerSignature: "",
    confirmedAt: null,
  }
}

function createDefaultArchive(): ArchiveData {
  return {
    flashPackageVersion: "",
    toolVersion: "",
    successScreenshots: [],
    testItems: [
      { name: "系统正常启动", passed: false },
      { name: "Wi-Fi连接正常", passed: false },
      { name: "蓝牙功能正常", passed: false },
      { name: "相机功能正常", passed: false },
      { name: "触摸屏响应正常", passed: false },
      { name: "通话功能正常", passed: false },
    ],
    chargeAmount: 0,
    paymentMethod: "",
    receiptInfo: "",
    warrantyMonths: 3,
    warrantyNote: "",
    completedAt: null,
  }
}

function createMockOrders(): WorkOrder[] {
  const now = new Date()
  const fmt = (d: Date) => d.toISOString()
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000)
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)

  return [
    {
      id: generateId(),
      orderNo: "FF2026060001",
      brand: "华为",
      model: "Mate 60 Pro",
      systemVersion: "HarmonyOS 4.0",
      lockType: "huawei_account",
      customerRequest: "忘记华为账号密码，无法激活手机，需要解除账号锁",
      keepData: false,
      authCredential: "购机发票照片",
      status: "completed",
      createdAt: fmt(daysAgo(3)),
      updatedAt: fmt(daysAgo(2)),
      creator: "张丽",
      assignee: "王强",
      verify: {
        imei1: "860123456789012",
        imei2: "860123456789020",
        accountStatus: "locked",
        accountInfo: "hw***@163.com",
        blStatus: "locked",
        blDifficulty: "hard",
        warrantyStatus: "out_of_warranty",
        warrantyNote: "已过保修期",
        photos: [],
      },
      tasks: [
        { id: generateId(), type: "backup", label: "资料备份", completed: true, result: "客户确认无需备份", duration: 5, error: "" },
        { id: generateId(), type: "unlock", label: "账号解锁", completed: true, result: "通过官方渠道重置密码后解锁成功", duration: 45, error: "" },
        { id: generateId(), type: "flash", label: "系统重置", completed: true, result: "恢复出厂设置完成", duration: 20, error: "" },
        { id: generateId(), type: "repair", label: "分区修复", completed: true, result: "无需修复", duration: 0, error: "" },
      ],
      collaboration: {
        messages: [
          { id: generateId(), sender: "王强", senderRole: "技师", content: "华为账号锁需要通过官方渠道重置，已联系客户确认购机信息", timestamp: fmt(daysAgo(3)), type: "text" },
          { id: generateId(), sender: "系统", senderRole: "系统", content: "工单已分配给技师 王强", timestamp: fmt(daysAgo(3)), type: "system" },
        ],
        transfers: [],
        timeoutMinutes: 30,
        lastTimeoutAlert: null,
      },
      riskConfirm: {
        items: [
          { id: generateId(), type: "data_clear", title: "数据清除风险", description: "本次操作将清除设备全部数据", confirmed: true, riskLevel: "high" },
          { id: generateId(), type: "account_limit", title: "账号功能限制", description: "解锁后云服务可能受限", confirmed: true, riskLevel: "medium" },
          { id: generateId(), type: "brick_risk", title: "变砖风险评估", description: "低风险", confirmed: true, riskLevel: "low" },
          { id: generateId(), type: "charge_standard", title: "收费标准确认", description: "收费200元", confirmed: true, riskLevel: "low" },
        ],
        customerSignature: "data:image/png;base64,signature1",
        confirmedAt: fmt(daysAgo(2)),
      },
      archive: {
        flashPackageVersion: "HarmonyOS 4.0.0.116",
        toolVersion: "HiSuite 14.0",
        successScreenshots: [],
        testItems: [
          { name: "系统正常启动", passed: true },
          { name: "Wi-Fi连接正常", passed: true },
          { name: "蓝牙功能正常", passed: true },
          { name: "相机功能正常", passed: true },
          { name: "触摸屏响应正常", passed: true },
          { name: "通话功能正常", passed: true },
        ],
        chargeAmount: 200,
        paymentMethod: "微信支付",
        receiptInfo: "RF2026060001",
        warrantyMonths: 3,
        warrantyNote: "同一问题3个月内免费返修",
        completedAt: fmt(daysAgo(2)),
      },
    },
    {
      id: generateId(),
      orderNo: "FF2026060002",
      brand: "小米",
      model: "14 Ultra",
      systemVersion: "HyperOS 1.0",
      lockType: "bl",
      customerRequest: "需要解锁BL安装第三方Recovery，用于刷入自定义ROM",
      keepData: true,
      authCredential: "小米账号绑定确认",
      status: "processing",
      createdAt: fmt(hoursAgo(6)),
      updatedAt: fmt(hoursAgo(2)),
      creator: "李明",
      assignee: "赵刚",
      verify: {
        imei1: "862345678901234",
        imei2: "862345678901242",
        accountStatus: "unlocked",
        accountInfo: "mi***@qq.com",
        blStatus: "locked",
        blDifficulty: "easy",
        warrantyStatus: "in_warranty",
        warrantyNote: "保修期内，解锁BL将导致保修失效",
        photos: [],
      },
      tasks: [
        { id: generateId(), type: "backup", label: "资料备份", completed: true, result: "已备份至电脑", duration: 15, error: "" },
        { id: generateId(), type: "unlock", label: "BL解锁", completed: true, result: "通过小米解锁工具成功解锁", duration: 30, error: "" },
        { id: generateId(), type: "flash", label: "刷入Recovery", completed: false, result: "", duration: 0, error: "" },
        { id: generateId(), type: "repair", label: "分区修复", completed: false, result: "", duration: 0, error: "" },
      ],
      collaboration: {
        messages: [
          { id: generateId(), sender: "赵刚", senderRole: "技师", content: "BL已解锁，正在刷入TWRP Recovery", timestamp: fmt(hoursAgo(2)), type: "text" },
        ],
        transfers: [],
        timeoutMinutes: 30,
        lastTimeoutAlert: null,
      },
      riskConfirm: createDefaultRiskConfirm(true),
      archive: createDefaultArchive(),
    },
    {
      id: generateId(),
      orderNo: "FF2026060003",
      brand: "三星",
      model: "Galaxy S24 Ultra",
      systemVersion: "One UI 6.1 / Android 14",
      lockType: "frp",
      customerRequest: "二手手机FRP锁无法激活，卖家已失联",
      keepData: false,
      authCredential: "无（二手购入无原账号信息）",
      status: "collaborating",
      createdAt: fmt(hoursAgo(12)),
      updatedAt: fmt(hoursAgo(1)),
      creator: "张丽",
      assignee: "刘伟",
      verify: {
        imei1: "353456789012345",
        imei2: "353456789012352",
        accountStatus: "frp_locked",
        accountInfo: "未知账号",
        blStatus: "locked",
        blDifficulty: "hard",
        warrantyStatus: "unknown",
        warrantyNote: "无法确认保修状态",
        photos: [],
      },
      tasks: [
        { id: generateId(), type: "backup", label: "资料备份", completed: true, result: "设备已锁，无法备份", duration: 2, error: "" },
        { id: generateId(), type: "unlock", label: "FRP解锁", completed: false, result: "", duration: 0, error: "三星FRP解锁方案暂未成功" },
        { id: generateId(), type: "flash", label: "刷机写入", completed: false, result: "", duration: 0, error: "" },
      ],
      collaboration: {
        messages: [
          { id: generateId(), sender: "刘伟", senderRole: "技师", content: "三星S24 FRP锁较新，常规方案无效，需要远程专家协助", timestamp: fmt(hoursAgo(4)), type: "text" },
          { id: generateId(), sender: "陈博士", senderRole: "远程专家", content: "试试组合键进入下载模式后用Odin刷入组合固件", timestamp: fmt(hoursAgo(3)), type: "text" },
          { id: generateId(), sender: "刘伟", senderRole: "技师", content: "正在尝试，固件下载中...", timestamp: fmt(hoursAgo(1)), type: "text" },
        ],
        transfers: [
          { id: generateId(), from: "刘伟", to: "陈博士", reason: "三星S24 FRP锁新方案，需要远程专家指导", timestamp: fmt(hoursAgo(4)) },
        ],
        timeoutMinutes: 30,
        lastTimeoutAlert: fmt(hoursAgo(1)),
      },
      riskConfirm: createDefaultRiskConfirm(false),
      archive: createDefaultArchive(),
    },
    {
      id: generateId(),
      orderNo: "FF2026060004",
      brand: "OPPO",
      model: "Find X7 Ultra",
      systemVersion: "ColorOS 14",
      lockType: "pattern",
      customerRequest: "忘记屏幕图案锁，多次尝试后设备被锁定",
      keepData: true,
      authCredential: "OPPO账号验证",
      status: "verifying",
      createdAt: fmt(hoursAgo(2)),
      updatedAt: fmt(hoursAgo(1)),
      creator: "李明",
      assignee: "",
      verify: {
        imei1: "864567890123456",
        imei2: "",
        accountStatus: "locked",
        accountInfo: "",
        blStatus: "locked",
        blDifficulty: "medium",
        warrantyStatus: "in_warranty",
        warrantyNote: "保修期内",
        photos: [],
      },
      tasks: createDefaultTasks(),
      collaboration: createDefaultCollaboration(),
      riskConfirm: createDefaultRiskConfirm(true),
      archive: createDefaultArchive(),
    },
    {
      id: generateId(),
      orderNo: "FF2026060005",
      brand: "vivo",
      model: "X100 Pro",
      systemVersion: "OriginOS 4",
      lockType: "password",
      customerRequest: "手机密码忘记，需要解锁但保留内部照片和微信记录",
      keepData: true,
      authCredential: "vivo账号验证",
      status: "pending",
      createdAt: fmt(hoursAgo(1)),
      updatedAt: fmt(hoursAgo(1)),
      creator: "张丽",
      assignee: "",
      verify: createDefaultVerify(),
      tasks: createDefaultTasks(),
      collaboration: createDefaultCollaboration(),
      riskConfirm: createDefaultRiskConfirm(true),
      archive: createDefaultArchive(),
    },
    {
      id: generateId(),
      orderNo: "FF2026060006",
      brand: "一加",
      model: "12",
      systemVersion: "OxygenOS 14",
      lockType: "bl",
      customerRequest: "解锁BL刷入Pixel Experience，要求保留基带功能",
      keepData: false,
      authCredential: "一加账号验证",
      status: "confirming",
      createdAt: fmt(daysAgo(1)),
      updatedAt: fmt(hoursAgo(3)),
      creator: "李明",
      assignee: "赵刚",
      verify: {
        imei1: "865678901234567",
        imei2: "865678901234575",
        accountStatus: "unlocked",
        accountInfo: "one***@gmail.com",
        blStatus: "unlocked",
        blDifficulty: "easy",
        warrantyStatus: "out_of_warranty",
        warrantyNote: "已过保修期",
        photos: [],
      },
      tasks: [
        { id: generateId(), type: "backup", label: "资料备份", completed: true, result: "客户确认无需备份", duration: 3, error: "" },
        { id: generateId(), type: "unlock", label: "BL解锁", completed: true, result: "已通过fastboot解锁", duration: 10, error: "" },
        { id: generateId(), type: "flash", label: "刷入Pixel Experience", completed: true, result: "刷入成功，基带正常", duration: 25, error: "" },
        { id: generateId(), type: "repair", label: "分区修复", completed: true, result: "无需修复", duration: 0, error: "" },
      ],
      collaboration: {
        messages: [
          { id: generateId(), sender: "赵刚", senderRole: "技师", content: "Pixel Experience刷入成功，基带信号正常", timestamp: fmt(hoursAgo(4)), type: "text" },
        ],
        transfers: [],
        timeoutMinutes: 30,
        lastTimeoutAlert: null,
      },
      riskConfirm: createDefaultRiskConfirm(false),
      archive: {
        flashPackageVersion: "PixelExperience_Plus_14.0_oneplus12",
        toolVersion: "TWRP 3.7.1 + fastboot",
        successScreenshots: [],
        testItems: [
          { name: "系统正常启动", passed: true },
          { name: "Wi-Fi连接正常", passed: true },
          { name: "蓝牙功能正常", passed: true },
          { name: "相机功能正常", passed: true },
          { name: "触摸屏响应正常", passed: true },
          { name: "通话功能正常", passed: true },
        ],
        chargeAmount: 150,
        paymentMethod: "",
        receiptInfo: "",
        warrantyMonths: 3,
        warrantyNote: "",
        completedAt: null,
      },
    },
    {
      id: generateId(),
      orderNo: "FF2026060007",
      brand: "小米",
      model: "Redmi Note 13 Pro",
      systemVersion: "MIUI 14",
      lockType: "pin",
      customerRequest: "小孩玩手机误设PIN码，现在无法解锁",
      keepData: true,
      authCredential: "小米账号验证",
      status: "abnormal",
      createdAt: fmt(daysAgo(2)),
      updatedAt: fmt(daysAgo(1)),
      creator: "张丽",
      assignee: "赵刚",
      verify: {
        imei1: "867890123456789",
        imei2: "867890123456797",
        accountStatus: "locked",
        accountInfo: "xm***@126.com",
        blStatus: "locked",
        blDifficulty: "easy",
        warrantyStatus: "in_warranty",
        warrantyNote: "保修期内",
        photos: [],
      },
      tasks: [
        { id: generateId(), type: "backup", label: "资料备份", completed: true, result: "已通过小米云备份", duration: 20, error: "" },
        { id: generateId(), type: "unlock", label: "PIN解锁", completed: false, result: "", duration: 0, error: "小米账号验证失败，客户忘记账号密码" },
        { id: generateId(), type: "flash", label: "刷机写入", completed: false, result: "", duration: 0, error: "" },
      ],
      collaboration: {
        messages: [
          { id: generateId(), sender: "赵刚", senderRole: "技师", content: "客户小米账号也无法验证，需要客户先找回账号", timestamp: fmt(daysAgo(2)), type: "text" },
          { id: generateId(), sender: "系统", senderRole: "系统", content: "操作已超时30分钟，请及时处理", timestamp: fmt(daysAgo(1)), type: "system" },
        ],
        transfers: [],
        timeoutMinutes: 30,
        lastTimeoutAlert: fmt(daysAgo(1)),
      },
      riskConfirm: createDefaultRiskConfirm(true),
      archive: createDefaultArchive(),
    },
    {
      id: generateId(),
      orderNo: "FF2026060008",
      brand: "华为",
      model: "P60 Pro",
      systemVersion: "HarmonyOS 3.1",
      lockType: "password",
      customerRequest: "手机被远程锁定，疑似账号被盗，需要解锁并恢复使用",
      keepData: true,
      authCredential: "身份证+购机凭证",
      status: "pending",
      createdAt: fmt(hoursAgo(0.5)),
      updatedAt: fmt(hoursAgo(0.5)),
      creator: "李明",
      assignee: "",
      verify: createDefaultVerify(),
      tasks: createDefaultTasks(),
      collaboration: createDefaultCollaboration(),
      riskConfirm: createDefaultRiskConfirm(true),
      archive: createDefaultArchive(),
    },
  ]
}

interface OrderStore {
  orders: WorkOrder[]
  loadOrders: () => void
  addOrder: (order: Omit<WorkOrder, "id" | "orderNo" | "createdAt" | "updatedAt" | "verify" | "tasks" | "collaboration" | "riskConfirm" | "archive">) => WorkOrder
  updateOrder: (id: string, updates: Partial<WorkOrder>) => void
  updateVerify: (orderId: string, updates: Partial<DeviceVerify>) => void
  updateTask: (orderId: string, taskId: string, updates: Partial<OperationTask>) => void
  addMessage: (orderId: string, message: Omit<CollaborationMessage, "id" | "timestamp">) => void
  addTransfer: (orderId: string, transfer: Omit<TransferRecord, "id" | "timestamp">) => void
  updateRiskItem: (orderId: string, itemId: string, confirmed: boolean) => void
  confirmRisk: (orderId: string, signature: string) => void
  updateArchive: (orderId: string, updates: Partial<ArchiveData>) => void
  finalizeArchive: (orderId: string) => void
  transferExceptionToCollab: (orderId: string, taskId: string, taskLabel: string, error: string) => void
  getBrandStats: () => BrandStats[]
  getOrder: (id: string) => WorkOrder | undefined
  getCurrentStagePath: (order: WorkOrder) => string
}

let orderCounter = 9

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],

  loadOrders: () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsedOrders = JSON.parse(stored) as WorkOrder[]
        orderCounter = getMaxOrderIndex(parsedOrders) + 1
        set({ orders: parsedOrders })
        return
      } catch {
        // ignore parse error
      }
    }
    const mockOrders = createMockOrders()
    orderCounter = getMaxOrderIndex(mockOrders) + 1
    set({ orders: mockOrders })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders))
  },

  addOrder: (orderData) => {
    const state = get()
    const nextIndex = getMaxOrderIndex(state.orders) + 1
    orderCounter = nextIndex + 1
    const newOrder: WorkOrder = {
      ...orderData,
      id: generateId(),
      orderNo: generateOrderNo(nextIndex),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verify: createDefaultVerify(),
      tasks: createDefaultTasks(),
      collaboration: createDefaultCollaboration(),
      riskConfirm: createDefaultRiskConfirm(orderData.keepData),
      archive: createDefaultArchive(),
    }
    set((state) => {
      const orders = [newOrder, ...state.orders]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
    return newOrder
  },

  updateOrder: (id, updates) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  updateVerify: (orderId, updates) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? { ...o, verify: { ...o.verify, ...updates }, updatedAt: new Date().toISOString() }
          : o
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  updateTask: (orderId, taskId, updates) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              tasks: o.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
              updatedAt: new Date().toISOString(),
            }
          : o
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  addMessage: (orderId, message) => {
    const newMsg: CollaborationMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
    }
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              collaboration: {
                ...o.collaboration,
                messages: [...o.collaboration.messages, newMsg],
              },
              updatedAt: new Date().toISOString(),
            }
          : o
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  addTransfer: (orderId, transfer) => {
    const newTransfer: TransferRecord = {
      ...transfer,
      id: generateId(),
      timestamp: new Date().toISOString(),
    }
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              collaboration: {
                ...o.collaboration,
                transfers: [...o.collaboration.transfers, newTransfer],
              },
              updatedAt: new Date().toISOString(),
            }
          : o
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  updateRiskItem: (orderId, itemId, confirmed) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              riskConfirm: {
                ...o.riskConfirm,
                items: o.riskConfirm.items.map((item) =>
                  item.id === itemId ? { ...item, confirmed } : item
                ),
              },
              updatedAt: new Date().toISOString(),
            }
          : o
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  confirmRisk: (orderId, signature) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              riskConfirm: {
                ...o.riskConfirm,
                customerSignature: signature,
                confirmedAt: new Date().toISOString(),
              },
              status: "confirming" as OrderStatus,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  updateArchive: (orderId, updates) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              archive: { ...o.archive, ...updates },
              updatedAt: new Date().toISOString(),
            }
          : o
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  finalizeArchive: (orderId) => {
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              archive: { ...o.archive, completedAt: new Date().toISOString() },
              status: "completed" as OrderStatus,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  transferExceptionToCollab: (orderId, taskId, taskLabel, error) => {
    const systemMessage: Omit<CollaborationMessage, "id" | "timestamp"> = {
      sender: "系统",
      senderRole: "系统",
      content: `【异常转派】节点「${taskLabel}」遇到异常：${error}。请远程专家协助处理。`,
      type: "system",
    }
    set((state) => {
      const orders = state.orders.map((o) => {
        if (o.id !== orderId) return o
        const existingMsg = o.collaboration.messages.find(
          (m) => m.type === "system" && m.content.includes(`节点「${taskLabel}」`)
        )
        const newMsg: CollaborationMessage = {
          ...systemMessage,
          id: generateId(),
          timestamp: new Date().toISOString(),
        }
        return {
          ...o,
          status: "collaborating" as OrderStatus,
          collaboration: {
            ...o.collaboration,
            messages: existingMsg
              ? o.collaboration.messages
              : [...o.collaboration.messages, newMsg],
          },
          updatedAt: new Date().toISOString(),
        }
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
      return { orders }
    })
  },

  getCurrentStagePath: (order) => {
    if (order.status === "completed") return `/archive/${order.id}`
    if (order.archive.completedAt) return `/archive/${order.id}`
    if (order.riskConfirm.confirmedAt) return `/archive/${order.id}`
    if (order.status === "confirming") return `/risk/${order.id}`
    if (order.status === "collaborating") return `/collab/${order.id}`
    if (order.tasks.some((t) => t.completed || t.result || t.error)) return `/tasks/${order.id}`
    if (order.verify.imei1 || order.verify.photos.length > 0) return `/verify/${order.id}`
    return `/verify/${order.id}`
  },

  getBrandStats: () => {
    const orders = get().orders
    const brandMap = new Map<string, { total: number; success: number; durations: number[]; models: Set<string> }>()

    for (const order of orders) {
      const existing = brandMap.get(order.brand) || { total: 0, success: 0, durations: [] as number[], models: new Set<string>() }
      existing.total++
      if (order.status === "completed") {
        existing.success++
        const created = new Date(order.createdAt).getTime()
        const completed = order.archive.completedAt ? new Date(order.archive.completedAt).getTime() : new Date(order.updatedAt).getTime()
        existing.durations.push(Math.round((completed - created) / 60000))
      }
      if (order.status === "abnormal") {
        existing.models.add(`${order.brand} ${order.model}`)
      }
      brandMap.set(order.brand, existing)
    }

    const stats: BrandStats[] = []
    brandMap.forEach((data, brand) => {
      stats.push({
        brand,
        totalOrders: data.total,
        successOrders: data.success,
        successRate: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
        avgDurationMinutes: data.durations.length > 0 ? Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length) : 0,
        highRiskModels: Array.from(data.models),
      })
    })

    return stats.sort((a, b) => b.totalOrders - a.totalOrders)
  },

  getOrder: (id) => {
    return get().orders.find((o) => o.id === id)
  },
}))
