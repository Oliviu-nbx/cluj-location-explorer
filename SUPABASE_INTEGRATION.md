
# Cluj Compass - Supabase Integration Documentation

## Overview

The Cluj Compass application uses Supabase as its backend service for:
- Authentication
- Database storage
- Edge functions
- File storage

## Database Schema

### Core Tables

1. **locations**
   - Main table for storing location data
   - Key fields: id, name, slug, category_id, address, latitude, longitude
   - Includes fields for ratings, price_level, and contact information

2. **location_photos**
   - Stores photos associated with locations
   - Linked to locations via location_id
   - Contains photo references, dimensions, and attribution

3. **location_reviews**
   - Stores user reviews for locations
   - Linked to locations via location_id
   - Includes rating, text, author information

4. **place_info**
   - Additional information about places from external sources
   - Includes amenities, check-in/out times, neighborhood
   - Connected to locations via location_id

5. **categories**
   - Location categories (hotel, restaurant, bar, etc.)
   - Includes name, slug, description, and icon

6. **profiles**
   - Extended user information
   - Linked to Supabase auth.users
   - Includes admin flag for permission control

7. **user_favorites**
   - Tracks which locations users have favorited
   - Many-to-many relationship between users and locations

### Row Level Security (RLS)

RLS policies need to be implemented for each table to ensure proper data access control:

- Public read access for locations, categories, photos
- User-specific access for favorites, profiles
- Admin-only access for certain operations

## Authentication Setup

Current implementation uses Supabase authentication with email/password.

Requirements:
1. Set up email provider in Supabase Auth settings
2. Configure user table triggers to create profile records
3. Implement authorization checks for admin routes

## Database Functions

Several database functions need implementation:
1. **handle_new_user()**: Creates a profile when a new user signs up
2. **is_admin_check()**: Verifies if a user has admin privileges
3. **get_user_favorites()**: Returns a user's favorited locations

## Edge Functions

The application uses Supabase Edge Functions for external API integrations:

1. **google-places**: Integrates with Google Places API
   - Fetches place details
   - Updates location information

2. **apify-places-scraper**: Integrates with Apify for web scraping
   - Scrapes websites for location data
   - Processes and stores scraped data

3. **process-location**: Processes location data
   - Validates and normalizes data
   - Calculates composite scores
   - Generates slugs

## Environment Secrets

The following secrets are configured in the Supabase project:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_DB_URL
- GOOGLE_MAPS_API_KEY

## Implementation Status

Current status of Supabase integration:
- Database schema is defined but needs to be fully created in Supabase
- Authentication is partially implemented
- Edge functions are created but need completion
- Client code currently uses in-memory data instead of actual Supabase queries

## Implementation Roadmap

1. **Database Setup**:
   - Create all tables with proper relationships
   - Implement RLS policies
   - Set up triggers and functions

2. **Authentication**:
   - Complete client-side auth implementation
   - Set up admin role management
   - Configure appropriate redirects

3. **Data Migration**:
   - Migrate sample data to Supabase
   - Update LocationService to use Supabase client

4. **Storage Setup**:
   - Create storage buckets for location images
   - Implement upload functionality
   - Set appropriate access policies

5. **Edge Function Completion**:
   - Finalize Google Places integration
   - Complete scraping functionality

## Common Issues & Troubleshooting

1. **Authentication Session Not Persisting**:
   - Make sure to use the complete session object, not just user
   - Configure proper storage options for auth client

2. **RLS Blocking Access**:
   - Check RLS policies
   - Verify user roles
   - Use service role for admin functions when needed

3. **Slow Queries**:
   - Add appropriate indexes
   - Implement proper caching strategies

## Best Practices

1. **Security**:
   - Never expose service role key in client code
   - Always use RLS for data access control
   - Validate all inputs in edge functions

2. **Optimizations**:
   - Use subscriptions for real-time updates
   - Implement proper caching
   - Separate read/write operations

3. **Error Handling**:
   - Implement proper error handling for all Supabase operations
   - Log errors appropriately
   - Provide user-friendly error messages

---

This document provides the technical details for implementing and maintaining the Supabase backend for the Cluj Compass application.
