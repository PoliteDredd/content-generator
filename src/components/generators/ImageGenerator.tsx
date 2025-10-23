import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ImageGenerator = () => {
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [lighting, setLighting] = useState("");
  const [composition, setComposition] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          type: 'image',
          params: {
            subject: subject.trim(),
            style,
            lighting: lighting.trim() || "natural lighting",
            composition: composition.trim() || "centered composition"
          }
        }
      });

      if (error) throw error;
      setOutput(data.content);
      toast.success("Image generated successfully!");
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            placeholder="e.g., a modern office workspace"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger id="style" className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photorealistic">Photorealistic</SelectItem>
              <SelectItem value="digital-art">Digital Art</SelectItem>
              <SelectItem value="illustration">Illustration</SelectItem>
              <SelectItem value="3d-render">3D Render</SelectItem>
              <SelectItem value="abstract">Abstract</SelectItem>
              <SelectItem value="minimalist">Minimalist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lighting">Lighting</Label>
            <Input
              id="lighting"
              placeholder="e.g., soft golden hour light"
              value={lighting}
              onChange={(e) => setLighting(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="composition">Composition</Label>
            <Input
              id="composition"
              placeholder="e.g., rule of thirds, wide angle"
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
              className="bg-background/50"
            />
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="w-full bg-secondary hover:opacity-90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Image"
          )}
        </Button>
      </div>

      {output && (
        <Card className="p-4 bg-muted/50 border-border/50">
          <p className="text-sm font-medium text-muted-foreground mb-4">Generated Image:</p>
          <img 
            src={output} 
            alt="Generated content" 
            className="w-full rounded-lg shadow-lg"
          />
        </Card>
      )}
    </div>
  );
};

export default ImageGenerator;