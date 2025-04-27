
import { supabase } from '@/integrations/supabase/client';
import { Location, LocationCategory } from '../types/location';

export class DatabaseLocationService {
  static async getAllLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          category:categories!inner(
            id,
            name,
            slug,
            description,
            icon
          ),
          photos:location_photos(
            id,
            photo_reference,
            width,
            height,
            attribution
          ),
          reviews:location_reviews(
            id,
            rating,
            text,
            author_name,
            profile_photo_url,
            time
          )
        `)
        .order('name');

      if (error) throw error;
      
      return data.map(this.transformDatabaseLocation);
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  static async addLocation(locationData: Partial<Location>): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          name: locationData.name,
          slug: locationData.slug,
          category_id: locationData.category,
          address: locationData.address,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          phone: locationData.phone,
          website: locationData.website,
          place_id: locationData.placeId || `manual-${Date.now()}`,
          rating: locationData.rating,
          price_level: locationData.priceLevel,
          open_now: locationData.openNow,
          editorial_summary: locationData.editorialSummary,
          user_ratings_total: locationData.userRatingsTotal,
          composite_score: locationData.compositeScore || locationData.rating
        }])
        .select()
        .single();

      if (error) throw error;
      return this.transformDatabaseLocation(data);
    } catch (error) {
      console.error('Error adding location:', error);
      throw error;
    }
  }

  static async updateLocation(location: Location): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update({
          name: location.name,
          category_id: location.category,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          phone: location.phone,
          website: location.website,
          rating: location.rating,
          price_level: location.priceLevel,
          open_now: location.openNow,
          editorial_summary: location.editorialSummary,
          updated_at: new Date().toISOString()
        })
        .eq('id', location.id)
        .select()
        .single();

      if (error) throw error;
      return this.transformDatabaseLocation(data);
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  static async deleteLocation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

  private static transformDatabaseLocation(data: any): Location {
    return {
      id: data.id,
      placeId: data.place_id,
      name: data.name,
      slug: data.slug,
      category: data.category_id,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      phone: data.phone,
      website: data.website,
      rating: data.rating,
      userRatingsTotal: data.user_ratings_total,
      priceLevel: data.price_level,
      openNow: data.open_now,
      photos: data.photos || [],
      types: [data.category_id],
      reviews: data.reviews || [],
      editorialSummary: data.editorial_summary,
      lastUpdated: data.updated_at,
      compositeScore: data.composite_score,
      openingHours: []
    };
  }
}
