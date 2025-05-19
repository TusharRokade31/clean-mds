"use client"
import { useState, useEffect } from 'react';

export default function PropertyListingForm() {
  const [currentTab, setCurrentTab] = useState(1);
  
  const [formData, setFormData] = useState({
    // Initialize with default values
    // Basic info - Property Details
    propertyName: '',
    builtYear: '',
    bookingSince: '',
    hostingType: '',
    liveAtProperty: '',
    email: '',
    mobileNumber: '',
    useWhatsAppNumber: false,
    landlineNumber: '',
    
    // Host Details - Business
    businessLogo: null,
    businessName: '',
    businessMobile: '',
    businessWhatsApp: '',
    businessGender: '',
    businessEmail: '',
    businessLanguages: [],
    foundedYear: '',
    propertiesCount: 1,
    businessDescription: '',
    
    // Host Details - Personal
    profilePhoto: null,
    hostName: '',
    hostGender: '',
    hostMobile: '',
    hostWhatsApp: '',
    hostEmail: '',
    hostLanguages: [],
    hostingSince: '',
    hostPropertiesCount: 1,
    hostDescription: '',
    
    // Location Details
    address: '',
    houseNumber: '',
    locality: 'Borivali West',
    pincode: '',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState({});
  
  const validateTab = (tabNumber) => {
    const newErrors = {};
    
    if (tabNumber === 1) { // Basic Info Tab
      if (!formData.propertyName.trim()) newErrors.propertyName = 'Property name is required';
      if (!formData.builtYear) newErrors.builtYear = 'Built year is required';
      if (!formData.bookingSince) newErrors.bookingSince = 'Booking since date is required';
      if (!formData.hostingType) newErrors.hostingType = 'Hosting type is required';
      if (!formData.liveAtProperty) newErrors.liveAtProperty = 'This field is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    } 
    else if (tabNumber === 2) { // Host Details Tab
      if (formData.hostingType === 'business') {
        if (!formData.businessName) newErrors.businessName = 'Business name is required';
        if (!formData.businessMobile) newErrors.businessMobile = 'Mobile number is required';
        if (!formData.businessGender) newErrors.businessGender = 'Gender is required';
        if (!formData.businessDescription) newErrors.businessDescription = 'Description is required';
      } else {
        if (!formData.hostName) newErrors.hostName = 'Host name is required';
        if (!formData.hostGender) newErrors.hostGender = 'Gender is required';
        if (!formData.hostMobile) newErrors.hostMobile = 'Mobile number is required';
        if (!formData.hostDescription) newErrors.hostDescription = 'Description is required';
      }
    }
    else if (tabNumber === 3) { // Location Tab
      if (!formData.houseNumber) newErrors.houseNumber = 'House/Building number is required';
      if (!formData.locality) newErrors.locality = 'Locality is required';
      if (!formData.pincode) newErrors.pincode = 'Pincode is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleTabChange = (tabNumber) => {
    // Validate current tab before proceeding
    if (tabNumber > currentTab) {
      const isValid = validateTab(currentTab);
      if (!isValid) return;
    }
    
    setCurrentTab(tabNumber);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevData => ({
        ...prevData,
        [fieldName]: file
      }));
    }
  };
  
  const handleNumberChange = (fieldName, value) => {
    if (value >= 1) {
      setFormData(prevData => ({
        ...prevData,
        [fieldName]: value
      }));
    }
  };
  
const handleSubmit = async () => {
    try {
      // Format data for API submission
      const formDataToSubmit = new FormData();
      
      // Add all text and number fields
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] !== 'object' || formData[key] === null) {
          formDataToSubmit.append(key, formData[key]);
        }
      });
      
      // Add file uploads
      if (formData.hostingType === 'business' && formData.businessLogo) {
        formDataToSubmit.append('businessLogo', formData.businessLogo);
      } else if (formData.hostingType === 'individually' && formData.profilePhoto) {
        formDataToSubmit.append('profilePhoto', formData.profilePhoto);
      }
      
      // Call your API endpoint
      const response = await fetch('/api/property-listing', {
        method: 'POST',
        body: formDataToSubmit
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      const result = await response.json();
      return result;

      
      
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };
  
 

  
  return (
    <div className="property-listing-form">
      {/* Progress Tabs */}
      <div className="tabs-container">
        <div className={`tab ${currentTab === 1 ? 'active' : ''}`} onClick={() => handleTabChange(1)}>
          <span className="tab-number">1</span> Basic Info
        </div>
        <div className={`tab ${currentTab === 2 ? 'active' : currentTab > 2 ? 'completed' : ''}`} onClick={() => handleTabChange(2)}>
          <span className="tab-number">2</span> Location
        </div>
        <div className={`tab ${currentTab === 3 ? 'active' : currentTab > 3 ? 'completed' : ''}`} onClick={() => handleTabChange(3)}>
          <span className="tab-number">3</span> Amenities
        </div>
        <div className={`tab ${currentTab === 4 ? 'active' : currentTab > 4 ? 'completed' : ''}`} onClick={() => handleTabChange(4)}>
          <span className="tab-number">4</span> Property Details
        </div>
        <div className={`tab ${currentTab === 5 ? 'active' : currentTab > 5 ? 'completed' : ''}`} onClick={() => handleTabChange(5)}>
          <span className="tab-number">5</span> Room Details
        </div>
        <div className={`tab ${currentTab === 6 ? 'active' : currentTab > 6 ? 'completed' : ''}`} onClick={() => handleTabChange(6)}>
          <span className="tab-number">6</span> Photos And Videos
        </div>
        <div className={`tab ${currentTab === 7 ? 'active' : currentTab > 7 ? 'completed' : ''}`} onClick={() => handleTabChange(7)}>
          <span className="tab-number">7</span> Policies
        </div>
        <div className={`tab ${currentTab === 8 ? 'active' : ''}`} onClick={() => handleTabChange(8)}>
          <span className="tab-number">8</span> Finance & Legal
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab - Property Details */}
        {currentTab === 1 && (
          <div className="tab-content">
            <h2>Basic Info</h2>
            
            <div className="property-details-section">
              <div className="section-header">
                <div className="circle-number">1</div>
                <h3>Property Details</h3>
                <p>Update your property details here</p>
              </div>
              
              <div className="form-group">
                <label>Name of the Property</label>
                <p className="field-description">Enter the name of the property which will be displayed to Guests</p>
                <input 
                  type="text" 
                  name="propertyName" 
                  placeholder="Enter the full name" 
                  value={formData.propertyName}
                  onChange={handleInputChange}
                />
                {errors.propertyName && <span className="error">{errors.propertyName}</span>}
              </div>
              
              <div className="form-group">
                <label>When was the property built?</label>
                <select 
                  name="builtYear" 
                  value={formData.builtYear}
                  onChange={handleInputChange}
                >
                  <option value="">Select a year</option>
                  {[...Array(50)].map((_, i) => (
                    <option key={i} value={2025 - i}>{2025 - i}</option>
                  ))}
                </select>
                {errors.builtYear && <span className="error">{errors.builtYear}</span>}
              </div>
              
              <div className="form-group">
                <label>Accepting booking since?</label>
                <p className="field-description">Since when is this property available for guests to book</p>
                <select 
                  name="bookingSince" 
                  value={formData.bookingSince}
                  onChange={handleInputChange}
                >
                  <option value="">Select a year</option>
                  {[...Array(50)].map((_, i) => (
                    <option key={i} value={2025 - i}>{2025 - i}</option>
                  ))}
                </select>
                {errors.bookingSince && <span className="error">{errors.bookingSince}</span>}
              </div>
              
              <div className="form-group">
                <label>How will this property be hosted?</label>
                <div className="radio-group">
                  <label>
                    <input 
                      type="radio" 
                      name="hostingType" 
                      value="individually" 
                      checked={formData.hostingType === 'individually'}
                      onChange={handleInputChange}
                    />
                    Individually
                    <p className="field-description">If hosting isn't your primary profession or income source</p>
                  </label>
                  
                  <label>
                    <input 
                      type="radio" 
                      name="hostingType" 
                      value="business" 
                      checked={formData.hostingType === 'business'}
                      onChange={handleInputChange}
                    />
                    As part of a business
                    <p className="field-description">If you're affiliated with a registered hospitality or property management company</p>
                  </label>
                </div>
                {errors.hostingType && <span className="error">{errors.hostingType}</span>}
              </div>
              
              <div className="form-group">
                <label>Do you (host) live at this property?</label>
                <div className="radio-group inline">
                  <label>
                    <input 
                      type="radio" 
                      name="liveAtProperty" 
                      value="no" 
                      checked={formData.liveAtProperty === 'no'}
                      onChange={handleInputChange}
                    />
                    No
                  </label>
                  
                  <label>
                    <input 
                      type="radio" 
                      name="liveAtProperty" 
                      value="yes" 
                      checked={formData.liveAtProperty === 'yes'}
                      onChange={handleInputChange}
                    />
                    Yes
                  </label>
                </div>
                {errors.liveAtProperty && <span className="error">{errors.liveAtProperty}</span>}
              </div>
              
              <div className="contact-details-section">
                <h4>Contact details to be shared with guests</h4>
                <p>These contact details will be shared with the guests when they make a booking</p>
                
                <div className="form-group">
                  <label>Email ID</label>
                  <div className="input-with-button">
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Enter email ID" 
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    <button type="button" className="verify-button">Verify</button>
                  </div>
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>Mobile number</label>
                  <div className="input-with-button">
                    <div className="country-code">
                      <select>
                        <option value="+91">+91</option>
                      </select>
                    </div>
                    <input 
                      type="text" 
                      name="mobileNumber" 
                      placeholder="Enter number" 
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                    />
                    <button type="button" className="verify-button">Verify</button>
                  </div>
                  {errors.mobileNumber && <span className="error">{errors.mobileNumber}</span>}
                </div>
                
                <div className="form-group checkbox">
                  <label>
                    <input 
                      type="checkbox" 
                      name="useWhatsAppNumber" 
                      checked={formData.useWhatsAppNumber}
                      onChange={handleInputChange}
                    />
                    Use the same mobile number for WhatsApp.
                  </label>
                </div>
                
                <div className="form-group">
                  <label>Landline number (Optional)</label>
                  <input 
                    type="text" 
                    name="landlineNumber" 
                    placeholder="Eg: 01244637533" 
                    value={formData.landlineNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="host-details-section">
              <div className="section-header">
                <div className="circle-number">2</div>
                <h3>Host Details</h3>
                <p>Update your details here</p>
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="back-button">Back</button>
              <button type="button" className="continue-button" onClick={() => handleTabChange(2)}>Continue</button>
            </div>
          </div>
        )}
        
        {/* Location Tab */}
        {currentTab === 2 && (
          <div className="tab-content">
            <h2>Property Location Details</h2>
            <p>Please fill in the location details of your property.</p>
            
            <div className="location-alert">
              <span className="info-icon">i</span>
              <p>To avoid rejection, please enter the address as per the registration or lease document.</p>
            </div>
            
            <div className="search-container">
              <input type="text" placeholder="Search here" className="search-input" />
              <button type="button" className="use-location-button">Or Use My Current Location</button>
            </div>
            
            <div className="map-container">
              {/* Map would be embedded here */}
              <div className="map-placeholder">Map goes here</div>
            </div>
            
            <div className="form-group">
              <label>House/Building/Apartment No.</label>
              <input 
                type="text" 
                name="houseNumber" 
                placeholder="Please add details" 
                value={formData.houseNumber}
                onChange={handleInputChange}
              />
              {errors.houseNumber && <span className="error">{errors.houseNumber}</span>}
            </div>
            
            <div className="form-group">
              <label>Locality/Area/Street/Sector</label>
              <input 
                type="text" 
                name="locality" 
                value={formData.locality}
                onChange={handleInputChange}
              />
              {errors.locality && <span className="error">{errors.locality}</span>}
            </div>
            
            <div className="form-group">
              <label>Pincode</label>
              <input 
                type="text" 
                name="pincode" 
                placeholder="Enter Pincode" 
                value={formData.pincode}
                onChange={handleInputChange}
              />
              {errors.pincode && <span className="error">{errors.pincode}</span>}
            </div>
            
            <div className="form-group">
              <label>Country</label>
              <input 
                type="text" 
                name="country" 
                value={formData.country}
                onChange={handleInputChange}
                readOnly
              />
            </div>
            
            <div className="form-group">
              <label>State</label>
              <input 
                type="text" 
                name="state" 
                value={formData.state}
                onChange={handleInputChange}
              />
              {errors.state && <span className="error">{errors.state}</span>}
            </div>
            
            <div className="form-group">
              <label>City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city}
                onChange={handleInputChange}
              />
              {errors.city && <span className="error">{errors.city}</span>}
            </div>
            
            <div className="form-group checkbox">
              <label>
                <input 
                  type="checkbox" 
                  name="agreeToTerms" 
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                />
                I agree to the <a href="#" className="terms-link">terms and conditions</a> and confirm the address provided here is as per the registration or lease document.
              </label>
              {errors.agreeToTerms && <span className="error">{errors.agreeToTerms}</span>}
            </div>
            
            <div className="form-buttons">
              <button type="button" className="back-button" onClick={() => handleTabChange(1)}>Back</button>
              <button type="button" className="save-continue-button" onClick={() => handleTabChange(3)}>Save And Continue</button>
            </div>
          </div>
        )}
        
        {/* Host Details Tab */}
        {formData.hostingType === 'business' && currentTab === 3 && (
          <div className="tab-content">
            <h2>Host Details</h2>
            <p>Update your details here</p>
            <div className="profile-preview-link">
              <a href="#">How guests will see your profile?</a> <a href="#" className="preview-link">Preview</a>
            </div>
            
            <div className="business-details-section">
              <h3>Business details</h3>
              <p>This will show in the Host Profile of all the properties where you are the host on MakeMyTrip Website/App</p>
              
              <div className="form-group">
                <label>Upload your Business/Brand Logo</label>
                <p>Logo adds a professional touch to your listing</p>
                <div className="upload-container">
                  <div className="placeholder-image">
                    <span>TR</span>
                  </div>
                  <button type="button" className="upload-button">
                    Click to Upload or drag and drop
                    <span>JPG, JPEG, or PNG</span>
                    <span>(min. 100 KB & max. 15 MB)</span>
                  </button>
                </div>
                <p className="upload-error">Please upload a Hospitality Partner Chain Image Logo as Profile photo to continue</p>
              </div>
              
              <div className="form-group">
                <label>Display name for your business</label>
                <p>Your business name will be displayed as host for the guests</p>
                <input 
                  type="text" 
                  name="businessName" 
                  placeholder="Eg: Elsta group" 
                  value={formData.businessName}
                  onChange={handleInputChange}
                />
                <p className="field-required">This field is required</p>
                {errors.businessName && <span className="error">{errors.businessName}</span>}
              </div>
              
              <div className="form-group">
                <label>Mobile number</label>
                <p>This number is not shared with guests. It will only be used to send notifications regarding bookings, guest chat etc.</p>
                <div className="input-with-button">
                  <div className="country-code">
                    <select>
                      <option value="+91">+91</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    name="businessMobile" 
                    placeholder="Enter number" 
                    value={formData.businessMobile}
                    onChange={handleInputChange}
                  />
                  <button type="button" className="verify-button">Verify</button>
                </div>
                <p className="field-required">This field is required</p>
                <p className="use-suggestion">Use +91 8779618017</p>
                {errors.businessMobile && <span className="error">{errors.businessMobile}</span>}
              </div>
              
              <div className="form-group">
                <label>WhatsApp number</label>
                <p>This number is not shared with guests. It will only be used to send notifications regarding bookings, guest chat etc.</p>
                <div className="input-with-button">
                  <div className="country-code">
                    <select>
                      <option value="+91">+91</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    name="businessWhatsApp" 
                    placeholder="Enter number" 
                    value={formData.businessWhatsApp}
                    onChange={handleInputChange}
                  />
                  <button type="button" className="verify-button">Verify</button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <div className="radio-group inline">
                  <label>
                    <input 
                      type="radio" 
                      name="businessGender" 
                      value="male" 
                      checked={formData.businessGender === 'male'}
                      onChange={handleInputChange}
                    />
                    Male
                  </label>
                  
                  <label>
                    <input 
                      type="radio" 
                      name="businessGender" 
                      value="female" 
                      checked={formData.businessGender === 'female'}
                      onChange={handleInputChange}
                    />
                    Female
                  </label>
                </div>
                <p className="field-required">This field is required</p>
                {errors.businessGender && <span className="error">{errors.businessGender}</span>}
              </div>
              
              <div className="form-group">
                <label>Email ID</label>
                <div className="input-with-verification">
                  <input 
                    type="email" 
                    name="businessEmail" 
                    value="rokadetushar122@gmail.com" 
                    readOnly
                  />
                  <span className="verified-badge">✓ Verified</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Languages your staff speaks</label>
                <p>Let's guests know what languages they can use to communicate with your staff</p>
                <select 
                  name="businessLanguages" 
                  value={formData.businessLanguages}
                  onChange={handleInputChange}
                >
                  <option value="">Select language</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="marathi">Marathi</option>
                </select>
                <p className="field-required">This field is required</p>
              </div>
            </div>
            
            <div className="business-related-section">
              <h3>Business related</h3>
              <p>Tell your guests more about your business</p>
              
              <div className="form-group">
                <label>Founded in/Serving Guests since (Year)</label>
                <select 
                  name="foundedYear" 
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                >
                  <option value="2025">2025</option>
                  {[...Array(50)].map((_, i) => (
                    <option key={i} value={2025 - i}>{2025 - i}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Number of properties your business manages</label>
                <div className="number-input">
                  <button 
                    type="button" 
                    onClick={() => handleNumberChange('propertiesCount', formData.propertiesCount - 1)}
                    disabled={formData.propertiesCount <= 1}
                  >-</button>
                  <input 
                    type="number" 
                    name="propertiesCount" 
                    value={formData.propertiesCount}
                    onChange={(e) => handleNumberChange('propertiesCount', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleNumberChange('propertiesCount', formData.propertiesCount + 1)}
                  >+</button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Tell your guests more about your business</label>
                <p>This will show in the Host Profile of all the properties where you are the host on MakeMyTrip Website/App</p>
                <div className="warning-note">
                  <span className="warning-icon">⚠</span> Do not share any sensitive information, contact details or any other inappropriate content
                </div>
                
                <div className="description-textarea">
                  <textarea 
                    name="businessDescription" 
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Write your business description here"
                  ></textarea>
                  <div className="example-text">
                    <ul>
                      <li>Origin (Eg: Business was founded in 2016 by ABC Group to offer luxury stays in India)</li>
                      <li>Philosophy (Eg: Offering luxury villa stays with personalized, memorable experiences tailored to guests' preferences.)</li>
                      <li>Uniqueness (Eg: Offering unique stays like historic villas or villas located in offbeat locations)</li>
                    </ul>
                  </div>
                </div>
                <p className="field-required">This field is required.</p>
                {errors.businessDescription && <span className="error">{errors.businessDescription}</span>}
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="back-button" onClick={() => handleTabChange(2)}>Back</button>
              <div className="error-message">There are 6 errors above.</div>
              <button type="button" className="continue-button" onClick={() => handleTabChange(4)}>Continue</button>
            </div>
          </div>
        )}
        
        {/* Host Details Tab (Personal) */}
        {formData.hostingType === 'individually' && currentTab === 3 && (
          <div className="tab-content">
            <h2>Host Details</h2>
            <p>Update your details here</p>
            <div className="profile-preview-link">
              <a href="#">How guests will see your profile?</a> <a href="#" className="preview-link">Preview</a>
            </div>
            
            <div className="personal-details-section">
              <h3>Personal details</h3>
              <p>This will show in the Host Profile of all the properties where you are the host on MakeMyTrip Website/App</p>
              
              <div className="form-group">
                <label>Upload Profile Photo</label>
                <p>Profile photo adds a personal touch to your listing</p>
                <div className="upload-container">
                  <div className="placeholder-image">
                    <span>TR</span>
                  </div>
                  <button type="button" className="upload-button">
                    Click to Upload or drag and drop
                    <span>JPG, JPEG, or PNG</span>
                    <span>(min. 100 KB & max. 15 MB)</span>
                  </button>
                </div>
                <p className="upload-suggestion">We suggest you upload a clear photo of yourself without any alterations.</p>
              </div>
              
              <div className="form-group">
                <label>Name of the host</label>
                <input 
                  type="text" 
                  name="hostName" 
                  value="Tushar Rokade"
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <div className="radio-group inline">
                  <label>
                    <input 
                      type="radio" 
                      name="hostGender" 
                      value="male" 
                      checked={formData.hostGender === 'male'}
                      onChange={handleInputChange}
                    />
                    Male
                  </label>
                  
                  <label>
                    <input 
                      type="radio" 
                      name="hostGender" 
                      value="female" 
                      checked={formData.hostGender === 'female'}
                      onChange={handleInputChange}
                    />
                    Female
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label>Mobile number</label>
                <p>This number is not shared with guests. It will only be used to send notifications regarding bookings, guest chat etc.</p>
                <div className="input-with-button">
                  <div className="country-code">
                    <select>
                      <option value="+91">+91</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    name="hostMobile" 
                    placeholder="Enter number" 
                    value={formData.hostMobile}
                    onChange={handleInputChange}
                  />
                  <button type="button" className="verify-button">Verify</button>
                </div>
                <p className="use-suggestion">Use +91 8779618017</p>
              </div>
              
              <div className="form-group">
                <label>WhatsApp number</label>
                <p>This number is not shared with guests. It will only be used to send notifications regarding bookings, guest chat etc.</p>
                <div className="input-with-button">
                  <div className="country-code">
                    <select>
                      <option value="+91">+91</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    name="hostWhatsApp" 
                    placeholder="Enter number" 
                    value={formData.hostWhatsApp}
                    onChange={handleInputChange}
                  />
                  <button type="button" className="verify-button">Verify</button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Email ID</label>
                <div className="input-with-verification">
                  <input 
                    type="email" 
                    name="hostEmail" 
                    value="rokadetushar122@gmail.com" 
                    readOnly
                  />
                  <span className="verified-badge">✓ Verified</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Languages you speak</label>
                <p>Select languages you speak</p>
                <select 
                  name="hostLanguages" 
                  value={formData.hostLanguages}
                  onChange={handleInputChange}
                >
                  <option value="">Select language</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="marathi">Marathi</option>
                </select>
                <p className="field-required">This field is required</p>
              </div>
            </div>
            
            <div className="host-experience-section">
              <h3>Host Details</h3>
              <p>Tell us more about your hosting experience and description</p>
              
              <div className="form-group">
                <label>Hosting since (Year)</label>
                <select 
                  name="hostingSince" 
                  value={formData.hostingSince}
                  onChange={handleInputChange}
                >
                  <option value="2025">2025</option>
                  {[...Array(50)].map((_, i) => (
                    <option key={i} value={2025 - i}>{2025 - i}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Total number of properties you manage</label>
                <div className="number-input">
                  <button 
                    type="button" 
                    onClick={() => handleNumberChange('hostPropertiesCount', formData.hostPropertiesCount - 1)}
                    disabled={formData.hostPropertiesCount <= 1}
                  >-</button>
                  <input 
                    type="number" 
                    name="hostPropertiesCount" 
                    value={formData.hostPropertiesCount}
                    onChange={(e) => handleNumberChange('hostPropertiesCount', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleNumberChange('hostPropertiesCount', formData.hostPropertiesCount + 1)}
                  >+</button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Tell us more about your hosting experience and description</label>
                <p>This will show in the Host Profile of all the properties where you are the host on MakeMyTrip Website/App</p>
                <div className="warning-note">
                  <span className="warning-icon">⚠</span> Do not share any sensitive information, contact details or any other inappropriate content
                </div>
                
                <div className="description-textarea">
                  <textarea 
                    name="hostDescription" 
                    value={formData.hostDescription}
                    onChange={handleInputChange}
                    rows={6}
                  ></textarea>
                  <div className="example-text">
                    <ul>
                      <li>Profession and Interests (Eg: An Engineer turned Chef who loves to experiment with multiple cuisines)</li>
                      <li>Specialty or fun fact about you (Eg: I can jump very fast on one leg)</li>
                      <li>Hosting motivation or something special you do for guests (Eg: I have personally curated the menu for guests!)</li>
                    </ul>
                  </div>
                </div>
                <p className="field-required">This field is required.</p>
                {errors.hostDescription && <span className="error">{errors.hostDescription}</span>}
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="back-button" onClick={() => handleTabChange(2)}>Back</button>
              <div className="error-message">There is an error above.</div>
              <button type="button" className="continue-button" onClick={() => handleTabChange(4)}>Continue</button>
            </div>
          </div>
        )}
        
        {/* Location Tab (already implemented above) */}
        
        {/* Amenities Tab */}
        {currentTab === 4 && (
          <div className="tab-content">
            <h2>Amenities</h2>
            <p>Please select the amenities available at your property.</p>
            
            {/* Placeholder for amenities tab */}
            <div className="placeholder-content">
              <p>Amenities tab content will go here</p>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="back-button" onClick={() => handleTabChange(3)}>Back</button>
              <button type="button" className="continue-button" onClick={() => handleTabChange(5)}>Continue</button>
            </div>
          </div>
        )}
        
        {/* Additional tabs would go here */}
        {currentTab > 4 && (
          <div className="tab-content">
            <h2>Tab {currentTab}</h2>
            <p>This is a placeholder for tab {currentTab}</p>
            
            <div className="form-buttons">
              <button type="button" className="back-button" onClick={() => handleTabChange(currentTab - 1)}>Back</button>
              <button 
                type="button" 
                className="continue-button" 
                onClick={() => currentTab < 8 ? handleTabChange(currentTab + 1) : handleSubmit}
              >
                {currentTab === 8 ? 'Submit' : 'Continue'}
              </button>
            </div>
          </div>
        )}
      </form>
      
      {/* CSS for styling */}
      <style jsx>{`
        .property-listing-form {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .tabs-container {
          display: flex;
          overflow: auto;
          flex-wrap: nowrap;
          border-bottom: 1px solid #ddd;
          margin-bottom: 30px;
        }
        
        .tab {
          padding: 15px 20px;
          cursor: pointer;
          width: 300px;
          position: relative;
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          color: #666;
        }
        
        .tab.active {
          color: #1a73e8;
          border-bottom: 2px solid #1a73e8;
        }
        
        .tab.completed {
          color: #4caf50;
        }
        
        .tab-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #eee;
          margin-right: 8px;
          font-size: 14px;
        }
        
        .tab.active .tab-number {
          background-color: #1a73e8;
          color: white;
        }
        
        .tab.completed .tab-number {
          background-color: #4caf50;
          color: white;
        }
        
        .tab-content {
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          font-size: 24px;
          margin-bottom: 15px;
          color: #333;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .circle-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #1a73e8;
          color: white;
          font-size: 16px;
          margin-right: 15px;
        }
        
        .section-header h3 {
          font-size: 18px;
          margin: 0;
          margin-right: 15px;
        }
        
        .section-header p {
          color: #666;
          margin: 0;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #333;
        }
        
        .field-description {
          color: #666;
          font-size: 14px;
          margin-top: 4px;
          margin-bottom: 8px;
        }
        
        input[type="text"],
        input[type="email"],
        input[type="number"],
        select,
        textarea {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .input-with-button {
          display: flex;
        }
        
        .country-code {
          width: 80px;
        }
        
        .country-code select {
          height: 42px;
          border-right: none;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .input-with-button input {
          flex-grow: 1;
          border-radius: 0;
        }
        
        .verify-button {
          padding: 0 15px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-left: none;
          color: #1a73e8;
          cursor: pointer;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }
        
        .radio-group {
          margin-top: 10px;
        }
        
        .radio-group label {
          font-weight: normal;
          margin-bottom: 15px;
        }
        
        .radio-group.inline {
          display: flex;
        }
        
        .radio-group.inline label {
          margin-right: 30px;
        }
        
        .contact-details-section,
        .business-details-section,
        .personal-details-section,
        .host-experience-section,
        .business-related-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .host-details-section {
          margin-top: 30px;
        }
        
        .contact-details-section h4 {
          margin-bottom: 10px;
        }
        
        .form-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
        }
        
        .back-button {
          padding: 10px 20px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          color: #333;
          cursor: pointer;
        }
        
        .continue-button,
        .save-continue-button {
          padding: 10px 20px;
          background-color: #ff5f1f;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
        }
        
        .error {
          color: #d32f2f;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .error-message {
          color: #d32f2f;
          margin-right: 15px;
          align-self: center;
        }
        
        .field-required {
          color: #d32f2f;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .checkbox {
          display: flex;
        }
        
        .checkbox label {
          display: flex;
          align-items: center;
        }
        
        .checkbox input {
          margin-right: 10px;
        }
        
        .upload-container {
          display: flex;
          align-items: center;
          margin-top: 10px;
        }
        
        .placeholder-image {
          width: 100px;
          height: 100px;
          background-color: #eee;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20px;
        }
        
        .placeholder-image span {
          font-size: 24px;
          color: #666;
        }
        
        .upload-button {
          padding: 15px;
          background-color: #fff;
          border: 1px dashed #1a73e8;
          border-radius: 4px;
          color: #1a73e8;
          cursor: pointer;
          text-align: left;
          display: flex;
          flex-direction: column;
        }
        
        .upload-button span {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        
        .upload-error {
          color: #d32f2f;
          margin-top: 10px;
        }
        
        .upload-suggestion {
          color: #666;
          margin-top: 10px;
          font-size: 14px;
        }
        
        .profile-preview-link {
          text-align: right;
          margin-bottom: 20px;
        }
        
        .profile-preview-link a {
          color: #1a73e8;
          text-decoration: none;
        }
        
        .input-with-verification {
          position: relative;
        }
        
        .verified-badge {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #4caf50;
          font-weight: bold;
        }
        
        .number-input {
          display: flex;
          align-items: center;
          width: fit-content;
        }
        
        .number-input button {
          width: 40px;
          height: 40px;
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          font-size: 18px;
          cursor: pointer;
        }
        
        .number-input input {
          width: 60px;
          text-align: center;
        }
        
        .warning-note {
          display: flex;
          align-items: center;
          background-color: #fffde7;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        .warning-icon {
          color: #ff9800;
          margin-right: 10px;
        }
        
        .description-textarea {
          position: relative;
        }
        
        .description-textarea textarea {
          height: 150px;
          resize: vertical;
        }
        
        .example-text {
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
          margin-top: 10px;
        }
        
        .example-text ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .example-text li {
          margin-bottom: 5px;
        }
        
        .use-suggestion {
          color: #1a73e8;
          cursor: pointer;
          margin-top: 5px;
          font-size: 14px;
        }
        
        .terms-link {
          color: #1a73e8;
          text-decoration: none;
        }
        
        .location-alert {
          display: flex;
          align-items: center;
          background-color: #e3f2fd;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #1a73e8;
          color: white;
          margin-right: 15px;
          font-size: 14px;
          font-style: italic;
        }
        
        .location-alert p {
          margin: 0;
        }
        
        .search-container {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .search-input {
          flex-grow: 1;
          margin-right: 15px;
        }
        
        .use-location-button {
          padding: 10px 15px;
          background-color: transparent;
          border: none;
          color: #1a73e8;
          cursor: pointer;
          white-space: nowrap;
        }
        
        .map-container {
          height: 300px;
          background-color: #f5f5f5;
          margin-bottom: 20px;
          position: relative;
        }
        
        .map-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #666;
        }
      `}</style>
    </div>
  );

}