export type Service = {
  id: string
  name: string
  minutes: number
  price: number // 價格（新台幣元）
}

// 你可以依需求調整或從資料庫載入
export const services: Service[] = [
  { id: 'basic', name: '基礎修甲', minutes: 60, price: 800 },
  { id: 'gel', name: '凝膠上色', minutes: 90, price: 1200 },
  { id: 'remove_gel', name: '卸甲 + 上色', minutes: 120, price: 1600 },
]

export function getServiceById(id?: string | null): Service | undefined {
  if (!id) return undefined
  return services.find(s => s.id === id)
}
