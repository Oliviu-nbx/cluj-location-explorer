
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
    
    // Transform data to match Location interface
    return (data || []).map(item => transformLocationData(item));
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
    
    // Transform data to match Location interface
    return (data || []).map(item => transformLocationData(item));
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
    
    // Transform data to match Location interface
    return data ? transformLocationData(data) : undefined;
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
    
    // Transform data to match Location interface
    return (data || []).map(item => transformLocationData(item));
  }
};

// Helper function to transform database data to match Location interface
const transformLocationData = (item: any): Location => {
  return {
    id: item.id,
    placeId: item.place_id, // Rename field to match interface
    name: item.name,
    slug: item.slug,
    category: item.category_id as LocationCategory, // Cast to LocationCategory
    address: item.address,
    latitude: item.latitude,
    longitude: item.longitude,
    phone: item.phone,
    website: item.website,
    rating: item.rating,
    userRatingsTotal: item.user_ratings_total,
    priceLevel: item.price_level,
    openNow: item.open_now,
    // Transform photos to match interface
    photos: Array.isArray(item.photos) ? item.photos.map((photo: any) => ({
      photoReference: photo.photo_reference,
      width: photo.width,
      height: photo.height,
      attribution: photo.attribution
    })) : [],
    // Adding required fields that might be missing
    types: [item.category_id], // Use category_id as default type
    openingHours: [], // Default empty array
    reviews: Array.isArray(item.reviews) ? item.reviews.map((review: any) => ({
      authorName: review.author_name,
      rating: review.rating,
      text: review.text,
      time: review.time,
      profilePhotoUrl: review.profile_photo_url
    })) : [],
    editorialSummary: item.editorial_summary,
    lastUpdated: item.updated_at // Use updated_at as lastUpdated
  };
};
