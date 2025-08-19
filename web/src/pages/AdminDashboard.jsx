import React, { useEffect, useState } from 'react'
import { api } from '../api'

function formatISO(iso) {
  const d = new Date(iso)
  return d.toLocaleString()
}

export default function AdminDashboard() {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { bookings } = await api.allBookings()
        setRows(bookings)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      {loading ? 'Loading...' : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Email</th>
              <th>Start</th>
              <th>End</th>
              <th>Booked At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.user.name}</td>
                <td>{r.user.email}</td>
                <td>{formatISO(r.slot.startAt)}</td>
                <td>{formatISO(r.slot.endAt)}</td>
                <td>{formatISO(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
