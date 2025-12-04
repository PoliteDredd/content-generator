import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Loader2, Download, Play, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VideoGenerator = () => {
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
    setVideoUrl(null);

    try {
      // Simulated video generation - replace with real API integration
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // For demo purposes, using a sample video URL
      // In production, this would call an actual text-to-video API
      setVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
      
      toast({
        title: "Video generated!",
        description: "Your video is ready to preview and download.",
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

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.download = "generated-video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your video is being downloaded.",
      });
    }
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
            Enter your script or paste text to convert into a video
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
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
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
      {videoUrl && !isLoading && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Video className="h-5 w-5 text-primary" />
              Video Preview
            </CardTitle>
            <CardDescription>
              Your generated video is ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-black/50 aspect-video">
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full border-primary/50 hover:bg-primary/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Video
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-border/30 bg-muted/30 backdrop-blur-sm">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: For best results, keep your script clear and well-structured. 
            Add natural pauses with punctuation for better narration flow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoGenerator;
