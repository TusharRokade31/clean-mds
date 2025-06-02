'use client'
import { 
  FormControlLabel, Radio, RadioGroup, TextField, Button, 
  Grid, Typography, FormGroup, Checkbox, FormControl, FormLabel,
  Tabs, Tab, Box, Chip, Select, MenuItem, InputLabel
} from '@mui/material';
import { useState } from 'react';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
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

export default function AmenitiesForm({ formData, onChange, errors, onSave }) {
  const [selectedTab, setSelectedTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };


  // Updated amenity data structure
  const amenityCategories = {
    mandatory: {
      title: 'Mandatory',
      items: [
        {
          name: 'Air Conditioning',
          options: ['room controlled', 'centralize'],
          Suboptions: ['All-Weather (Hot & Cold)']
        },
        {
          name: 'Laundry',
          options: ['Free', 'Paid'],
          Suboptions: ['Limited Pieces of Laundry Free']
        },
        {
          name: 'Newspaper',
          options: ['Local Language', 'English'],
          Suboptions: []
        },
        {
          name: 'Parking',
          options: ['Free', 'Paid'],
          Suboptions: ['Onsite', 'Valet', 'Public']
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
          Suboptions: ['Common Pool', 'Kids Pool', 'Infinity Pool', 'Indoor Pool', 'Heated Pool', 'Roof Top Pool']
        },
        {
          name: 'Wifi',
          options: ['Free', 'Paid'],
          Suboptions: ['Speed Suitable for Working', 'Speed Suitable for Surfing', 'Unreliable', 'Available in Lobby']
        },
        {
          name: 'Reception',
          options: ['24 Hours', 'Limited duration'],
          Suboptions: []
        },
        {
          name: 'Restaurant/Bhojnalay',
          options: ['24 Hours', 'Limited duration'],
          Suboptions: ['Halal', 'Kosher', 'Veg food available', 'Jain food available', 'Satvik food available', 'Indian']
        }
      ]
    },
    basicFacilities: {
      title: 'Basic Facilities',
      items: [
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
          Suboptions: ['Cooking appliances', 'Microwave', 'Utensils', 'Toaster', 'Induction', 'Cutlery']
        },
        {
          name: 'Power backup',
          options: ['Genset', 'Inverter'],
          Suboptions: []
        },
        {
          name: 'Refrigerator',
          options: [],
          Suboptions: []
        },
        {
          name: 'Washing Machine',
          options: [],
          Suboptions: []
        }
      ]
    },
    generalServices: {
      title: 'General Services',
      items: [
        {
          name: 'Bellboy service',
          options: [],
          Suboptions: []
        },
        {
          name: 'Caretaker',
          options: [],
          Suboptions: []
        },
        {
          name: 'Luggage storage',
          options: [],
          Suboptions: []
        },
        {
          name: 'Specially abled assistance',
          options: [],
          Suboptions: ['Auditory Guidance', 'Wheelchair', 'Braille', 'Tactile signs']
        }
      ]
    },
    commonArea: {
      title: 'Common Area',
      items: [
        {
          name: 'Balcony/ Terrace',
          options: [],
          Suboptions: []
        },
        {
          name: 'Fireplace',
          options: ['Indoor', 'Outdoor', 'Common'],
          Suboptions: ['Free', 'Paid']
        },
        {
          name: 'Lawn',
          options: [],
          Suboptions: []
        },
        {
          name: 'Seating Area',
          options: [],
          Suboptions: []
        }
      ]
    },
    foodBeverages: {
      title: 'Food and Beverages',
      items: [
        {
          name: 'Dining Area/Bhojnalay',
          options: ['Balcony', 'Verandah', 'Seating Arrangements on the Lawn', 'Poolside sit-out-area', 'Patio'],
          Suboptions: []
        },
        {
          name: "Kid's Menu",
          options: [],
          Suboptions: []
        },
        {
          name: 'Breakfast',
          options: [],
          Suboptions: ['Indian Veg food', 'Jain food']
        }
      ]
    },
    healthWellness: {
      title: 'Health and Wellness',
      items: [
        {
          name: 'Activity Centre',
          options: [],
          Suboptions: []
        },
        {
          name: 'Yoga',
          options: [],
          Suboptions: []
        },
        {
          name: 'Meditation Room',
          options: [],
          Suboptions: []
        }
      ]
    },
    security: {
      title: 'Security',
      items: [
        {
          name: 'Security alarms',
          options: [],
          Suboptions: []
        },
        {
          name: 'Security Guard',
          options: [],
          Suboptions: []
        },
        {
          name: 'Carbon Monoxide Detector',
          options: [],
          Suboptions: []
        }
      ]
    },
    mediaTechnology: {
      title: 'Media Technology',
      items: [
        {
          name: 'TV',
          options: [],
          Suboptions: ['LED', 'LCD', 'Flat Screen', 'International Channels', 'HD Channels', 'Satellite TV', 'Remote Controlled', 'Cable', 'Smart TV']
        }
      ]
    }
  };

  // Get amenity value from form data
  const getAmenityValue = (category, amenityName) => {
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');
    return formData?.[category]?.[key] || { 
      available: false,
      option: [], // Back to array for multiple selection
      subOptions: [] // Back to array for multiple selection
    };
  };

  // Handle amenity changes - Updated to work with parent component
  const handleAmenityChange = (category, amenityName, updates) => {
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');
    
    // Create the updated amenities object
    const updatedAmenities = {
      ...formData,
      [category]: {
        ...formData[category],
        [key]: updates
      }
    };
    
    // Call the parent's onChange function with the updated amenities
    onChange(updatedAmenities);
  };

  // Count selected amenities for each category
  const getSelectedCount = (category) => {
    const categoryData = formData?.[category];
    if (!categoryData) return 0;
    
    return Object.values(categoryData).filter(amenity => amenity.available).length;
  };

  const renderAmenityOptions = (category, amenity) => {
    const amenityValue = getAmenityValue(category, amenity.name);
    const hasOptions = amenity.options && amenity.options.length > 0;
    const hasSuboptions = amenity.Suboptions && amenity.Suboptions.length > 0;
    
    return (
      <Grid container spacing={3} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #e0e0e0' }}>
        {/* Amenity Name and Yes/No Radio */}
        <Grid item xs={12}>
          <FormControl sx={{display:"flex", alignItems:"center"}} component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
              {amenity.name}
            </FormLabel>
            <RadioGroup
              value={amenityValue.available ? 'yes' : 'no'}
              onChange={(e) => {
                const isAvailable = e.target.value === 'yes';
                handleAmenityChange(category, amenity.name, {
                  available: isAvailable,
                  option: isAvailable ? amenityValue.option : [],
                  subOptions: isAvailable ? amenityValue.subOptions : []
                });
              }}
              row
            >
              <FormControlLabel value="no" control={<Radio />} label="No" />
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Show Options dropdown if available and amenity is selected */}
        {amenityValue.available && hasOptions && (
          <Grid item size={{xs:12, md:3}}>
            <FormControl fullWidth>
              <InputLabel>Select Options</InputLabel>
              <Select
                multiple
                value={amenityValue.option || []}
                label="Select Options"
                onChange={(e) => {
                  const value = typeof e.target.value === 'string' 
                    ? e.target.value.split(',') 
                    : e.target.value;
                  
                  handleAmenityChange(category, amenity.name, {
                    ...amenityValue,
                    option: value
                  });
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {amenity.options.map((option, index) => (
                  <MenuItem 
                    key={index} 
                    value={option}
                    sx={{
                      backgroundColor: amenityValue.option?.includes(option) 
                        ? 'rgba(25, 118, 210, 0.08)' 
                        : 'transparent'
                    }}
                  >
                    {/* <Checkbox 
                      checked={amenityValue.option?.includes(option) || false}
                      sx={{ mr: 1 }}
                    /> */}
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Show Suboptions dropdown if available and either no options or options are selected */}
        {amenityValue.available && hasSuboptions && 
         (!hasOptions || (hasOptions && amenityValue.option?.length > 0)) && (
          <Grid item size={{xs:12, md:3}}>
            <FormControl fullWidth>
              <InputLabel>Select Additional Options</InputLabel>
              <Select
                multiple
                value={amenityValue.subOptions || []}
                label="Select Additional Options"
                onChange={(e) => {
                  const value = typeof e.target.value === 'string' 
                    ? e.target.value.split(',') 
                    : e.target.value;
                  
                  handleAmenityChange(category, amenity.name, {
                    ...amenityValue,
                    subOptions: value
                  });
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {amenity.Suboptions.map((suboption, index) => (
                  <MenuItem 
                    key={index} 
                    value={suboption}
                    sx={{
                      backgroundColor: amenityValue.subOptions?.includes(suboption) 
                        ? 'rgba(156, 39, 176, 0.08)' 
                        : 'transparent'
                    }}
                  >
                    {/* <Checkbox 
                      checked={amenityValue.subOptions?.includes(suboption) || false}
                      sx={{ mr: 1 }}
                    /> */}
                    {suboption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Show selected items as chips */}
        {amenityValue.available && (
          <Grid item size={{xs:12}}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {amenityValue.option?.map((option, index) => (
                <Chip 
                  key={`option-${index}`} 
                  label={option} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  onDelete={() => {
                    const newOptions = amenityValue.option.filter(opt => opt !== option);
                    handleAmenityChange(category, amenity.name, {
                      ...amenityValue,
                      option: newOptions
                    });
                  }}
                />
              ))}
              {amenityValue.subOptions?.map((suboption, index) => (
                <Chip 
                  key={`suboption-${index}`} 
                  label={suboption} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                  onDelete={() => {
                    const newSuboptions = amenityValue.subOptions.filter(opt => opt !== suboption);
                    handleAmenityChange(category, amenity.name, {
                      ...amenityValue,
                      subOptions: newSuboptions
                    });
                  }}
                />
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>All Amenities</Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Answering the amenities available at your property can significantly influence guests to book! Please answer the <strong>Mandatory Amenities</strong> available below
      </Typography>
      
      <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: '600px' }}>
        {/* Vertical Tabs */}
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="Amenity categories"
          sx={{ 
            borderRight: 1, 
            borderColor: 'divider',
            minWidth: '250px',
            '& .MuiTab-root': {
              alignItems: 'flex-start',
              textAlign: 'left',
              minHeight: '60px',
              padding: '12px 16px'
            }
          }}
        >
          {Object.entries(amenityCategories).map(([category, { title }], index) => {
            const selectedCount = getSelectedCount(category);
            return (
              <Tab
                key={category}
                label={
                  <Box>
                    <Typography variant="body2">{title} ({selectedCount})</Typography>
                  </Box>
                }
                id={`vertical-tab-${index}`}
                aria-controls={`vertical-tabpanel-${index}`}
              />
            );
          })}
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {Object.entries(amenityCategories).map(([category, { title, items }], index) => (
            <TabPanel key={category} value={selectedTab} index={index}>
              <Typography variant="h6" gutterBottom>{title}</Typography>
              <FormGroup>
                {items.map((amenity, amenityIndex) => (
                  <div key={amenityIndex}>
                    {renderAmenityOptions(category, amenity)}
                  </div>
                ))}
              </FormGroup>
            </TabPanel>
          ))}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onSave}
          size="large"
        >
          Save & Continue
        </Button>
      </Box>
    </div>
  );
}