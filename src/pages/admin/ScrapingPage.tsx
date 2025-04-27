
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ExternalLink, Copy, Database, Webhook, RefreshCw, Play } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Form schemas
const n8nWebhookSchema = z.object({
  webhookUrl: z.string().url("Please enter a valid URL"),
});

const apifyIntegrationSchema = z.object({
  apifyToken: z.string().min(1, "Apify token is required"),
  actorId: z.string().min(1, "Actor ID is required"),
});

const googlePlacesSchema = z.object({
  query: z.string().min(3, "Search query must be at least 3 characters"),
  location: z.string().optional(),
  radius: z.coerce.number().min(100, "Radius must be at least 100 meters").max(50000, "Radius must be less than 50km"),
});

type N8nWebhookFormValues = z.infer<typeof n8nWebhookSchema>;
type ApifyIntegrationFormValues = z.infer<typeof apifyIntegrationSchema>;
type GooglePlacesFormValues = z.infer<typeof googlePlacesSchema>;

export default function ScrapingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("n8n");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // N8n webhook form
  const n8nForm = useForm<N8nWebhookFormValues>({
    resolver: zodResolver(n8nWebhookSchema),
    defaultValues: {
      webhookUrl: localStorage.getItem("n8nWebhookUrl") || "",
    },
  });
  
  // Apify integration form
  const apifyForm = useForm<ApifyIntegrationFormValues>({
    resolver: zodResolver(apifyIntegrationSchema),
    defaultValues: {
      apifyToken: localStorage.getItem("apifyToken") || "",
      actorId: localStorage.getItem("apifyActorId") || "apify/google-places-scraper",
    },
  });
  
  // Google Places direct query form
  const googlePlacesForm = useForm<GooglePlacesFormValues>({
    resolver: zodResolver(googlePlacesSchema),
    defaultValues: {
      query: "",
      location: "46.77,23.59", // Cluj-Napoca center
      radius: 5000,
    },
  });

  // The payload example that n8n webhook would receive
  const examplePayload = {
    name: "Coffee Shop Example",
    category_id: "restaurant", 
    slug: "coffee-shop-example",
    address: "123 Main St, Anytown, USA",
    latitude: 40.7128,
    longitude: -74.0060,
    phone: "555-123-4567",
    website: "https://example.com",
    place_id: "example-place-id",
    rating: 4.5,
    price_level: 2,
  };

  const examplePayloadString = JSON.stringify(examplePayload, null, 2);

  // Helper to copy content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard",
    });
  };

  // Handle n8n webhook testing
  const handleTestN8nWebhook = async (data: N8nWebhookFormValues) => {
    setIsProcessing(true);
    
    try {
      // Test the webhook by sending a request
      await fetch(data.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Add this to handle potential CORS issues
        body: JSON.stringify({
          test: true,
          message: "This is a test from the location management system",
        }),
      });
      
      // Store the webhook URL in localStorage for future use
      localStorage.setItem("n8nWebhookUrl", data.webhookUrl);
      
      toast({
        title: "Webhook Test",
        description: "A test message was sent to your n8n webhook.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      
      toast({
        variant: "destructive",
        title: "Webhook Test Failed",
        description: "Failed to send test message to the webhook URL. Please check the URL and try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Apify integration
  const handleRunApify = async (data: ApifyIntegrationFormValues) => {
    setIsProcessing(true);
    
    try {
      // Save Apify credentials in localStorage
      localStorage.setItem("apifyToken", data.apifyToken);
      localStorage.setItem("apifyActorId", data.actorId);
      
      // Use Supabase edge function to trigger the Apify actor
      const { data: response, error } = await supabase.functions.invoke("apify-places-scraper", {
        body: {
          token: data.apifyToken,
          actorId: data.actorId,
          searchParams: {
            queries: "restaurants in Cluj-Napoca",
            language: "en",
            maxCrawledPlaces: 10,
          },
        },
      });

      if (error) throw error;
      
      console.log("Apify run response:", response);
      
      toast({
        title: "Apify Run Started",
        description: "The scraping job has started successfully. Results will be processed when available.",
      });
    } catch (error) {
      console.error("Error running Apify:", error);
      
      toast({
        variant: "destructive",
        title: "Apify Run Failed",
        description: "Failed to start the scraping job. Please check your Apify credentials and try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Google Places direct query
  const handleQueryGooglePlaces = async (data: GooglePlacesFormValues) => {
    setIsProcessing(true);
    
    try {
      // Use the existing Google Places edge function
      const { data: response, error } = await supabase.functions.invoke("google-places", {
        body: {
          action: "searchNearby",
          params: {
            location: data.location ? 
              { lat: parseFloat(data.location.split(',')[0]), lng: parseFloat(data.location.split(',')[1]) } : 
              { lat: 46.77, lng: 23.59 }, 
            radius: data.radius,
            keyword: data.query
          }
        }
      });

      if (error) throw error;
      
      console.log("Google Places query response:", response);
      
      toast({
        title: "Places Retrieved",
        description: `Found ${response.results.length} places matching your query.`,
      });
    } catch (error) {
      console.error("Error querying Google Places:", error);
      
      toast({
        variant: "destructive",
        title: "Query Failed",
        description: "Failed to retrieve places from Google Places API. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Scraping Tools</h1>
        <p className="text-gray-500">
          Integrate with external services to scrape location data
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="n8n">n8n Integration</TabsTrigger>
          <TabsTrigger value="apify">Apify Integration</TabsTrigger>
          <TabsTrigger value="google">Google Places API</TabsTrigger>
        </TabsList>

        <TabsContent value="n8n" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>n8n Webhook Integration</CardTitle>
              <CardDescription>
                Configure a webhook URL to receive data from n8n workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...n8nForm}>
                <form onSubmit={n8nForm.handleSubmit(handleTestN8nWebhook)} className="space-y-6">
                  <FormField
                    control={n8nForm.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>n8n Webhook URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://your-n8n-instance.com/webhook/..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Testing..." : "Test Connection"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium mb-2">Expected payload format:</h4>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[200px]">
                    {examplePayloadString}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(examplePayloadString)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => window.open("https://n8n.io/integrations/", "_blank")}
                className="mr-2"
              >
                n8n Documentation <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <Alert>
            <Database className="h-4 w-4" />
            <AlertTitle>How n8n integration works</AlertTitle>
            <AlertDescription>
              Configure an n8n workflow to send location data to your webhook. 
              Each time the workflow runs, it will send location data to your application.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="apify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apify Integration</CardTitle>
              <CardDescription>
                Use Apify actors to scrape location data from Google Maps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apifyForm}>
                <form onSubmit={apifyForm.handleSubmit(handleRunApify)} className="space-y-6">
                  <FormField
                    control={apifyForm.control}
                    name="apifyToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apify API Token</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your Apify API token" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apifyForm.control}
                    name="actorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actor ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="apify/google-places-scraper" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Running..." : "Run Scraper"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => window.open("https://apify.com/store", "_blank")}
                className="mr-2"
              >
                Apify Actors <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open("https://apify.com/apify/google-places-scraper", "_blank")}
              >
                Google Places Scraper <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <Alert>
            <Database className="h-4 w-4" />
            <AlertTitle>How Apify integration works</AlertTitle>
            <AlertDescription>
              Apify actors can scrape location data from Google Maps and other sources.
              Set up your Apify token and select an actor to start scraping locations.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="google" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Places API</CardTitle>
              <CardDescription>
                Query the Google Places API directly for location data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...googlePlacesForm}>
                <form onSubmit={googlePlacesForm.handleSubmit(handleQueryGooglePlaces)} className="space-y-6">
                  <FormField
                    control={googlePlacesForm.control}
                    name="query"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search Query</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="restaurants, hotels, attractions, etc." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={googlePlacesForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (lat,lng)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="46.77,23.59" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={googlePlacesForm.control}
                      name="radius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Radius (meters)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5000" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Searching..." : "Search Places"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
