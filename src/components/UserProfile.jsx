// src/components/UserProfile.jsx
import { useAuth } from '../context/AuthContext'

export default function UserProfile() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <div className="flex items-center gap-4">
        {user.avatar && (
          <img
            src={user.avatar}
            alt={user.name || 'User avatar'}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold text-white">{user.name || 'Anonymous User'}</h2>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>
    </div>
  )
} 