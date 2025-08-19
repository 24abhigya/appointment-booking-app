import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { getRole, clearAuth } from './api'

function Protected({ children, role }) {
  const r = getRole()
  if (!r) return <Navigate to="/login" replace />
  if (role && r !== role) return <Navigate to="/" replace />
  return children
}

function Navbar() {
  const navigate = useNavigate()
  const role = getRole()
  return (
    <nav style={{display:'flex',gap:12,padding:12,borderBottom:'1px solid #ddd'}}>
      <Link to="/">Home</Link>
      <Link to="/patient">Patient</Link>
      <Link to="/admin">Admin</Link>
      {role ? (
        <button onClick={() => { clearAuth(); navigate('/login') }}>Logout</button>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  )
}

export default function App() {
  return (
    <div>
      <Navbar />
      <div style={{padding:16}}>
        <Routes>
          <Route path="/" element={<div>Welcome to Clinic Appointments</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/patient" element={<Protected role="patient"><PatientDashboard /></Protected>} />
          <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}
