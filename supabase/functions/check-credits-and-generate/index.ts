// Supabase Edge Function for checking credits and generating content
// This would be deployed to Supabase Edge Functions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    })

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { contentType, prompt, creditsRequired } = await req.json()

    // Check user credits
    const { data: credits, error: creditsError } = await supabaseClient
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (creditsError || !credits) {
      return new Response(JSON.stringify({ error: "Failed to fetch credits" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check if user has enough credits
    if (credits.credits_used + creditsRequired > credits.monthly_limit) {
      return new Response(JSON.stringify({ error: "Insufficient credits" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // TODO: Call OpenAI API to generate content
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert marketing content generator. Generate ${contentType} content based on the user's prompt.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
      }),
    })

    const openaiData = await openaiResponse.json()
    const generatedContent = openaiData.choices[0].message.content

    // Update user credits
    const { error: updateCreditsError } = await supabaseClient
      .from("user_credits")
      .update({ credits_used: credits.credits_used + creditsRequired })
      .eq("user_id", user.id)

    if (updateCreditsError) {
      return new Response(JSON.stringify({ error: "Failed to update credits" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Save generated content
    const { data: savedContent, error: saveError } = await supabaseClient
      .from("generated_content")
      .insert({
        user_id: user.id,
        content_type: contentType,
        title: `Generated ${contentType}`,
        prompt: prompt,
        generated_content: { content: generatedContent, metadata: { generated_at: new Date().toISOString() } },
        credits_used: creditsRequired,
        status: "completed",
      })
      .select()
      .single()

    if (saveError) {
      return new Response(JSON.stringify({ error: "Failed to save content" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(
      JSON.stringify({
        content: generatedContent,
        creditsUsed: creditsRequired,
        remainingCredits: credits.monthly_limit - (credits.credits_used + creditsRequired),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
