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
    
    try {
      // Call Google Places API via our edge function
      const { data: places, error } = await supabase.functions.invoke('google-places', {
        body: {
          action: 'searchNearby',
          params: {
            location: { lat: 46.77, lng: 23.59 }, // Cluj-Napoca center
            radius: 5000, // 5km radius
            type: 'establishment'
          }
        }
      });

      if (error) throw error;

      // Transform Google Places data to match our Location interface
      const locations = await Promise.all(places.results.map(async (place: any) => {
        // Get detailed place information
        const { data: details } = await supabase.functions.invoke('google-places', {
          body: {
            action: 'getPlaceDetails',
            params: {
              placeId: place.place_id
            }
          }
        });

        return this.transformGooglePlaceToLocation(details.result);
      }));

      // Cache the results
      CacheService.set(cacheKey, locations, this.CACHE_TTL.ALL_LOCATIONS);
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  static async getLocationsByCategory(category: LocationCategory): Promise<Location[]> {
    const cacheKey = `locations_by_category_${category}`;
    
    const cachedData = CacheService.get<Location[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const { data: places, error } = await supabase.functions.invoke('google-places', {
        body: {
          action: 'searchNearby',
          params: {
            location: { lat: 46.77, lng: 23.59 }, // Cluj-Napoca center
            radius: 5000,
            type: category // Use the category as Google Places type
          }
        }
      });

      if (error) throw error;

      const locations = await Promise.all(places.results.map(async (place: any) => {
        const { data: details } = await supabase.functions.invoke('google-places', {
          body: {
            action: 'getPlaceDetails',
            params: {
              placeId: place.place_id
            }
          }
        });

        return this.transformGooglePlaceToLocation(details.result);
      }));

      CacheService.set(cacheKey, locations, this.CACHE_TTL.CATEGORY_LOCATIONS);
      return locations;
    } catch (error) {
      console.error(`Error fetching locations for category ${category}:`, error);
      throw error;
    }
  }

  // Helper method to transform Google Place data to our Location interface
  private static transformGooglePlaceToLocation(place: any): Location {
    return {
      id: place.place_id,
      placeId: place.place_id,
      name: place.name,
      slug: this.generateSlug(place.name),
      category: this.determineCategory(place.types),
      address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      phone: place.formatted_phone_number,
      website: place.website,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      priceLevel: place.price_level,
      openNow: place.opening_hours?.open_now,
      photos: place.photos?.map((photo: any) => ({
        photoReference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        attribution: photo.html_attributions?.join(', ')
      })) || [],
      types: place.types,
      openingHours: place.opening_hours?.periods || [],
      reviews: place.reviews?.map((review: any) => ({
        authorName: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time,
        profilePhotoUrl: review.profile_photo_url
      })) || [],
      editorialSummary: place.editorial_summary?.overview,
      lastUpdated: new Date().toISOString()
    };
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private static determineCategory(types: string[]): LocationCategory {
    if (types.includes('lodging')) return 'hotel';
    if (types.includes('bar')) return 'bar';
    if (types.includes('restaurant')) return 'restaurant';
    if (types.includes('night_club')) return 'night_club';
    if (types.includes('tourist_attraction')) return 'tourist_attraction';
    return 'tourist_attraction'; // default category
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
