import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LocationService } from "@/services/LocationService";
import { Location } from "@/types/location";
import LocationDetails from "@/components/LocationDetails";
import SEO from "@/components/SEO";

const LocationPage = () => {
  const { categorySlug, locationSlug } = useParams<{ 
    categorySlug: string, 
    locationSlug: string 
  }>();
  const [location, setLocation] = useState<Location | null>(null);
  const [relatedLocations, setRelatedLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLocationData = async () => {
      setLoading(true);
      try {
        if (!locationSlug) {
          setError("Location not specified");
          return;
        }
        
        const locationData = await LocationService.getLocationBySlug(locationSlug);
        
        if (!locationData) {
          setError("Location not found");
          return;
        }
        
        // Check if the category in the URL matches the location's category
        if (categorySlug && locationData.category !== categorySlug) {
          setError("Category mismatch");
          return;
        }
        
        setLocation(locationData);
        
        // Fetch nearby locations
        if (locationData.latitude && locationData.longitude) {
          const nearby = await LocationService.getNearbyLocations(
            locationData.latitude, 
            locationData.longitude,
            5
          );
          // Filter out the current location
          setRelatedLocations(nearby.filter(loc => loc.id !== locationData.id));
        }
      } catch (err) {
        console.error("Error fetching location data:", err);
        setError("Failed to load location data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocationData();
  }, [categorySlug, locationSlug]);
  
  if (location) {
    return (
      <>
        <SEO 
          location={location} 
          baseUrl="https://wcompass.ro"
          canonicalUrl={`/${location.category}/${location.slug}`}
          type="website"
        />
        
        <div className="container my-8">
          <LocationDetails 
            location={location} 
            relatedLocations={relatedLocations} 
          />
        </div>
      </>
    );
  }
  
  if (loading) {
    return (
      <div className="container my-8">
        <div className="text-center py-16">
          <p className="text-lg">Loading location details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !location) {
    return (
      <div className="container my-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-lg text-gray-600">{error || "Location not found"}</p>
          <a href="/" className="text-primary hover:underline mt-4 inline-block">
            Return to Home
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container my-8">
      <div className="text-center py-16">
        <p className="text-lg">Loading location details...</p>
      </div>
    </div>
  );
};

export default LocationPage;
