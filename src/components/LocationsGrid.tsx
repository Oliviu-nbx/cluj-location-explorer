
import { useState } from "react";
import { Location, LocationCategory } from "@/types/location";
import LocationCard from "./LocationCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationsGridProps {
  locations: Location[];
  title?: string;
  category?: LocationCategory;
}

const LocationsGrid = ({ locations, title, category }: LocationsGridProps) => {
  const [sortOption, setSortOption] = useState<string>("rating");
  
  const sortedLocations = [...locations].sort((a, b) => {
    switch (sortOption) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "reviews":
        return (b.userRatingsTotal || 0) - (a.userRatingsTotal || 0);
      case "price-low":
        return (a.priceLevel || 0) - (b.priceLevel || 0);
      case "price-high":
        return (b.priceLevel || 0) - (a.priceLevel || 0);
      default:
        return (b.rating || 0) - (a.rating || 0);
    }
  });

  return (
    <div className="my-8 animate-fade-in">
      {title && (
        <h2 className="text-2xl font-display font-bold mb-6">{title}</h2>
      )}
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <p className="text-muted-foreground">
          {locations.length} location{locations.length !== 1 ? 's' : ''} found
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedLocations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </div>
  );
};

export default LocationsGrid;
