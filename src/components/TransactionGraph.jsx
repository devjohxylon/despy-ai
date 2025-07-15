// src/components/TransactionGraph.jsx
import { Bar } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useEffect, useRef } from 'react'

Chart.register(ChartDataLabels)

export default function TransactionGraph({ transactions, address }) {
  const chartRef = useRef(null)

  useEffect(() => {
    const chart = chartRef.current
    if (chart) {
      console.log('Destroying previous chart instance')
      chart.destroy() // Destroy previous chart to avoid conflicts
    } else {
      console.log('No chart instance to destroy')
    }
  }, [transactions])

  if (!transactions || transactions.length === 0) {
    console.log('No transactions data to render graph')
    return <div className="text-center text-text-secondary">No transactions available</div>
  }

  const data = {
    labels: transactions.map(tx => tx.hash?.slice(0, 6) || tx.signature?.slice(0, 6) || 'Unknown'),
    datasets: [{
      label: `Transactions for ${address}`,
      data: transactions.map(tx => parseFloat(tx.value || 0) / (tx.tokenDecimal ? 10 ** parseInt(tx.tokenDecimal) : 1e18) || 0),
      backgroundColor: ctx => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200)
        gradient.addColorStop(0, 'rgba(75, 192, 192, 0.8)')
        gradient.addColorStop(1, 'rgba(75, 192, 192, 0.2)')
        return gradient
      },
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      barPercentage: 0.7,
      categoryPercentage: 0.7
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutBounce'
    },
    scales: {
      x: { title: { display: true, text: 'Transaction IDs', color: '#a0aec0' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
      y: { title: { display: true, text: 'Value (in Native Units)', color: '#a0aec0' }, beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
    },
    plugins: [
      {
        legend: { position: 'top', labels: { color: '#e2e8f0' } },
        datalabels: {
          color: '#fff',
          font: { size: 14, weight: 'bold' },
          formatter: (value, ctx) => `${value.toFixed(4)} ${transactions[ctx.dataIndex].tokenSymbol || 'ETH'}`,
          anchor: 'end',
          align: 'top',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 4,
          padding: 2
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const tx = transactions[tooltipItem.dataIndex]
              return [
                `Hash: ${tx.hash || tx.signature || 'N/A'}`,
                `Value: ${tooltipItem.raw.toFixed(4)} ${tx.tokenSymbol || 'ETH'}`,
                `Gas: ${parseFloat(tx.gasUsed || 0).toLocaleString()}`
              ]
            }
          },
          backgroundColor: 'rgba(26, 32, 44, 0.9)',
          titleColor: '#e2e8f0',
          bodyColor: '#a0aec0'
        },
        beforeDraw: (chart) => {
          const ctx = chart.ctx
          ctx.save()

          // Custom background gradient
          const gradientBg = ctx.createLinearGradient(0, 0, chart.width, chart.height)
          gradientBg.addColorStop(0, 'rgba(0, 0, 0, 0.3)')
          gradientBg.addColorStop(1, 'rgba(0, 0, 0, 0.8)')
          ctx.fillStyle = gradientBg
          ctx.fillRect(0, 0, chart.width, chart.height)

          // Glowing trails
          ctx.beginPath()
          transactions.forEach((tx, index) => {
            const x = chart.scales.x.getPixelForValue(index)
            const y = chart.scales.y.getPixelForValue(parseFloat(tx.value || 0) / (tx.tokenDecimal ? 10 ** parseInt(tx.tokenDecimal) : 1e18) || 0)
            ctx.moveTo(x, chart.height)
            ctx.lineTo(x, y)
            const gradientGlow = ctx.createRadialGradient(x, y, 0, x, y, 20)
            gradientGlow.addColorStop(0, 'rgba(75, 192, 192, 0.8)')
            gradientGlow.addColorStop(0.5, 'rgba(75, 192, 192, 0.4)')
            gradientGlow.addColorStop(1, 'rgba(75, 192, 192, 0)')
            ctx.strokeStyle = gradientGlow
            ctx.lineWidth = 2
            ctx.stroke()
          })
          ctx.closePath()

          // Subtle background overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
          ctx.fillRect(0, 0, chart.width, chart.height)
          ctx.restore()
        },
        id: 'customCanvasEffects'
      }
    ],
    rotation: -0.5 // Enhanced 3D tilt
  }

  return (
    <div className="bg-primary/80 rounded-xl p-5 shadow-lg relative overflow-hidden" style={{ minHeight: '400px' }}>
      <h2 className="text-text-secondary text-xl font-light mb-4">Transaction Graph (3D with Glowing Trails)</h2>
      <div style={{ height: '100%', position: 'relative' }}>
        <Bar ref={chartRef} data={data} options={options} />
      </div>
    </div>
  )
}