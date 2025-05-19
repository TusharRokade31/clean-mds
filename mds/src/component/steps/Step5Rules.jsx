// Step5Rules.jsx
"use client"
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePropertyStep5 } from '../../redux/features/property/propertySlice';

const Step5Rules = ({ propertyData, nextStep, handleBack }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.property);
  
  const [formData, setFormData] = useState({
    smoking: propertyData.rules?.smoking || false,
    pets: propertyData.rules?.pets || false,
    partyOrganizing: propertyData.rules?.partyOrganizing || false,
    cooking: propertyData.rules?.cooking || false,
    additionalRules: propertyData.rules?.additionalRules || ''
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(value)
    console.log(checked)
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const resultAction = await dispatch(updatePropertyStep5({
      id: propertyData._id,
      data: formData
    }));
    
    if (!resultAction.error) {
      nextStep();
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">House Rules</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <p className="text-gray-700 mb-4">Let guests know what's allowed in your property</p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smoking"
                name="smoking"
                checked={formData.smoking}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="smoking" className="ml-3 text-gray-700">Smoking allowed</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pets"
                name="pets"
                checked={formData.pets}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="pets" className="ml-3 text-gray-700">Pets allowed</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="partyOrganizing"
                name="partyOrganizing"
                checked={formData.partyOrganizing}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="partyOrganizing" className="ml-3 text-gray-700">Events or parties allowed</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="cooking"
                name="cooking"
                checked={formData.cooking}
                onChange={handleChange}
                className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="cooking" className="ml-3 text-gray-700">Cooking allowed</label>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Additional rules (optional)</label>
          <textarea
            name="additionalRules"
            value={formData.additionalRules}
            onChange={handleChange}
            placeholder="Any specific house rules you'd like guests to know about"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
          <p className="mt-1 text-sm text-gray-500">
            You can add more specific rules or guidelines for guests
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

export default Step5Rules;