"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "@/component/hotel-listing/Header";
import { PropertyList } from "@/component/hotel-listing/PropertyList";
import { Sidebar } from "@/component/hotel-listing/Sidebar";
import { Button, IconButton, Drawer } from "@mui/material";
import { SwapVert, Tune, Menu, Close } from "@mui/icons-material";
import { List, Map, Search } from "lucide-react";
import { getPropertiesByQuery } from "@/redux/features/property/propertySlice";
import MapModal from "@/component/hotel-listing/MapModal";


export default function PropertyBookingApp() {
  const dispatch = useDispatch();
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileSortModal, setShowMobileSortModal] = useState(false);
  const [showMobileHeader, setShowMobileHeader] = useState(false); // New state
  const [showMapModal, setShowMapModal] = useState(false);
  
  const { 
    searchResults, 
    isSearchLoading, 
    searchError, 
    searchQuery,
    searchPagination 
  } = useSelector((state) => state.property);



  useEffect(() => {
    if (!searchQuery || searchResults.length === 0) {
      dispatch(getPropertiesByQuery(searchQuery));
    }
  }, [dispatch]);

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
        {/* Rest of your existing code remains the same */}
        <div className="flex flex-col px-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {/* Sacred Stays in {searchQuery?.location} */}
            </h1>
          <div className="flex items-center justify-between">
              <p className="text-gray-600">
            {isSearchLoading ? 
              "Loading properties..." : 
              `Showing ${searchResults.length} properties`
              // `Showing ${searchResults.length} properties for ${searchQuery?.persons} guests • ${searchQuery?.checkin} to ${searchQuery?.checkout}`
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
              {/* <Menu className="w-4 h-4 mr-1" /> */}
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
        onClick={() => setShowMapModal(true)} // Add this
        sx={{ color: '#666' }}
      >
        <Map className="w-4 h-4 mr-2" />
        Map
      </Button>
          </div>
        </div>

        {/* Mobile Filter and Hotels Count Bar - Updated */}
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
        onClick={() => setShowMapModal(true)} // Add this
        className="bg-[#1035ac] text-white px-3 py-1 rounded-lg cursor-pointer"
      >
        Map View
      </div>
            </div>
          </div>
        </div>

        {/* Rest of your existing code */}
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
            onLoadMore={() => {
              if (searchPagination?.hasMore && !isSearchLoading) {
                dispatch(getPropertiesByQuery({
                  ...searchQuery,
                  skip: searchResults.length
                }));
              }
            }}
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