// src/app/account/page.js
'use client'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateUserProfile, fetchCurrentUser } from '@/redux/features/auth/authSlice'
import Image from 'next/image'

export default function AccountPage() {
  const dispatch = useDispatch()
  const { user, isLoading, error } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
  })
  
  const [message, setMessage] = useState('')
  
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        gender: user.gender || 'Male',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || '',
        phoneNumber: user.phoneNumber || '',
      })
    }
  }, [user])
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(updateUserProfile(formData)).unwrap()
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err || 'Failed to update profile')
      setTimeout(() => setMessage(''), 3000)
    }
  }
  
  if (isLoading && !user) {
    return <div className="text-center py-12">Loading...</div>
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Account information</h1>
      
      <div>
        {message && (
          <div className={`mb-4 p-3 rounded ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        <div className="max-w-3xl md:flex justify-between items-start  pt-6">
        <div className="flex mb-8">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            {user && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
            )}
            
            {/* <button className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity" type="button">
              <span className="text-xs">Change Image</span>
            </button> */}
          </div>
        </div>
        
        
        
        <form className='w-full ps-4' onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 font-medium">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="block mb-2 font-medium">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            
           
            
            <div>
              <label htmlFor="email" className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="dateOfBirth" className="block mb-2 font-medium">Date of birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block mb-2 font-medium">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block mb-2 font-medium">Phone number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <button 
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}