import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TextGenerator = () => {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          type: 'text',
          params: {
            topic: topic.trim(),
            tone,
            audience: audience.trim() || "general audience",
            goal: goal.trim() || "inform and engage"
          }
        }
      });

      if (error) throw error;
      setOutput(data.content);
      toast.success("Text generated successfully!");
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || "Failed to generate text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic *</Label>
          <Input
            id="topic"
            placeholder="e.g., AI-powered productivity tools"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-background/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="e.g., startup founders"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="bg-background/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal">Goal</Label>
          <Input
            id="goal"
            placeholder="e.g., drive sign-ups, educate, entertain"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="bg-background/50"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Text"
          )}
        </Button>
      </div>

      {output && (
        <Card className="p-4 bg-muted/50 border-border/50 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <div className="pr-12">
            <p className="text-sm font-medium text-muted-foreground mb-2">Generated Text:</p>
            <p className="whitespace-pre-wrap text-foreground">{output}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TextGenerator;