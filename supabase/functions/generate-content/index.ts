import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, params } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    // Configure prompts based on content type
    if (type === 'text') {
      systemPrompt = `You are a professional content writer specializing in marketing copy and engaging text. 
      Generate compelling, well-structured text that matches the specified tone and audience.
      Keep the output between 150-200 words unless otherwise specified.
      Focus on clarity, impact, and engagement.`;
      
      userPrompt = `Create marketing text with the following specifications:
      Topic: ${params.topic}
      Tone: ${params.tone}
      Target Audience: ${params.audience}
      Goal: ${params.goal}
      
      Generate a compelling paragraph that achieves the goal while maintaining the specified tone.`;
    } 
    else if (type === 'image') {
      // Build a comprehensive image generation prompt
      const imagePrompt = `Create a ${params.style} image of ${params.subject}. Lighting: ${params.lighting}. Composition: ${params.composition}.`;
      
      // Call Lovable AI Gateway with image generation model
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { role: "user", content: imagePrompt }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!imageResponse.ok) {
        if (imageResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (imageResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await imageResponse.text();
        console.error("AI gateway error:", imageResponse.status, errorText);
        throw new Error("AI gateway error");
      }

      const imageData = await imageResponse.json();
      const generatedImage = imageData.choices[0].message.images?.[0]?.image_url?.url;
      
      if (!generatedImage) {
        throw new Error("No image generated");
      }

      return new Response(
        JSON.stringify({ content: generatedImage, isImage: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (type === 'code') {
      systemPrompt = `You are an expert programmer who writes clean, functional, well-documented code.
      Generate concise code snippets that perform the specified task correctly.
      Include helpful comments explaining key parts of the code.
      Follow best practices for the specified programming language.`;
      
      userPrompt = `Create a code snippet with these specifications:
      Task: ${params.task}
      Language: ${params.language}
      Context: ${params.context}
      
      Generate clean, functional code that accomplishes the task. Include brief inline comments for clarity.
      Keep the code concise but complete enough to be immediately useful.`;
    }
    else {
      throw new Error("Invalid content type");
    }

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});