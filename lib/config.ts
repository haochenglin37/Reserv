export const BUSINESS_DAYS: number[] = JSON.parse(process.env.BUSINESS_DAYS || '[1,2,3,4,5,6]')
export const OPEN_TIME = process.env.OPEN_TIME || '10:00'
export const CLOSE_TIME = process.env.CLOSE_TIME || '19:00'
export const SLOT_MINUTES = parseInt(process.env.APPOINTMENT_SLOT_MINUTES || '60')
export const BUFFER_MINUTES = parseInt(process.env.BOOKING_BUFFER_MINUTES || '120')
export const TZ = process.env.TZ || 'Asia/Taipei'
