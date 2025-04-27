import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LocationService } from "@/services/LocationService";
import { Location, LocationCategory, CATEGORY_LABELS } from "@/types/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { DatabaseLocationService } from "@/services/DatabaseLocationService";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["hotel", "bar", "restaurant", "night_club", "tourist_attraction"]),
  address: z.string().min(5, "Address must be at least 5 characters"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  phone: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  rating: z.coerce.number().min(0).max(5).optional(),
  priceLevel: z.coerce.number().min(1).max(4).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditLocationFormProps {
  location: Location;
  onSuccess: () => void;
}

export function EditLocationForm({ location, onSuccess }: EditLocationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: location.name,
      category: location.category,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      phone: location.phone || "",
      website: location.website || "",
      rating: location.rating || undefined,
      priceLevel: location.priceLevel || undefined,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const updatedLocation: Location = {
        ...location,
        name: values.name,
        category: values.category as LocationCategory,
        address: values.address,
        latitude: values.latitude,
        longitude: values.longitude,
        phone: values.phone || undefined,
        website: values.website || undefined,
        rating: values.rating,
        priceLevel: values.priceLevel,
        lastUpdated: new Date().toISOString(),
      };
      
      await DatabaseLocationService.updateLocation(updatedLocation);
      onSuccess();
    } catch (error) {
      console.error("Error updating location:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update location. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input placeholder="Location name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address*</FormLabel>
              <FormControl>
                <Input placeholder="Full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude*</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="Latitude" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude*</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="Longitude" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Phone number (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="Website URL (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating (0-5)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="5" placeholder="Rating" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Level (1-4)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="4" placeholder="Price level" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : "Update Location"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
