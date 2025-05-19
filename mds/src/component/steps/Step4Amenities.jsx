// Step4Amenities.jsx
"use client"
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePropertyStep4 } from '../../redux/features/property/propertySlice';

const generalAmenities = [
  'Wi-Fi', 'TV', 'Kitchen', 'Washer', 'Free parking', 'Paid parking',
  'Air conditioning', 'Heating', 'Dedicated workspace', 'Pool', 'Hot tub',
  'Patio', 'BBQ grill', 'Outdoor dining area', 'Fire pit', 'Gym'
];

const otherAmenities = [
  'Beachfront', 'Waterfront', 'Ski-in/ski-out', 'Garden view', 'Mountain view',
  'Lake view', 'Sea view', 'Breakfast included', 'Cleaning service', 'Doorman'
];

const safetyAmenities = [
  'Smoke alarm', 'Carbon monoxide alarm', 'Fire extinguisher', 'First aid kit',
  'Emergency exit', 'Security cameras', '24/7 security'
];



const Mandatory = [
  {
    name: 'Air Conditioning',
    options: ['room controlled', 'centralize'],
    Suboptions: ['All-Weather (Hot & Cold)',]

  },
  {
    name: 'Laundry',
    options: ['Free', 'Paid'],
    Suboptions: ['Limited Pieces of Laundry Free',]
  },
  {
    name: 'Newspaper',
    options: ['Local Language', 'English'],
    Suboptions: []
  },

  {
    name: 'Parking',
    options: ['Free', 'Paid'],
    Suboptions: ['Onsite', 'Valet', 'Public',]
  },

  {
    name: 'Room service',
    options: ['24 Hours', 'Limited duration'],
    Suboptions: []
  },

  {
    name: 'Smoke detector',
    options: ['In Room', 'Lobby'],
    Suboptions: []
  },


  {
    name: 'Swimming Pool',
    options: ['In Room', 'Lobby'],
    Suboptions: ['Common Pool',
      'Kids Pool',
      'Infinity Pool',
      'Indoor Pool',
      'Heated Pool',
      'Roof Top Pool',
      'Sunny Swimming',
      'Plunge Pool',
      'Pool cover',
      'Pool with a view',
      'Saltwater pool',
      'Shallow end',
      'Indoor Pool',
      'Fully secluded outdoor pool',
      'Women-only pool',]
  },


  {
    name: 'Wifi',
    options: ['Free', 'Paid'],
    Suboptions: ['Speed Suitable for Working', 'Speed Suitable for Surfing', 'Unreliable', 'Avaliable in Lobby ',]
  },

  {
    name: 'Reception',
    options: ['24 Hours', 'Limited duration'],
    Suboptions: []
  },


  {
    name: 'Restaurant/Bhojnalay',
    options: ['24 Hours', 'Limited duration'],
    Suboptions: ['Halal', 'Kosher', 'Veg food available', 'Jain food available', 'Satvik food available','Indian']
  },

  {
    name: 'Luggage assistance',
    options: [],
    Suboptions: []
  },

   {
    name: 'Wheelchair',
    options: ['Free', 'Paid'],
    Suboptions: []
  },

  {
    name: 'CCTV',
    options: [],
    Suboptions: []
  },

  {
    name: 'Fire extinguishers',
    options: [],
    Suboptions: []
  },

  {
    name: 'Langar/Prasad',
    options: [],
    Suboptions: []
  },

  {
    name: 'First-aid services',
    options: [],
    Suboptions: []
  },

  {
    name: 'Religious site',
    options: [],
    Suboptions: []
  },
  {
    name: 'spiritualEvents',
    options: [],
    Suboptions: []
  },
]




const BasicFacilities = [

  {
    name: 'Elevator/ Lift',
    options: [],
    Suboptions: []
  },

  {
    name: 'Housekeeping',
    options: [],
    Suboptions: []
  },

   {
    name: 'Kitchen/Kitchenette',
    options: [],
    Suboptions: ['Cooking appliances','Microwave', 'Utensils', 'Toaster', 'Induction', 'Cutlery']
  },
  
 
  
  'Power backup',
  'Refrigerator',
  'Washing Machine',
];

const GeneralServices = [
  'Bellboy service',
  'Caretaker',
  'Luggage storage',
  'Specially abled assistance',
  'Wake-up Call / Service',
  'Pool/ Beach towels',
]
const CommanArea = [
  'Balcony/ Terrace',
  'Fireplace',
  'Lawn',
  'Seating Area',
  'Prayer Room',
  'Living Room',
  'Sitout Area',
  'Bonfire Pit',
]


const FoodandBeverages = [
  'Dining Area/Bhojnalay',
  `Kid's Menu`,
  'Breakfast',
  'Food Options Available ',
]

const Healthandwellness = [
  'Activity Centre',
  'Yoga',
  'Meditation Room',
]


const Security = [
  'Security alarms',
  'Security Guard',
  'Carbon Monoxide Detector',
]


const MediaTechnology = [
  'TV'
]

const PaymentServices = [
  'Currency Exchange'
]

const AmenityCheckbox = ({ name, label, checked, onChange }) => (
  <div className="flex items-center mb-2">
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 text-indigo-600 rounded"
    />
    <label htmlFor={name} className="ml-2 text-gray-700">{label}</label>
  </div>
);

const Step4Amenities = ({ propertyData, nextStep, handleBack }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.property);

  const [formData, setFormData] = useState({
    general: propertyData.amenities?.general || [],
    other: propertyData.amenities?.other || [],
    safety: propertyData.amenities?.safety || []
  });

  const handleCheckboxChange = (category, item) => {
    setFormData(prev => {
      const currentItems = prev[category];
      const updatedItems = currentItems.includes(item)
        ? currentItems.filter(i => i !== item)
        : [...currentItems, item];

      return {
        ...prev,
        [category]: updatedItems
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dispatch update action
    const resultAction = await dispatch(updatePropertyStep4({
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
      <h2 className="text-2xl font-bold mb-6">What amenities do you offer?</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4">General amenities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {generalAmenities.map(item => (
              <AmenityCheckbox
                key={item}
                name={`general-${item}`}
                label={item}
                checked={formData.general.includes(item)}
                onChange={() => handleCheckboxChange('general', item)}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4">Other features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {otherAmenities.map(item => (
              <AmenityCheckbox
                key={item}
                name={`other-${item}`}
                label={item}
                checked={formData.other.includes(item)}
                onChange={() => handleCheckboxChange('other', item)}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4">Safety features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {safetyAmenities.map(item => (
              <AmenityCheckbox
                key={item}
                name={`safety-${item}`}
                label={item}
                checked={formData.safety.includes(item)}
                onChange={() => handleCheckboxChange('safety', item)}
              />
            ))}
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

export default Step4Amenities;