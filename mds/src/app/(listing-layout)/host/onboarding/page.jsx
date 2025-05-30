'use client'
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { 
  Tabs, Tab, Typography, Box, Button, 
  Stepper, Step, StepLabel, Paper, Alert
} from '@mui/material';
import { 
  initializeProperty, 
  getProperty, 
  resetCurrentProperty,
  getDraftProperties,
  updateBasicInfo,
  updateLocation,
  updateAmenities,
  addRooms,
  updateRoom
} from '@/redux/features/property/propertySlice';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BasicInfoForm from '@/component/BasicInfoForm';
import LocationForm from '@/component/LocationForm';
import AmenitiesForm from '@/component/AmenitiesForm';
import RoomsForm from '@/component/RoomsForm';
import MediaForm from '@/component/MediaForm';

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
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { currentProperty, isLoading, error, draftProperties } = useSelector(state => state.property);
  console.log(currentProperty, "from main page")
  console.log(draftProperties)
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [formData, setFormData] = useState({
    basicInfo: {
      propertyType: '',
      placeName: '',
      placeRating: '',
      propertyBuilt: '',
      bookingSince: '',
      rentalForm: ''
    },
    location: {
      country: '',
      street: '',
      roomNumber: '',
      city: '',
      state: '',
      postalCode: '',
      coordinates: { lat: null, lng: null }
    },
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
  console.log(formData.basicInfo)
  const hasInitializedRef = useRef(false);

  // Initialize property data
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      if (id) {
        dispatch(getProperty(id));
      } else {
        dispatch(getDraftProperties())
          if (dispatch(getDraftProperties()).unwrap()) {
            setShowDraftModal(true);
          } else {
            dispatch(initializeProperty());
          }
        
      }
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
    if (currentProperty) {
      const property = currentProperty;
      
      // Set initial tab based on form progress
      if (property.formProgress) {
        if (!property.formProgress.step1Completed) setActiveTab(0);
        else if (!property.formProgress.step2Completed) setActiveTab(1);
        else if (!property.formProgress.step3Completed) setActiveTab(2);
        else if (!property.formProgress.step4Completed) setActiveTab(3);
      }
      
      // Initialize form data with property data
      setFormData({
        basicInfo: {
          propertyType: property.propertyType || '',
          placeName: property.placeName || '',
          placeRating: property.placeRating || '',
          propertyBuilt: property.propertyBuilt || '',
          bookingSince: property.bookingSince || '',
          rentalForm: property.rentalForm || ''
        },
        location: {
          country: property.location?.country || '',
          street: property.location?.street || '',
          roomNumber: property.location?.roomNumber || '',
          city: property.location?.city || '',
          state: property.location?.state || '',
          postalCode: property.location?.postalCode || '',
          coordinates: property.location?.coordinates || { lat: null, lng: null }
        },
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
        rooms: property.rooms || {}
      });
    }
  }, [currentProperty]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  const handleSaveAndNext = async (tabIndex) => {
    if (!currentProperty?._id) return;

    let result;
    
    switch(tabIndex) {
      case 0: // Basic Info
        result = await dispatch(updateBasicInfo({
          id: currentProperty._id,
          data: formData.basicInfo
        }));
        break;
        
      case 1: // Location
        result = await dispatch(updateLocation({
          id: currentProperty._id,
          data: formData.location
        }));
        break;
        
      case 2: // Amenities
        result = await dispatch(updateAmenities({
          id: currentProperty._id,
          data: { amenities: formData.amenities }
        }));
        break;

      case 3: // Rooms
        if (formData.rooms.length === 0) {
          alert('Please add at least one room before continuing');
          return;
        }
        // Don't dispatch addRooms here since it's already handled in RoomsForm
        // Just proceed to next step or completion
        if (tabIndex < 3) {
          setActiveTab(tabIndex + 1);
        } else {
          // Handle completion
          console.log('Property listing completed');
          // Navigate to success page or show completion message
        }
        break;

      case 4: // Media
      // Media completion is handled within MediaForm component
      // Just proceed to next step
      if (tabIndex < 6) {
        setActiveTab(tabIndex + 1);
      }
      break;
        
      default:
        return;
    }
    
   if (result.type.endsWith('/fulfilled')) {
    if (tabIndex < 3) {
      setActiveTab(tabIndex + 1);
    } else {
      // Handle completion
      console.log('Property listing completed');
      // Navigate to success page or show completion message
    }
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">Continue your listing</h2>
          <p className="mb-4">You have unfinished property listings. Would you like to continue working on one of them?</p>
          
          <div className="max-h-60 overflow-y-auto mb-4">
            {draftProperties?.map(property => (
              <div 
                key={property._id} 
                className="p-3 border border-gray-200 rounded-md mb-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => selectDraftProperty(property._id)}
              >
                <h3 className="font-medium">{property.placeName || property.propertyType || 'Draft property'}</h3>
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(property.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outlined"
              onClick={createNewProperty}
            >
              Create new listing
            </Button>
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

  const steps = ['Basic Info', 'Location', 'Amenities', 'Rooms',"Photos And Videos", "Policies", "Finance & Legal"];

  return (
    <>
      <DraftPropertyModal />
      <Paper className="max-w-7xl mx-auto my-8 p-4">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
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
              <Tab 
                key={index}   
                label={step} 
                {...a11yProps(index)}
                // Allow navigation to previous completed steps
                disabled={
                  index > 0 && 
                  !currentProperty?.formProgress?.[`step${index}Completed`] &&
                  index > activeTab
                }
              />
            ))}
          </Tabs>
          </Box>
          
          <TabPanel value={activeTab} index={0} dir={theme.direction}>
            <BasicInfoForm 
              formData={formData.basicInfo}
              onChange={(field, value) => handleInputChange('basicInfo', field, value)}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={1} dir={theme.direction}>
            <LocationForm 
              formData={formData.location}
              onChange={(field, value) => handleInputChange('location', field, value)}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2} dir={theme.direction}>
            <AmenitiesForm 
              formData={formData.amenities}
              onChange={(updatedAmenities) => {
                setFormData(prev => ({
                  ...prev,
                  amenities: updatedAmenities
                }));
              }}
            />
          </TabPanel>
          
          <TabPanel value={activeTab} index={3} dir={theme.direction}>
            <RoomsForm 
              rooms={formData.rooms}
              propertyId={currentProperty?._id}
              onAddRoom={(updatedRooms) => {
                setFormData(prev => ({
                  ...prev,
                  rooms: updatedRooms
                }));
              }}
              onSave={() => handleSaveAndNext(3)}
              onBack={() => setActiveTab(2)}
              // errors={error}
            />
          </TabPanel>
          <TabPanel value={activeTab} index={4} dir={theme.direction}>
          <MediaForm
            propertyId={currentProperty?._id}
            onSave={() => handleSaveAndNext(4)}
            onBack={() => setActiveTab(3)}    
          />
        </TabPanel>
          <TabPanel value={activeTab} index={5} dir={theme.direction}>
           {`Polices`}
          </TabPanel>
          <TabPanel value={activeTab} index={6} dir={theme.direction}>
           {`Finance & Legal`}
          </TabPanel>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
  <Button
    variant="outlined"
    disabled={activeTab === 0}
    onClick={() => setActiveTab(prev => prev - 1)}
  >
    Previous
  </Button>
  
  {activeTab < 6 && (
    <Button
      variant="contained"
      onClick={() => handleSaveAndNext(activeTab)}
      disabled={isLoading}
    >
      Save & Continue
    </Button>
  )}
  
  {activeTab === 6 && (
    <Button
      variant="contained"
      onClick={() => {
        if (formData.rooms.length > 0) {
          handleSaveAndNext(activeTab);
        } else {
          alert('Please add at least one room to complete the listing');
        }
      }}
      disabled={isLoading || formData.rooms.length === 0}
    >
      Complete Listing
    </Button>
  )}
</Box>
      </Paper>
    </>
  );
}