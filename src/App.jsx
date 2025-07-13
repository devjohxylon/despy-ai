// src/App.jsx
import { useNavigate } from 'react-router-dom'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import PredictionForm from './components/PredictionForm'
import DashboardPage from './components/DashboardPage'
import AlertsPage from './components/AlertsPage'
import ActivityPage from './components/ActivityPage'
import InvestigationWorkspace from './components/InvestigationWorkspace'
import SettingsPage from './components/SettingsPage'
import ContractScanner from './components/ContractScanner'
import { useData } from './context/DataContext'
import * as tf from '@tensorflow/tfjs'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedBackground from './components/AnimatedBackground' // New component

function App() {
  const { data, setData, loading, setLoading, error, setError } = useData()
  const navigate = useNavigate()
  const location = useLocation()

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
      let reputationScore = 0

      if (chain === 'ethereum') {
        const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY
        if (apiKey) {
          const ethResponse = await fetch(
            `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
          )
          const ethJson = await ethResponse.json()
          if (ethJson.status === '1') transactions = ethJson.result

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

        alerts = transactions.map(tx => {
          const gasUsed = parseFloat(tx.gasUsed)
          const value = parseFloat(tx.value) / (isToken ? 10 ** parseInt(tx.tokenDecimal) : 1e18)
          const severity = gasUsed > 200000 || value > 10 ? 'HIGH' : 'LOW'
          return {
            type: severity.toLowerCase() === 'high' ? 'danger' : 'warning',
            score: severityMap[severity] || 40,
            date: new Date(tx.timeStamp * 1000).toLocaleString(),
            message: `Unusual tx: Gas ${gasUsed.toLocaleString()} | Value ${value.toFixed(4)} ${isToken ? tx.tokenSymbol : 'ETH'}`
          }
        })

        timeline = transactions.map(tx => ({
          date: new Date(tx.timeStamp * 1000).toLocaleString(),
          event: isToken
            ? `Token transfer ${parseFloat(tx.value / (10 ** parseInt(tx.tokenDecimal))).toFixed(4)} ${tx.tokenSymbol} to ${tx.to.slice(0, 6)}...`
            : `Transfer ${parseFloat(tx.value / 1e18).toFixed(4)} ETH to ${tx.to.slice(0, 6)}...`,
          type: isToken ? 'token' : 'transfer'
        }))

        if (alerts.length > 0) score = Math.max(...alerts.map(a => a.score))
        else if (transactions.length > 0) {
          const txCount = transactions.length
          const totalValue = transactions.reduce((sum, tx) => sum + parseFloat(tx.value / (isToken ? 10 ** parseInt(tx.tokenDecimal) : 1e18)), 0)
          score = Math.min(100, txCount * 5 + (totalValue > 10 ? 50 : 0))
        }

        reputationScore = calculateReputationScore(address)

      } else if (chain === 'solana') {
        const quickNodeApiKey = import.meta.env.VITE_QUICKNODE_API_KEY
        if (!quickNodeApiKey) throw new Error('QuickNode API key missing.')
        const solResponse = await fetch(quickNodeApiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getSignaturesForAddress",
            params: [address, { limit: 10 }]
          })
        })
        if (!solResponse.ok) throw new Error(`Solana API error: ${solResponse.status}`)
        const solJson = await solResponse.json()
        if (solJson.result) {
          transactions = solJson.result
          timeline = transactions.map(tx => ({
            date: new Date(tx.blockTime * 1000).toLocaleString(),
            event: `Tx signature: ${tx.signature.slice(0, 6)}...`,
            type: 'solana'
          }))
          score = Math.min(100, transactions.length * 10)
          alerts = transactions.map(tx => ({
            type: 'warning',
            score: 40,
            date: new Date(tx.blockTime * 1000).toLocaleString(),
            message: `Tx detected: ${tx.signature.slice(0, 6)}...`
          }))
          reputationScore = calculateReputationScore(address)
        } else throw new Error(solJson.error?.message || 'No result from Solana API')
      } else if (chain === 'bsc') {
        const bscApiKey = import.meta.env.VITE_BSCSCAN_API_KEY
        if (bscApiKey) {
          const bscResponse = await fetch(
            `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${bscApiKey}`
          )
          const bscJson = await bscResponse.json()
          if (bscJson.status === '1') transactions = bscJson.result

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

        alerts = transactions.map(tx => {
          const gasUsed = parseFloat(tx.gasUsed)
          const value = parseFloat(tx.value) / (isToken ? 10 ** parseInt(tx.tokenDecimal) : 1e18)
          const severity = gasUsed > 200000 || value > 10 ? 'HIGH' : 'LOW'
          return {
            type: severity.toLowerCase() === 'high' ? 'danger' : 'warning',
            score: severityMap[severity] || 40,
            date: new Date(tx.timeStamp * 1000).toLocaleString(),
            message: `Unusual tx: Gas ${gasUsed.toLocaleString()} | Value ${value.toFixed(4)} ${isToken ? tx.tokenSymbol : 'BNB'}`
          }
        })

        timeline = transactions.map(tx => ({
          date: new Date(tx.timeStamp * 1000).toLocaleString(),
          event: isToken
            ? `Token transfer ${parseFloat(tx.value / (10 ** parseInt(tx.tokenDecimal))).toFixed(4)} ${tx.tokenSymbol} to ${tx.to.slice(0, 6)}...`
            : `Transfer ${parseFloat(tx.value / 1e18).toFixed(4)} BNB to ${tx.to.slice(0, 6)}...`,
          type: isToken ? 'token' : 'transfer'
        }))

        if (alerts.length > 0) score = Math.max(...alerts.map(a => a.score))
        else if (transactions.length > 0) {
          const txCount = transactions.length
          const totalValue = transactions.reduce((sum, tx) => sum + parseFloat(tx.value / (isToken ? 10 ** parseInt(tx.tokenDecimal) : 1e18)), 0)
          score = Math.min(100, txCount * 5 + (totalValue > 10 ? 50 : 0))
        }
        reputationScore = calculateReputationScore(address)
      }

      risks = [
        { name: 'Liquidity', value: Math.random() * score },
        { name: 'Ownership', value: Math.random() * score },
        { name: 'Code', value: Math.random() * score },
        { name: 'Social', value: Math.random() * score },
        { name: 'Market', value: Math.random() * score },
      ]

      if (transactions.length > 1) {
        const features = transactions.map(tx => [
          parseFloat(tx.value / (isToken ? 10 ** parseInt(tx.tokenDecimal) : 1e18)),
          parseFloat(tx.gasUsed || 0),
          parseFloat(tx.cumulativeGasUsed || 0)
        ])
        const normalizedFeatures = tf.tensor2d(features)
        const mean = normalizedFeatures.mean(0)
        const variance = normalizedFeatures.sub(mean).square().mean(0)
        const std = variance.sqrt().add(tf.scalar(1e-7))
        const standardized = normalizedFeatures.sub(mean).div(std)

        const inputDim = features[0].length
        const model = tf.sequential()
        model.add(tf.layers.dense({ units: 8, activation: 'relu', inputShape: [inputDim] }))
        model.add(tf.layers.dense({ units: 4, activation: 'relu' }))
        model.add(tf.layers.dense({ units: 8, activation: 'relu' }))
        model.add(tf.layers.dense({ units: inputDim, activation: 'linear' }))
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' })

        await model.fit(standardized, standardized, { epochs: 50, batchSize: 32, verbose: 0 })
        const reconstructed = model.predict(standardized)
        const mse = standardized.sub(reconstructed).square().mean(1).dataSync()
        const threshold = mse.sort((a, b) => a - b)[Math.floor(mse.length * 0.95)] || 0
        const anomalies = mse.filter(err => err > threshold).length
        predictiveRisk = Math.min(100, (anomalies / transactions.length) * 100)

        risks.push({ name: 'Predictive', value: predictiveRisk })
        score = Math.max(score, predictiveRisk)
      }

      score = Math.max(score, reputationScore)
      setData({ score, risks, timeline, alerts, transactions, address, predictiveRisk, chain, reputationScore })
      if (location.pathname !== '/dashboard') navigate('/dashboard') // Auto-navigate to dashboard
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateReputationScore = (address) => {
    const riskFactor = address.includes('0') ? 0.3 : address.includes('f') ? 0.7 : 0.5
    const randomRisk = Math.random() * 50 + 20
    return Math.min(100, Math.round(riskFactor * randomRisk))
  }

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -50 }
  }
  const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.5 }

  return (
    <div className="flex h-screen overflow-hidden relative">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <Topbar onSubmit={handleSubmit} />
        </motion.div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
            >
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/investigation" element={<InvestigationWorkspace />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/contract-scanner" element={<ContractScanner />} />
                <Route path="/" element={<PredictionForm onSubmit={handleSubmit} loading={loading} />} />
              </Routes>
              {error && <div className="text-danger mt-4 animate-pulse">{error}</div>}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default App