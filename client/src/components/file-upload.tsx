import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (data: unknown) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileUpload, isLoading }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/json") {
        toast({
          title: "Invalid file type",
          description: "Please upload a JSON file.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          onFileUpload(data);
        } catch (error) {
          toast({
            title: "Parse error",
            description: "Invalid JSON file. Please check the format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    },
    [onFileUpload, toast]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <Card className="mb-8">
      <CardContent className="p-8">
        <div className="text-center">
          <div
            className={`border-2 border-dashed rounded-lg p-12 transition-colors duration-200 cursor-pointer ${
              isDragOver
                ? "border-[--roadmap-blue] bg-blue-50"
                : "border-gray-300 hover:border-[--roadmap-blue] hover:bg-blue-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <CloudUpload className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload JSON Configuration
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop your roadmap JSON file here, or click to browse
            </p>
            <Button
              className="bg-[--roadmap-blue] hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Choose File"}
            </Button>
            <input
              id="fileInput"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* Sample JSON Structure */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Expected JSON Structure:
          </h4>
          <pre className="text-xs text-gray-600 overflow-x-auto">
            <code>{`{
  "segments": [
    {
      "name": "Phase 1: Discovery & Design",
      "weeks": 1,
      "boxes": [
        {
          "title": "Design thinking & Workshop",
          "goal": "Goal: Conduct a design thinking workshop..."
        }
      ]
    }
  ]
}`}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
