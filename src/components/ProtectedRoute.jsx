// src/components/ProtectedRoute.jsx
import { useAuth, RedirectToSignIn } from '@clerk/clerk-react'
import { motion } from 'framer-motion'

const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth()

  // Show loading spinner while auth state is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  // Render protected content
  return children
}

export default ProtectedRoute 