import * as d3 from "d3";
import type { RoadmapData } from "@shared/schema";
import { CANVAS_CONFIG, calculateCanvasDimensions, wrapText } from "./roadmap-utils";

export function createRoadmapSVG(svgElement: SVGSVGElement, data: RoadmapData) {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove(); // Clear existing content

  const { width, height, numBoxes } = calculateCanvasDimensions(data);
  const allBoxes = data.segments.flatMap(segment => segment.boxes);
  
  svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

  const startY = CANVAS_CONFIG.padding + (numBoxes - 1) * CANVAS_CONFIG.stepY;
  const boxPositions: Array<{ x: number; y: number }> = [];
  let maxYAfterGoal = 0;

  // Draw boxes
  allBoxes.forEach((box, i) => {
    const currentY = startY - i * CANVAS_CONFIG.stepY;
    const currentX = CANVAS_CONFIG.padding + i * CANVAS_CONFIG.stepX;
    
    boxPositions.push({ x: currentX, y: currentY });
    
    // Create box group
    const boxGroup = svg.append("g")
      .attr("class", "roadmap-box")
      .attr("data-index", i);

    // Main box rectangle
    boxGroup.append("rect")
      .attr("x", currentX)
      .attr("y", currentY)
      .attr("width", CANVAS_CONFIG.boxWidth)
      .attr("height", CANVAS_CONFIG.boxHeight)
      .attr("fill", CANVAS_CONFIG.colors.boxFill)
      .attr("rx", CANVAS_CONFIG.cornerRadius)
      .style("cursor", "pointer")
      .style("transition", "all 0.3s ease")
      .on("mouseenter", function(event) {
        // Calculate center point for zoom
        const centerX = currentX + CANVAS_CONFIG.boxWidth / 2;
        const centerY = currentY + CANVAS_CONFIG.boxHeight / 2;
        
        // Zoom effect on the entire box group (3x zoom = 300%)
        boxGroup.transition()
          .duration(300)
          .attr("transform", `translate(${centerX}, ${centerY}) scale(3) translate(${-centerX}, ${-centerY})`);
        
        d3.select(this).style("opacity", 0.9);
        showTooltip(event, box);
      })
      .on("mouseleave", function() {
        // Reset zoom
        boxGroup.transition()
          .duration(300)
          .attr("transform", "scale(1) translate(0, 0)");
        
        d3.select(this).style("opacity", 1);
        hideTooltip();
      });

    // Title text
    const wrappedTitle = wrapText(box.title, 25);
    const titleY = currentY + CANVAS_CONFIG.boxHeight / 2;
    
    if (wrappedTitle.length === 1) {
      boxGroup.append("text")
        .attr("x", currentX + CANVAS_CONFIG.boxWidth / 2)
        .attr("y", titleY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", CANVAS_CONFIG.colors.textWhite)
        .attr("font-size", "14")
        .attr("font-weight", "600")
        .style("pointer-events", "none")
        .text(wrappedTitle[0]);
    } else {
      boxGroup.append("text")
        .attr("x", currentX + CANVAS_CONFIG.boxWidth / 2)
        .attr("y", titleY - 8)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", CANVAS_CONFIG.colors.textWhite)
        .attr("font-size", "14")
        .attr("font-weight", "600")
        .style("pointer-events", "none")
        .text(wrappedTitle[0]);
        
      if (wrappedTitle[1]) {
        boxGroup.append("text")
          .attr("x", currentX + CANVAS_CONFIG.boxWidth / 2)
          .attr("y", titleY + 8)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", CANVAS_CONFIG.colors.textWhite)
          .attr("font-size", "14")
          .attr("font-weight", "600")
          .style("pointer-events", "none")
          .text(wrappedTitle[1]);
      }
    }

    // Goal text with bold formatting for "Goal:" and "Outcomes:"
    const wrappedGoal = wrapText(box.goal, 35);
    const goalY = currentY + CANVAS_CONFIG.boxHeight + CANVAS_CONFIG.goalBoxYOffset + 15;
    
    wrappedGoal.forEach((line, i) => {
      const goalText = boxGroup.append("text")
        .attr("x", currentX)
        .attr("y", goalY + (i * 17))
        .attr("fill", CANVAS_CONFIG.colors.textGray)
        .attr("font-size", "13")
        .style("pointer-events", "none");

      // Check if line contains "Goal:" or "Outcomes:" and format accordingly
      if (line.includes("Goal:") || line.includes("Outcomes:")) {
        const parts = line.split(/(Goal:|Outcomes:)/);
        let xOffset = 0;
        
        parts.forEach(part => {
          if (part === "Goal:" || part === "Outcomes:") {
            const boldSpan = goalText.append("tspan")
              .attr("x", currentX + xOffset)
              .attr("font-weight", "bold")
              .text(part);
            xOffset += part.length * 8; // Approximate character width
          } else if (part.trim()) {
            const normalSpan = goalText.append("tspan")
              .attr("x", currentX + xOffset)
              .text(part);
            xOffset += part.length * 6.5; // Approximate character width
          }
        });
      } else {
        goalText.text(line);
      }
    });

    maxYAfterGoal = Math.max(maxYAfterGoal, goalY + wrappedGoal.length * 17);
  });

  // Draw connections
  for (let i = 0; i < numBoxes - 1; i++) {
    const pos1 = boxPositions[i];
    const pos2 = boxPositions[i + 1];
    
    const startX = pos1.x + CANVAS_CONFIG.boxWidth;
    const startY = pos1.y + CANVAS_CONFIG.boxHeight / 2;
    const endY = pos2.y + CANVAS_CONFIG.boxHeight / 2;
    const midX = startX + (CANVAS_CONFIG.stepX - CANVAS_CONFIG.boxWidth) / 2;
    
    const connectionGroup = svg.append("g");
    
    // Connection path
    const pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${pos2.x} ${endY}`;
    connectionGroup.append("path")
      .attr("d", pathData)
      .attr("stroke", CANVAS_CONFIG.colors.lineColor)
      .attr("stroke-width", CANVAS_CONFIG.lineWidth)
      .attr("fill", "none");
    
    // Arrow head
    const arrowSize = 8;
    const arrowPoints = `${pos2.x},${endY} ${pos2.x - arrowSize * 1.5},${endY - arrowSize} ${pos2.x - arrowSize * 1.5},${endY + arrowSize}`;
    connectionGroup.append("polygon")
      .attr("points", arrowPoints)
      .attr("fill", CANVAS_CONFIG.colors.lineColor);
  }

  // Draw timeline
  drawTimeline(svg, data, boxPositions, maxYAfterGoal + 40);
}

function drawTimeline(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: RoadmapData, boxPositions: Array<{ x: number; y: number }>, timelineY: number) {
  const timelineGroup = svg.append("g");
  
  const timelineStartX = boxPositions[0].x;
  const timelineEndX = boxPositions[boxPositions.length - 1].x + CANVAS_CONFIG.boxWidth;
  
  // Main timeline (dashed)
  timelineGroup.append("line")
    .attr("x1", timelineStartX)
    .attr("y1", timelineY)
    .attr("x2", timelineEndX)
    .attr("y2", timelineY)
    .attr("stroke", CANVAS_CONFIG.colors.durationLine)
    .attr("stroke-width", CANVAS_CONFIG.lineWidth)
    .attr("stroke-dasharray", "10,5");

  // Segment markers and labels
  let currentBoxIndex = 0;
  const separatorPoints = [timelineStartX];
  
  data.segments.forEach((segment, segmentIndex) => {
    const startBoxPos = boxPositions[currentBoxIndex];
    const numBoxesInSegment = segment.boxes.length;
    const endBoxIndex = currentBoxIndex + numBoxesInSegment - 1;
    const endBoxPos = boxPositions[endBoxIndex];
    
    const segmentStartX = startBoxPos.x;
    const segmentEndX = endBoxPos.x + CANVAS_CONFIG.boxWidth;
    separatorPoints.push(segmentEndX);
    
    // Segment label
    timelineGroup.append("text")
      .attr("x", segmentStartX + (segmentEndX - segmentStartX) / 2)
      .attr("y", timelineY + 25)
      .attr("text-anchor", "middle")
      .attr("fill", CANVAS_CONFIG.colors.textGray)
      .attr("font-size", "11")
      .text(`${segment.name} ${segment.weeks} Weeks`);
    
    currentBoxIndex += numBoxesInSegment;
  });
  
  // Vertical separators
  separatorPoints.forEach((x, i) => {
    const height = i === 0 ? 25 : 120 + (i - 1) * 60;
    timelineGroup.append("line")
      .attr("x1", x)
      .attr("y1", timelineY)
      .attr("x2", x)
      .attr("y2", timelineY - height)
      .attr("stroke", CANVAS_CONFIG.colors.durationLine)
      .attr("stroke-width", CANVAS_CONFIG.lineWidth)
      .attr("stroke-dasharray", "10,5");
  });
}

function showTooltip(event: MouseEvent, box: any) {
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("padding", "8px 12px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("max-width", "300px")
    .style("z-index", "1000")
    .style("pointer-events", "none");

  tooltip.html(`
    <div style="font-weight: 600; margin-bottom: 4px;">${box.title}</div>
    <div style="font-size: 11px; color: #ccc;">${box.goal}</div>
  `);

  const rect = tooltip.node()!.getBoundingClientRect();
  tooltip
    .style("left", (event.pageX - rect.width / 2) + "px")
    .style("top", (event.pageY - rect.height - 10) + "px");
}

function hideTooltip() {
  d3.selectAll(".tooltip").remove();
}
