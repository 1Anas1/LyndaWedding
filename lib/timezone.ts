/**
 * App timezone: North Africa (Morocco / Maghreb).
 * Used for displaying and interpreting event times on the invitation.
 */
export const APP_TIMEZONE = 'Africa/Casablanca'

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: APP_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/**
 * Format a Date to "HH:mm" in the app timezone (North Africa).
 */
export function formatTimeInAppTz(date: Date): string {
  const parts = timeFormatter.formatToParts(date)
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

/**
 * Return the UTC ISO string for "dateStr at 18:00" in North Africa.
 * Used for countdown target.
 */
export function getCountdownTargetISO(dateStr: string, hour = 18): string {
  const targetHour = String(hour).padStart(2, '0')
  const check = new Intl.DateTimeFormat('fr-FR', {
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  // Morocco is UTC+0 or UTC+1; try both and pick when Casablanca shows target hour
  for (const utcHour of [hour - 1, hour, hour + 1]) {
    if (utcHour < 0 || utcHour > 23) continue
    const d = new Date(`${dateStr}T${String(utcHour).padStart(2, '0')}:00:00.000Z`)
    const parts = check.formatToParts(d)
    const h = parts.find((p) => p.type === 'hour')?.value ?? '00'
    if (h === targetHour) return d.toISOString()
  }
  return new Date(`${dateStr}T${targetHour}:00:00.000Z`).toISOString()
}
