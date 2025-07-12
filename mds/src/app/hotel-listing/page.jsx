"use client"

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "@/component/hotel-listing/Header";
import { PropertyList } from "@/component/hotel-listing/PropertyList";
import { Sidebar } from "@/component/hotel-listing/Sidebar";
import { Button } from "@mui/material";
import { List, Map } from "lucide-react";
import { getPropertiesByQuery } from "@/redux/features/property/propertySlice";

export default function PropertyBookingApp() {
  const dispatch = useDispatch();
  const { 
    searchResults, 
    isSearchLoading, 
    searchError, 
    searchQuery,
    searchPagination 
  } = useSelector((state) => state.property);


  useEffect(() => {
    // Only fetch if we don't have a recent search query or results
    if (!searchQuery || searchResults.length === 0) {
      dispatch(getPropertiesByQuery(searchQuery));
    }
  }, [dispatch, searchQuery, searchResults.length]);

  // Use search query from Redux if available, otherwise use default


  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col px-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Sacred Stays in {searchQuery?.location}
            </h1>
            <p className="text-gray-600">
              {isSearchLoading ? 
                "Loading properties..." : 
                `Showing ${searchResults.length} properties for ${searchQuery?.persons} guests • ${searchQuery?.checkin} to ${searchQuery?.checkout}`
              }
            </p>
            {searchError && (
              <p className="text-red-600 text-sm mt-1">
                Error: {searchError}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4 lg:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <List className="w-4 h-4" />
              List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              Map
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          <div className="lg:hidden mb-4">
            {/* Mobile filter button */}
          </div>

          <PropertyList 
            properties={searchResults}
            isLoading={isSearchLoading}
            error={searchError}
            hasMore={searchPagination.hasMore}
            onLoadMore={() => {
              if (searchPagination.hasMore && !isSearchLoading) {
                dispatch(getPropertiesByQuery({
                  ...searchQuery,
                  skip: searchResults.length
                }));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}