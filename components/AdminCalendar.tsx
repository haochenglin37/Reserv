'use client'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { isSameDay } from 'date-fns'

export default function AdminCalendar({ bookings, blocks }: { bookings: { start: Date }[]; blocks: { start: Date }[] }) {
  return (
    <Calendar
      tileClassName={({ date, view }) => {
        if (view === 'month') {
          if (blocks.some(b => isSameDay(new Date(b.start), date))) return 'bg-red-200'
          if (bookings.some(b => isSameDay(new Date(b.start), date))) return 'bg-blue-200'
        }
        return null
      }}
    />
  )
}
