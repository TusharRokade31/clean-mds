// Step3Size.jsx
"use client"
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePropertyStep3 } from '../../redux/features/property/propertySlice';

const Step3Size = ({ propertyData, nextStep, handleBack }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.property);
  
  const [formData, setFormData] = useState({
    acreage: propertyData.size?.acreage || 1,
    guests: propertyData.size?.guests || 1,
    bedrooms: propertyData.size?.bedrooms || 1,
    beds: propertyData.size?.beds || 1,
    bathrooms: propertyData.size?.bathrooms || 1,
    kitchens: propertyData.size?.kitchens || 1
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (formData.acreage <= 0) newErrors.acreage = 'Acreage must be greater than 0';
    if (formData.guests <= 0) newErrors.guests = 'Guests must be greater than 0';
    if (formData.bedrooms <= 0) newErrors.bedrooms = 'Bedrooms must be greater than 0';
    if (formData.beds <= 0) newErrors.beds = 'Beds must be greater than 0';
    if (formData.bathrooms <= 0) newErrors.bathrooms = 'Bathrooms must be greater than 0';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Dispatch update action
    const resultAction = await dispatch(updatePropertyStep3({
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
      <h2 className="text-2xl font-bold mb-6">How big is your place?</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Property size (acreage)</label>
          <input
            type="number"
            name="acreage"
            min="1"
            value={formData.acreage}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${errors.acreage ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.acreage && (
            <p className="mt-1 text-sm text-red-600">{errors.acreage}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">Size of your property in acres</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Guests</label>
          <div className="flex items-center">
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
              className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              name="guests"
              min="1"
              value={formData.guests}
              onChange={handleChange}
              className={`w-20 px-3 py-1 text-center border-t border-b ${errors.guests ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, guests: prev.guests + 1 }))}
              className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {errors.guests && (
            <p className="mt-1 text-sm text-red-600">{errors.guests}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Bedrooms</label>
          <div className="flex items-center">
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, bedrooms: Math.max(1, prev.bedrooms - 1) }))}
              className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              name="bedrooms"
              min="1"
              value={formData.bedrooms}
              onChange={handleChange}
              className={`w-20 px-3 py-1 text-center border-t border-b ${errors.bedrooms ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, bedrooms: prev.bedrooms + 1 }))}
              className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {errors.bedrooms && (
            <p className="mt-1 text-sm text-red-600">{errors.bedrooms}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Beds</label>
          <div className="flex items-center">
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, beds: Math.max(1, prev.beds - 1) }))}
              className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              name="beds"
              min="1"
              value={formData.beds}
              onChange={handleChange}
              className={`w-20 px-3 py-1 text-center border-t border-b ${errors.beds ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, beds: prev.beds + 1 }))}
              className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {errors.beds && (
            <p className="mt-1 text-sm text-red-600">{errors.beds}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Bathrooms</label>
          <div className="flex items-center">
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, bathrooms: Math.max(1, prev.bathrooms - 1) }))}
              className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              name="bathrooms"
              min="1"
              value={formData.bathrooms}
              onChange={handleChange}
              className={`w-20 px-3 py-1 text-center border-t border-b ${errors.bathrooms ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, bathrooms: prev.bathrooms + 1 }))}
              className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {errors.bathrooms && (
            <p className="mt-1 text-sm text-red-600">{errors.bathrooms}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Kitchens</label>
          <div className="flex items-center">
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, kitchens: Math.max(1, prev.kitchens - 1) }))}
              className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              name="kitchens"
              min="1"
              value={formData.kitchens}
              onChange={handleChange}
              className={`w-20 px-3 py-1 text-center border-t border-b ${errors.kitchens ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button 
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, kitchens: prev.kitchens + 1 }))}
              className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
            >
              +
            </button>
          </div>
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

export default Step3Size;