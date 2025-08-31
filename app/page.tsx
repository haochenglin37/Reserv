import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center py-20">
      <h1 className="text-3xl font-bold mb-6">美甲預約</h1>
      <Link href="/book" className="px-4 py-2 bg-pink-500 text-white rounded">
        立即預約
      </Link>
    </main>
  )
}
