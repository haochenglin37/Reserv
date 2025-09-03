"use client"
import { useEffect, useMemo, useState } from 'react'
import { addDays, addMinutes, format, startOfWeek, isSameDay } from 'date-fns'

type Props = {
  date: Date // any date within the desired week (local time)
  serviceId: string
  onSelect: (sel: { date: string; time: string }) => void
  selected?: { date: string; time: string } | null
}

export default function WeekSchedule({ date, serviceId, onSelect, selected }: Props) {
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date])
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const today = new Date()

  const times = useMemo(() => {
    // 與後端預設一致（.env 可改），此處僅用於畫格線
    const [oh, om] = '10:00'.split(":").map(Number)
    const [ch, cm] = '19:00'.split(":").map(Number)
    const start = new Date(0)
    start.setHours(oh, om, 0, 0)
    const end = new Date(0)
    end.setHours(ch, cm, 0, 0)
    const out: string[] = []
    let cur = new Date(start)
    while (cur < end) {
      out.push(format(cur, 'HH:mm'))
      cur = addMinutes(cur, 60)
    }
    return out
  }, [])

  const [avail, setAvail] = useState<Record<string, string[]>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      setLoading(true)
      try {
        const list = await Promise.all(days.map(async d => {
          const ds = format(d, 'yyyy-MM-dd')
          const params = new URLSearchParams({ date: ds })
          if (serviceId) params.set('serviceId', serviceId)
          const res = await fetch(`/api/availability?${params.toString()}`)
          if (res.status === 401) {
            window.location.href = '/api/auth/line/login'
            return [ds, []] as const
          }
          if (!res.ok) throw new Error(await res.text())
          const data = await res.json()
          return [ds, data.slots as string[]] as const
        }))
        if (cancelled) return
        const next: Record<string, string[]> = {}
        for (const [k, v] of list) next[k] = v
        setAvail(next)
      } catch (e) {
        console.error('Load week availability failed', e)
        if (!cancelled) setError('載入時段失敗，請稍後再試')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [days, serviceId])

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left w-20 sticky left-0 bg-gray-50 z-20">時間</th>
              {days.map(d => (
                <th
                  key={format(d,'yyyy-MM-dd')}
                  className={`p-2 text-left ${isSameDay(d, today) ? 'bg-pink-50' : ''}`}
                >
                  {format(d, 'MM/dd (EEE)')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map(t => (
              <tr key={t} className="border-t">
                <td className="p-2 text-gray-600 whitespace-nowrap sticky left-0 bg-white z-10">{t}</td>
                {days.map(d => {
                  const ds = format(d, 'yyyy-MM-dd')
                  const ok = (avail[ds] || []).includes(t)
                  const isSel = selected && selected.date === ds && selected.time === t
                  return (
                    <td key={ds+':'+t} className={`p-1 ${isSameDay(d, today) ? 'bg-pink-50/40' : ''}`}>
                      <button
                        disabled={!ok}
                        onClick={() => onSelect({ date: ds, time: t })}
                        className={`w-full text-left px-3 py-2 rounded-md border text-sm ${ok ? 'hover:bg-pink-50' : 'opacity-30 cursor-not-allowed'} ${isSel ? 'bg-pink-500 text-white border-pink-500' : ''}`}
                      >
                        {ok ? '可預約' : '—'}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <p className="text-sm text-gray-500 mt-2">載入中…</p>}
    </div>
  )
}
