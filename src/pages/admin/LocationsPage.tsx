
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LocationService } from "@/services/LocationService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function LocationsPage() {
  const [page] = useState(1);

  const { data: locations, isLoading } = useQuery({
    queryKey: ["admin-locations", page],
    queryFn: () => LocationService.getAllLocations(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manage Locations</h1>
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
          {locations?.map((location) => (
            <TableRow key={location.id}>
              <TableCell>{location.name}</TableCell>
              <TableCell>{location.category}</TableCell>
              <TableCell>{location.address}</TableCell>
              <TableCell>{location.rating}</TableCell>
              <TableCell>Edit</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
