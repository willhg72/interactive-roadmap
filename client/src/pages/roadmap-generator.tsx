import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileUpload } from "@/components/file-upload";
import { RoadmapCanvas } from "@/components/roadmap-canvas";
import { Route, Download, Upload, FileText } from "lucide-react";
import type { RoadmapData } from "@shared/schema";

export default function RoadmapGenerator() {
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapData | null>(null);
  const [showUpload, setShowUpload] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const validateMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const response = await apiRequest("POST", "/api/roadmap/validate", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.valid) {
        setCurrentRoadmap(result.data);
        setShowUpload(false);
        toast({
          title: "Success",
          description: "Roadmap loaded successfully!",
        });
      } else {
        const description = result.error?.message
          ? `Validation failed: ${result.error.message}`
          : "Please check your JSON structure and try again.";
        toast({
          title: "Invalid JSON",
          description: description,
          variant: "destructive",
        });
        if (result.error) {
          console.error("Detailed validation error:", result.error);
        }
      }
    },
    onError: async (error: any) => {
      let description = "Failed to validate roadmap data.";
      try {
        const errorData = await error.response?.json();
        if (errorData && errorData.error) {
          description = `Backend Error: ${errorData.error.message}. Check the console for more details.`;
          console.error("Detailed backend error:", errorData.error);
        } else {
          console.error("Unknown error:", error);
        }
      } catch (e) {
        console.error("Failed to parse error response. Original error:", error);
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ name, data }: { name: string; data: RoadmapData }) => {
      const response = await apiRequest("POST", "/api/roadmap", { name, data });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmaps"] });
      toast({
        title: "Saved",
        description: "Roadmap saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save roadmap.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = useCallback(
    (data: unknown) => {
      validateMutation.mutate(data);
    },
    [validateMutation]
  );

  const handleUploadNew = useCallback(() => {
    setShowUpload(true);
    setCurrentRoadmap(null);
  }, []);

  const handleSave = useCallback(() => {
    if (currentRoadmap) {
      const name = `Roadmap ${new Date().toLocaleDateString()}`;
      saveMutation.mutate({ name, data: currentRoadmap });
    }
  }, [currentRoadmap, saveMutation]);

  const handleExportPNG = useCallback(() => {
    toast({
      title: "Export",
      description: "PNG export functionality coming soon!",
    });
  }, [toast]);

  const handleExportSVG = useCallback(() => {
    if (currentRoadmap) {
      const svg = document.querySelector('#roadmap-svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roadmap.svg';
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  }, [currentRoadmap]);

  const totalWeeks = currentRoadmap?.segments.reduce((sum, segment) => sum + segment.weeks, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Route className="text-[--roadmap-blue] text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Interactive Roadmap Generator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleExportPNG}
                disabled={!currentRoadmap}
                className="bg-[--roadmap-blue] hover:bg-blue-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PNG
              </Button>
              <Button
                onClick={handleExportSVG}
                disabled={!currentRoadmap}
                variant="secondary"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export SVG
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUpload ? (
          <FileUpload
            onFileUpload={handleFileUpload}
            isLoading={validateMutation.isPending}
          />
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Total Duration: {totalWeeks} weeks
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handleSave}
                      disabled={saveMutation.isPending}
                      variant="outline"
                    >
                      Save Roadmap
                    </Button>
                    <Button
                      onClick={handleUploadNew}
                      variant="outline"
                      className="text-[--roadmap-blue]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roadmap Canvas */}
            <Card className="overflow-hidden">
              <div className="h-[600px]">
                <RoadmapCanvas data={currentRoadmap} />
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
