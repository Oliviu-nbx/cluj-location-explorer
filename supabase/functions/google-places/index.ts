
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@googlemaps/google-maps-services-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY')!;
const client = createClient({});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, params } = await req.json()

    switch (action) {
      case 'searchNearby': {
        const { location, radius, type } = params
        const response = await client.placesNearby({
          params: {
            location,
            radius,
            type,
            key: GOOGLE_MAPS_API_KEY,
          },
        })
        
        return new Response(JSON.stringify(response.data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'getPlaceDetails': {
        const { placeId } = params
        const response = await client.placeDetails({
          params: {
            place_id: placeId,
            key: GOOGLE_MAPS_API_KEY,
          },
        })

        return new Response(JSON.stringify(response.data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'geocode': {
        const { address } = params
        const response = await client.geocode({
          params: {
            address,
            key: GOOGLE_MAPS_API_KEY,
          },
        })

        return new Response(JSON.stringify(response.data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error in google-places function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
