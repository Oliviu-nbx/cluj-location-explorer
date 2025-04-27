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

  private static SAMPLE_LOCATIONS: Location[] = [
    {
      id: 'hotel-1',
      placeId: 'sample-hotel-1',
      name: 'Grand Hotel Transilvania',
      slug: 'grand-hotel-transilvania',
      category: 'hotel',
      address: '1 Unirii Square, Cluj-Napoca',
      latitude: 46.7712,
      longitude: 23.5964,
      phone: '+40 264 594 999',
      website: 'https://example.com/grand-hotel',
      rating: 4.8,
      userRatingsTotal: 520,
      priceLevel: 4,
      openNow: true,
      photos: [],
      types: ['lodging', 'hotel'],
      reviews: [
        {
          authorName: 'John Smith',
          rating: 5,
          text: 'Excellent stay with amazing views of the city center!',
          time: Date.now() / 1000,
          profilePhotoUrl: 'https://example.com/profiles/john.jpg'
        }
      ],
      editorialSummary: 'A luxurious 5-star hotel in the heart of Cluj-Napoca',
      lastUpdated: new Date().toISOString(),
      compositeScore: 4.8
    },
    {
      id: 'restaurant-1',
      placeId: 'sample-restaurant-1',
      name: 'Casa Traditionala',
      slug: 'casa-traditionala',
      category: 'restaurant',
      address: '15 Memorandumului Street, Cluj-Napoca',
      latitude: 46.7690,
      longitude: 23.5898,
      phone: '+40 264 123 456',
      website: 'https://example.com/casa-traditionala',
      rating: 4.6,
      userRatingsTotal: 850,
      priceLevel: 2,
      openNow: true,
      photos: [],
      types: ['restaurant', 'food'],
      lastUpdated: new Date().toISOString(),
      compositeScore: 4.6
    },
    {
      id: 'bar-1',
      placeId: 'sample-bar-1',
      name: 'The Soviet',
      slug: 'the-soviet',
      category: 'bar',
      address: '22 Piezisa Street, Cluj-Napoca',
      latitude: 46.7623,
      longitude: 23.5789,
      rating: 4.7,
      userRatingsTotal: 320,
      priceLevel: 2,
      openNow: true,
      photos: [],
      types: ['bar', 'point_of_interest'],
      lastUpdated: new Date().toISOString(),
      compositeScore: 4.7
    },
    {
      id: 'club-1',
      placeId: 'sample-club-1',
      name: 'Form Space',
      slug: 'form-space',
      category: 'night_club',
      address: '5 Decebal Street, Cluj-Napoca',
      latitude: 46.7701,
      longitude: 23.5882,
      phone: '+40 264 777 888',
      rating: 4.5,
      userRatingsTotal: 1200,
      priceLevel: 3,
      openNow: false,
      photos: [],
      types: ['night_club', 'entertainment'],
      lastUpdated: new Date().toISOString(),
      compositeScore: 4.5
    },
    {
      id: 'attraction-1',
      placeId: 'sample-attraction-1',
      name: 'Botanical Garden Alexandru Borza',
      slug: 'botanical-garden-alexandru-borza',
      category: 'tourist_attraction',
      address: '42 Republicii Street, Cluj-Napoca',
      latitude: 46.7623,
      longitude: 23.5882,
      phone: '+40 264 592 152',
      website: 'https://example.com/botanical-garden',
      rating: 4.9,
      userRatingsTotal: 2500,
      priceLevel: 1,
      openNow: true,
      photos: [],
      types: ['tourist_attraction', 'park'],
      editorialSummary: 'A beautiful garden featuring over 10,000 plant species',
      lastUpdated: new Date().toISOString(),
      compositeScore: 4.9
    }
  ];

  static async getAllLocations(): Promise<Location[]> {
    const cacheKey = 'all_locations';
    
    // Try to get from cache first
    const cachedData = CacheService.get<Location[]>(cacheKey);
    if (cachedData) {
      console.log('Using cached data for all locations');
      return cachedData;
    }
    
    try {
      // Return sample data instead of making API call
      return this.SAMPLE_LOCATIONS;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return this.SAMPLE_LOCATIONS; // Fallback to sample data
    }
  }

  static async getLocationsByCategory(category: LocationCategory): Promise<Location[]> {
    const cacheKey = `locations_by_category_${category}`;
    
    const cachedData = CacheService.get<Location[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Filter sample data by category
    return this.SAMPLE_LOCATIONS.filter(location => location.category === category);
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

  static async getLocationById(id: string): Promise<Location | null> {
    const cacheKey = `location_by_id_${id}`;
    
    // Try to get from cache first
    const cachedData = CacheService.get<Location>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for location ID: ${id}`);
      return cachedData;
    }
    
    try {
      // Find the location in our sample data
      const location = this.SAMPLE_LOCATIONS.find(loc => loc.id === id);
      
      if (location) {
        // Cache the result if found
        CacheService.set(cacheKey, location, this.CACHE_TTL.LOCATION_DETAILS);
      }
      
      return location || null;
    } catch (error) {
      console.error(`Error fetching location with ID ${id}:`, error);
      return null;
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

  // New method to add a location
  static async addLocation(locationData: Partial<Location>): Promise<Location> {
    try {
      // Ensure required fields
      if (!locationData.name || !locationData.category || !locationData.address || 
          locationData.latitude === undefined || locationData.longitude === undefined) {
        throw new Error("Missing required fields");
      }

      // Generate ID if not provided
      const id = locationData.id || crypto.randomUUID();
      
      // Create a new location object
      const newLocation: Location = {
        id,
        name: locationData.name,
        slug: locationData.slug || this.generateSlug(locationData.name),
        category: locationData.category,
        address: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        phone: locationData.phone,
        website: locationData.website,
        rating: locationData.rating,
        priceLevel: locationData.priceLevel,
        placeId: locationData.placeId || `manual-${Date.now()}`,
        photos: locationData.photos || [],
        types: locationData.types || [locationData.category],
        reviews: locationData.reviews || [],
        editorialSummary: locationData.editorialSummary,
        lastUpdated: new Date().toISOString(),
        openNow: locationData.openNow,
        userRatingsTotal: locationData.userRatingsTotal,
        openingHours: locationData.openingHours,
        compositeScore: locationData.compositeScore || locationData.rating
      };
      
      // In a real application, we would persist this to a database
      // For now, we'll just add it to our sample locations array
      this.SAMPLE_LOCATIONS.push(newLocation);
      
      // Clear the cache to ensure we fetch the latest data next time
      CacheService.remove('all_locations');
      CacheService.remove(`locations_by_category_${newLocation.category}`);
      
      return newLocation;
    } catch (error) {
      console.error("Error adding location:", error);
      throw error;
    }
  }
  
  // Method to update an existing location
  static async updateLocation(location: Location): Promise<Location> {
    try {
      // Find the location index
      const index = this.SAMPLE_LOCATIONS.findIndex(loc => loc.id === location.id);
      if (index === -1) {
        throw new Error(`Location with ID ${location.id} not found`);
      }
      
      // Update the location
      this.SAMPLE_LOCATIONS[index] = {
        ...location,
        lastUpdated: new Date().toISOString()
      };
      
      // Clear relevant caches
      CacheService.remove('all_locations');
      CacheService.remove(`locations_by_category_${location.category}`);
      CacheService.remove(`location_by_slug_${location.slug}`);
      
      return this.SAMPLE_LOCATIONS[index];
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  }
  
  // Method to delete a location
  static async deleteLocation(id: string): Promise<void> {
    try {
      // Find the location
      const index = this.SAMPLE_LOCATIONS.findIndex(loc => loc.id === id);
      if (index === -1) {
        throw new Error(`Location with ID ${id} not found`);
      }
      
      // Store category before deletion for cache clearing
      const category = this.SAMPLE_LOCATIONS[index].category;
      const slug = this.SAMPLE_LOCATIONS[index].slug;
      
      // Remove the location
      this.SAMPLE_LOCATIONS.splice(index, 1);
      
      // Clear relevant caches
      CacheService.remove('all_locations');
      CacheService.remove(`locations_by_category_${category}`);
      CacheService.remove(`location_by_slug_${slug}`);
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error;
    }
  }

  // New method to get place details for a location
  static async getPlaceDetails(locationId: string) {
    try {
      const location = await this.getLocationById(locationId);
      if (!location) {
        throw new Error(`Location with ID ${locationId} not found`);
      }
      
      // Here we would typically fetch additional place details from an API
      // For now, we'll return some mock data based on the location
      return {
        location,
        details: {
          amenities: ["WiFi", "Parking", "Air Conditioning"],
          checkInTime: location.category === 'hotel' ? "14:00" : null,
          checkOutTime: location.category === 'hotel' ? "12:00" : null,
          neighborhood: "City Center",
          externalReviews: [
            {
              source: "TripAdvisor",
              rating: 4.7,
              reviewCount: 245
            },
            {
              source: "Booking.com",
              rating: 8.9,
              reviewCount: 180
            },
            {
              source: "Yelp",
              rating: 4.5,
              reviewCount: 120
            }
          ]
        }
      };
    } catch (error) {
      console.error("Error getting place details:", error);
      throw error;
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
