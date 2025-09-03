'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { services } from '@/lib/services'
import WeekSchedule from '@/components/WeekSchedule'

export default function BookPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date>(new Date())
  const [slots, setSlots] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState('')
  const [serviceId, setServiceId] = useState(services[0]?.id || '')
  const [selectedDate, setSelectedDate] = useState('')
  const [form, setForm] = useState({
    phone: '',
    notes: '',
  })
  const [me, setMe] = useState<{ name?: string } | null>(null)

  useEffect(() => {
    fetch('/api/me')
      .then(async (r) => (r.ok ? r.json() : null))
      .then((data) => setMe(data))
      .catch(() => setMe(null))
  }, [])

  useEffect(() => {
    // 切換服務或週時重置選取
    setSelected('')
    setSelectedDate('')
  }, [date, serviceId])

  const submit = async () => {
    if (!selectedDate || !selected || !serviceId) return
    const payload = {
      date: selectedDate,
      time: selected,
      serviceId,
      phone: form.phone,
      notes: form.notes,
    }
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.status === 401) {
      window.location.href = '/api/auth/line/login'
      return
    }
    if (res.ok) {
      router.push('/success')
    } else {
      alert(await res.text())
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">預約時間</h1>
      <div className="mb-4 flex items-center gap-2">
        <button className="px-2 py-1 border rounded" onClick={() => setDate(new Date(date.getTime() - 7*24*60*60*1000))}>上一週</button>
        <div className="text-gray-700">{format(date, 'yyyy/MM/dd')} 所在的一週</div>
        <button className="px-2 py-1 border rounded" onClick={() => setDate(new Date(date.getTime() + 7*24*60*60*1000))}>下一週</button>
      </div>
      <div className="mb-4">
        <WeekSchedule
          date={date}
          serviceId={serviceId}
          selected={selected && selectedDate ? { date: selectedDate, time: selected } : null}
          onSelect={({ date, time }) => { setSelected(time); setSelectedDate(date) }}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">選擇服務</label>
        <select className="w-full border p-2" value={serviceId} onChange={e => { setServiceId(e.target.value); setSelected('') }}>
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name}（約 {s.minutes} 分，$ {s.price}）</option>
          ))}
        </select>
      </div>
      {selected && (
        <div className="space-y-2">
          {/* 確認摘要 */}
          <div className="p-3 border rounded bg-yellow-50 text-sm">
            <div className="font-medium mb-1">請確認預約資訊</div>
            <div>
              {format(new Date(selectedDate + 'T00:00:00'), 'yyyy/MM/dd')} {selected} ·
              {(() => { const svc = services.find(s => s.id === serviceId); return ` ${svc?.name}（約 ${svc?.minutes} 分，$ ${svc?.price}）` })()}
            </div>
            <div className="text-gray-600">使用者：{me?.name ?? 'LINE 使用者'}</div>
          </div>
          <input className="w-full border p-2" placeholder="手機" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <textarea className="w-full border p-2" placeholder="備註" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button onClick={submit} className="w-full bg-pink-500 text-white p-3 rounded-md">送出預約</button>
        </div>
      )}
    </div>
  )
}
