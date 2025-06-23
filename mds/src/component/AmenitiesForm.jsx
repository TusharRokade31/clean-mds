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
          options: [],
          Suboptions: []
        },
        {
          name: 'Laundry',
          options: ['Free', 'Paid'],
          Suboptions: []
        },
        {
          name: 'Newspaper',
          options: [],
          Suboptions: ['Local Language', 'English']
        },
        {
          name: 'Parking',
          options: ['Free', 'Paid'],
          Suboptions: []
        },
        {
          name: 'Room service',
          options: [],
          Suboptions: []
        },
        {
          name: 'Smoke detector',
          options: [],
          Suboptions: ['In Room', 'Lobby']
        },
        {
          name: 'Wifi',
          options: [],
          Suboptions: []
        },
        {
          name: 'Restaurant/Bhojnalay',
          options: [],
          Suboptions: ['Jain food available']
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
          name: 'Luggage assistance',
          options: [],
          Suboptions: []
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
          name: 'Kitchen',
          options: [],
          Suboptions: []
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
          name: 'Wheelchair',
          options: [],
          Suboptions:[]
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
        },
        {
          name: 'Prayer Room',
          options: [],
          Suboptions: []
        },
        {
          name: 'Sitout Area',
          options: [],
          Suboptions: []
        },
        {
          name: 'Bonfire Pit',
          options: [],
          Suboptions: []
        },
      ]
    },
    foodBeverages: {
      title: 'Food and Beverages',
      items: [
        {
          name: 'Dining Area/Bhojnalay',
          options: [],
          Suboptions: []
        },
        {
          name: "Food Options Available",
          options: [],
          Suboptions: ['Veg','Jain']
        },
        {
          name: 'Breakfast',
          options: [],
          Suboptions: []
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
          Suboptions: []
        }
      ]
    },
    paymentServices: {
      title: 'Payment Services',
      items: [
        {
          name: 'ATM',
          options: [],
          Suboptions: []
        },
        {
          name: 'UPI',
          options: [],
          Suboptions: []
        }
      ]
    }
  };

  // Get amenity value from form data
  const getAmenityValue = (category, amenityName) => {
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');
    return formData?.[category]?.[key] || { 
      available: undefined,
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
  
  return Object.values(categoryData).filter(amenity => 
    amenity.available !== undefined && amenity.available !== null
  ).length;
};

  const renderAmenityOptions = (category, amenity) => {
    const amenityValue = getAmenityValue(category, amenity.name);
    const hasOptions = amenity.options && amenity.options.length > 0;
    const hasSuboptions = amenity.Suboptions && amenity.Suboptions.length > 0;
    
    return (
      <Grid container  sx={{ mb: 3, pb: 3, borderBottom: '1px solid #e0e0e0' }}>
        {/* Amenity Name and Yes/No Radio */}
        <Grid item xs={12}>
          <FormControl sx={{
              "& .MuiOutlinedInput-root": {

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },display:"flex", alignItems:"start"
            }}    component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
              {amenity.name}
            </FormLabel>
            <RadioGroup
              // value={amenityValue.available ? 'yes' : 'no'}
              value={amenityValue.available === undefined ? '' : (amenityValue.available ? 'yes' : 'no')}
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
          <Grid sx={{marginInlineStart:'10px'}} item size={{xs:12, md:3}}>
            <FormControl sx={{
              "& .MuiOutlinedInput-root": {

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}  fullWidth>
              <InputLabel>Select Options</InputLabel>
              <Select
                
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
          <Grid sx={{marginInlineStart:'15px'}}  item size={{xs:12, md:3}}>
            <FormControl sx={{
              "& .MuiOutlinedInput-root": {

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}  fullWidth>
              <InputLabel>Select Additional Options</InputLabel>
              <Select
                multiple={amenity.name !== 'Fireplace'}
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
                    <Checkbox 
                      checked={amenityValue.subOptions?.includes(suboption) || false}
                      sx={{ mr: 1 }}
                    />
                    {suboption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Show selected items as chips */}
        {/* {amenityValue.available && (
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
        )} */}
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
      
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onSave}
          size="large"
        >
          Save & Continue
        </Button>
      </Box> */}
    </div>
  );
}