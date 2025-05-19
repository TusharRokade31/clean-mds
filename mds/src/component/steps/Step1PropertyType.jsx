// Step1PropertyType.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePropertyStep1 } from '../../redux/features/property/propertySlice';

const propertyTypes = [
  { id: 'hotel', label: 'Hotel', description: 'A professional hospitality venue that offers a distinctive theme, unique service, and accommodations to guests.' },
  { id: 'Cottage', label: 'Cottage', description: 'A charming, fully furnished dwelling, typically located in residential areas for a homely feel.' },
  { id: 'villa', label: 'Villa', description: 'An upscale, standalone residence, often featuring private outdoor spaces like a pool or garden for a luxurious experience.' },
  { id: 'Cabin', label: 'Cabin', description: 'A cozy and compact home, typically located in nature-rich environments offering peaceful retreats.' },
  { id: 'Farm stay', label: 'Farm stay', description: 'A countryside retreat offering a serene, rural setting, often with hands-on farm experiences for guests.' },
  { id: 'Houseboat', label: 'Houseboat', description: 'A unique floating accommodation, offering a scenic experience with the option to explore water-based destinations.' },
  { id: 'Lighthouse', label: 'Lighthouse', description: 'An iconic, coastal structure offering a quiet, scenic stay with panoramic views, often used as a charming residence.' },
];


const rentalForms = [
  { id: 'entire', label: 'Entire place', description: 'Guests have the whole place to themselves—there\'s a private entrance and no shared spaces. A bedroom, bathroom, and kitchen are usually included.' },
  { id: 'private', label: 'Private room', description: 'Guests have their own private room for sleeping, and may share some common spaces with you or others.' },
  { id: 'shared', label: 'Shared room', description: 'Guests sleep in a room or common area that may be shared with you or others.' }
];

const Step1PropertyType = ({ propertyData, nextStep, handleBack }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.property);
  
  const [formData, setFormData] = useState({
    propertyType: propertyData.propertyType || 'Hotel',
    placeName: propertyData.placeName || '',
    rentalForm: propertyData.rentalForm || 'Entire place'
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.placeName.trim()) {
      newErrors.placeName = 'Place name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Dispatch update action
    const resultAction = await dispatch(updatePropertyStep1({
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
      <h2 className="text-2xl font-bold mb-6">Choose listing categories</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Choose a property type</label>
          <div className="relative">
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {propertyTypes.map(type => (
                <option key={type.id} value={type.label}>{type.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {propertyTypes.find(t => t.label === formData.propertyType)?.description || ''}
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Place name</label>
          <input
            type="text"
            name="placeName"
            value={formData.placeName}
            onChange={handleChange}
            placeholder="Place name"
            className={`w-full px-4 py-2 border ${errors.placeName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          {errors.placeName && (
            <p className="mt-1 text-sm text-red-600">{errors.placeName}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            A catchy name usually includes: House name + Room name + Featured property + Tourist destination
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Rental form</label>
          <div className="relative">
            <select
              name="rentalForm"
              value={formData.rentalForm}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {rentalForms.map(form => (
                <option key={form.id} value={form.label}>{form.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {rentalForms.find(f => f.label === formData.rentalForm)?.description || ''}
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

export default Step1PropertyType;