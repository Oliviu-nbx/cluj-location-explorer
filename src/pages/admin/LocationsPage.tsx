
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DatabaseLocationService } from "@/services/DatabaseLocationService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, Webhook, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { N8nWebhookSetup } from "@/components/admin/N8nWebhookSetup";
import PlaceInfoManager from "@/components/admin/PlaceInfoManager";
import { AddLocationForm } from "@/components/admin/AddLocationForm";
import { EditLocationForm } from "@/components/admin/EditLocationForm";
import { Location, LocationCategory, CATEGORY_LABELS } from "@/types/location";

export default function LocationsPage() {
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  
  const { data: locations, isLoading, refetch } = useQuery({
    queryKey: ["admin-locations", page],
    queryFn: () => DatabaseLocationService.getAllLocations(),
  });

  const handleAddLocation = () => {
    setIsAddLocationOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setLocationToEdit(location);
    setIsEditLocationOpen(true);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      try {
        await DatabaseLocationService.deleteLocation(locationId);
        toast({
          title: "Success",
          description: "Location has been deleted successfully",
        });
        refetch();
      } catch (error) {
        console.error("Error deleting location:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete the location",
        });
      }
    }
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
                <TableCell>{CATEGORY_LABELS[location.category as LocationCategory] || location.category}</TableCell>
                <TableCell>{location.address}</TableCell>
                <TableCell>{location.compositeScore ?? location.rating}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedLocationId(location.id)}
                    >
                      Manage
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditLocation(location)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add Location Dialog */}
      <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          <AddLocationForm 
            onSuccess={() => {
              setIsAddLocationOpen(false);
              refetch();
              toast({
                title: "Location Added",
                description: "The new location has been added successfully",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditLocationOpen} onOpenChange={setIsEditLocationOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          {locationToEdit && (
            <EditLocationForm 
              location={locationToEdit}
              onSuccess={() => {
                setIsEditLocationOpen(false);
                refetch();
                toast({
                  title: "Location Updated",
                  description: "The location has been updated successfully",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Place Info Manager Dialog */}
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
