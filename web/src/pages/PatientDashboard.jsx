import React, { useEffect, useState } from 'react'
import { api } from '../api'

function formatISO(iso) {
  const d = new Date(iso)
  return d.toLocaleString()
}

function todayStr(d=new Date()) {
  return d.toISOString().slice(0,10)
}

export default function PatientDashboard() {
  const [slots, setSlots] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookError, setBookError] = useState('')
  const [bookLoading, setBookLoading] = useState(false)
  const [my, setMy] = useState([])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const from = todayStr()
      const to = todayStr(new Date(Date.now() + 6 * 86400000))
      const { available } = await api.slots({ from, to })
      setSlots(available)
      const { bookings } = await api.myBookings()
      setMy(bookings)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function book(slotId) {
    setBookError('')
    setBookLoading(true)
    try {
      await api.book(slotId)
      await load()
    } catch (e) {
      setBookError(e.message)
    } finally {
      setBookLoading(false)
    }
  }

  return (
    <div style={{display:'grid', gap:16}}>
      <h2>Patient Dashboard</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <div>
        <h3>Available Slots (next 7 days)</h3>
        {loading ? 'Loading...' : (
          <ul>
            {slots.map(s => (
              <li key={s.id} style={{marginBottom:8}}>
                {formatISO(s.startAt)} - {formatISO(s.endAt)}{' '}
                <button disabled={bookLoading} onClick={() => book(s.id)}>
                  {bookLoading ? 'Booking...' : 'Book'}
                </button>
              </li>
            ))}
            {slots.length === 0 && <div>No available slots.</div>}
          </ul>
        )}
        {bookError && <div style={{color:'red'}}>{bookError}</div>}
      </div>
      <div>
        <h3>My Bookings</h3>
        <ul>
          {my.map(b => (
            <li key={b.id}>
              {formatISO(b.slot.startAt)} - {formatISO(b.slot.endAt)}
            </li>
          ))}
          {my.length === 0 && <div>No bookings yet.</div>}
        </ul>
      </div>
    </div>
  )
}
