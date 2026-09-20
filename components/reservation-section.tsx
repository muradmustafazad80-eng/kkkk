'use client'

import { useState } from 'react'
import { CalendarCheck, Check, Crown } from 'lucide-react'
import { GoldConfetti } from '@/components/gold-confetti'
import { GlowButton } from '@/components/glow-button'

const services = [
  'Klassik saç kəsimi',
  'Saç + saqqal',
  'Saqqal formalaşdırma',
  'Royal ülgüc təraş',
  'Uşaq kəsimi',
  'KRAL VIP Paket',
]

type Result = { done: boolean; visit: number; gift: boolean; name: string }

export function ReservationSection() {
  const [result, setResult] = useState<Result>({ done: false, visit: 0, gift: false, name: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const date = String(formData.get('date') || '')
    const time = String(formData.get('time') || '')
    const service = String(formData.get('service') || '')

    if (!name || !phone || !date || !time || !service) {
      setError('Zəhmət olmasa bütün məlumatları doldurun.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          barberName: 'Ustad Əli',
          serviceName: service,
          dateTime: `${date}T${time}:00`,
        }),
      })
      const bookingRes = await res.json()

      if (bookingRes.success) {
        setResult({ done: true, visit: 2, gift: false, name })
      } else {
        if (res.status === 401) {
          setError('Rezervasiya üçün əvvəlcə hesabınıza daxil olun.')
        } else {
          setError(bookingRes.error || 'Rezervasiya yaradıla bilmədi.')
        }
      }
    } catch {
      setError('Serverlə əlaqə qurmaq mümkün olmadı.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setResult({ done: false, visit: 0, gift: false, name: '' })
    setError('')
    setSubmitting(false)
  }

  return (
    <section id="rezervasiya" className="scroll-mt-20 py-24 md:py-32">
      {result.gift && <GoldConfetti />}
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span className="inline-flex w-fit items-center gap-2 text-xs font-medium tracking-[0.3em] text-primary">
                <CalendarCheck className="size-4" aria-hidden="true" />
                REZERVASİYA
              </span>
              <h2 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight md:text-4xl">
                Yerinizi indi ayırın
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                Formu doldurun, komandamız təsdiq üçün sizinlə əlaqə saxlasın. Növbədə
                gözləmədən premium xidmət.
              </p>
              <ul className="mt-8 space-y-3">
                {['Onlayn və sürətli qeydiyyat', 'Uyğun vaxt seçimi', 'Təsdiq zəngi'].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary" aria-hidden="true" />
                    {t}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm text-primary">
                  <Crown className="size-4" aria-hidden="true" />
                  Hər 10-cu kəsim KRAL-dan HƏDİYYƏ
                </li>
              </ul>
            </div>

            <div className="border-t border-border/60 bg-card/60 p-8 md:border-l md:border-t-0 md:p-12">
              {result.done ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  {result.gift ? (
                    <>
                      <span className="flex size-16 items-center justify-center rounded-full border border-primary bg-primary/15 text-primary">
                        <Crown className="size-8" aria-hidden="true" />
                      </span>
                      <h3 className="mt-6 text-balance font-serif text-2xl font-semibold text-primary">
                        Təbriklər, {result.name}!
                      </h3>
                      <p className="mt-3 text-pretty leading-relaxed text-foreground">
                        Bu sizin <span className="font-semibold text-primary">10-cu</span> gəlişinizdir —
                        bu kəsiminiz KRAL tərəfindən sizə HƏDİYYƏDİR!
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="flex size-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                        <Check className="size-7" aria-hidden="true" />
                      </span>
                      <h3 className="mt-6 font-serif text-2xl font-semibold">Təşəkkür edirik!</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Rezervasiyanız qəbul edildi. Bu sizin{' '}
                        <span className="font-semibold text-primary">{result.visit}-ci</span> gəlişinizdir.
                      </p>
                      {result.visit % 10 === 9 && (
                        <p className="mt-3 text-sm text-primary">
                          Növbəti gəlişiniz KRAL hədiyyəsi olacaq!
                        </p>
                      )}
                    </>
                  )}
                  <GlowButton
                    onClick={reset}
                    className="mt-8 border border-primary/50 bg-background/40 px-6 py-3 text-sm font-medium tracking-widest text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    YENİ REZERVASİYA
                  </GlowButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm text-muted-foreground">
                      Ad, Soyad
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      placeholder="Adınızı daxil edin"
                      className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm text-muted-foreground">
                      Telefon
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+994 __ ___ __ __"
                      className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="mb-2 block text-sm text-muted-foreground">
                        Tarix
                      </label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        required
                        className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="time" className="mb-2 block text-sm text-muted-foreground">
                        Vaxt
                      </label>
                      <input
                        id="time"
                        name="time"
                        type="time"
                        required
                        className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="service" className="mb-2 block text-sm text-muted-foreground">
                      Xidmət
                    </label>
                    <select
                      id="service"
                      name="service"
                      className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                    >
                      {services.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  {error && <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                  <GlowButton
                    type="submit"
                    full
                    disabled={submitting}
                    className="bg-primary px-6 py-3.5 text-sm font-medium tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    {submitting ? 'GÖNDƏRİLİR...' : 'TƏSDİQ ET'}
                  </GlowButton>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
