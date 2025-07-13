import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

// Helper to generate random lat/lng for demo (real app: use geo API)
const getRandomPosition = () => {
  const lat = (Math.random() * 180) - 90 // -90 to 90
  const lng = (Math.random() * 360) - 180 // -180 to 180
  return [lat, lng]
}

export default function LiveMap({ alerts = [] }) {
  // Use alerts for markers; fall back to mocks if no alerts
  const markers = alerts.length > 0
    ? alerts.map((alert, i) => ({
        position: getRandomPosition(),
        risk: alert.type.charAt(0).toUpperCase() + alert.type.slice(1),
        message: `${alert.message} (Score: ${alert.score})`
      }))
    : [
        { position: [51.505, -0.09], risk: 'High', message: 'Potential scam detected' },
        { position: [40.7128, -74.0060], risk: 'Medium', message: 'High volume activity' },
      ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-4 shadow-lg h-96"
    >
      <div className="text-text-secondary mb-2">Live Risk Map (Ethereum Activity)</div>
      <MapContainer center={[40.0, 0.0]} zoom={2} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((marker, i) => (
          <Marker key={i} position={marker.position}>
            <Popup>
              <strong>{marker.risk}</strong>: {marker.message}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  )
}