// src/App.jsx (with Forta integration and corrected routing)

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import PredictionForm from './components/PredictionForm'
import DashboardPage from './components/DashboardPage'
import AlertsPage from './components/AlertsPage'
import ActivityPage from './components/ActivityPage'
import InvestigationWorkspace from './components/InvestigationWorkspace'
import SettingsPage from './components/SettingsPage'
import { useData } from './context/DataContext'

function App() {
  const { data, setData, loading, setLoading, error, setError } = useData()
  const navigate = useNavigate()

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
          chainId: 1,
          createdSince: 604800000
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
      navigate('/dashboard')
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
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/investigation" element={<InvestigationWorkspace />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<PredictionForm onSubmit={handleSubmit} loading={loading} />} />
          </Routes>
          {error && <div className="text-danger mt-4">{error}</div>}
        </main>
      </div>
    </div>
  )
}

export default App