import type { RoadmapData } from "@shared/schema";

export const CANVAS_CONFIG = {
  padding: 120,
  boxWidth: 220,
  boxHeight: 70,
  goalBoxYOffset: 15,
  stepX: 280, // boxWidth + 60
  stepY: 60,
  cornerRadius: 15,
  lineWidth: 2,
  colors: {
    boxFill: "#4186CD",
    lineColor: "#828282",
    durationLine: "#A0A0A0",
    textWhite: "#FFFFFF",
    textGray: "#505050",
  },
};

export function calculateCanvasDimensions(data: RoadmapData) {
  const allBoxes = data.segments.flatMap(segment => segment.boxes);
  const numBoxes = allBoxes.length;
  
  const width = CANVAS_CONFIG.padding * 2 + (numBoxes - 1) * CANVAS_CONFIG.stepX + CANVAS_CONFIG.boxWidth;
  const height = CANVAS_CONFIG.padding * 2 + (numBoxes - 1) * CANVAS_CONFIG.stepY + CANVAS_CONFIG.boxHeight + 400;
  
  return { width, height, numBoxes };
}

export function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine: string[] = [];
  
  words.forEach(word => {
    const testLine = [...currentLine, word].join(' ');
    if (testLine.length <= maxLength) {
      currentLine.push(word);
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
        currentLine = [word];
      } else {
        lines.push(word);
      }
    }
  });
  
  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }
  
  return lines;
}

export function estimateGoalHeight(goalText: string): number {
  const lines = wrapText(goalText, 35);
  return lines.length * 17; // Approximate line height
}
