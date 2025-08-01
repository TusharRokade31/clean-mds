import Property from '../../models/Property.js';


// Get all properties (for admin or host) //moved to hostController
export const getAllProperties = async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's properties
    if (req.user.role !== 'admin') {  
      query.owner = req.user._id;
    }
    
    const properties = await Property.find(query);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check if user owns the property or is admin
    if (req.user.role !== "admin" || property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this property'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
