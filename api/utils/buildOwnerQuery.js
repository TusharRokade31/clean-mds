export const buildOwnerQuery = (req, propertyId) => {
  const query = { property: propertyId };
  if (req.user.role !== 'admin') {
    query.owner = req.user._id;
  }
  return query;
};