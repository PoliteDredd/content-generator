import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Loader2, Download, Play, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedScene {
  narration: string;
  imageUrl: string;
  duration: number;
}

interface VideoResult {
  scenes: GeneratedScene[];
  audioBase64: string;
  audioType: string;
  totalDuration: number;
}

const VideoGenerator = () => {
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!script.trim()) {
      toast({
        title: "Script required",
        description: "Please enter a script or text to generate the video.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoResult(null);
    setCurrentSceneIndex(0);
    setIsPlaying(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-video', {
        body: { script: script.trim() }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate video');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setVideoResult(data);
      
      toast({
        title: "Video generated!",
        description: `Created ${data.scenes.length} scenes with narration.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate video";
      setError(errorMessage);
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (!videoResult || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      
      // Auto-advance scenes based on duration
      const sceneDuration = videoResult.totalDuration / videoResult.scenes.length;
      let sceneIndex = 0;
      
      intervalRef.current = setInterval(() => {
        sceneIndex++;
        if (sceneIndex < videoResult.scenes.length) {
          setCurrentSceneIndex(sceneIndex);
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, sceneDuration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentSceneIndex(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
    }
  };

  const handleNextScene = () => {
    if (videoResult && currentSceneIndex < videoResult.scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    }
  };

  const handleDownload = () => {
    if (!videoResult) return;
    
    // Download audio file
    const audioBlob = new Blob(
      [Uint8Array.from(atob(videoResult.audioBase64), c => c.charCodeAt(0))],
      { type: videoResult.audioType }
    );
    const audioUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "video-narration.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(audioUrl);
    
    toast({
      title: "Download started",
      description: "Audio narration is being downloaded. Images can be saved by right-clicking.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Video className="h-5 w-5 text-primary" />
            Script Input
          </CardTitle>
          <CardDescription>
            Enter your script to generate an animated slideshow with AI narration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your script here... 

Example:
'Welcome to our product showcase. Today we'll explore the amazing features that make our solution stand out. Let's dive in and see how we can transform your workflow...'"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="min-h-[200px] bg-background/50 border-border/50 focus:border-primary/50 resize-none"
          />
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {script.length} characters
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !script.trim()}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
                <Loader2 className="h-12 w-12 text-primary animate-spin relative" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium">Creating your video...</p>
                <p className="text-sm text-muted-foreground">Generating scenes, images, and narration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="border-destructive/50 bg-destructive/10 backdrop-blur-sm">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Generation Failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Preview */}
      {videoResult && !isLoading && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Video className="h-5 w-5 text-primary" />
              Video Preview
            </CardTitle>
            <CardDescription>
              {videoResult.scenes.length} scenes generated - Click play to watch with narration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Display */}
            <div className="relative rounded-lg overflow-hidden bg-black/50 aspect-video">
              {videoResult.scenes[currentSceneIndex]?.imageUrl && (
                <img
                  src={videoResult.scenes[currentSceneIndex].imageUrl}
                  alt={`Scene ${currentSceneIndex + 1}`}
                  className="w-full h-full object-contain transition-opacity duration-500"
                />
              )}
              
              {/* Scene Navigation Overlay */}
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevScene}
                  disabled={currentSceneIndex === 0}
                  className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextScene}
                  disabled={currentSceneIndex === videoResult.scenes.length - 1}
                  className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Scene Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {videoResult.scenes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSceneIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSceneIndex 
                        ? 'bg-primary w-4' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Narration Text */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground italic">
                "{videoResult.scenes[currentSceneIndex]?.narration}"
              </p>
            </div>

            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={`data:${videoResult.audioType};base64,${videoResult.audioBase64}`}
              onEnded={handleAudioEnded}
              className="hidden"
            />
            
            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={handlePlay}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isPlaying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Play with Narration
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="border-primary/50 hover:bg-primary/10"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Audio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-border/30 bg-muted/30 backdrop-blur-sm">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: For best results, write clear, descriptive scenes. The AI will generate unique visuals and narration based on your text.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoGenerator;
