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
    const { script } = await req.json();
    
    if (!script || typeof script !== 'string') {
      throw new Error('Script is required');
    }

    console.log('Processing script:', script.substring(0, 100) + '...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Step 1: Break script into scenes and generate image prompts
    console.log('Generating scene descriptions...');
    const sceneResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a video scene planner. Given a script, break it into 3-5 visual scenes. 
For each scene, provide:
1. A short segment of text for narration (2-3 sentences max)
2. A detailed image prompt that captures the visual for that scene

Respond in this exact JSON format:
{
  "scenes": [
    {
      "narration": "Text to be spoken for this scene",
      "imagePrompt": "Detailed visual description for AI image generation"
    }
  ]
}
Only output valid JSON, no markdown or explanation.`
          },
          {
            role: 'user',
            content: script
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!sceneResponse.ok) {
      const error = await sceneResponse.text();
      console.error('Scene generation error:', error);
      throw new Error('Failed to generate scenes');
    }

    const sceneData = await sceneResponse.json();
    const sceneText = sceneData.choices?.[0]?.message?.content || '';
    console.log('Scene response:', sceneText);

    let scenes;
    try {
      // Clean potential markdown wrapper
      const cleanJson = sceneText.replace(/```json\n?|\n?```/g, '').trim();
      scenes = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse scenes:', e);
      // Fallback: create a single scene from the entire script
      scenes = {
        scenes: [
          {
            narration: script.substring(0, 500),
            imagePrompt: `A professional, cinematic scene representing: ${script.substring(0, 200)}`
          }
        ]
      };
    }

    console.log(`Generated ${scenes.scenes.length} scenes`);

    // Step 2: Generate images for each scene
    console.log('Generating images...');
    const imagePromises = scenes.scenes.map(async (scene: any, index: number) => {
      console.log(`Generating image ${index + 1}:`, scene.imagePrompt.substring(0, 50));
      
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: `Generate a high-quality, cinematic image: ${scene.imagePrompt}. Make it visually stunning and professional.`
            }
          ],
          modalities: ['image', 'text'],
        }),
      });

      if (!imageResponse.ok) {
        console.error(`Image ${index + 1} generation failed:`, await imageResponse.text());
        return null;
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      console.log(`Image ${index + 1} generated:`, imageUrl ? 'success' : 'no image');
      
      return {
        narration: scene.narration,
        imageUrl: imageUrl || null,
      };
    });

    const generatedScenes = await Promise.all(imagePromises);
    const validScenes = generatedScenes.filter(s => s && s.imageUrl);

    if (validScenes.length === 0) {
      throw new Error('Failed to generate any images');
    }

    console.log(`Successfully generated ${validScenes.length} images`);

    // Step 3: Generate audio narration using ElevenLabs
    console.log('Generating audio narration...');
    const fullNarration = validScenes.map(s => s.narration).join(' ');
    
    const audioResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: fullNarration,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('ElevenLabs error:', errorText);
      throw new Error('Failed to generate audio narration');
    }

    const audioArrayBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));
    
    console.log('Audio generated successfully, size:', audioArrayBuffer.byteLength);

    // Calculate duration estimate (rough: ~150 words per minute average)
    const wordCount = fullNarration.split(/\s+/).length;
    const estimatedDurationMs = (wordCount / 150) * 60 * 1000;
    const durationPerScene = estimatedDurationMs / validScenes.length;

    return new Response(
      JSON.stringify({
        success: true,
        scenes: validScenes.map((scene, i) => ({
          ...scene,
          duration: durationPerScene,
        })),
        audioBase64,
        audioType: 'audio/mpeg',
        totalDuration: estimatedDurationMs,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Video generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const status = errorMessage.includes('Rate limit') ? 429 : 
                   errorMessage.includes('Payment') ? 402 : 500;
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
