
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface GooglePlacesScraperProps {
  onStatusUpdate: (message: string) => void;
}

export const GooglePlacesScraper = ({ onStatusUpdate }: GooglePlacesScraperProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleQuery, setGoogleQuery] = useState("");
  const [googleRadius, setGoogleRadius] = useState("1000");
  const [googleType, setGoogleType] = useState("restaurant");

  const handleGoogleSearch = async () => {
    setLoading(true);
    onStatusUpdate("Geocoding location...");
    
    try {
      // Validate inputs
      if (!googleQuery) {
        throw new Error("Location query is required");
      }

      // Get coordinates from the location query
      const geocodeResponse = await supabase.functions.invoke("google-places", {
        body: {
          action: "geocode",
          params: {
            address: googleQuery,
          },
        },
      });

      console.log("Geocode response:", geocodeResponse);

      if (!geocodeResponse.data || 
          !geocodeResponse.data.results || 
          geocodeResponse.data.results.length === 0) {
        throw new Error("Location not found. Please try a different search term.");
      }

      const location = geocodeResponse.data.results[0].geometry.location;
      onStatusUpdate(`Found location. Searching for ${googleType}s...`);

      // Search for places near the location
      const placesResponse = await supabase.functions.invoke("google-places", {
        body: {
          action: "searchNearby",
          params: {
            location: location,
            radius: parseInt(googleRadius),
            type: googleType,
          },
        },
      });

      console.log("Places response:", placesResponse);

      if (!placesResponse.data || 
          !placesResponse.data.results || 
          placesResponse.data.results.length === 0) {
        throw new Error(`No ${googleType}s found at this location. Try increasing the radius or changing the place type.`);
      }

      // Process each place
      onStatusUpdate(`Found ${placesResponse.data.results.length} places. Getting details...`);
      const places = placesResponse.data.results;
      let processedCount = 0;

      for (const place of places) {
        onStatusUpdate(`Processing ${processedCount + 1} of ${places.length}...`);
        
        try {
          // Get additional details for each place
          const detailsResponse = await supabase.functions.invoke("google-places", {
            body: {
              action: "getPlaceDetails",
              params: {
                placeId: place.place_id,
              },
            },
          });

          if (!detailsResponse.data || !detailsResponse.data.result) {
            console.warn(`No details found for place: ${place.name}`);
            continue;
          }

          const placeDetails = detailsResponse.data.result;
          
          if (placeDetails) {
            // Map the place details to our location structure
            const location = {
              place_id: placeDetails.place_id,
              name: placeDetails.name,
              slug: placeDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              category_id: googleType,
              address: placeDetails.formatted_address || place.vicinity,
              latitude: placeDetails.geometry.location.lat,
              longitude: placeDetails.geometry.location.lng,
              phone: placeDetails.formatted_phone_number,
              website: placeDetails.website,
              rating: placeDetails.rating,
              price_level: placeDetails.price_level
            };

            // Store the location in our database
            const { data, error } = await supabase.functions.invoke("process-location", {
              body: location
            });

            if (error) {
              console.error("Error processing location:", error);
            } else {
              processedCount++;
            }
          }
        } catch (placeError) {
          console.error(`Error processing place ${place.name}:`, placeError);
        }
      }

      toast({
        title: "Scraping Complete",
        description: `Successfully added ${processedCount} locations.`,
      });
    } catch (error) {
      console.error("Error scraping from Google Places:", error);
      toast({
        variant: "destructive",
        title: "Scraping Failed",
        description: error.message || "An error occurred during the Google Places scraping process.",
      });
    } finally {
      setLoading(false);
      onStatusUpdate("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Places API</CardTitle>
        <CardDescription>
          Search for places directly using Google Places API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="googleQuery">Location</Label>
          <Input
            id="googleQuery"
            placeholder="e.g. Cluj-Napoca, Romania"
            value={googleQuery}
            onChange={(e) => setGoogleQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="googleRadius">Radius (meters)</Label>
            <Input
              id="googleRadius"
              type="number"
              value={googleRadius}
              onChange={(e) => setGoogleRadius(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="googleType">Place Type</Label>
            <Select value={googleType} onValueChange={setGoogleType}>
              <SelectTrigger id="googleType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurants</SelectItem>
                <SelectItem value="cafe">Cafes</SelectItem>
                <SelectItem value="bar">Bars</SelectItem>
                <SelectItem value="lodging">Hotels</SelectItem>
                <SelectItem value="tourist_attraction">Tourist Attractions</SelectItem>
                <SelectItem value="museum">Museums</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGoogleSearch} 
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Search Places
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
