// pages/profile/wishlist.jsx or app/profile/wishlist/page.jsx
"use client"; // if using Next.js 13+ app directory

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchWishlist, 
  removeFromWishlist, 
  clearAllWishlist,
  selectWishlistItems,
  selectWishlistCount 
} from '@/redux/features/wishlist/wishlistSlice';
import { Heart, Trash2, MapPin, Star, Loader2, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistCount = useSelector(selectWishlistCount);
  const { isLoading, error } = useSelector(state => state.wishlist);
  
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemoveItem = async (propertyId) => {
    setRemovingId(propertyId);
    try {
      await dispatch(removeFromWishlist(propertyId)).unwrap();
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await dispatch(clearAllWishlist()).unwrap();
      toast.success('Wishlist cleared successfully');
      setOpenClearDialog(false);
    } catch (error) {
      toast.error(error || 'Failed to clear wishlist');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r text-black bg-clip-text  mb-2">
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {wishlistCount > 0 
                  ? `You have ${wishlistCount} ${wishlistCount === 1 ? 'property' : 'properties'} saved`
                  : 'No properties saved yet'
                }
              </p>
            </div>
            
            {wishlistCount > 0 && (
              <Button
                onClick={() => setOpenClearDialog(true)}
                variant="outlined"
                color="error"
                startIcon={<Trash2 className="w-4 h-4" />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                }}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Wishlist Items */}
        {wishlistCount === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Wishlist is Empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring and save your favorite properties to your wishlist. 
              Click the heart icon on any property to add it here.
            </p>
            <Link href="/">
              <Button
                variant="contained"
                startIcon={<ShoppingBag className="w-4 h-4" />}
                sx={{
                  background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(16, 53, 172, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(16, 53, 172, 0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Browse Properties
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const property = item.property;
              if (!property) return null;

              const coverImage = property.media?.images?.find(img => img.isCover) || property.media?.images?.[0];
              const imageUrl = coverImage?.url || null;

              return (
                <div 
                  key={item._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(property._id)}
                    disabled={removingId === property._id}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full z-10 shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50"
                    title="Remove from wishlist"
                  >
                    {removingId === property._id ? (
                      <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </button>

                  {/* Property Image */}
                  <Link href={`/hotel-details/${property._id}`}>
                    <div className="relative h-56 overflow-hidden cursor-pointer">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={property.placeName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                              <span className="text-3xl">🏨</span>
                            </div>
                            <div className="text-sm text-gray-500 font-medium">Property Image</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Image Count Overlay */}
                      {property.media?.images?.length > 0 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                          {property.media.images.length} {property.media.images.length === 1 ? 'Photo' : 'Photos'}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Property Details */}
                  <div className="p-5">
                    <Link href={`/hotel-details/${property._id}`}>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 cursor-pointer line-clamp-2">
                        {property.placeName}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="line-clamp-1">
                        {property.location?.city && property.location?.state 
                          ? `${property.location.city}, ${property.location.state}`
                          : property.location?.street || 'Location not specified'
                        }
                      </p>
                    </div>

                    {/* Rating */}
                    {/* {property.placeRating && (
                      <div className="flex items-center gap-1 mb-4">
                        <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-sm font-semibold">{property.placeRating}</span>
                        </div>
                        <span className="text-xs text-gray-500">Rating</span>
                      </div>
                    )} */}

                    {/* Property Type Badge */}
                    {property.propertyType && (
                      <div className="mb-4">
                        <span className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 py-1 rounded-lg text-xs font-medium text-blue-700">
                          {property.propertyType.split('(')[0].trim()}
                        </span>
                      </div>
                    )}

                    {/* Added Date */}
                    <div className="text-xs text-gray-500 mb-4 border-t border-gray-100 pt-3">
                      Added {new Date(item.addedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>

                    {/* View Details Button */}
                    <Link href={`/hotel-details/${property._id}`}>
                      <Button 
                        variant="contained"
                        fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
                          color: 'white',
                          textTransform: 'none',
                          borderRadius: '12px',
                          py: 1.5,
                          fontWeight: 600,
                          fontSize: '14px',
                          boxShadow: '0 4px 12px rgba(16, 53, 172, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(16, 53, 172, 0.4)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Clear All Confirmation Dialog */}
        <Dialog 
          open={openClearDialog} 
          onClose={() => setOpenClearDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              maxWidth: '400px',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: '20px' }}>
            Clear Wishlist?
          </DialogTitle>
          <DialogContent>
            <p className="text-gray-600">
              Are you sure you want to remove all {wishlistCount} {wishlistCount === 1 ? 'property' : 'properties'} from your wishlist? 
              This action cannot be undone.
            </p>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setOpenClearDialog(false)}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: 'gray',
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleClearAll}
              variant="contained"
              color="error"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 3,
              }}
            >
              Clear All
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}