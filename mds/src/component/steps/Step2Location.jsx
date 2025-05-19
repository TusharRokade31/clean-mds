// Step2Location.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePropertyStep2 } from '../../redux/features/property/propertySlice';

const Step2Location = ({ propertyData, nextStep, handleBack }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.property);
  
  const [formData, setFormData] = useState({
    country: propertyData.location?.country || '',
    street: propertyData.location?.street || '',
    roomNumber: propertyData.location?.roomNumber || '',
    city: propertyData.location?.city || '',
    state: propertyData.location?.state || '',
    postalCode: propertyData.location?.postalCode || '',
    coordinates: propertyData.location?.coordinates || { lat: '', lng: '' }
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCoordinatesChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [name]: value
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    // Dispatch update action
    const resultAction = await dispatch(updatePropertyStep2({
      id: propertyData._id,
      data: formData
  }));
    
    // If successful, move to next step
    if (!resultAction.error) {
      nextStep();
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Where's your place located?</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Country/Region</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className={`w-full px-4 py-2 border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Street address</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="123 Main St"
            className={`w-full px-4 py-2 border ${errors.street ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Apartment, suite, etc. (optional)</label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            placeholder="Apt #, Suite, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className={`w-full px-4 py-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className={`w-full px-4 py-2 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Postal code</label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Postal Code"
            className={`w-full px-4 py-2 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Coordinates (optional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="lat"
              value={formData.coordinates.lat}
              onChange={handleCoordinatesChange}
              placeholder="Latitude"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              name="lng"
              value={formData.coordinates.lng}
              onChange={handleCoordinatesChange}
              placeholder="Longitude"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enter the exact coordinates for your property if you know them.
          </p>
        </div>
        
   <div className="flex justify-between mt-8">
        <button
          type='button'
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Go back
        </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2Location;