'use client'
import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function BookPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    if (date) {
      const d = format(date, 'yyyy-MM-dd')
      fetch(`/api/availability?date=${d}`)
        .then(res => res.json())
        .then(data => setSlots(data.slots))
    }
  }, [date])

  const submit = async () => {
    if (!date || !selected) return
    const payload = {
      date: format(date, 'yyyy-MM-dd'),
      time: selected,
      customerName: form.name,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
    }
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      router.push('/success')
    } else {
      alert(await res.text())
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">預約時間</h1>
      <Calendar
        onChange={(d) => setDate(d as Date)}
        value={date}
        minDate={new Date()}
        locale="zh-TW"
        className="mb-4"
      />
      {date && (
        <div className="mb-4">
          <p className="mb-2">選擇時段：</p>
          {slots.length === 0 && <p>無可預約時段</p>}
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setSelected(s)}
                className={`px-2 py-1 border rounded ${selected === s ? 'bg-pink-500 text-white' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {selected && (
        <div className="space-y-2">
          <input className="w-full border p-2" placeholder="您的姓名" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="w-full border p-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="w-full border p-2" placeholder="手機" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <textarea className="w-full border p-2" placeholder="備註" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button onClick={submit} className="w-full bg-pink-500 text-white p-2 rounded">送出預約</button>
        </div>
      )}
    </div>
  )
}
