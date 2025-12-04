import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Sparkles, Image, Code, Video } from "lucide-react";
import TextGenerator from "./generators/TextGenerator";
import ImageGenerator from "./generators/ImageGenerator";
import CodeGenerator from "./generators/CodeGenerator";
import VideoGenerator from "./generators/VideoGenerator";

const ContentGenerator = () => {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Generation</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Custom Content Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate text, images, code, and videos automatically with structured prompts and consistent outputs
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="border-border/50 bg-gradient-card shadow-elevated backdrop-blur-sm">
          <Tabs defaultValue="text" className="w-full">
            <div className="border-b border-border/50">
              <TabsList className="w-full justify-start rounded-none bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="text" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Text Generation
                </TabsTrigger>
                <TabsTrigger 
                  value="image" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                >
                  <Image className="w-4 h-4" />
                  Image Prompts
                </TabsTrigger>
                <TabsTrigger 
                  value="code" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                >
                  <Code className="w-4 h-4" />
                  Code Generation
                </TabsTrigger>
                <TabsTrigger 
                  value="video" 
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2"
                >
                  <Video className="w-4 h-4" />
                  Video Generator
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="text" className="mt-0">
                <TextGenerator />
              </TabsContent>

              <TabsContent value="image" className="mt-0">
                <ImageGenerator />
              </TabsContent>

              <TabsContent value="code" className="mt-0">
                <CodeGenerator />
              </TabsContent>

              <TabsContent value="video" className="mt-0">
                <VideoGenerator />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <Card className="p-6 bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
            <Sparkles className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Structured Prompts</h3>
            <p className="text-sm text-muted-foreground">
              Consistent formatting for reliable, high-quality outputs every time
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
            <Image className="w-8 h-8 text-secondary mb-4" />
            <h3 className="font-semibold text-lg mb-2">Multi-Format Support</h3>
            <p className="text-sm text-muted-foreground">
              Generate text, image descriptions, and functional code snippets
            </p>
          </Card>

          <Card className="p-6 bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
            <Code className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-semibold text-lg mb-2">Reusable System</h3>
            <p className="text-sm text-muted-foreground">
              Test, refine, and iterate on your prompts for perfect results
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;