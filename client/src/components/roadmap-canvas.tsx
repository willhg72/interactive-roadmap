import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { createRoadmapSVG } from "@/lib/d3-utils";
import { CANVAS_CONFIG } from "@/lib/roadmap-utils";
import type { RoadmapData } from "@shared/schema";

interface RoadmapCanvasProps {
  data: RoadmapData | null;
}

export function RoadmapCanvas({ data }: RoadmapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (data && svgRef.current) {
      createRoadmapSVG(svgRef.current, data);
    }
  }, [data]);

  useEffect(() => {
    if (svgRef.current) {
      const transform = `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`;
      svgRef.current.style.transform = transform;
    }
  }, [zoom, pan]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev * 0.8, 0.1));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setPan(prev => ({
      x: prev.x + deltaX / zoom,
      y: prev.y + deltaY / zoom,
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No roadmap data available
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Zoom:</span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="w-8 h-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              className="w-8 h-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetView}
            className="text-[--roadmap-blue]"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset View
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={containerRef}
          className={`absolute inset-0 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            id="roadmap-svg"
            className="w-full h-full"
            style={{ transformOrigin: "0 0" }}
          />
        </div>
      </div>
    </div>
  );
}
