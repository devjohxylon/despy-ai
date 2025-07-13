// src/App.jsx (with Forta integration and AI predictive threats)

import { useNavigate } from 'react-router-dom'
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
import * as tf from '@tensorflow/tfjs'

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

  const handleSubmit = async ({ input, chain }) => {
    setLoading(true)
    setError(null)
    try {
      const address = input.toLowerCase()
      let transactions = []
      let isToken = false
      let alerts = []
      let score = 0
      let risks = []
      let timeline = []
      let predictiveRisk = 0

      if (chain === 'ethereum') {
        const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY
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

        timeline = transactions.map(tx => ({
          date: new Date(tx.timeStamp * 1000).toLocaleString(),
          event: isToken
            ? `Token transfer ${parseFloat(tx.value / (10 ** parseInt(tx.tokenDecimal))).toFixed(4)} ${tx.tokenSymbol} to ${tx.to.slice(0, 6)}...`
            : `Transfer ${parseFloat(tx.value / 1e18).toFixed(4)} ETH to ${tx.to.slice(0, 6)}...`,
          type: isToken ? 'token' : 'transfer'
        }))

        alerts = fortaAlerts.map(alert => ({
          type: alert.severity.toLowerCase() === 'critical' || alert.severity.toLowerCase() === 'high' ? 'danger' :
                alert.severity.toLowerCase() === 'medium' ? 'warning' : 'success',
          score: severityMap[alert.severity] || 50,
          date: new Date(alert.createdAt).toLocaleString(),
          message: `${alert.name}: ${alert.description}`
        }))

        if (fortaAlerts.length > 0) {
          score = Math.max(...fortaAlerts.map(a => severityMap[a.severity] || 0))
        } else if (transactions.length > 0) {
          const txCount = transactions.length
          const totalValue = transactions.reduce((sum, tx) => sum + parseFloat(tx.value / (isToken ? (10 ** parseInt(tx.tokenDecimal)) : 1e18)), 0)
          score = Math.min(100, txCount * 5 + (totalValue > 10 ? 50 : 0))
        }

      } else if (chain === 'solana') {
        const solResponse = await fetch(
          'https://api.mainnet-beta.solana.com',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getSignaturesForAddress",
              params: [address, { limit: 10 }]
            })
          }
        )
        const solJson = await solResponse.json()
        if (solJson.result) {
          transactions = solJson.result
          timeline = transactions.map(tx => ({
            date: new Date(tx.blockTime * 1000).toLocaleString(),
            event: `Transaction signature: ${tx.signature.slice(0, 6)}...`,
            type: 'solana'
          }))
          score = Math.min(100, transactions.length * 10) // Simple scoring for Solana
        }
      } else if (chain === 'bsc') {
        const bscApiKey = import.meta.env.VITE_BSCSCAN_API_KEY
        if (bscApiKey) {
          const bscResponse = await fetch(
            `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${bscApiKey}`
          )
          const bscJson = await bscResponse.json()
          if (bscJson.status === '1') {
            transactions = bscJson.result
          }

          if (transactions.length === 0) {
            const tokenResponse = await fetch(
              `https://api.bscscan.com/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${bscApiKey}`
            )
            const tokenJson = await tokenResponse.json()
            if (tokenJson.status === '1') {
              transactions = tokenJson.result
              isToken = true
            }
          }
        }

        timeline = transactions.map(tx => ({
          date: new Date(tx.timeStamp * 1000).toLocaleString(),
          event: isToken
            ? `Token transfer ${parseFloat(tx.value / (10 ** parseInt(tx.tokenDecimal))).toFixed(4)} ${tx.tokenSymbol} to ${tx.to.slice(0, 6)}...`
            : `Transfer ${parseFloat(tx.value / 1e18).toFixed(4)} BNB to ${tx.to.slice(0, 6)}...`,
          type: isToken ? 'token' : 'transfer'
        }))

        if (transactions.length > 0) {
          const txCount = transactions.length
          const totalValue = transactions.reduce((sum, tx) => sum + parseFloat(tx.value / (isToken ? (10 ** parseInt(tx.tokenDecimal)) : 1e18)), 0)
          score = Math.min(100, txCount * 5 + (totalValue > 10 ? 50 : 0))
        }
      }

      risks = [
        { name: 'Liquidity', value: Math.random() * score },
        { name: 'Ownership', value: Math.random() * score },
        { name: 'Code', value: Math.random() * score },
        { name: 'Social', value: Math.random() * score },
        { name: 'Market', value: Math.random() * score },
      ]

      // AI-Powered Predictive Threats - Autoencoder for anomaly detection
      if (transactions.length > 1) { // Require at least 2 transactions for std/variance
        // Preprocess data: extract values as features
        const features = transactions.map(tx => [
          parseFloat(tx.value / (isToken ? (10 ** parseInt(tx.tokenDecimal)) : 1e18)),
          parseFloat(tx.gasUsed || 0), // Solana has no gas, so default to 0
          parseFloat(tx.cumulativeGasUsed || 0)
        ])
        const normalizedFeatures = tf.tensor2d(features)
        const mean = normalizedFeatures.mean(0)
        const variance = normalizedFeatures.sub(mean).square().mean(0)
        const std = variance.sqrt().add(tf.scalar(1e-7)) // Avoid division by zero
        const standardized = normalizedFeatures.sub(mean).div(std)

        // Simple Autoencoder model
        const inputDim = features[0].length
        const model = tf.sequential()
        model.add(tf.layers.dense({ units: 8, activation: 'relu', inputShape: [inputDim] }))
        model.add(tf.layers.dense({ units: 4, activation: 'relu' }))
        model.add(tf.layers.dense({ units: 8, activation: 'relu' }))
        model.add(tf.layers.dense({ units: inputDim, activation: 'linear' }))
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' })

        // Train the model
        await model.fit(standardized, standardized, { epochs: 50, batchSize: 32, verbose: 0 })

        // Predict and calculate reconstruction error
        const reconstructed = model.predict(standardized)
        const mse = standardized.sub(reconstructed).square().mean(1).dataSync()
        const threshold = mse.sort((a, b) => a - b)[Math.floor(mse.length * 0.95)] || 0
        const anomalies = mse.filter(err => err > threshold).length
        predictiveRisk = Math.min(100, (anomalies / transactions.length) * 100)

        risks.push({ name: 'Predictive', value: predictiveRisk })
        score = Math.max(score, predictiveRisk)
      }

      setData({ score, risks, timeline, alerts, transactions, address, predictiveRisk, chain })
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
        <Topbar onSubmit={handleSubmit} />
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