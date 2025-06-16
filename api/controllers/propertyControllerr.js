// Update a Room
export const updateRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId, roomId } = req.params;
    const roomData = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find room index
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    // Update room data
    Object.keys(roomData).forEach(key => {
      property.rooms[roomIndex][key] = roomData[key];
    });
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room: property.rooms[roomIndex],
      property
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Delete a Room
export const deleteRoom = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find room index
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    // Remove room
    property.rooms.splice(roomIndex, 1);
    property.formProgress.step4Completed = property.rooms.length > 0;
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
      property
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Upload Media (Images and Videos)
export const uploadPropertyMedia = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return errorResponse(res, 400, 'No files uploaded');
    }
    
    // Add file count validation
    if (files.length > 20) {
      return errorResponse(res, 400, 'Cannot upload more than 20 files at once');
    }
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    const uploadedMedia = [];
    
    // Process each uploaded file
    for (const file of files) {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const mediaUrl = `/${file.path.replace(/\\/g, '/')}`; // Normalize path separators
      
      const mediaItem = {
        url: mediaUrl,
        type: mediaType,
        filename: file.filename,
        tags: [], // Will be updated separately
        isCover: false,
        displayOrder: mediaType === 'image' ? property.media.images.length : property.media.videos.length,
        uploadedAt: new Date()
      };
      
      // Add to appropriate array
      if (mediaType === 'image') {
        property.media.images.push(mediaItem);
      } else {
        property.media.videos.push(mediaItem);
      }
      
      uploadedMedia.push({
        ...mediaItem,
        _id: property.media[mediaType === 'image' ? 'images' : 'videos'][property.media[mediaType === 'image' ? 'images' : 'videos'].length - 1]._id
      });
    }
    
    await property.save();
    
    return res.status(201).json({
      success: true,
      message: `${files.length} media files uploaded successfully`,
      uploadedMedia,
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Update Media Tags and Properties
export const updateMediaItem = async (req, res) => {
  try {
    const { propertyId, mediaId } = req.params;
    const { tags, isCover, displayOrder } = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find media item in images or videos
    let mediaItem = null;
    let mediaType = null;
    let mediaIndex = -1;
    
    // Check in images
    mediaIndex = property.media.images.findIndex(img => img._id.toString() === mediaId);
    if (mediaIndex !== -1) {
      mediaItem = property.media.images[mediaIndex];
      mediaType = 'images';
    } else {
      // Check in videos
      mediaIndex = property.media.videos.findIndex(vid => vid._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = property.media.videos[mediaIndex];
        mediaType = 'videos';
      }
    }
    
    if (!mediaItem) {
      return errorResponse(res, 404, 'Media item not test found');
    }
    
    // Validate tags - ensure at least one tag is provided
    if (tags !== undefined) {
      if (!Array.isArray(tags) || tags.length === 0) {
        return errorResponse(res, 400, 'Each media item must have at least one tag');
      }
      
      // Filter out empty tags
      const validTags = tags.filter(tag => tag && tag.trim().length > 0);
      if (validTags.length === 0) {
        return errorResponse(res, 400, 'Each media item must have at least one valid tag');
      }
      
      mediaItem.tags = validTags;
    }
    
    // Update display order if provided
    if (typeof displayOrder === 'number') {
      mediaItem.displayOrder = displayOrder;
    }
    
    // Handle cover image setting (only for images)
    if (isCover !== undefined && mediaType === 'images') {
      if (isCover) {
        // Remove cover status from other images
        property.media.images.forEach(img => {
          img.isCover = false;
        });
        mediaItem.isCover = true;
        property.media.coverImage = mediaItem._id;
      } else {
        mediaItem.isCover = false;
        if (property.media.coverImage && property.media.coverImage.toString() === mediaId) {
          property.media.coverImage = null;
        }
      }
    }
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Media item updated successfully',
      mediaItem,
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const validatePropertyMedia = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    const allMedia = [...property.media.images, ...property.media.videos];
    const itemsWithoutTags = [];
    
    // Check each media item for tags
    allMedia.forEach((item, index) => {
      if (!item.tags || item.tags.length === 0) {
        itemsWithoutTags.push({
          id: item._id,
          filename: item.filename,
          type: item.type,
          index: index + 1
        });
      }
    });
    
    if (itemsWithoutTags.length > 0) {
      return errorResponse(res, 400, 'Some media items are missing tags', {
        itemsWithoutTags,
        message: 'Each media item must have at least one tag before proceeding'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'All media items have valid tags',
      totalMedia: allMedia.length
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Delete Media Item
export const deleteMediaItem = async (req, res) => {
  try {
    const { propertyId, mediaId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find and remove media item
    let mediaItem = null;
    let mediaIndex = -1;
    
    // Check in images
    mediaIndex = property.media.images.findIndex(img => img._id.toString() === mediaId);
    if (mediaIndex !== -1) {
      mediaItem = property.media.images[mediaIndex];
      property.media.images.splice(mediaIndex, 1);
      
      // If this was the cover image, remove cover reference
      if (property.media.coverImage && property.media.coverImage.toString() === mediaId) {
        property.media.coverImage = null;
      }
    } else {
      // Check in videos
      mediaIndex = property.media.videos.findIndex(vid => vid._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = property.media.videos[mediaIndex];
        property.media.videos.splice(mediaIndex, 1);
      }
    }
    
    if (!mediaItem) {
      return errorResponse(res, 404, 'Media item not found');
    }
    
    // Delete physical file
    try {
      const filePath = `.${mediaItem.url}`;
      await unlink(filePath);
    } catch (fileError) {
      console.log('Could not delete file:', fileError.message);
    }
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Media item deleted successfully',
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};


// Upload Media to Specific Room
export const uploadRoomMedia = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return errorResponse(res, 400, 'No files uploaded');
    }
    
    if (files.length > 20) {
      return errorResponse(res, 400, 'Cannot upload more than 20 files at once');
    }
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find the specific room
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    const room = property.rooms[roomIndex];
    const uploadedMedia = [];
    
    // Initialize media object if it doesn't exist
    if (!room.media) {
      room.media = { images: [], videos: [] };
    }
    
    // Process each uploaded file
    for (const file of files) {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const mediaUrl = `/${file.path.replace(/\\/g, '/')}`; // Normalize path separators
      
      const mediaItem = {
        url: mediaUrl,
        type: mediaType,
        filename: file.filename,
        tags: [], // Will be updated separately
        isCover: false,
        displayOrder: mediaType === 'image' ? room.media.images.length : room.media.videos.length,
        uploadedAt: new Date()
      };
      
      // Add to appropriate array
      if (mediaType === 'image') {
        room.media.images.push(mediaItem);
      } else {
        room.media.videos.push(mediaItem);
      }
      
      uploadedMedia.push({
        ...mediaItem,
        _id: room.media[mediaType === 'image' ? 'images' : 'videos'][room.media[mediaType === 'image' ? 'images' : 'videos'].length - 1]._id
      });
    }
    
    await property.save();
    
    return res.status(201).json({
      success: true,
      message: `${files.length} media files uploaded to room successfully`,
      uploadedMedia,
      room: property.rooms[roomIndex],
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Update Room Media Item
export const updateRoomMediaItem = async (req, res) => {
  try {
    const { propertyId, roomId, mediaId } = req.params;
    const { tags, isCover, displayOrder } = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find the specific room
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    const room = property.rooms[roomIndex];
    
    // Find media item in room's images or videos
    let mediaItem = null;
    let mediaType = null;
    let mediaIndex = -1;
    
    // Check in images
    if (room.media && room.media.images) {
      mediaIndex = room.media.images.findIndex(img => img._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = room.media.images[mediaIndex];
        mediaType = 'images';
      }
    }
    
    // Check in videos if not found in images
    if (!mediaItem && room.media && room.media.videos) {
      mediaIndex = room.media.videos.findIndex(vid => vid._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = room.media.videos[mediaIndex];
        mediaType = 'videos';
      }
    }
    
    if (!mediaItem) {
      return errorResponse(res, 404, 'Media item not found in room');
    }
    
    // Validate tags - ensure at least one tag is provided
    if (tags !== undefined) {
      if (!Array.isArray(tags) || tags.length === 0) {
        return errorResponse(res, 400, 'Each media item must have at least one tag');
      }
      
      const validTags = tags.filter(tag => tag && tag.trim().length > 0);
      if (validTags.length === 0) {
        return errorResponse(res, 400, 'Each media item must have at least one valid tag');
      }
      
      mediaItem.tags = validTags;
    }
    
    // Update display order if provided
    if (typeof displayOrder === 'number') {
      mediaItem.displayOrder = displayOrder;
    }
    
    // Handle cover image setting (only for images)
    if (isCover !== undefined && mediaType === 'images') {
      if (isCover) {
        // Remove cover status from other images in this room
        room.media.images.forEach(img => {
          img.isCover = false;
        });
        mediaItem.isCover = true;
        room.media.coverImage = mediaItem._id;
      } else {
        mediaItem.isCover = false;
        if (room.media.coverImage && room.media.coverImage.toString() === mediaId) {
          room.media.coverImage = null;
        }
      }
    }
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Room media item updated successfully',
      mediaItem,
      room: property.rooms[roomIndex],
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Delete Room Media Item
export const deleteRoomMediaItem = async (req, res) => {
  try {
    const { propertyId, roomId, mediaId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find the specific room
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    const room = property.rooms[roomIndex];
    
    // Find and remove media item
    let mediaItem = null;
    let mediaIndex = -1;
    
    // Check in images
    if (room.media && room.media.images) {
      mediaIndex = room.media.images.findIndex(img => img._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = room.media.images[mediaIndex];
        room.media.images.splice(mediaIndex, 1);
        
        // If this was the cover image, remove cover reference
        if (room.media.coverImage && room.media.coverImage.toString() === mediaId) {
          room.media.coverImage = null;
        }
      }
    }
    
    // Check in videos if not found in images
    if (!mediaItem && room.media && room.media.videos) {
      mediaIndex = room.media.videos.findIndex(vid => vid._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = room.media.videos[mediaIndex];
        room.media.videos.splice(mediaIndex, 1);
      }
    }
    
    if (!mediaItem) {
      return errorResponse(res, 404, 'Media item not found in room');
    }
    
    // Delete physical file
    try {
      const filePath = `.${mediaItem.url}`;
      await unlink(filePath);
    } catch (fileError) {
      console.log('Could not delete file:', fileError.message);
    }
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Room media item deleted successfully',
      room: property.rooms[roomIndex],
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Get Room Media
export const getRoomMedia = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    const { type } = req.query; // 'image' or 'video'
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }
    
    // Find the specific room
    const room = property.rooms.find(room => room._id.toString() === roomId);
    
    if (!room) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    let mediaItems = [];
    
    if (room.media) {
      // Get images or videos based on type parameter
      if (!type || type === 'image') {
        mediaItems = [...mediaItems, ...(room.media.images || [])];
      }
      if (!type || type === 'video') {
        mediaItems = [...mediaItems, ...(room.media.videos || [])];
      }
    }
    
    // Sort by display order
    mediaItems.sort((a, b) => a.displayOrder - b.displayOrder);
    
    return res.status(200).json({
      success: true,
      count: mediaItems.length,
      data: mediaItems,
      room: {
        _id: room._id,
        roomName: room.roomName
      }
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Get Media by Tags
export const getMediaByTags = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { tags, type } = req.query; // tags as comma-separated string, type: 'image' or 'video'
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }
    
    let mediaItems = [];
    
    // Get images or videos based on type parameter
    if (!type || type === 'image') {
      mediaItems = [...mediaItems, ...property.media.images];
    }
    if (!type || type === 'video') {
      mediaItems = [...mediaItems, ...property.media.videos];
    }
    
    // Filter by tags if provided
    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim().toLowerCase());
      mediaItems = mediaItems.filter(item => 
        item.tags.some(tag => filterTags.includes(tag.toLowerCase()))
      );
    }
    
    // Sort by display order
    mediaItems.sort((a, b) => a.displayOrder - b.displayOrder);
    
    return res.status(200).json({
      success: true,
      count: mediaItems.length,
      data: mediaItems
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Complete Media Step
export const completeMediaStep = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Check if minimum requirements are met (at least 10 media items)
    const totalMedia = property.media.images.length + property.media.videos.length;
    console.log(property)
    
    if (totalMedia < 10) {
      return errorResponse(res, 400, `Minimum 10 media items required. Currently have ${totalMedia} items.`);
    }
    
    // Ensure there's at least one cover image
    const hasCoverImage = property.media.images.some(img => img.isCover) || property.media.coverImage;
    
    if (!hasCoverImage && property.media.images.length > 0) {
      // Automatically set first image as cover if none selected
      property.media.images[0].isCover = true;
      property.media.coverImage = property.media.images[0]._id;
    }
    
    // Mark step 5 as completed
    property.formProgress.step5Completed = true;
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Media step completed successfully',
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};