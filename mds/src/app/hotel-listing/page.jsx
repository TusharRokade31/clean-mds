"use client"

import { useEffect, useState, Suspense } from "react"; // Added Suspense import
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Header } from "@/component/hotel-listing/Header";
import { PropertyList } from "@/component/hotel-listing/PropertyList";
import { Sidebar } from "@/component/hotel-listing/Sidebar";
import { Button, IconButton, Drawer } from "@mui/material";
import { SwapVert, Tune, Menu, Close } from "@mui/icons-material";
import { List, Map, Search } from "lucide-react";
import { getPropertiesByQuery } from "@/redux/features/property/propertySlice";
import MapModal from "@/component/hotel-listing/MapModal";

// 1. Remove "export default" from here and change the name slightly
function PropertyBookingContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileSortModal, setShowMobileSortModal] = useState(false);
  const [showMobileHeader, setShowMobileHeader] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  const { 
    searchResults, 
    isSearchLoading, 
    searchError, 
    searchQuery,
    searchPagination 
  } = useSelector((state) => state.property);

  // 1. Initial Load
  useEffect(() => {
    if (!searchQuery || searchResults.length === 0) {
      dispatch(getPropertiesByQuery(searchQuery));
    }
  }, [dispatch, searchQuery, searchResults.length]);

  // 2. Handle Browser Back Button (URL Sync)
  useEffect(() => {
    const urlSkip = parseInt(searchParams.get('skip') || '0', 10);
    
    if (urlSkip === 0 && searchResults.length > (searchPagination?.limit || 10)) {
      dispatch(getPropertiesByQuery({
        ...searchQuery,
        skip: 0
      }));
    }
  }, [searchParams, dispatch, searchResults.length, searchQuery, searchPagination?.limit]);

  // 3. Updated Load More Handler
  const handleLoadMore = () => {
    if (searchPagination?.hasMore && !isSearchLoading) {
      const nextSkip = searchResults.length;
      
      const params = new URLSearchParams(searchParams.toString());
      params.set('skip', nextSkip.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      dispatch(getPropertiesByQuery({
        ...searchQuery,
        skip: nextSkip
      }));
    }
  };

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* Mobile Header Drawer */}
      <Drawer
        anchor="top"
        open={showMobileHeader}
        onClose={() => setShowMobileHeader(false)}
        sx={{
          '& .MuiDrawer-paper': {
            height: 'auto',
            maxHeight: '80vh',
          }
        }}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Search & Filters</h2>
            <IconButton onClick={() => setShowMobileHeader(false)}>
              <Close />
            </IconButton>
          </div>
          <Header />
        </div>
      </Drawer>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col px-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2"></h1>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {isSearchLoading ? 
                  "Loading properties..." : 
                  `Showing ${searchResults.length} properties`
                }
              </p>
              <div className="md:hidden">
                <Button
                  onClick={() => setShowMobileHeader(true)}
                  sx={{
                    color: '#1035ac',
                    border: '1px solid #1035ac',
                    borderRadius: '8px',
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 2,
                    py: 0.5
                  }}
                >
                  <Search className="w-4 h-4 mr-1" />
                  Search
                </Button>
              </div>
            </div>
            {searchError && (
              <p className="text-red-600 text-sm mt-1">
                Error: {searchError}
              </p>
            )}
          </div>
          
          {/* Desktop View Toggle */}
          <div className="hidden lg:flex items-center gap-2 mt-4 lg:mt-0">
            <Button
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: 'transparent',
                borderColor: '#1035ac',
                color: '#1035ac',
                '&:hover': {
                  backgroundColor: '#1035ac',
                  color: 'white'
                }
              }}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowMapModal(true)}
              sx={{ color: '#666' }}
            >
              <Map className="w-4 h-4 mr-2" />
              Map
            </Button>
          </div>
        </div>

        {/* Mobile Filter and Hotels Count Bar */}
        <div className="lg:hidden mb-4 px-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {searchResults.length} hotels found
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowMobileFilter(true)}
                sx={{
                  color: '#1035ac',
                  border: '1px solid #1035ac',
                  borderRadius: '8px',
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 2,
                  py: 0.5
                }}
              >
                <Tune className="w-4 h-4 mr-1" />
                Filter
              </Button>
              <div 
                onClick={() => setShowMapModal(true)}
                className="bg-[#1035ac] text-white px-3 py-1 rounded-lg cursor-pointer"
              >
                Map View
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          <Sidebar 
            isMobile={true}
            showModal={showMobileFilter}
            onCloseModal={() => setShowMobileFilter(false)}
          />

          <PropertyList 
            properties={searchResults}
            isLoading={isSearchLoading}
            error={searchError}
            hasMore={searchPagination?.hasMore}
            showMobileSortModal={showMobileSortModal}
            setShowMobileSortModal={setShowMobileSortModal}
            onLoadMore={handleLoadMore} 
          />
        </div>
      </div>

      {/* Fixed Bottom Sort Button for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Button
          fullWidth
          onClick={() => setShowMobileSortModal(true)}
          sx={{
            backgroundColor: '#1035ac',
            color: 'white',
            py: 1.5,
            borderRadius: '8px',
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#0d2d8f'
            }
          }}
        >
          <SwapVert className="w-5 h-5 mr-2" />
          Sort
        </Button>
      </div>

      <MapModal 
        open={showMapModal} 
        onClose={() => setShowMapModal(false)} 
        properties={searchResults} 
      />

      <div className="lg:hidden pb-20"></div>
    </div>
  );
}

// 2. Create the new default export that wraps everything in Suspense
export default function PropertyBookingApp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-20 bg-gray-50 flex justify-center items-center">
        {/* You can replace this with a proper loading spinner if you prefer */}
        <p className="text-gray-600 text-lg">Loading booking interface...</p>
      </div>
    }>
      <PropertyBookingContent />
    </Suspense>
  );
}