// Enhanced detectPropertyChanges.js with debugging
export const detectPropertyChanges = (originalProperty, updatedData, stepNumber) => {
  console.log('=== DETECT CHANGES DEBUG ===');
  console.log('Original property status:', originalProperty.status);
  console.log('Has publishedVersion:', !!originalProperty.publishedVersion);
  console.log('Step Number:', stepNumber);
  
  if (!originalProperty.publishedVersion) {
    console.log('No published version found - returning false');
    return false;
  }
  
  const publishedData = originalProperty.publishedVersion;
  console.log('Published data exists:', !!publishedData);
  
  let hasChanges = false;
  
  switch(stepNumber) {
    case 1:
      console.log('=== STEP 1 COMPARISON ===');
      console.log('Published propertyType:', publishedData.propertyType);
      console.log('Updated propertyType:', updatedData.propertyType);
      console.log('Published placeName:', publishedData.placeName);
      console.log('Updated placeName:', updatedData.placeName);
      console.log('Published email:', publishedData.email);
      console.log('Updated email:', updatedData.email);
      
      hasChanges = (
        publishedData.propertyType !== updatedData.propertyType ||
        publishedData.placeName !== updatedData.placeName ||
        publishedData.placeRating !== updatedData.placeRating ||
        publishedData.propertyBuilt !== updatedData.propertyBuilt ||
        publishedData.bookingSince !== updatedData.bookingSince ||
        publishedData.rentalForm !== updatedData.rentalForm ||
        publishedData.email !== updatedData.email ||
        publishedData.mobileNumber !== updatedData.mobileNumber ||
        publishedData.landline !== updatedData.landline
      );
      break;
    
    case 2:
      console.log('=== STEP 2 COMPARISON ===');
      console.log('Published location:', JSON.stringify(publishedData.location));
      console.log('Updated location:', JSON.stringify(updatedData));
      
      hasChanges = JSON.stringify(publishedData.location) !== JSON.stringify(updatedData);
      break;
    
    case 3:
      console.log('=== STEP 3 COMPARISON ===');
      console.log('Published amenities keys:', Object.keys(publishedData.amenities || {}));
      console.log('Updated amenities keys:', Object.keys(updatedData || {}));
      
      hasChanges = JSON.stringify(publishedData.amenities) !== JSON.stringify(updatedData);
      break;
    
    case 4:
      console.log('=== STEP 4 COMPARISON ===');
      console.log('Published rooms count:', publishedData.rooms?.length || 0);
      console.log('Updated rooms count:', updatedData?.length || 0);
      
      hasChanges = JSON.stringify(publishedData.rooms) !== JSON.stringify(updatedData);
      break;
    
    case 5:
      console.log('=== STEP 5 COMPARISON ===');
      const publishedImageCount = publishedData.media?.images?.length || 0;
      const publishedVideoCount = publishedData.media?.videos?.length || 0;
      const currentImageCount = updatedData.images?.length || 0;
      const currentVideoCount = updatedData.videos?.length || 0;
      
      console.log('Published images:', publishedImageCount);
      console.log('Current images:', currentImageCount);
      console.log('Published videos:', publishedVideoCount);
      console.log('Current videos:', currentVideoCount);
      console.log('Published coverImage:', publishedData.media?.coverImage);
      console.log('Current coverImage:', updatedData.coverImage);
      
      hasChanges = publishedImageCount !== currentImageCount || 
                   publishedVideoCount !== currentVideoCount ||
                   publishedData.media?.coverImage !== updatedData.coverImage;
      break;
    
    default:
      console.log('Unknown step number');
      hasChanges = false;
  }
  
  console.log('Changes detected:', hasChanges);
  console.log('=== END DEBUG ===');
  
  return hasChanges;
};

// Enhanced markForReapproval with debugging
export const markForReapproval = async (property, stepNumber, userId) => {
  console.log('=== MARK FOR REAPPROVAL DEBUG ===');
  console.log('Property status before:', property.status);
  console.log('Step number:', stepNumber);
  console.log('User ID:', userId);
  
  if (property.status === 'published') {
    console.log('Property is published, marking for reapproval...');
    
    property.status = 'pending_changes';
    property.pendingChanges[`step${stepNumber}Changed`] = true;
    property.pendingChanges.changedAt = new Date();
    property.pendingChanges.changedBy = userId;
    property.lastChangedAt = new Date();
    
    console.log('New status:', property.status);
    console.log('Pending changes:', property.pendingChanges);
  } else {
    console.log('Property is not published, status:', property.status);
  }
  console.log('=== END REAPPROVAL DEBUG ===');
};