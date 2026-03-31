/**
 * Generate and render volatility index chart
 */
export function renderVolatilityChart() {
  const chartArea = document.getElementById('chart-area');
  const chartLine = document.getElementById('chart-line');
  
  if (!chartArea || !chartLine) return;

  // Generate realistic data (0-100 for volatility)
  const points = generateChartPoints(24);
  
  // Create paths for SVG
  const areePath = createAreaPath(points);
  const linePath = createLinePath(points);
  
  chartArea.setAttribute('d', areePath);
  chartLine.setAttribute('points', linePath);
}

/**
 * Generate random chart points simulating volatility
 * @param {number} count - Number of data points
 * @returns {Array} Array of y values
 */
function generateChartPoints(count) {
  const points = [];
  let currentValue = 50;
  
  for (let i = 0; i < count; i++) {
    // Smooth random walk
    const change = (Math.random() - 0.5) * 20;
    currentValue = Math.max(20, Math.min(80, currentValue + change));
    points.push(currentValue);
  }
  
  return points;
}

/**
 * Create SVG area path from data points
 * @param {Array} points - Array of y values
 * @returns {string} SVG path string
 */
function createAreaPath(points) {
  const width = 1000;
  const height = 240;
  const pointSpacing = width / (points.length - 1);
  
  // Scale points to SVG coordinates
  const scaledPoints = points.map((val, i) => {
    const x = i * pointSpacing;
    const y = height - (val / 100) * (height * 0.7) - (height * 0.15);
    return { x, y };
  });
  
  // Create line points
  let linePath = '';
  scaledPoints.forEach((point, i) => {
    linePath += `${i === 0 ? '' : ' '}${point.x},${point.y}`;
  });
  
  // Create area path (line + bottom closure)
  let areaPath = `M ${scaledPoints[0].x} ${scaledPoints[0].y}`;
  
  for (let i = 1; i < scaledPoints.length; i++) {
    areaPath += ` L ${scaledPoints[i].x} ${scaledPoints[i].y}`;
  }
  
  // Close the path at the bottom
  areaPath += ` L ${scaledPoints[scaledPoints.length - 1].x} ${height}`;
  areaPath += ` L ${scaledPoints[0].x} ${height}`;
  areaPath += ' Z';
  
  return areaPath;
}

/**
 * Create SVG line path from data points
 * @param {Array} points - Array of y values
 * @returns {string} SVG polyline points string
 */
function createLinePath(points) {
  const width = 1000;
  const height = 240;
  const pointSpacing = width / (points.length - 1);
  
  let pathString = '';
  points.forEach((val, i) => {
    const x = i * pointSpacing;
    const y = height - (val / 100) * (height * 0.7) - (height * 0.15);
    pathString += `${i === 0 ? '' : ','}${x},${y}`;
  });
  
  return pathString;
}
