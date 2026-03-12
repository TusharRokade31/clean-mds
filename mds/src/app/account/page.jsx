// src/app/account/page.js
'use client'
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  updateUserProfile, 
  fetchCurrentUser, 
  uploadProfilePhoto, 
  deleteProfilePhoto,
  clearError 
} from '@/redux/features/auth/authSlice'
import Image from 'next/image'
import { User } from 'lucide-react'

export default function AccountPage() {
  const dispatch = useDispatch()
  const { user, isLoading, error, uploadingPhoto, uploadPhotoError } = useSelector((state) => state.auth)
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    state: '',
    maritalStatus: '',
    city: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
  })
  
  const [message, setMessage] = useState('')
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        gender: user.gender || 'Male',
        state: user.state || '',
        city: user.city || '',
        maritalStatus: user.maritalStatus || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: user.address || '',
        phoneNumber: user.phoneNumber || '',
      })
    }
  }, [user])
  
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])
  
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

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMessage('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      await dispatch(uploadProfilePhoto(file)).unwrap()
      setMessage('Profile photo updated successfully!')
      setTimeout(() => setMessage(''), 3000)
      setShowPhotoOptions(false)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setMessage(err || 'Failed to upload photo')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDeletePhoto = async () => {
    if (!confirm('Are you sure you want to delete your profile photo?')) return

    try {
      await dispatch(deleteProfilePhoto()).unwrap()
      setMessage('Profile photo deleted successfully!')
      setTimeout(() => setMessage(''), 3000)
      setShowPhotoOptions(false)
    } catch (err) {
      setMessage(err || 'Failed to delete photo')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
    setShowPhotoOptions(false)
  }
  
  if (isLoading && !user) {
    return <div className="text-center py-12">Loading...</div>
  }

  const states = [
    "Haryana", "Andaman and Nicobar", "Delhi", "Dadra and Nagar Haveli", "Chhattisgarh", 
    "Assam", "Arunachal Pradesh", "Nagaland", "Ladakh", "Lakshadweep", "Telangana", 
    "Sikkim", "West Bengal", "Jharkhand", "Meghalaya", "Odisha", "Uttarakhand", 
    "Jammu and Kashmir", "Tripura", "Mizoram", "Rajasthan", "Manipur", "Gujarat", 
    "Goa", "Bihar", "Andhra Pradesh", "Karnataka", "Daman and Diu", "Maharashtra", 
    "Madhya Pradesh", "Uttar Pradesh", "Kerala", "Chandigarh", "Tamil Nadu", 
    "Puducherry", "Punjab", "Himachal Pradesh", "Others",
  ]

  const cities = [
    "Delhi", "Mumbai", "Bengaluru", "Goa", "Chennai", "Dubai", "Jaipur", 
    "Hyderabad", "Bangkok", "Singapore", "Pattaya", "Phuket",
  ]
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">General Information</h1>
      
      <div>
        {message && (
          <div className={`mb-4 p-3 rounded ${error || uploadPhotoError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        <div className="max-w-3xl md:flex justify-between items-start pt-6">
          <div className="flex mb-8 flex-col items-center relative">
            {/* Profile Photo Container with Overlay Button */}
            <div className="relative group mb-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                {user?.profilePhoto ? (
                  <Image
                    src={user.profilePhoto}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-[#1035ac]">
  <User className="w-12  h-12  text-white" strokeWidth={1.5} />
</div>
                )}
                
                {/* Overlay when uploading */}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <span className="text-xs">Uploading...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Photo Button Overlay */}
              <button
                onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-gradient-to-br bg-[#1035ac] border border-white text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-110"
                type="button"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                  />
                </svg>
              </button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="hidden"
            />

            {/* Photo Options Dropdown */}
            {showPhotoOptions && (
              <div className="absolute top-36 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] z-10 animate-fadeIn">
                <button
                  onClick={triggerFileInput}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {user?.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  </span>
                </button>
                
                {user?.profilePhoto && (
                  <>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleDeletePhoto}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="text-sm font-medium">Delete Photo</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Click outside to close dropdown */}
            {showPhotoOptions && (
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setShowPhotoOptions(false)}
              ></div>
            )}
          </div>
        
          <form className='w-full ps-4' onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className='flex'>
                <div className='flex-1'>
                  <label htmlFor="name" className="block mb-2 font-medium">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
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
                <label htmlFor="maritalStatus" className="block mb-2 font-medium">Marital Status</label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Status</option>
                  <option value="Married">Married</option>
                  <option value="Single">Single</option>
                </select>
              </div>

              <div>
                <label htmlFor="city" className="block mb-2 font-medium">City</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="state" className="block mb-2 font-medium">State</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select State</option>
                  {states.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}