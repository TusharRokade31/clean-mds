'use client'
import { 
  FormControlLabel, Checkbox, TextField, Button, 
  Grid, Typography, FormGroup, Accordion, 
  AccordionSummary, AccordionDetails, Radio, RadioGroup
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';

export default function AmenitiesForm({ formData, onChange, errors, onSave }) {
  const [expanded, setExpanded] = useState('mandatory'); // Start with mandatory open
  
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  const amenityCategories = {
    mandatory: {
      title: 'Mandatory Amenities',
      items: ['AirConditioning', 'Heating', 'WiFi', 'TV', 'Kitchen']
    },
    basicFacilities: {
      title: 'Basic Facilities',
      items: ['Washer', 'Dryer', 'Iron', 'HairDryer', 'Workspace']
    },
    generalServices: {
      title: 'General Services',
      items: ['RoomService', 'Concierge', 'Housekeeping', 'WakeUpService']
    },
    commonArea: {
      title: 'Common Areas',
      items: ['Pool', 'HotTub', 'Gym', 'Parking', 'Elevator']
    },
    foodBeverages: {
      title: 'Food & Beverages',
      items: ['Breakfast', 'Restaurant', 'Bar', 'CoffeeMachine']
    },
    healthWellness: {
      title: 'Health & Wellness',
      items: ['Spa', 'Sauna', 'FitnessCenter']
    },
    mediaTechnology: {
      title: 'Media & Technology',
      items: ['FlatscreenTV', 'StreamingServices', 'WorkspaceDesk']
    },
    paymentServices: {
      title: 'Payment Services',
      items: ['CreditCards', 'MobilePayments', 'OnlineBooking']
    },
    security: {
      title: 'Security',
      items: ['24HourSecurity', 'SecurityCameras', 'SafeBox']
    },
    safety: {
      title: 'Safety',
      items: ['SmokeDetectors', 'FireExtinguisher', 'FirstAidKit']
    }
  };
  
  const renderAmenityOptions = (category, amenity) => {
    // Get current amenity value or initialize if it doesn't exist
    const amenityValue = formData[category]?.[amenity] || { available: false };
    
    return (
      <Grid container spacing={2} alignItems="center" className="mb-3 pb-2 border-b">
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={amenityValue.available || false}
                onChange={(e) => {
                  onChange(category, amenity, {
                    ...amenityValue,
                    available: e.target.checked
                  });
                }}
              />
            }
            label={amenity.replace(/([A-Z])/g, ' $1').trim()} // Add spaces before capital letters
          />
        </Grid>
        
        {amenityValue.available && (
          <>
            <Grid item xs={12} sm={4}>
              <RadioGroup
                value={amenityValue.option || ''}
                onChange={(e) => {
                  onChange(category, amenity, {
                    ...amenityValue,
                    option: e.target.value
                  });
                }}
                row
              >
                <FormControlLabel value="included" control={<Radio />} label="Included" />
                <FormControlLabel value="extraCharge" control={<Radio />} label="Extra Charge" />
                <FormControlLabel value="roomControlled" control={<Radio />} label="Room Controlled" />
              </RadioGroup>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Additional Details"
                value={amenityValue.subOptions?.[0] || ''}
                onChange={(e) => {
                  onChange(category, amenity, {
                    ...amenityValue,
                    subOptions: [e.target.value]
                  });
                }}
              />
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>Property Amenities</Typography>
      <Typography variant="body2" className="mb-4">
        Select all amenities that are available at your property
      </Typography>
      
      {Object.entries(amenityCategories).map(([category, { title, items }]) => (
        <Accordion 
          key={category}
          expanded={expanded === category}
          onChange={handleAccordionChange(category)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {items.map(amenity => (
                <div key={amenity}>
                  {renderAmenityOptions(category, amenity)}
                </div>
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      ))}
      
      <div className="flex justify-end mt-4">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onSave}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}