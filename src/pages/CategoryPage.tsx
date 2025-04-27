
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LocationService } from "@/services/LocationService";
import { Location, LocationCategory, CATEGORY_LABELS } from "@/types/location";
import LocationsGrid from "@/components/LocationsGrid";
import MapView from "@/components/MapView";
import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLocationsByCategory = async () => {
      setLoading(true);
      try {
        if (categorySlug && Object.keys(CATEGORY_LABELS).includes(categorySlug)) {
          const data = await LocationService.getLocationsByCategory(categorySlug as LocationCategory);
          setLocations(data);
        } else {
          // Handle invalid category
          setLocations([]);
        }
      } catch (error) {
        console.error("Error fetching locations by category:", error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocationsByCategory();
  }, [categorySlug]);

  const categoryLabel = categorySlug && CATEGORY_LABELS[categorySlug as LocationCategory];
  const title = `${categoryLabel || 'Places'} in Cluj-Napoca`;
  const description = `Discover the best ${categoryLabel?.toLowerCase() || 'places'} in Cluj-Napoca. Browse ratings, reviews, photos and more.`;
  
  return (
    <>
      <SEO 
        title={title}
        description={description}
        baseUrl="https://wcompass.ro"
        canonicalUrl={categorySlug ? `/category/${categorySlug}` : undefined}
        type="website"
      />
      
      <div className="container my-8">
        <h1 className="text-3xl font-display font-bold mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">{description}</p>
        
        <Tabs defaultValue="list" className="mb-8">
          <TabsList>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            {loading ? (
              <div className="text-center py-8">Loading locations...</div>
            ) : locations.length > 0 ? (
              <LocationsGrid
                locations={locations}
                category={categorySlug as LocationCategory}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No locations found in this category.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="map">
            <MapView 
              locations={locations}
              height="600px"
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CategoryPage;
