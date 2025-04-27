
import { supabase } from '@/integrations/supabase/client';
import { Location, LocationCategory } from '../types/location';

export const LocationService = {
  getAllLocations: async (): Promise<Location[]> => {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        category:category_id (id, name),
        photos:location_photos (
          photo_reference,
          width,
          height,
          attribution
        ),
        reviews:location_reviews (
          author_name,
          rating,
          text,
          time,
          profile_photo_url
        )
      `)
      .order('name');

    if (error) throw error;
    return data || [];
  },
  
  getLocationsByCategory: async (category: LocationCategory): Promise<Location[]> => {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        category:category_id (id, name),
        photos:location_photos (
          photo_reference,
          width,
          height,
          attribution
        ),
        reviews:location_reviews (
          author_name,
          rating,
          text,
          time,
          profile_photo_url
        )
      `)
      .eq('category_id', category)
      .order('name');

    if (error) throw error;
    return data || [];
  },
  
  getLocationBySlug: async (slug: string): Promise<Location | undefined> => {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        category:category_id (id, name),
        photos:location_photos (
          photo_reference,
          width,
          height,
          attribution
        ),
        reviews:location_reviews (
          author_name,
          rating,
          text,
          time,
          profile_photo_url
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },
  
  getNearbyLocations: async (latitude: number, longitude: number, limit: number = 5): Promise<Location[]> => {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        category:category_id (id, name),
        photos:location_photos (
          photo_reference,
          width,
          height,
          attribution
        )
      `)
      .order('created_at')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};
