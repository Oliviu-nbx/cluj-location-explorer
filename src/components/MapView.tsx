
import React, { useEffect, useRef, useState } from 'react';
import { Location } from '@/types/location';

interface MapViewProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (locationId: string) => void;
  selectedLocationId?: string;
}

const MapView: React.FC<MapViewProps> = ({
  locations,
  center = { lat: 46.77, lng: 23.59 }, // Cluj-Napoca center
  zoom = 13,
  height = '500px',
  onMarkerClick,
  selectedLocationId
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // This is a mock implementation since we're not actually loading Google Maps
  useEffect(() => {
    // In a real implementation, we would:
    // 1. Load Google Maps API
    // 2. Create a new map instance
    // 3. Add markers for each location
    // 4. Set up event listeners for markers

    setMapLoaded(true);

    return () => {
      // Cleanup would happen here
    };
  }, [locations]);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg">
      <div 
        ref={mapRef} 
        className="map-container" 
        style={{ height }}
      >
        {/* This would be replaced by the actual Google Map */}
        <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
          <div className="text-center p-4">
            <h3 className="text-lg font-medium mb-2">Map View</h3>
            <p className="text-sm text-gray-600">
              {mapLoaded 
                ? `Displaying ${locations.length} locations in Cluj-Napoca` 
                : "Loading map..."}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {locations.map(location => (
                <div 
                  key={location.id}
                  className={`p-2 text-xs rounded cursor-pointer ${
                    selectedLocationId === location.id 
                      ? "bg-primary text-white" 
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  }`}
                  onClick={() => onMarkerClick && onMarkerClick(location.id)}
                >
                  {location.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
