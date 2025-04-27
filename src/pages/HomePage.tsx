
import { useEffect, useState } from "react";
import { LocationService } from "@/services/LocationService";
import { Location, LocationCategory, CATEGORY_LABELS } from "@/types/location";
import LocationsGrid from "@/components/LocationsGrid";
import MapView from "@/components/MapView";
import SearchBar from "@/components/SearchBar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HomePage = () => {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locations = await LocationService.getAllLocations();
        setAllLocations(locations);
        setFilteredLocations(locations);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, []);
  
  useEffect(() => {
    let filtered = allLocations;
    
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(loc => loc.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(query) ||
        loc.address.toLowerCase().includes(query)
      );
    }
    
    setFilteredLocations(filtered);
  }, [selectedCategory, searchQuery, allLocations]);

  const handleCategoryChange = (category: LocationCategory | 'all') => {
    setSelectedCategory(category);
  };

  return (
    <>
      <SEO 
        title="Discover Cluj-Napoca - Your Ultimate City Guide"
        description="Explore the best hotels, restaurants, bars, clubs, and tourist attractions in Cluj-Napoca with WCompass - your comprehensive guide to the heart of Transylvania."
        baseUrl="https://wcompass.ro"
        canonicalUrl="/"
      />
      
      <section className="bg-gradient-to-r from-primary to-accent text-white py-16 mb-8">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
              Discover Cluj-Napoca
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Your ultimate guide to hotels, restaurants, bars, clubs, and tourist attractions in the heart of Transylvania.
            </p>
          </div>
        </div>
      </section>
      
      <div className="container">
        <SearchBar
          onSearch={setSearchQuery}
          onCategoryChange={handleCategoryChange}
          selectedCategory={selectedCategory}
        />
        
        <Tabs defaultValue="list" className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold">Explore Places</h2>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? "default" : "outline"}
              onClick={() => setSelectedCategory('all')}
              className="whitespace-nowrap"
            >
              All Places
            </Button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                onClick={() => setSelectedCategory(key as LocationCategory)}
                className="whitespace-nowrap"
              >
                {label}
              </Button>
            ))}
          </div>
          
          <TabsContent value="list">
            {loading ? (
              <div className="text-center py-8">Loading locations...</div>
            ) : (
              <LocationsGrid
                locations={filteredLocations}
              />
            )}
          </TabsContent>
          
          <TabsContent value="map">
            <MapView 
              locations={filteredLocations}
              height="600px"
            />
          </TabsContent>
        </Tabs>
        
        {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
          const locations = allLocations.filter(loc => loc.category === category);
          if (!locations || locations.length === 0) return null;
          
          return (
            <section key={category} className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold">{label}</h2>
                <Link to={`/category/${category}`}>
                  <Button variant="ghost" className="flex items-center gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.slice(0, 3).map(location => (
                  <LocationsGrid
                    key={location.id}
                    locations={[location]}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
};

export default HomePage;
