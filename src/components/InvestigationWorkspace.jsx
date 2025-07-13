import { useState } from 'react'
import { motion } from 'framer-motion'
import { useData } from '../context/DataContext'

export default function InvestigationWorkspace() {
  const { data } = useData()
  const [notes, setNotes] = useState('')
  const [annotations, setAnnotations] = useState([])

  const addAnnotation = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setAnnotations([...annotations, { text: e.target.value, time: new Date().toLocaleString() }])
      e.target.value = ''
    }
  }

  return (
    <motion.div
      key="investigation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-4 shadow-lg h-full"
    >
      <h2 className="text-text-secondary text-xl mb-4">Investigation Workspace</h2>
      {data?.address && (
        <div className="mb-6">
          <h3 className="text-accent font-semibold">Analyzing: {data.address.slice(0, 6)}...</h3>
          <p className="text-text-secondary">Score: {data.score || 'N/A'}</p>
        </div>
      )}
      <div className="mb-6">
        <label className="block text-text-secondary mb-2">Notes</label>
        <textarea
          className="w-full bg-secondary text-text-primary p-2 rounded-lg h-32 resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add team notes here..."
        />
      </div>
      <div>
        <label className="block text-text-secondary mb-2">Annotations</label>
        <input
          type="text"
          className="w-full bg-secondary text-text-primary p-2 rounded-lg mb-2"
          placeholder="Add annotation (press Enter)..."
          onKeyPress={addAnnotation}
        />
        <ul className="space-y-2">
          {annotations.map((anno, i) => (
            <li key={i} className="text-text-secondary">{anno.text} <span className="text-xs opacity-70">({anno.time})</span></li>
          ))}
        </ul>
      </div>
      <div className="mt-6 text-text-secondary">
        Findings: {data?.alerts?.length || 0} alerts, {data?.transactions?.length || 0} transactions
      </div>
    </motion.div>
  )
}