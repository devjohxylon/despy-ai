import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [input, setInput] = useState({ address: '', chain: 'ethereum', type: 'wallet' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let endpoint;
      if (input.type === 'wallet-trace') {
        endpoint = '/trace-wallet';
      } else if (input.type === 'wallet-score') {
        endpoint = '/score-wallet';
      } else if (input.type === 'token-detect') {
        endpoint = '/detect-token';
      }
      const res = await axios.post(`http://localhost:8000${endpoint}`, {
        address: input.address,
        chain: input.chain
      });
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderDashboard = () => {
    if (!result) return null;
    if (input.type === 'wallet-trace') {
      return (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Wallet History</h2>
          <ul>
            {result.history.map((event, idx) => (
              <li key={idx}>{event.timestamp}: {event.type} - {JSON.stringify(event.details)}</li>
            ))}
          </ul>
          <h3>Flags: {result.flags.join(', ')}</h3>
        </div>
      );
    } else if (input.type === 'wallet-score') {
      const chartData = [{ name: 'Score', value: result.score }];
      return (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Wallet Score: {result.score}</h2>
          <p>{result.explanation}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (input.type === 'token-detect') {
      return (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Token Risk</h2>
          <p>Rugpull: {result.risk.is_rugpull ? 'Yes' : 'No'}</p>
          <p>Honeypot: {result.risk.is_honeypot ? 'Yes' : 'No'}</p>
          <p>Age: {result.risk.age_days} days</p>
          <p>Audit: {result.risk.audit_status}</p>
          <p>Tx Pattern: {result.risk.tx_pattern}</p>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">DeSpy AI MVP</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="address"
          value={input.address}
          onChange={handleChange}
          placeholder="Wallet or Token Address"
          className="border p-2 w-full"
          required
        />
        <select name="chain" value={input.chain} onChange={handleChange} className="border p-2 w-full">
          <option value="ethereum">Ethereum</option>
          <option value="solana">Solana</option>
        </select>
        <select name="type" value={input.type} onChange={handleChange} className="border p-2 w-full">
          <option value="wallet-trace">Trace Wallet</option>
          <option value="wallet-score">Score Wallet</option>
          <option value="token-detect">Detect Token</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Analyze</button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {renderDashboard()}
    </div>
  );
}

export default App;