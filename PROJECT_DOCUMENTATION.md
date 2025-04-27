
# Cluj Compass Project Documentation

## Project Overview

Cluj Compass is a location discovery platform for Cluj-Napoca, Romania. It allows users to browse various locations categorized as hotels, restaurants, bars, night clubs, and tourist attractions. The admin panel enables authorized users to manage locations, categories, and data scraping.

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Components**: Shadcn UI (built on Radix UI)
- **Styling**: Tailwind CSS
- **Routing**: React Router Dom
- **State Management**: React Query (TanStack Query)
- **Authentication**: Custom Auth via Supabase
- **Backend**: Supabase (PostgreSQL database)
- **Edge Functions**: Supabase Edge Functions

## Project Structure

### Core Pages

1. **HomePage**: Landing page showing featured locations
2. **CategoryPage**: Shows locations filtered by category
3. **LocationPage**: Detailed view of a specific location
4. **AuthPage**: Handles user login/signup
5. **ProfilePage**: User profile management
6. **Admin Pages**:
   - Dashboard (Analytics)
   - LocationsPage (Location management)
   - CategoriesPage (Category management)
   - ScrapingPage (Data scraping tools)
   - Monitoring (Error reporting)

### Key Components

- **Header**: Main navigation component
- **LocationCard**: Card display for a location in listings
- **LocationDetails**: Detailed information about a location
- **LocationsGrid**: Grid display for multiple locations
- **MapView**: Interactive map showing location(s)
- **SearchBar**: Search functionality
- **AuthContext**: Authentication state management
- **Admin Components**:
  - AddLocationForm: Form to add new locations
  - EditLocationForm: Form to edit existing locations
  - N8nWebhookSetup: Integration with n8n for data scraping
  - PlaceInfoManager: Detailed location data management

### Services

#### LocationService

The central service for all location data operations. Currently uses in-memory sample data (`SAMPLE_LOCATIONS`) but is designed to work with a Supabase backend once fully implemented.

Key methods:
- `getAllLocations()`: Fetch all locations
- `getLocationsByCategory()`: Filter locations by category
- `getLocationById()`: Get a location by ID
- `getLocationBySlug()`: Get a location by slug
- `getNearbyLocations()`: Get locations near a given point
- `addLocation()`: Add a new location
- `updateLocation()`: Update an existing location
- `deleteLocation()`: Delete a location
- `getPlaceDetails()`: Get detailed information about a place

#### CacheService

Handles in-memory caching of location data to improve performance.

Key methods:
- `get<T>()`: Get cached data by key
- `set<T>()`: Set cache data with an optional TTL
- `remove()`: Remove item from cache
- `clear()`: Clear all cache
- `has()`: Check if an item exists in cache
- `stats()`: Get cache usage statistics

#### EnvironmentService

Manages environment-specific configuration.

Key features:
- Environment detection
- API base URL configuration
- Google Analytics integration
- Feature flag management

### Data Models

#### Location

```typescript
export type LocationCategory = 'hotel' | 'bar' | 'restaurant' | 'night_club' | 'tourist_attraction';

export interface Location {
  id: string;
  placeId: string;
  name: string;
  slug: string;
  category: LocationCategory;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  openNow?: boolean;
  openingHours?: LocationOpeningPeriod[];
  photos: LocationPhotoReference[];
  types: string[];
  reviews?: LocationReview[];
  editorialSummary?: string;
  lastUpdated: string;
  compositeScore?: number;
}
```

#### PlaceInfo

Additional information about locations from external sources:

```typescript
export interface PlaceInfo {
  id: string;
  locationId: string;
  source: PlaceSource;
  rating: number;
  reviewCount: number;
  priceLevel: number | null;
  amenities: string[];
  checkInTime: string | null;
  checkOutTime: string | null;
  neighborhood: string | null;
  updatedAt: string;
}
```

## Authentication System

Authentication is implemented through Supabase. The system uses a custom `AuthContext` component that provides authentication state and methods across the application.

Features:
- Email/password authentication
- Admin role detection
- Protected routes for admin features

## Admin Panel

The admin panel is accessible only to users with admin privileges. It includes:

1. **Location Management**: 
   - View all locations
   - Add new locations
   - Edit existing locations
   - Delete locations
   - Manage detailed place information

2. **Category Management**:
   - View all categories
   - Add/edit/delete categories

3. **Data Scraping**:
   - Integration with n8n for automated location scraping
   - Google Places API integration

4. **Analytics & Monitoring**:
   - User analytics dashboard
   - Error monitoring and reporting

## Supabase Integration

The project is integrated with Supabase for backend functionality. The database schema includes these main tables:

- `locations`: Core location data
- `location_photos`: Photos associated with locations
- `location_reviews`: User reviews for locations
- `place_info`: Additional information from external sources
- `categories`: Location categories
- `profiles`: User profile information
- `user_favorites`: User's favorite locations

## Current Implementation Status

The application currently uses in-memory sample data for development and demonstration purposes. The backend integration with Supabase is partially implemented but needs to be completed.

Key areas requiring completion:
1. **Database Integration**: Replace sample data with actual Supabase queries
2. **Authentication**: Complete user registration and profile management
3. **Image Upload**: Implement file uploads for location images
4. **External API Integration**: Complete integrations with Google Places API and other data sources
5. **Data Scraping**: Complete the n8n webhook integration for automated data collection
6. **Mobile Optimization**: Enhance responsive design for all pages

## Development Workflow

1. **Adding New Features**:
   - Create new components in `src/components`
   - Add new pages in `src/pages`
   - Update routes in `App.tsx`

2. **Database Changes**:
   - Update Supabase schema
   - Update corresponding TypeScript interfaces in `src/types`

3. **Component Structure**:
   - Keep components small and focused
   - Use Shadcn UI components for consistent design
   - Follow Tailwind CSS conventions for styling

4. **State Management**:
   - Use React Query for API state
   - Use React Context for global state (auth, UI preferences)
   - Use React state for component-level state

## Performance Considerations

1. **Caching**: 
   - Location data is cached using `CacheService`
   - TTL values are customized based on data type

2. **Lazy Loading**:
   - Implement code-splitting for routes
   - Optimize image loading with `OptimizedImage` component

## Future Enhancements

1. **User Reviews**: Allow authenticated users to leave reviews
2. **Advanced Search**: Implement full-text search and filtering
3. **Geolocation**: Show nearby locations based on user's current position
4. **Social Integration**: Share locations on social media platforms
5. **Recommendation Engine**: Suggest locations based on user preferences

## Troubleshooting

1. **Authentication Issues**:
   - Check Supabase configuration
   - Verify admin privileges in profiles table

2. **Data Not Loading**:
   - Check console for API errors
   - Verify Supabase connection
   - Clear cache and retry

3. **Admin Access Problems**:
   - Ensure user has `is_admin` flag set to true in profiles table
   - Verify auth state is properly initialized before checking admin status

## Code Refactoring Notes

Several files in the project are becoming too large and should be refactored:
1. **LocationService.ts** (541 lines): Split into multiple domain-specific services
2. **LocationsPage.tsx** (203 lines): Break into smaller components

## Deployment

The project is designed to be deployed using Supabase hosting, but can also be deployed to any static hosting service since it's a React SPA.

Required environment variables:
- Supabase URL
- Supabase Anon Key
- Google Maps API Key (for location features)

---

This documentation provides a comprehensive overview of the Cluj Compass project. Refer to specific component files for more detailed implementation details.
