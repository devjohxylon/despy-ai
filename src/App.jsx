import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import PredictionForm from './components/PredictionForm'
import ScoreCard from './components/ScoreCard'
import RiskRadarChart from './components/RiskRadarChart'
import ActivityTimeline from './components/ActivityTimeline'
import AlertsFeed from './components/AlertsFeed'
import TransactionGraph from './components/TransactionGraph'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const severityMap = {
    INFO: 20,
    LOW: 40,
    MEDIUM: 60,
    HIGH: 80,
    CRITICAL: 100
  }

  const handleSubmit = async (input) => {
    setLoading(true)
    setError(null)
    try {
      const address = input.toLowerCase()
      const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY

      // Fetch transactions from Etherscan (for timeline and graph)
      let transactions = []
      let isToken = false
      if (apiKey) {
        const ethResponse = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
        )
        const ethJson = await ethResponse.json()
        if (ethJson.status === '1') {
          transactions = ethJson.result
        }

        // If no normal txns, try token txns (for contract addresses)
        if (transactions.length === 0) {
          const tokenResponse = await fetch(
            `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
          )
          const tokenJson = await tokenResponse.json()
          if (tokenJson.status === '1') {
            transactions = tokenJson.result
            isToken = true
          }
        }
      }

      // Fetch alerts from Forta GraphQL API
      const fortaQuery = `
        query GetAlerts($input: AlertsInput) {
          alerts(input: $input) {
            alerts {
              createdAt
              name
              severity
              description
              source {
                transactionHash
                block {
                  number
                  chainId
                }
                bot {
                  name
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor {
                alertId
                blockNumber
              }
            }
          }
        }
      `
      const fortaVariables = {
        input: {
          addresses: [address],
          chainId: 1, // Ethereum
          createdSince: 604800000 // Last 7 days in ms (7*24*60*60*1000)
        }
      }
      const fortaResponse = await fetch('https://api.forta.network/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fortaQuery, variables: fortaVariables })
      })
      const fortaJson = await fortaResponse.json()
      if (fortaJson.errors) throw new Error(fortaJson.errors[0].message)

      const fortaAlerts = fortaJson.data?.alerts?.alerts || []

      // Derive data
      const timeline = transactions.map(tx => ({
        date: new Date(tx.timeStamp * 1000).toLocaleString(),
        event: isToken
          ? `Token transfer ${parseFloat(tx.value / (10 ** parseInt(tx.tokenDecimal))).toFixed(4)} ${tx.tokenSymbol} to ${tx.to.slice(0, 6)}...`
          : `Transfer ${parseFloat(tx.value / 1e18).toFixed(4)} ETH to ${tx.to.slice(0, 6)}...`,
        type: isToken ? 'token' : 'transfer'
      }))

      const alerts = fortaAlerts.map(alert => ({
        type: alert.severity.toLowerCase() === 'critical' || alert.severity.toLowerCase() === 'high' ? 'danger' :
              alert.severity.toLowerCase() === 'medium' ? 'warning' : 'success',
        score: severityMap[alert.severity] || 50,
        date: new Date(alert.createdAt).toLocaleString(),
        message: `${alert.name}: ${alert.description}`
      }))

      // Calculate score: Max severity or average if alerts, else based on txns
      let score = 0
      if (fortaAlerts.length > 0) {
        score = Math.max(...fortaAlerts.map(a => severityMap[a.severity] || 0))
      } else if (transactions.length > 0) {
        const txCount = transactions.length
        const totalValue = transactions.reduce((sum, tx) => sum + parseFloat(tx.value / (isToken ? (10 ** parseInt(tx.tokenDecimal)) : 1e18)), 0)
        score = Math.min(100, txCount * 5 + (totalValue > 10 ? 50 : 0))
      }

      const risks = [
        { name: 'Liquidity', value: Math.random() * score },
        { name: 'Ownership', value: Math.random() * score },
        { name: 'Code', value: Math.random() * score },
        { name: 'Social', value: Math.random() * score },
        { name: 'Market', value: Math.random() * score },
      ]

      setData({ score, risks, timeline, alerts, transactions, address })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-secondary">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PredictionForm onSubmit={handleSubmit} loading={loading} />
          </motion.div>
          {error && <div className="text-danger mt-4">{error}</div>}
          {loading ? (
            <LoadingSkeleton />
          ) : data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <ScoreCard score={data.score} />
              <RiskRadarChart data={data.risks} />
              <ActivityTimeline events={data.timeline} />
              <AlertsFeed alerts={data.alerts} />
              <div className="md:col-span-2 lg:col-span-3">
                <TransactionGraph transactions={data.transactions} address={data.address} />
              </div>
            </div>
          ) : (
            <div className="text-center mt-20 text-text-secondary">Enter a wallet or token to analyze</div>
          )}
        </main>
      </div>
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-primary rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-secondary rounded w-3/4 mb-4"></div>
        <div className="h-32 bg-secondary rounded"></div>
      </div>
    ))}
    <div className="md:col-span-2 lg:col-span-3 bg-primary rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-secondary rounded w-3/4 mb-4"></div>
      <div className="h-64 bg-secondary rounded"></div>
    </div>
  </div>
)

export default App