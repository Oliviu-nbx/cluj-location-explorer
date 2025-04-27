
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { N8nWebhookSetup } from "@/components/admin/N8nWebhookSetup";
import { supabase } from "@/integrations/supabase/client";

const ScrapingPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState({
    googlePlaces: false,
    apify: false,
    n8n: false
  });
  const [apifyToken, setApifyToken] = useState("");
  const [apifyQuery, setApifyQuery] = useState("restaurants in Cluj-Napoca");
  const [apifyMaxPlaces, setApifyMaxPlaces] = useState("10");
  const [apifyActor, setApifyActor] = useState("apify/google-places-scraper");
  const [googleQuery, setGoogleQuery] = useState("");
  const [googleRadius, setGoogleRadius] = useState("1000");
  const [googleType, setGoogleType] = useState("restaurant");

  // Handle Google Places API direct search
  const handleGoogleSearch = async () => {
    setLoading((prev) => ({ ...prev, googlePlaces: true }));
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

      if (!geocodeResponse.data || !geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
        throw new Error("Location not found");
      }

      const location = geocodeResponse.data.results[0].geometry.location;

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

      if (!placesResponse.data || !placesResponse.data.results || placesResponse.data.results.length === 0) {
        throw new Error("No places found");
      }

      // Process each place
      const places = placesResponse.data.results;
      let processedCount = 0;

      for (const place of places) {
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
          const { error } = await supabase.functions.invoke("process-location", {
            body: location
          });

          if (!error) {
            processedCount++;
          }
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
      setLoading((prev) => ({ ...prev, googlePlaces: false }));
    }
  };

  // Handle Apify scraping
  const handleApifyScraping = async () => {
    setLoading((prev) => ({ ...prev, apify: true }));
    try {
      // Validate inputs
      if (!apifyToken) {
        throw new Error("Apify token is required");
      }
      
      if (!apifyQuery) {
        throw new Error("Search query is required");
      }

      const searchParams = {
        queries: apifyQuery,
        language: "en",
        maxCrawledPlaces: parseInt(apifyMaxPlaces),
      };

      const response = await supabase.functions.invoke("apify-places-scraper", {
        body: {
          token: apifyToken,
          actorId: apifyActor,
          searchParams
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Apify Scraping Started",
        description: "The scraping job has been started. Results will be processed in the background.",
      });
    } catch (error) {
      console.error("Error starting Apify scraper:", error);
      toast({
        variant: "destructive",
        title: "Scraping Failed",
        description: error.message || "An error occurred while starting the Apify scraper.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, apify: false }));
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Location Scraping Tools</h1>
      
      <Tabs defaultValue="google">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="google">Google Places API</TabsTrigger>
          <TabsTrigger value="apify">Apify Scraper</TabsTrigger>
          <TabsTrigger value="n8n">n8n Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4">
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
                disabled={loading.googlePlaces}
              >
                {loading.googlePlaces ? "Searching..." : "Search Places"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="apify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apify Scraper</CardTitle>
              <CardDescription>
                Use Apify's Google Places Scraper for more comprehensive data collection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apifyToken">Apify API Token</Label>
                <Input
                  id="apifyToken"
                  type="password"
                  placeholder="Your Apify API token"
                  value={apifyToken}
                  onChange={(e) => setApifyToken(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apifyQuery">Search Query</Label>
                <Textarea
                  id="apifyQuery"
                  placeholder="e.g. restaurants in Cluj-Napoca"
                  value={apifyQuery}
                  onChange={(e) => setApifyQuery(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apifyMaxPlaces">Max Places</Label>
                  <Input
                    id="apifyMaxPlaces"
                    type="number"
                    value={apifyMaxPlaces}
                    onChange={(e) => setApifyMaxPlaces(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apifyActor">Actor</Label>
                  <Select value={apifyActor} onValueChange={setApifyActor}>
                    <SelectTrigger id="apifyActor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apify/google-places-scraper">Google Places Scraper</SelectItem>
                      <SelectItem value="apify/tripadvisor-scraper">TripAdvisor Scraper</SelectItem>
                      <SelectItem value="apify/booking-scraper">Booking.com Scraper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleApifyScraping} 
                disabled={loading.apify}
              >
                {loading.apify ? "Starting..." : "Start Scraping"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="n8n" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>n8n Workflow Integration</CardTitle>
              <CardDescription>
                Set up a webhook endpoint for n8n workflows to send location data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <N8nWebhookSetup />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapingPage;
