import React from 'react';
import * as d3 from 'd3';

function RiskGauge({ score }) {
  const svgRef = React.useRef();

  React.useEffect(() => {
    const svg = d3.select(svgRef.current).html('')
      .attr('width', 200).attr('height', 100);
    const arc = d3.arc()
      .innerRadius(40).outerRadius(50)
      .startAngle(-Math.PI / 2).endAngle((score / 100) * Math.PI - Math.PI / 2);
    svg.append('g').attr('transform', 'translate(100,50)')
      .append('path').attr('d', arc).attr('fill', score > 75 ? 'red' : score > 50 ? 'yellow' : 'green');
    svg.append('text').attr('x', 100).attr('y', 50).attr('text-anchor', 'middle').text(`${score}%`);
  }, [score]);

  return <svg ref={svgRef}></svg>;
}

export default RiskGauge;