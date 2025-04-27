
import { useState, useEffect } from "react";
import { Star, Phone, Globe, Clock, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Location } from "@/types/location";
import { PlaceInfo, PlaceSource } from "@/types/place-info";
import MapView from "./MapView";
import PlaceAggregatedInfo from "./PlaceAggregatedInfo";
import { supabase } from "@/integrations/supabase/client";

interface LocationDetailsProps {
  location: Location;
  relatedLocations?: Location[];
}

const LocationDetails = ({ location, relatedLocations = [] }: LocationDetailsProps) => {
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo[]>([]);

  useEffect(() => {
    const fetchPlaceInfo = async () => {
      const { data, error } = await supabase
        .from('place_info')
        .select('*')
        .eq('location_id', location.id);
      
      if (!error && data) {
        // Cast the source field to PlaceSource type to satisfy TypeScript
        setPlaceInfo(data.map(info => ({
          id: info.id,
          locationId: info.location_id,
          source: info.source as PlaceSource,
          rating: info.rating,
          reviewCount: info.review_count,
          priceLevel: info.price_level,
          amenities: info.amenities || [],
          checkInTime: info.check_in_time,
          checkOutTime: info.check_out_time,
          neighborhood: info.neighborhood,
          updatedAt: info.updated_at
        })));
      }
    };

    fetchPlaceInfo();
  }, [location.id]);

  const imageSrc = `https://source.unsplash.com/random/1200x600/?${location.category.replace('_', '-')}`;
  
  // Format price level
  const priceLevel = location.priceLevel ? "€".repeat(location.priceLevel) : "Free";

  // Format days of week
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <article className="animate-fade-in">
      <div className="relative h-64 md:h-96 overflow-hidden rounded-lg mb-6">
        <img
          src={imageSrc}
          alt={`Photo of ${location.name} in Cluj-Napoca`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <Badge className="mb-3" variant="secondary">
            {location.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          <h1>{location.name}</h1>
          <p className="text-gray-200 mt-2">{location.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex flex-wrap gap-4">
                  {location.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{location.rating}</span>
                      <span className="text-gray-500">({location.userRatingsTotal} reviews)</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{priceLevel}</Badge>
                  </div>

                  {location.openNow !== undefined && (
                    <div className={`flex items-center gap-1 ${location.openNow ? 'text-green-600' : 'text-red-600'}`}>
                      <Clock className="h-4 w-4" />
                      <span>{location.openNow ? 'Open Now' : 'Closed'}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {location.editorialSummary && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">About</h2>
                    <p className="text-gray-700">{location.editorialSummary}</p>
                  </div>
                )}

                {/* Contact */}
                <div>
                  <h2 className="text-xl font-bold mb-3">Contact Information</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>{location.address}</span>
                    </div>
                    
                    {location.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        <a href={`tel:${location.phone}`} className="hover:text-primary">{location.phone}</a>
                      </div>
                    )}
                    
                    {location.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <a href={location.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opening Hours */}
                {location.openingHours && location.openingHours.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-3">Opening Hours</h2>
                    <div className="space-y-1">
                      {/* In a real implementation, we would format the opening hours properly */}
                      <p className="text-gray-700">Monday - Friday: 9:00 AM - 10:00 PM</p>
                      <p className="text-gray-700">Saturday - Sunday: 10:00 AM - 11:00 PM</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
              
              {location.reviews && location.reviews.length > 0 ? (
                <div className="space-y-6">
                  {location.reviews.map((review, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{review.authorName}</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
                          <span>{review.rating}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{review.text}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(review.time * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews available for this location.</p>
              )}
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              <h2 className="text-xl font-bold mb-4">Photos</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* In a real implementation, we would fetch and display actual photos */}
                <img 
                  src={`https://source.unsplash.com/random/600x400/?${location.category.replace('_', '-')},1`} 
                  alt={`${location.name} photo 1`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <img 
                  src={`https://source.unsplash.com/random/600x400/?${location.category.replace('_', '-')},2`} 
                  alt={`${location.name} photo 2`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <img 
                  src={`https://source.unsplash.com/random/600x400/?${location.category.replace('_', '-')},3`} 
                  alt={`${location.name} photo 3`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <img 
                  src={`https://source.unsplash.com/random/600x400/?${location.category.replace('_', '-')},4`} 
                  alt={`${location.name} photo 4`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </TabsContent>

            <TabsContent value="sources" className="mt-6">
              {placeInfo.length > 0 ? (
                <PlaceAggregatedInfo 
                  placeInfo={placeInfo} 
                  compositeScore={location.compositeScore || 0} 
                />
              ) : (
                <p className="text-muted-foreground">No additional source information available.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <div className="sticky top-24">
            <h3 className="text-lg font-bold mb-4">Location</h3>
            <MapView 
              locations={[location]} 
              center={{ lat: location.latitude, lng: location.longitude }}
              zoom={15}
              height="300px"
            />

            {relatedLocations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Nearby Places</h3>
                <div className="space-y-4">
                  {relatedLocations.slice(0, 3).map(related => (
                    <div key={related.id} className="flex items-start gap-3 border-b pb-4">
                      <img
                        src={`https://source.unsplash.com/random/100x100/?${related.category.replace('_', '-')}`}
                        alt={related.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <a 
                          href={`/${related.category}/${related.slug}`} 
                          className="font-medium hover:text-primary"
                        >
                          {related.name}
                        </a>
                        {related.rating && (
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                            <span className="text-sm">{related.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schema.org structured data would be added here */}
    </article>
  );
};

export default LocationDetails;
