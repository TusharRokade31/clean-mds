export const buildOwnerQuery = (req, propertyId) => {
  // Guard: ensure user is authenticated
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  const query = { property: propertyId };
  if (req.user.role !== 'admin') {
    query.owner = req.user._id;
  }
  return query;
};