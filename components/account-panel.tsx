'use client'

import { useEffect, useState } from 'react'

interface Booking { id: string; dateTime: string; status: string; price: string; barberName: string; barberId: string; serviceName: string; duration: number }
interface Barber { id: string; name: string; specialty: string }

export function AccountPanel({ initialUser }: { initialUser: { email: string; customerId: string | null; role: string; businessTimezone: string } }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState('')
  const [profile, setProfile] = useState<{ name: string; phone: string } | null>(null)

  async function load() {
    const [bookingRes, barberRes, profileRes] = await Promise.all([fetch('/api/me/bookings'), fetch('/api/barbers'), fetch('/api/me')])
    const bookingData = await bookingRes.json(); const barberData = await barberRes.json(); const profileData = await profileRes.json()
    if (bookingData.success) setBookings(bookingData.bookings)
    if (Array.isArray(barberData)) setBarbers(barberData)
    if (profileData.success && profileData.profile) setProfile({ name: profileData.profile.name, phone: profileData.profile.phone })
  }
  useEffect(() => { load().catch(() => setMessage('Məlumatlar yüklənmədi.')) }, [])

  async function cancel(id: string) {
    setBusyId(id); setMessage('')
    const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST' }); const data = await res.json()
    setMessage(data.success ? 'Rezervasiya ləğv edildi.' : data.error || 'Əməliyyat alınmadı.')
    if (data.success) await load()
    setBusyId('')
  }

  async function reschedule(booking: Booking) {
    const date = window.prompt('Yeni tarix və saatı yazın: YYYY-MM-DDTHH:MM')
    if (!date) return
    setBusyId(booking.id); setMessage('')
    const res = await fetch(`/api/bookings/${booking.id}/reschedule`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dateTime: date, barberId: booking.barberId }) }); const data = await res.json()
    setMessage(data.success ? 'Rezervasiya dəyişdirildi.' : data.error || 'Əməliyyat alınmadı.')
    if (data.success) await load()
    setBusyId('')
  }

  return <div className="space-y-8"><div className="rounded-xl border border-border/60 bg-card p-6"><p className="text-xs tracking-[0.25em] text-primary">HESAB</p><h2 className="mt-2 font-serif text-2xl font-semibold">{initialUser.email}</h2><p className="mt-2 text-sm text-muted-foreground">{profile?.name || 'Müştəri'} · {profile?.phone || 'Telefon məlumatı yoxdur'}</p><p className="mt-1 text-sm text-muted-foreground">Rezervasiyaları yalnız siz görə bilərsiniz.</p></div>{message && <p role="status" className="rounded-sm border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{message}</p>}<div><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs tracking-[0.25em] text-primary">REZERVASİYALAR</p><h2 className="mt-2 font-serif text-3xl font-semibold">Sizin görüşləriniz</h2></div><a href="/#rezervasiya" className="text-sm text-primary hover:underline">Yeni rezervasiya</a></div>{bookings.length === 0 ? <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">Hələ rezervasiyanız yoxdur.</div> : <div className="grid gap-4">{bookings.map((booking) => <article key={booking.id} className="rounded-xl border border-border/60 bg-card p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="font-medium">{booking.serviceName}</p><p className="mt-1 text-sm text-muted-foreground">{booking.barberName} · {new Intl.DateTimeFormat('az-AZ', { dateStyle: 'medium', timeStyle: 'short', timeZone: initialUser.businessTimezone }).format(new Date(booking.dateTime))}</p><p className="mt-1 text-sm text-muted-foreground">{booking.price} AZN · {booking.status}</p></div>{['pending','confirmed'].includes(booking.status) && <div className="flex gap-2"><button onClick={() => reschedule(booking)} disabled={busyId === booking.id} className="rounded-sm border border-primary/40 px-4 py-2 text-xs text-primary hover:border-primary">Vaxtı dəyiş</button><button onClick={() => cancel(booking.id)} disabled={busyId === booking.id} className="rounded-sm border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground">Ləğv et</button></div>}</div></article>)}</div>}</div></div>
}
