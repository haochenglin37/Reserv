"use client"
export default function CancelBookingButton({ id }: { id: string }) {
  const onClick = async () => {
    if (!confirm('確定要取消這筆預約嗎？')) return
    const res = await fetch(`/api/my-bookings/${id}`, { method: 'DELETE' })
    if (res.ok) {
      location.reload()
    } else {
      alert(await res.text())
    }
  }
  return (
    <button type="button" onClick={onClick} className="text-sm text-red-600 underline">取消</button>
  )
}

