
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LocationService } from "@/services/LocationService";
import { Location, LocationCategory, CATEGORY_LABELS } from "@/types/location";
import LocationSitemap from "@/components/sitemap/LocationSitemap";

const LocationSitemapPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [locations, setLocations] = useState<Location[]>([]);
  const [baseUrl, setBaseUrl] = useState("https://wcompass.ro");
  
  useEffect(() => {
    // In development, we might want to use the current URL
    if (process.env.NODE_ENV === "development") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      if (categorySlug && Object.keys(CATEGORY_LABELS).includes(categorySlug)) {
        try {
          const locationData = await LocationService.getLocationsByCategory(categorySlug as LocationCategory);
          setLocations(locationData);
        } catch (error) {
          console.error(`Error fetching locations for sitemap: ${error}`);
        }
      }
    };
    
    fetchLocations();
  }, [categorySlug]);

  if (!categorySlug || !locations.length) {
    return null;
  }

  return (
    <LocationSitemap 
      baseUrl={baseUrl}
      locations={locations}
      category={categorySlug as LocationCategory}
    />
  );
};

export default LocationSitemapPage;
