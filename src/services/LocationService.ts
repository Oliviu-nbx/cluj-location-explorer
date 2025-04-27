import { supabase } from '@/integrations/supabase/client';
import { Location, LocationCategory } from '../types/location';
import CacheService from './CacheService';

export class LocationService {
  // Cache TTL values in milliseconds
  private static CACHE_TTL = {
    ALL_LOCATIONS: 10 * 60 * 1000, // 10 minutes
    CATEGORY_LOCATIONS: 5 * 60 * 1000, // 5 minutes
    LOCATION_DETAILS: 15 * 60 * 1000, // 15 minutes
    NEARBY_LOCATIONS: 5 * 60 * 1000  // 5 minutes
  };

  static async getAllLocations(): Promise<Location[]> {
    const cacheKey = 'all_locations';
    
    // Try to get from cache first
    const cachedData = CacheService.get<Location[]>(cacheKey);
    if (cachedData) {
      console.log('Using cached data for all locations');
      return cachedData;
    }
    
    // If not in cache, fetch from API
    try {
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
      const locations = (data || []).map(item => transformLocationData(item));
      
      // Cache the result
      CacheService.set(cacheKey, locations, this.CACHE_TTL.ALL_LOCATIONS);
      
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  static async getLocationsByCategory(category: LocationCategory): Promise<Location[]> {
    const cacheKey = `locations_by_category_${category}`;
    
    // Try to get from cache first
    const cachedData = CacheService.get<Location[]>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for category: ${category}`);
      return cachedData;
    }
    
    // If not in cache, fetch from API
    try {
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
      const locations = (data || []).map(item => transformLocationData(item));
      
      // Cache the result
      CacheService.set(cacheKey, locations, this.CACHE_TTL.CATEGORY_LOCATIONS);
      
      return locations;
    } catch (error) {
      console.error(`Error fetching locations for category ${category}:`, error);
      throw error;
    }
  }

  static async getLocationBySlug(slug: string): Promise<Location | null> {
    const cacheKey = `location_by_slug_${slug}`;
    
    // Try to get from cache first
    const cachedData = CacheService.get<Location>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for location: ${slug}`);
      return cachedData;
    }
    
    // If not in cache, fetch from API
    try {
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
      const location = data ? transformLocationData(data) : undefined;
      
      // Cache the result if found
      if (location) {
        CacheService.set(cacheKey, location, this.CACHE_TTL.LOCATION_DETAILS);
      }
      
      return location;
    } catch (error) {
      console.error(`Error fetching location with slug ${slug}:`, error);
      throw error;
    }
  }

  static async getNearbyLocations(latitude: number, longitude: number, radius: number = 5): Promise<Location[]> {
    const cacheKey = `nearby_locations_${latitude}_${longitude}_${radius}`;
    
    // Try to get from cache first
    const cachedData = CacheService.get<Location[]>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for nearby locations at (${latitude}, ${longitude})`);
      return cachedData;
    }
    
    // If not in cache, fetch from API
    try {
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
        .limit(radius);

      if (error) throw error;
      
      // Transform data to match Location interface
      const locations = (data || []).map(item => transformLocationData(item));
      
      // Cache the result
      CacheService.set(cacheKey, locations, this.CACHE_TTL.NEARBY_LOCATIONS);
      
      return locations;
    } catch (error) {
      console.error(`Error fetching nearby locations:`, error);
      throw error;
    }
  }

  // New method to add locations from n8n
  static async addLocationFromN8n(locationData: any): Promise<Location | null> {
    try {
      // Ensure we have all required fields
      const requiredFields = ['name', 'category_id', 'slug', 'address', 'latitude', 'longitude', 'place_id'];
      for (const field of requiredFields) {
        if (!locationData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // Insert the location into the database
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select()
        .single();
        
      if (error) throw error;
      
      return transformLocationData(data);
    } catch (error) {
      console.error("Error adding location from n8n:", error);
      return null;
    }
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
