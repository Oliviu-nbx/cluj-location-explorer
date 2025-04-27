
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = "https://owufofvccijykqodjnxn.supabase.co"
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const requestData = await req.json()
    console.log("Received location data:", JSON.stringify(requestData))
    
    // Check if it's a test request
    if (requestData.test === true) {
      console.log("This is a test request")
      return new Response(
        JSON.stringify({ success: true, message: "Test successful" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Validate the location data
    const requiredFields = ['name', 'category_id', 'address', 'latitude', 'longitude']
    for (const field of requiredFields) {
      if (!requestData[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    // Generate a slug if one wasn't provided
    if (!requestData.slug) {
      requestData.slug = requestData.name.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-') // Replace multiple - with single -
    }
    
    // Generate a place_id if one wasn't provided
    if (!requestData.place_id) {
      requestData.place_id = `auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
    
    // Insert the location into the database
    const { data, error } = await supabase
      .from('locations')
      .insert([requestData])
      .select()
    
    if (error) throw error
    
    console.log("Location added successfully:", data)
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error processing location:", error.message)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: "Please make sure your payload includes all required fields" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
