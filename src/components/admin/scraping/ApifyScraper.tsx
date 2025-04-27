
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ApifyScraperProps {
  onStatusUpdate?: (message: string) => void;
}

export const ApifyScraper = ({ onStatusUpdate }: ApifyScraperProps = {}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [apifyToken, setApifyToken] = useState("");
  const [apifyQuery, setApifyQuery] = useState("restaurants in Cluj-Napoca");
  const [apifyMaxPlaces, setApifyMaxPlaces] = useState("10");
  const [apifyActor, setApifyActor] = useState("apify/google-places-scraper");
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const updateStatus = (message: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(message);
    }
  };

  const handleApifyScraping = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    updateStatus("Preparing Apify scraper...");
    
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

      console.log("Starting Apify scraper with params:", searchParams);
      updateStatus(`Starting Apify scraping for "${apifyQuery}"...`);
      
      const response = await supabase.functions.invoke("apify-places-scraper", {
        body: {
          token: apifyToken,
          actorId: apifyActor,
          searchParams
        }
      });

      console.log("Apify response:", response);

      // Check for error in the response body (even if status is 200)
      if (response.data && response.data.success === false) {
        // Store the debug info for developer inspection
        setDebugInfo(response.data);
        throw new Error(response.data.error || "Unknown error from Apify scraper");
      }
      
      // Check for error in the error property
      if (response.error) {
        // Store the debug info for developer inspection
        setDebugInfo(response.error);
        throw new Error(response.error.message || "Unknown error from Apify scraper");
      }

      updateStatus(`Apify job started with run ID: ${response.data?.runId || 'unknown'}`);
      
      toast({
        title: "Apify Scraping Started",
        description: "The scraping job has been started. Results will be processed in the background. This might take a few minutes.",
      });
    } catch (error) {
      console.error("Error starting Apify scraper:", error);
      setError(error.message || "An error occurred while starting the Apify scraper.");
      toast({
        variant: "destructive",
        title: "Scraping Failed",
        description: error.message || "An error occurred while starting the Apify scraper.",
      });
    } finally {
      setLoading(false);
      // Keep the status message for Apify since it's a background process
      if (!error) {
        setTimeout(() => updateStatus(""), 5000);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apify Scraper</CardTitle>
        <CardDescription>
          Use Apify's Google Places Scraper for more comprehensive data collection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {debugInfo && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md mb-4">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="apifyToken">Apify API Token</Label>
          <Input
            id="apifyToken"
            type="password"
            placeholder="Your Apify API token"
            value={apifyToken}
            onChange={(e) => setApifyToken(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get your Apify token from the <a href="https://console.apify.com/account/integrations" target="_blank" rel="noopener noreferrer" className="underline">Apify Console</a>.
          </p>
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
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Start Scraping
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
