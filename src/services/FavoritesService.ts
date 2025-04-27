
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
    
    return data.map(item => item.locations as Location);
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
