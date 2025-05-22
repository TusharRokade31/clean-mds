'use client'
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { 
  Tabs, Tab, Typography, Box, Button, 
  Stepper, Step, StepLabel, Paper
} from '@mui/material';
import { 
  initializeProperty, 
  getProperty, 
  resetCurrentProperty,
  getDraftProperties,
  updateBasicInfo,
  updateLocation,
  updateAmenities,
  addRooms
} from '@/redux/features/property/propertySlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BasicInfoForm from '@/component/BasicInfoForm';
import LocationForm from '@/component/LocationForm';
import AmenitiesForm from '@/component/AmenitiesForm';
import RoomsForm from '@/component/RoomsForm';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `property-tab-${index}`,
    'aria-controls': `property-tabpanel-${index}`,
  };
}

export default function PropertyForm() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { currentProperty, isLoading, error, draftProperties } = useSelector(state => state.property);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [formData, setFormData] = useState({
    basicInfo: {},
    location: {},
    amenities: {
      mandatory: {},
      basicFacilities: {},
      generalServices: {},
      commonArea: {},
      foodBeverages: {},
      healthWellness: {},
      mediaTechnology: {},
      paymentServices: {},
      security: {},
      safety: {}
    },
    rooms: []
  });
  
  const hasInitializedRef = useRef(false);

  // Initialize property data
  useEffect(() => {
    let isInitializing = false;
    
    if (!hasInitializedRef.current && !isInitializing) {
      isInitializing = true;
      hasInitializedRef.current = true;
      
      const timer = setTimeout(() => {
        if (id) {
          dispatch(getProperty(id));
        } else {
          dispatch(getDraftProperties()).then(result => {
            if (result.payload && result.payload.data && result.payload.data.length > 0) {
              setShowDraftModal(true);
            } else {
              dispatch(initializeProperty());
            }
          }).catch(err => {
            console.error("Error fetching draft properties:", err);
            dispatch(initializeProperty());
          });
        }
      }, 10);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [dispatch, id]);
  
  // Handle unmount
  useEffect(() => {
    return () => {
      dispatch(resetCurrentProperty());
      hasInitializedRef.current = false;
    };
  }, [dispatch]);

  // Update form data when property data is loaded
  useEffect(() => {
    if (currentProperty && currentProperty.property) {
      const property = currentProperty.property;
      
      // Set initial tab based on form progress
      if (property.formProgress) {
        if (!property.formProgress.step1Completed) setActiveTab(0);
        else if (!property.formProgress.step2Completed) setActiveTab(1);
        else if (!property.formProgress.step3Completed) setActiveTab(2);
        else if (!property.formProgress.step4Completed) setActiveTab(3);
      }
      
      // Initialize form data
      setFormData({
        basicInfo: {
          propertyType: property.propertyType || '',
          placeName: property.placeName || '',
          placeRating: property.placeRating || '',
          propertyBuilt: property.propertyBuilt || '',
          bookingSince: property.bookingSince || '',
          rentalForm: property.rentalForm || ''
        },
        location: property.location || {},
        amenities: property.amenities || {
          mandatory: {},
          basicFacilities: {},
          generalServices: {},
          commonArea: {},
          foodBeverages: {},
          healthWellness: {},
          mediaTechnology: {},
          paymentServices: {},
          security: {},
          safety: {}
        },
        rooms: property.rooms || []
      });
    }
  }, [currentProperty]);

  const handleTabChange = (event, newValue) => {
    // Check if moving forward
    if (newValue > activeTab) {
      // Validate current tab before allowing to move forward
      const isValid = validateCurrentTab(activeTab);
      if (!isValid) return;
    }
    
    setActiveTab(newValue);
  };

  const validateCurrentTab = (tab) => {
    let isValid = true;
    const errors = {};
    
    switch(tab) {
      case 0: // Basic Info
        if (!formData.basicInfo.propertyType) {
          errors.propertyType = 'Property type is required';
          isValid = false;
        }
        if (!formData.basicInfo.placeName) {
          errors.placeName = 'Place name is required';
          isValid = false;
        }
        if (!formData.basicInfo.placeRating) {
          errors.placeRating = 'Rating is required';
          isValid = false;
        }
        if (!formData.basicInfo.propertyBuilt) {
          errors.propertyBuilt = 'Built year is required';
          isValid = false;
        }
        if (!formData.basicInfo.bookingSince) {
          errors.bookingSince = 'Booking since date is required';
          isValid = false;
        }
        if (!formData.basicInfo.rentalForm) {
          errors.rentalForm = 'Rental form is required';
          isValid = false;
        }
        break;
        
      case 1: // Location
        if (!formData.location.country) {
          errors.country = 'Country is required';
          isValid = false;
        }
        if (!formData.location.street) {
          errors.street = 'Street is required';
          isValid = false;
        }
        if (!formData.location.city) {
          errors.city = 'City is required';
          isValid = false;
        }
        if (!formData.location.state) {
          errors.state = 'State is required';
          isValid = false;
        }
        if (!formData.location.postalCode) {
          errors.postalCode = 'Postal code is required';
          isValid = false;
        }
        break;
        
      case 2: // Amenities
        // Check if mandatory amenities are selected
        // This would depend on your specific requirements
        break;
        
      case 3: // Rooms
        if (formData.rooms.length === 0) {
          errors.rooms = 'At least one room is required';
          isValid = false;
        }
        break;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveBasicInfo = async () => {
    if (!validateCurrentTab(0)) return;
    
    if (currentProperty && currentProperty.property) {
      await dispatch(updateBasicInfo({
        id: currentProperty.property._id,
        data: formData.basicInfo
      }));
      
      setActiveTab(1);
    }
  };

  const handleSaveLocation = async () => {
    if (!validateCurrentTab(1)) return;
    
    if (currentProperty && currentProperty.property) {
      await dispatch(updateLocation({
        id: currentProperty.property._id,
        data: formData.location
      }));
      
      setActiveTab(2);
    }
  };

  const handleSaveAmenities = async () => {
    if (!validateCurrentTab(2)) return;
    
    if (currentProperty && currentProperty.property) {
      await dispatch(updateAmenities({
        id: currentProperty.property._id,
        data: { amenities: formData.amenities }
      }));
      
      setActiveTab(3);
    }
  };

  const handleAddRoom = async (roomData) => {
    if (currentProperty && currentProperty.property) {
      await dispatch(addRooms({
        id: currentProperty.property._id,
        data: roomData
      }));
      
      // Update rooms in formData
      setFormData(prev => ({
        ...prev,
        rooms: [...prev.rooms, roomData]
      }));
    }
  };

  const selectDraftProperty = (propertyId) => {
    dispatch(getProperty(propertyId));
    setShowDraftModal(false);
  };
  
  const createNewProperty = () => {
    dispatch(initializeProperty());
    setShowDraftModal(false);
  };

  const DraftPropertyModal = () => {
    if (!showDraftModal) return null;
    
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Continue your listing</h2>
          <p className="mb-4">You have unfinished property listings. Would you like to continue working on one of them?</p>
          
          <div className="max-h-60 overflow-y-auto mb-4">
            {draftProperties && draftProperties.data && draftProperties.data.map(property => (
              <div 
                key={property._id} 
                className="p-3 border border-gray-200 rounded-md mb-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => selectDraftProperty(property._id)}
              >
                <h3 className="font-medium">{property.propertyType || 'Draft property'}</h3>
                <p className="text-sm text-gray-500">Last updated: {new Date(property.updatedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={createNewProperty}
            >
              Create new listing
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !currentProperty) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const steps = ['Basic Info', 'Location', 'Amenities', 'Rooms', 'Photos', 'Policies', 'Finance & Legal'];

  return (
    <>
      <DraftPropertyModal />
      <Paper className="max-w-7xl mx-auto my-8 p-4">
        <Stepper activeStep={activeTab} alternativeLabel className="mb-8">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              aria-label="property form tabs"
            >
              {steps.map((step, index) => (
                <Tab key={index} label={step} {...a11yProps(index)} />
              ))}
            </Tabs>
          </Box>
          
          <TabPanel value={activeTab} index={0} dir={theme.direction}>
            <BasicInfoForm 
              formData={formData.basicInfo}
              onChange={(field, value) => handleInputChange('basicInfo', field, value)}
              errors={formErrors}
              onSave={handleSaveBasicInfo}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={1} dir={theme.direction}>
            <LocationForm 
              formData={formData.location}
              onChange={(field, value) => handleInputChange('location', field, value)}
              errors={formErrors}
              onSave={handleSaveLocation}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2} dir={theme.direction}>
            <AmenitiesForm 
              formData={formData.amenities}
              onChange={(category, amenity, value) => {
                setFormData(prev => ({
                  ...prev,
                  amenities: {
                    ...prev.amenities,
                    [category]: {
                      ...prev.amenities[category],
                      [amenity]: value
                    }
                  }
                }));
              }}
              errors={formErrors}
              onSave={handleSaveAmenities}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={3} dir={theme.direction}>
            <RoomsForm 
              rooms={formData.rooms}
              onAddRoom={handleAddRoom}
              errors={formErrors}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={4} dir={theme.direction}>
            Photos and Videos Form (Coming Soon)
          </TabPanel>
          
          <TabPanel value={activeTab} index={5} dir={theme.direction}>
            Policies Form (Coming Soon)
          </TabPanel>
          
          <TabPanel value={activeTab} index={6} dir={theme.direction}>
            Finance & Legal Form (Coming Soon)
          </TabPanel>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            disabled={activeTab === 0}
            onClick={() => setActiveTab(prevTab => prevTab - 1)}
          >
            Previous
          </Button>
          
          <Button
            variant="contained"
            onClick={() => {
              if (activeTab === steps.length - 1) {
                // Submit the entire form
                console.log('Submit form', formData);
              } else {
                // Move to next tab after validation
                const isValid = validateCurrentTab(activeTab);
                if (isValid) {
                  setActiveTab(prevTab => prevTab + 1);
                }
              }
            }}
          >
            {activeTab === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </>
  );
}