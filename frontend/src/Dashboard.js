import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import RiskGauge from './components/RiskGauge';

function Dashboard() {
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('eth');
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const graphRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    // WebSocket for alerts
    ws.current = new WebSocket('ws://localhost:8000/alerts');
    ws.current.onmessage = (event) => {
      setAlerts((prev) => [...prev, event.data]);
    };
    return () => ws.current.close();
  }, []);

  const scanWallet = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/wallet/${chain}/${address}`);
      setData(res.data);
      renderGraph(res.data.transactions);
      // Send to WS for alert simulation
      ws.current.send(`activity on ${address}`);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const renderGraph = (txs) => {
    const svg = d3.select(graphRef.current).html('').append('svg').attr('width', 600).attr('height', 400);
    // Simple force graph: nodes = tx hashes, links = sequence
    const nodes = txs.map((tx, i) => ({ id: i, hash: tx.hash || tx.signature }));
    const links = nodes.slice(1).map((n, i) => ({ source: i, target: i+1 }));
    
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(300, 200));
    
    const link = svg.append('g').selectAll('line').data(links).enter().append('line').attr('stroke', 'white');
    const node = svg.append('g').selectAll('circle').data(nodes).enter().append('circle')
      .attr('r', 5).attr('fill', 'blue');
    
    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('cx', d => d.x).attr('cy', d => d.y);
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">BlockTrace AI Dashboard</h1>
      <select value={chain} onChange={(e) => setChain(e.target.value)} className="bg-gray-800 p-2 mr-2">
        <option value="eth">Ethereum</option>
        <option value="sol">Solana</option>
      </select>
      <input 
        value={address} 
        onChange={(e) => setAddress(e.target.value)} 
        placeholder="Enter wallet address" 
        className="bg-gray-800 p-2 w-96 mr-2"
      />
      <button onClick={scanWallet} disabled={loading} className="bg-blue-600 p-2 rounded">
        {loading ? 'Scanning...' : 'Scan Wallet'}
      </button>
      
      {data && (
        <div className="mt-8">
          <h2 className="text-2xl">Results for {address} on {chain.toUpperCase()}</h2>
          <p>Risk Score: {data.risk_score}/100</p>
          <RiskGauge score={data.risk_score} />
          <p>Anomalies: {data.anomalies.join(', ') || 'None'}</p>
          <p>Explanation: {data.explanation}</p>
          <p>Holdings: {JSON.stringify(data.holdings)}</p>
          <h3>Recent Transactions (First 10):</h3>
          <ul>{data.transactions.map((tx, i) => <li key={i}>{JSON.stringify(tx)}</li>)}</ul>
          <div ref={graphRef} className="mt-4"><h3>Transaction Flow Graph</h3></div>
        </div>
      )}
      
      <div className="mt-8 bg-red-900 p-4 rounded" hidden={!alerts.length}>
        <h3>Real-Time Alerts:</h3>
        <ul>{alerts.map((a, i) => <li key={i}>{a}</li>)}</ul>
      </div>
    </div>
  );
}

export default Dashboard;