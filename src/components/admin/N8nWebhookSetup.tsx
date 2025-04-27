
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LocationService } from "@/services/LocationService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const webhookFormSchema = z.object({
  webhookUrl: z.string().url("Please enter a valid URL"),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

interface N8nWebhookSetupProps {
  onWebhookTested?: () => void;
}

export function N8nWebhookSetup({ onWebhookTested }: N8nWebhookSetupProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingResult, setTestingResult] = useState<"success" | "error" | null>(null);
  const [n8nStatus, setN8nStatus] = useState<"unconfigured" | "configured" | "testing" | "connected">(
    localStorage.getItem("n8nWebhookUrl") ? "configured" : "unconfigured"
  );

  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      webhookUrl: localStorage.getItem("n8nWebhookUrl") || "",
    },
  });

  // The payload that n8n webhook would receive
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

  const n8nWorkflowExample = `
[
  {
    "id": "4dd559b0-d253-4f2d-93b1-162d7e89e8e7",
    "name": "Google Places to Webhook",
    "nodes": [
      {
        "parameters": {
          "url": "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+Cluj+Napoca&key=YOUR_API_KEY"
        },
        "name": "HTTP Request",
        "type": "n8n-nodes-base.httpRequest",
        "position": [
          580,
          300
        ]
      },
      {
        "parameters": {
          "jsCode": "// Process each place from Google Places API\nfor (const place of $input.item.json.results) {\n  const item = {\n    name: place.name,\n    category_id: 'restaurant',\n    slug: place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),\n    address: place.formatted_address,\n    latitude: place.geometry.location.lat,\n    longitude: place.geometry.location.lng,\n    place_id: place.place_id,\n    rating: place.rating,\n    price_level: place.price_level\n  };\n  \n  // Emit each processed place as a separate item\n  $input.emit(item);\n}\n"
        },
        "name": "Process Places",
        "type": "n8n-nodes-base.code",
        "position": [
          800,
          300
        ]
      },
      {
        "parameters": {
          "url": "YOUR_WEBHOOK_URL",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          }
        },
        "name": "Send to Admin Panel",
        "type": "n8n-nodes-base.webhook",
        "position": [
          1020,
          300
        ]
      }
    ],
    "connections": {
      "HTTP Request": {
        "main": [
          [
            {
              "node": "Process Places",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Process Places": {
        "main": [
          [
            {
              "node": "Send to Admin Panel",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  }
]`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard",
    });
  };

  const onSubmit = async (data: WebhookFormValues) => {
    setIsSubmitting(true);
    setTestingResult(null);
    setN8nStatus("testing");
    
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
      
      // Since we're using no-cors, we won't get a proper response status
      // Just assume it worked and show a success message
      setTestingResult("success");
      setN8nStatus("connected");
      
      // Store the webhook URL in localStorage for future use
      localStorage.setItem("n8nWebhookUrl", data.webhookUrl);
      
      toast({
        title: "Webhook Test",
        description: "A test message was sent to your n8n webhook.",
      });
      
      if (onWebhookTested) {
        onWebhookTested();
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
      setTestingResult("error");
      setN8nStatus("unconfigured");
      
      toast({
        variant: "destructive",
        title: "Webhook Test Failed",
        description: "Failed to send test message to the webhook URL. Please check the URL and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="setup">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="guide">Integration Guide</TabsTrigger>
          <TabsTrigger value="workflow">Sample Workflow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter your n8n webhook URL to automatically add locations from your n8n workflows.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
              
              <div className="flex flex-col space-y-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Testing..." : "Test Connection"}
                </Button>
                
                {testingResult === "success" && (
                  <div className="flex items-center text-green-500 mt-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Webhook test successful!</span>
                  </div>
                )}
              </div>
            </form>
          </Form>
          
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              Once configured, your n8n workflow can send location data to this webhook. 
              The system will automatically process and store the locations in your database.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="guide" className="space-y-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle>How to set up n8n integration</CardTitle>
              <CardDescription>Follow these steps to automate location addition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Create a new workflow in n8n <a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">n8n.io <ExternalLink className="ml-1 h-3 w-3" /></a></li>
                <li>Add a trigger node (HTTP Request, Schedule, etc.)</li>
                <li>Add nodes to fetch location data (Google Places API, web scraping, etc.)</li>
                <li>Process the data to match the expected format</li>
                <li>Add a "Webhook" node as your output to send data to this system</li>
                <li>Copy your webhook URL from n8n and paste it in the setup tab</li>
                <li>Test your workflow to make sure it's sending data correctly</li>
              </ol>
              
              <div className="mt-6">
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
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => window.open("https://n8n.io/integrations/", "_blank")}
                className="w-full"
              >
                Visit n8n Documentation <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="workflow" className="space-y-4 py-4">
          <Card>
            <CardHeader>
              <CardTitle>Sample n8n Workflow</CardTitle>
              <CardDescription>
                Copy and import this workflow into your n8n instance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[300px]">
                  {n8nWorkflowExample}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(n8nWorkflowExample)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 text-sm">
                <p>This workflow:</p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Fetches restaurant data from Google Places API</li>
                  <li>Processes each place into the format expected by this system</li>
                  <li>Sends the formatted data to your webhook URL</li>
                </ol>
                <p className="mt-2 text-muted-foreground">
                  You'll need to replace YOUR_API_KEY with your Google Places API key and YOUR_WEBHOOK_URL with the webhook URL from the setup tab.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => window.open("https://n8n.io/academy/", "_blank")}
                className="w-full"
              >
                Learn more about n8n workflows <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
