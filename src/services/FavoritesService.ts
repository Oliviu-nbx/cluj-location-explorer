
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Location } from "@/types/location";

export const FavoritesService = {
  toggleFavorite: async (locationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return false;
    }

    const { data: existingFavorite } = await supabase
      .from('user_favorites')
      .select()
      .eq('user_id', user.id)
      .eq('location_id', locationId)
      .single();

    if (existingFavorite) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('location_id', locationId);

      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, location_id: locationId });

      if (error) throw error;
      return true;
    }
  },

  getFavorites: async (): Promise<Location[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        location_id,
        locations (*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    
    // Transform data to match Location interface, similar to LocationService
    return data.map(item => transformLocationData(item.locations));
  },

  checkIsFavorite: async (locationId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data } = await supabase
      .from('user_favorites')
      .select()
      .eq('user_id', user.id)
      .eq('location_id', locationId)
      .single();

    return !!data;
  }
};

// Helper function to transform location data to match Location interface
// This is similar to the function in LocationService.ts
const transformLocationData = (item: any): Location => {
  return {
    id: item.id,
    placeId: item.place_id,
    name: item.name,
    slug: item.slug,
    category: item.category_id,
    address: item.address,
    latitude: item.latitude,
    longitude: item.longitude,
    phone: item.phone,
    website: item.website,
    rating: item.rating,
    userRatingsTotal: item.user_ratings_total,
    priceLevel: item.price_level,
    openNow: item.open_now,
    photos: [], // Default empty array if no photos
    types: [item.category_id], // Use category_id as default type
    openingHours: [], // Default empty array
    reviews: [], // Default empty array
    editorialSummary: item.editorial_summary,
    lastUpdated: item.updated_at || item.created_at
  };
};
