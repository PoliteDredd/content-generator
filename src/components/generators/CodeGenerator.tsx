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

const CodeGenerator = () => {
  const [task, setTask] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!task.trim()) {
      toast.error("Please enter a task description");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          type: 'code',
          params: {
            task: task.trim(),
            language,
            context: context.trim() || "general purpose"
          }
        }
      });

      if (error) throw error;
      setOutput(data.content);
      toast.success("Code generated successfully!");
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || "Failed to generate code");
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
          <Label htmlFor="task">Task Description *</Label>
          <Textarea
            id="task"
            placeholder="e.g., Create a function that validates email addresses"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="bg-background/50 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="go">Go</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context</Label>
            <Input
              id="context"
              placeholder="e.g., web application, API endpoint"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="bg-background/50"
            />
          </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="w-full bg-accent hover:opacity-90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Code"
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
            <p className="text-sm font-medium text-muted-foreground mb-2">Generated Code:</p>
            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-background/50 p-4 rounded-lg overflow-x-auto">
              {output}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CodeGenerator;