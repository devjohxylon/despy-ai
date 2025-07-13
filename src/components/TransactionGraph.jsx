import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'

export default function TransactionGraph({ transactions = [], address }) {
  const svgRef = useRef(null)

  useEffect(() => {
    if (transactions.length === 0) {
      // Fallback if no txns
      d3.select(svgRef.current).append('text')
        .attr('x', 400)
        .attr('y', 200)
        .attr('text-anchor', 'middle')
        .text('No recent transactions found')
        .attr('fill', '#9CA3AF')
      return
    }

    const width = 800
    const height = 400

    // Clear previous SVG
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    // Build nodes and links
    const nodes = new Set([address, ...transactions.map(tx => tx.to), ...transactions.map(tx => tx.from)])
    const nodeData = Array.from(nodes).map(id => ({ id }))
    const linkData = transactions.map(tx => ({
      source: tx.from,
      target: tx.to,
      value: parseFloat(tx.value / 1e18)
    }))

    // Force simulation
    const simulation = d3.forceSimulation(nodeData)
      .force('link', d3.forceLink(linkData).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // Links with color scale
    const colorScale = d3.scaleLinear().domain([0, 10]).range(['#9CA3AF', '#EF4444']) // Gray to red for value
    const link = svg.append('g')
      .selectAll('line')
      .data(linkData)
      .join('line')
      .attr('stroke', d => colorScale(d.value))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value) || 1)

    // Nodes
    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodeData)
      .join('circle')
      .attr('r', 5)
      .attr('fill', d => d.id === address ? '#3B82F6' : '#9CA3AF')
      .call(drag(simulation))

    // Labels
    const label = svg.append('g')
      .attr('fill', '#F3F4F6')
      .attr('font-size', 10)
      .selectAll('text')
      .data(nodeData)
      .join('text')
      .text(d => d.id ? d.id.slice(0, 6) + '...' : 'Unknown')
      .attr('dy', '.35em')
      .attr('dx', 8)

    // Tooltips (simple on hover)
    node.append('title').text(d => `Address: ${d.id}`)
    link.append('title').text(d => `Value: ${d.value.toFixed(4)} ETH`)

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    })

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function dragged(event) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    }
  }, [transactions, address])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-4 shadow-lg h-96 overflow-hidden"
    >
      <div className="text-text-secondary mb-2">Transaction Graph</div>
      <svg ref={svgRef}></svg>
    </motion.div>
  )
}