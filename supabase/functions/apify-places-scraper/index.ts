
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'

// Configure CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
const createSupabaseClient = (req: Request) => {
  const authHeader = req.headers.get('Authorization')!
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )
  return supabaseClient
}

// Process scraper results and store them in the database
async function processApifyResults(results: any[], supabaseClient: any) {
  console.log(`Processing ${results.length} places from Apify scraper`)
  
  const processedLocations = []

  for (const place of results) {
    try {
      // Generate a slug from place name
      const slug = place.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Determine category based on place types
      let category = 'tourist_attraction' // default
      if (place.categories) {
        if (place.categories.includes('hotel') || place.categories.includes('lodging')) {
          category = 'hotel'
        } else if (place.categories.includes('restaurant')) {
          category = 'restaurant'
        } else if (place.categories.includes('bar')) {
          category = 'bar'
        } else if (place.categories.includes('night_club')) {
          category = 'night_club'
        }
      }

      // Create location object with mapped fields
      const location = {
        place_id: place.id || `apify_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        name: place.title,
        slug,
        category_id: category,
        address: place.address,
        latitude: place.lat,
        longitude: place.lng,
        phone: place.phone,
        website: place.website,
        rating: place.totalScore,
        price_level: place.priceLevel ? parseInt(place.priceLevel.replace('$', '').length) : null,
      }

      // Insert location into database
      const { data, error } = await supabaseClient
        .from('locations')
        .upsert(location, { onConflict: 'place_id', ignoreDuplicates: false })
        .select()
        .single()

      if (error) {
        console.error(`Error inserting location ${place.title}:`, error)
        continue
      }

      processedLocations.push(data)
      console.log(`Added location: ${place.title}`)
    } catch (error) {
      console.error(`Error processing place ${place.title}:`, error)
    }
  }

  return processedLocations
}

// Handle HTTP requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createSupabaseClient(req)

    if (req.method === 'POST') {
      const { token, actorId, searchParams } = await req.json()
      
      if (!token) {
        return new Response(JSON.stringify({ error: 'Apify token is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Default to Google Places Scraper if no actor specified
      const actor = actorId || 'apify/google-places-scraper'
      
      // Set default search parameters if not provided
      const params = searchParams || {
        queries: 'restaurants in Cluj-Napoca',
        language: 'en',
        maxCrawledPlaces: 10,
      }

      console.log(`Starting Apify scraper with actor: ${actor}`)
      console.log(`Search parameters: ${JSON.stringify(params)}`)
      
      try {
        // Start the Apify actor run - changed to GET request structure for compatibility
        // First, create URL for the actor
        const apifyBaseUrl = `https://api.apify.com/v2/acts/${actor}/runs`
        
        // Create the run by making a POST request to the Apify API
        const response = await fetch(apifyBaseUrl, {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ input: params })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Apify API error: Status ${response.status}, Response: ${errorText}`)
          throw new Error(`Apify API error: ${response.status} - ${errorText}`)
        }

        const runData = await response.json()
        const runId = runData.data.id

        console.log(`Started Apify run with ID: ${runId}`)
        
        // Set up background processing to wait for results
        const waitAndProcessResults = async () => {
          try {
            // Wait for the run to finish
            let isFinished = false
            let retryCount = 0
            let runResult

            while (!isFinished && retryCount < 30) {
              // Check run status
              const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              
              if (!statusResponse.ok) {
                throw new Error(`Failed to check run status: ${statusResponse.statusText}`)
              }
              
              const statusData = await statusResponse.json()
              const status = statusData.data.status
              console.log(`Run status: ${status}, attempt: ${retryCount + 1}`)
              
              if (status === 'SUCCEEDED') {
                isFinished = true
                
                // Get run results
                const datasetResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                
                if (!datasetResponse.ok) {
                  throw new Error(`Failed to get dataset: ${datasetResponse.statusText}`)
                }
                
                runResult = await datasetResponse.json()
                console.log(`Retrieved ${runResult.length} results from Apify`)
              } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
                throw new Error(`Run ${runId} ended with status: ${status}`)
              }
              
              if (!isFinished) {
                retryCount++
                // Wait 10 seconds before checking again
                await new Promise(resolve => setTimeout(resolve, 10000))
              }
            }

            if (!isFinished) {
              throw new Error('Run timed out waiting for completion')
            }

            // Process results and store in database
            if (runResult && Array.isArray(runResult)) {
              const processedLocations = await processApifyResults(runResult, supabaseClient)
              console.log(`Successfully processed ${processedLocations.length} locations from Apify`)
            }
          } catch (error) {
            console.error('Error processing Apify results:', error)
          }
        }

        // Start background processing
        EdgeRuntime.waitUntil(waitAndProcessResults())
        
        // Return immediate response
        return new Response(JSON.stringify({
          success: true,
          message: 'Apify job started successfully',
          runId,
          status: 'PENDING',
        }), {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } catch (apiError) {
        console.error('Error calling Apify API:', apiError);
        return new Response(JSON.stringify({ error: apiError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error handling request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
