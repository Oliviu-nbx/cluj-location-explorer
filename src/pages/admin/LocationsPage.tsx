import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocationService } from "@/services/LocationService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, Webhook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { N8nWebhookSetup } from "@/components/admin/N8nWebhookSetup";
import PlaceInfoManager from "@/components/admin/PlaceInfoManager";

export default function LocationsPage() {
  const [page] = useState(1);
  const { toast } = useToast();
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  const { data: locations, isLoading, refetch } = useQuery({
    queryKey: ["admin-locations", page],
    queryFn: () => LocationService.getAllLocations(),
  });

  const handleAddLocation = () => {
    toast({
      title: "Coming Soon",
      description: "Manual location addition will be available soon.",
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Locations</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddLocation} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Location
          </Button>
          <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Webhook className="h-4 w-4 mr-2" />
                n8n Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>n8n.io Webhook Integration</DialogTitle>
              </DialogHeader>
              <N8nWebhookSetup onWebhookTested={() => setIsWebhookDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No locations found. Add some manually or use n8n integration.
              </TableCell>
            </TableRow>
          ) : (
            locations?.map((location) => (
              <TableRow key={location.id}>
                <TableCell>{location.name}</TableCell>
                <TableCell>{location.category}</TableCell>
                <TableCell>{location.address}</TableCell>
                <TableCell>{location.compositeScore || location.rating}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedLocationId(location.id)}
                  >
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!selectedLocationId} onOpenChange={() => setSelectedLocationId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Place Information</DialogTitle>
          </DialogHeader>
          {selectedLocationId && (
            <PlaceInfoManager locationId={selectedLocationId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
