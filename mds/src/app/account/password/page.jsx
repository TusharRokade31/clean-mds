// src/app/account/password/page.js
'use client'
import { useState } from 'react'

export default function PasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    // Password update logic would go here
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>
      
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block mb-1">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block mb-1">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block mb-1">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update Password
          </button>
        </div>
      </form>
    </div>
  )
}