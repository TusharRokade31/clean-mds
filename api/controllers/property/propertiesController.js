import Property from '../../models/Property.js';

// Get all draft properties (for admin or host) //moved to hostController
export const getDraftProperties = async (req, res) => {
  try {
    let query = { status: 'draft' }; 

  
    if (req.user.role !== 'admin') {
      query.owner = req.user._id;  
    }
    
    const draftProperties = await Property.find(query);

    res.status(200).json({
      success: true,
      count: draftProperties.length,
      data: draftProperties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};