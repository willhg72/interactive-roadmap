import * as d3 from "d3";
import type { RoadmapData } from "@shared/schema";
import { CANVAS_CONFIG, calculateCanvasDimensions, wrapText } from "./roadmap-utils";

let currentZoomedBox: any = null;
let currentZoomedGroup: any = null;

function showModalZoom(boxGroup: any, box: any, originalX: number, originalY: number) {
  // Don't create multiple zoom effects
  if (currentZoomedBox) return;
  
  currentZoomedBox = box;
  currentZoomedGroup = boxGroup;
  
  // Get SVG dimensions and calculate center
  const svgElement = boxGroup.node().ownerSVGElement;
  const svgSelection = d3.select(svgElement);
  
  // Get the viewBox or use the SVG dimensions
  const viewBox = svgSelection.attr("viewBox");
  let svgWidth, svgHeight;
  
  if (viewBox) {
    const [x, y, width, height] = viewBox.split(' ').map(Number);
    svgWidth = width;
    svgHeight = height;
  } else {
    svgWidth = +svgSelection.attr("width") || 1200;
    svgHeight = +svgSelection.attr("height") || 800;
  }
  
  // Calculate center position within SVG coordinates
  const svgCenterX = svgWidth / 2;
  const svgCenterY = svgHeight / 2;
  
  // Create overlay background
  const overlay = svgSelection.append("rect")
    .attr("class", "zoom-overlay")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "rgba(0, 0, 0, 0.7)")
    .style("cursor", "pointer")
    .on("click", hideModalZoom);
  
  // Clone the box group for the zoom effect
  const clonedGroup = svgSelection.append("g")
    .attr("class", "zoomed-box-group")
    .style("pointer-events", "none");
  
  // Clone the box elements - 40% larger for presentations
  const modalScale = 4.2; // Increased from 3 to 4.2 (40% larger)
  const boxRect = clonedGroup.append("rect")
    .attr("x", svgCenterX - CANVAS_CONFIG.boxWidth * (modalScale / 2))
    .attr("y", svgCenterY - CANVAS_CONFIG.boxHeight * (modalScale / 2))
    .attr("width", CANVAS_CONFIG.boxWidth * modalScale)
    .attr("height", CANVAS_CONFIG.boxHeight * modalScale)
    .attr("fill", CANVAS_CONFIG.colors.boxFill)
    .attr("rx", CANVAS_CONFIG.cornerRadius * modalScale);
  
  // Clone and scale the title text
  const wrappedTitle = wrapText(box.title, 25);
  const titleY = svgCenterY;
  
  if (wrappedTitle.length === 1) {
    clonedGroup.append("text")
      .attr("x", svgCenterX)
      .attr("y", titleY)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", CANVAS_CONFIG.colors.textWhite)
      .attr("font-size", "58") // Increased from 42 to 58 (40% larger)
      .attr("font-weight", "600")
      .text(wrappedTitle[0]);
  } else {
    clonedGroup.append("text")
      .attr("x", svgCenterX)
      .attr("y", titleY - 32) // Increased spacing from 24 to 32
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", CANVAS_CONFIG.colors.textWhite)
      .attr("font-size", "58") // Increased from 42 to 58 (40% larger)
      .attr("font-weight", "600")
      .text(wrappedTitle[0]);
      
    if (wrappedTitle[1]) {
      clonedGroup.append("text")
        .attr("x", svgCenterX)
        .attr("y", titleY + 32) // Increased spacing from 24 to 32
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", CANVAS_CONFIG.colors.textWhite)
        .attr("font-size", "58") // Increased from 42 to 58 (40% larger)
        .attr("font-weight", "600")
        .text(wrappedTitle[1]);
    }
  }
  
  // Create a text background panel for better readability - 40% larger
  const panelWidth = CANVAS_CONFIG.boxWidth * 5.0; // Increased from 3.6 to 5.0
  const panelHeight = 392; // Increased from 280 to 392 (40% larger)
  const textPanel = clonedGroup.append("rect")
    .attr("x", svgCenterX - panelWidth / 2)
    .attr("y", svgCenterY + CANVAS_CONFIG.boxHeight * (modalScale / 2) + 42) // Adjusted positioning
    .attr("width", panelWidth)
    .attr("height", panelHeight)
    .attr("fill", "rgba(0, 0, 0, 0.8)")
    .attr("rx", 11) // Increased from 8 to 11
    .attr("stroke", "rgba(255, 255, 255, 0.2)")
    .attr("stroke-width", 1);

  // Clone and scale the goal text with better visibility - 40% larger
  const wrappedGoal = wrapText(box.goal, 50);
  const goalY = svgCenterY + CANVAS_CONFIG.boxHeight * (modalScale / 2) + 98; // Adjusted positioning
  const textStartX = svgCenterX - panelWidth / 2 + 28; // Increased padding from 20 to 28
  
  wrappedGoal.forEach((line, i) => {
    const goalText = clonedGroup.append("text")
      .attr("x", textStartX)
      .attr("y", goalY + (i * 56)) // Increased from 40 to 56 (40% larger line spacing)
      .attr("fill", "white")
      .attr("font-size", "39") // Increased from 28 to 39 (40% larger)
      .style("pointer-events", "none");

    // Check if line contains "Goal:" or "Outcomes:" and format accordingly
    if (line.includes("Goal:") || line.includes("Outcomes:")) {
      const parts = line.split(/(Goal:|Outcomes:)/);
      
      parts.forEach(part => {
        if (part === "Goal:" || part === "Outcomes:") {
          const boldSpan = goalText.append("tspan")
            .attr("font-weight", "bold")
            .text(part);
        } else if (part.trim()) {
          const normalSpan = goalText.append("tspan")
            .text(part);
        }
      });
    } else {
      goalText.text(line);
    }
  });
  
  // Add close instruction text - 40% larger
  clonedGroup.append("text")
    .attr("x", svgCenterX)
    .attr("y", svgCenterY + CANVAS_CONFIG.boxHeight * (modalScale / 2) + 518) // Adjusted positioning
    .attr("text-anchor", "middle")
    .attr("fill", "rgba(255, 255, 255, 0.7)")
    .attr("font-size", "34") // Increased from 24 to 34 (40% larger)
    .text("Haz clic o presiona Escape para cerrar");

  // Add animation
  overlay.style("opacity", 0).transition().duration(300).style("opacity", 1);
  clonedGroup.style("opacity", 0).transition().duration(300).style("opacity", 1);
}

function hideModalZoom() {
  if (!currentZoomedBox) return;
  
  const svg = d3.select(currentZoomedGroup.node().ownerSVGElement);
  
  // Remove overlay and zoomed elements with animation
  svg.selectAll(".zoom-overlay")
    .transition()
    .duration(300)
    .style("opacity", 0)
    .remove();
    
  svg.selectAll(".zoomed-box-group")
    .transition()
    .duration(300)
    .style("opacity", 0)
    .remove();
  
  currentZoomedBox = null;
  currentZoomedGroup = null;
}

export function createRoadmapSVG(svgElement: SVGSVGElement, data: RoadmapData) {
  const svgCanvas = d3.select(svgElement);
  svgCanvas.selectAll("*").remove(); // Clear existing content
  
  // Add keyboard event listener for Escape key
  d3.select(document).on("keydown", function(event) {
    if (event.key === "Escape" && currentZoomedBox) {
      hideModalZoom();
    }
  });

  const { width, height, numBoxes } = calculateCanvasDimensions(data);
  const allBoxes = data.segments.flatMap(segment => segment.boxes);
  
  svgCanvas.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

  const startY = CANVAS_CONFIG.padding + (numBoxes - 1) * CANVAS_CONFIG.stepY;
  const boxPositions: Array<{ x: number; y: number }> = [];
  let maxYAfterGoal = 0;

  // Draw boxes
  allBoxes.forEach((box, i) => {
    const currentY = startY - i * CANVAS_CONFIG.stepY;
    const currentX = CANVAS_CONFIG.padding + i * CANVAS_CONFIG.stepX;
    
    boxPositions.push({ x: currentX, y: currentY });
    
    // Create box group
    const boxGroup = svgCanvas.append("g")
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
      .on("click", function(event) {
        // Create modal-style zoom effect on click
        showModalZoom(boxGroup, box, currentX, currentY);
      })
      .on("mouseenter", function() {
        // Add hover effect without opening modal - scale and darken color
        d3.select(this)
          .transition()
          .duration(200)
          .attr("width", CANVAS_CONFIG.boxWidth * 1.05)
          .attr("height", CANVAS_CONFIG.boxHeight * 1.05)
          .attr("x", currentX - (CANVAS_CONFIG.boxWidth * 0.025))
          .attr("y", currentY - (CANVAS_CONFIG.boxHeight * 0.025))
          .attr("fill", "#1e3a8a"); // Navy blue
      })
      .on("mouseleave", function() {
        // Remove hover effect
        d3.select(this)
          .transition()
          .duration(200)
          .attr("width", CANVAS_CONFIG.boxWidth)
          .attr("height", CANVAS_CONFIG.boxHeight)
          .attr("x", currentX)
          .attr("y", currentY)
          .attr("fill", CANVAS_CONFIG.colors.boxFill); // Original color
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
    
    const connectionGroup = svgCanvas.append("g");
    
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
  drawTimeline(svgCanvas, data, boxPositions, maxYAfterGoal + 40);
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