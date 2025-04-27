
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
      
      <section className="relative bg-gradient-to-br from-primary/90 to-accent/90 text-white py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1527576539890-dfa815648363?auto=format&fit=crop&w=2000')] bg-cover bg-center opacity-20"></div>
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-4 animate-fade-in">
              Discover Cluj-Napoca
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 animate-fade-in">
              Your ultimate guide to hotels, restaurants, bars, clubs, and tourist attractions in the heart of Transylvania.
            </p>
          </div>
        </div>
      </section>
      
      <div className="container px-4 sm:px-6 lg:px-8">
        <SearchBar
          onSearch={setSearchQuery}
          onCategoryChange={handleCategoryChange}
          selectedCategory={selectedCategory}
          className="mb-8"
        />
        
        <Tabs defaultValue="list" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-display font-bold">Explore Places</h2>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="scrollbar-none flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
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
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading amazing places...</p>
              </div>
            ) : (
              <LocationsGrid
                locations={filteredLocations}
              />
            )}
          </TabsContent>
          
          <TabsContent value="map" className="min-h-[400px] sm:min-h-[600px]">
            <MapView 
              locations={filteredLocations}
              height="100%"
            />
          </TabsContent>
        </Tabs>
        
        {/* Category sections */}
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
