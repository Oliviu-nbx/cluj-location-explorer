
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { N8nWebhookSetup } from "@/components/admin/N8nWebhookSetup";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { GooglePlacesScraper } from "@/components/admin/scraping/GooglePlacesScraper";
import { ApifyScraper } from "@/components/admin/scraping/ApifyScraper";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ScrapingPage = () => {
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  
  const handleStatusUpdate = (message: string) => {
    setStatusMessage(message);
    // Clear any previous errors when a new operation starts
    if (message && error) {
      setError(null);
    }
    // Clear any previous info messages when a new operation starts
    if (message && info) {
      setInfo(null);
    }
  };

  // Add an information message about API keys being needed
  const showApiKeyInfo = () => {
    setInfo("Both Google Places API and Apify require API keys. Make sure you have valid keys before attempting to scrape data.");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Location Scraping Tools</h1>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {info && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">{info}</AlertDescription>
        </Alert>
      )}
      
      {statusMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <p>{statusMessage}</p>
        </div>
      )}
      
      <Tabs defaultValue="google" onValueChange={() => showApiKeyInfo()}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="google">Google Places API</TabsTrigger>
          <TabsTrigger value="apify">Apify Scraper</TabsTrigger>
          <TabsTrigger value="n8n">n8n Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="google">
          <GooglePlacesScraper onStatusUpdate={handleStatusUpdate} />
        </TabsContent>

        <TabsContent value="apify">
          <ApifyScraper onStatusUpdate={handleStatusUpdate} />
        </TabsContent>

        <TabsContent value="n8n">
          <Card>
            <N8nWebhookSetup />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapingPage;
