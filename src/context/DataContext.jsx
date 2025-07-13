// src/context/DataContext.js
import { createContext, useContext, useState } from 'react'

const DataContext = createContext()

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  return (
    <DataContext.Provider value={{ data, setData, loading, setLoading, error, setError }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)