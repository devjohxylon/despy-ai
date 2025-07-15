// src/components/TransactionGraph.jsx
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
)

export default function TransactionGraph({ transactions, address }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-panel p-6">
        <div className="text-center text-gray-400">No transactions available</div>
      </div>
    )
  }

  const data = {
    labels: transactions.map(tx => tx.hash?.slice(0, 6) || 'Unknown'),
    datasets: [{
      label: `Transactions for ${address?.slice(0, 8)}...`,
      data: transactions.map(tx => parseFloat(tx.value || 0) / (tx.tokenDecimal ? 10 ** parseInt(tx.tokenDecimal) : 1e18)),
      backgroundColor: 'rgba(56, 189, 248, 0.5)',
      borderColor: 'rgba(56, 189, 248, 1)',
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.7,
      categoryPercentage: 0.7
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: 'rgb(148, 163, 184)'
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: 'rgb(148, 163, 184)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgb(148, 163, 184)',
          font: {
            size: 12
          }
        }
      },
      datalabels: {
        color: 'rgb(226, 232, 240)',
        anchor: 'end',
        align: 'top',
        offset: 4,
        font: {
          size: 11
        },
        formatter: (value, ctx) => {
          const tx = transactions[ctx.dataIndex]
          return `${value.toFixed(4)} ${tx.tokenSymbol || 'ETH'}`
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'rgb(226, 232, 240)',
        bodyColor: 'rgb(148, 163, 184)',
        borderColor: 'rgba(56, 189, 248, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const tx = transactions[context.dataIndex]
            return [
              `Value: ${context.parsed.y.toFixed(4)} ${tx.tokenSymbol || 'ETH'}`,
              `Gas Used: ${parseInt(tx.gasUsed || 0).toLocaleString()}`,
              `Hash: ${tx.hash}`
            ]
          }
        }
      }
    }
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="text-gray-400 text-xl font-light mb-6">Transaction History</h2>
      <div className="h-[400px] relative">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}