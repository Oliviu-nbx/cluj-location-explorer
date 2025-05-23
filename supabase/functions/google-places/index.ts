
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, params } = await req.json();
    console.log(`Processing ${action} request with params:`, JSON.stringify(params));
    
    // Validate that we have the API key
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === '') {
      throw new Error('Google Maps API key is not configured');
    }
    
    switch (action) {
      case 'searchNearby': {
        const { location, radius, type } = params;
        
        // Convert location to string format if it's an object
        const locationParam = typeof location === 'object' 
          ? `${location.lat},${location.lng}`
          : location;
        
        console.log(`Searching for places near ${locationParam} with radius ${radius} and type ${type}`);
        
        // Use fetch with the Google Places API
        const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
        url.searchParams.append('location', locationParam);
        url.searchParams.append('radius', radius.toString());
        url.searchParams.append('type', type);
        url.searchParams.append('key', GOOGLE_MAPS_API_KEY);
        
        console.log(`Requesting: ${url.toString().replace(GOOGLE_MAPS_API_KEY, '[REDACTED]')}`);
        
        const response = await fetch(url.toString());
        const data = await response.json();
        
        if (!response.ok) {
          console.error(`Google API error: ${response.status}`, data);
          throw new Error(`Google Places API error: ${data.status || response.status} - ${data.error_message || 'Unknown error'}`);
        }
        
        console.log(`Found ${data.results?.length || 0} places`);
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getPlaceDetails': {
        const { placeId } = params;
        
        console.log(`Getting details for place: ${placeId}`);
        
        const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
        url.searchParams.append('place_id', placeId);
        url.searchParams.append('key', GOOGLE_MAPS_API_KEY);
        
        const response = await fetch(url.toString());
        const data = await response.json();
        
        if (!response.ok) {
          console.error(`Google API error: ${response.status}`, data);
          throw new Error(`Google Places API error: ${data.status || response.status} - ${data.error_message || 'Unknown error'}`);
        }
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'geocode': {
        const { address } = params;
        
        console.log(`Geocoding address: ${address}`);
        
        const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
        url.searchParams.append('address', address);
        url.searchParams.append('key', GOOGLE_MAPS_API_KEY);
        
        const response = await fetch(url.toString());
        const data = await response.json();
        
        if (!response.ok) {
          console.error(`Google API error: ${response.status}`, data);
          throw new Error(`Google Geocoding API error: ${data.status || response.status} - ${data.error_message || 'Unknown error'}`);
        }
        
        console.log(`Geocode results: ${data.results?.length || 0}`);
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }
  } catch (error) {
    console.error('Error in google-places function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
