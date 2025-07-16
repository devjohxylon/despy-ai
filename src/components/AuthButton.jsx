// src/components/AuthButton.jsx
import { SignInButton, SignUpButton, UserButton, useAuth, useClerk } from '@clerk/clerk-react'

export default function AuthButton() {
  const { isSignedIn, isLoaded } = useAuth()
  const clerk = useClerk()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 border-2 border-blue-500/30 hover:border-blue-500/50 transition-colors",
              userButtonPopoverCard: "bg-gray-900 border border-gray-700 shadow-2xl",
              userButtonPopoverActionButton: "text-gray-300 hover:text-white hover:bg-gray-800 transition-colors",
              userButtonPopoverActionButtonText: "text-gray-300",
              userButtonPopoverActionButtonIcon: "text-gray-400",
              userButtonPopoverFooter: "hidden",
              userPreviewMainIdentifier: "text-white",
              userPreviewSecondaryIdentifier: "text-gray-400"
            }
          }}
        />
      </div>
    )
  }

  const handleSignUpClick = () => {
    console.log('SignUp button clicked')
    console.log('Clerk instance:', clerk)
    try {
      clerk.openSignUp()
    } catch (error) {
      console.error('Error opening signup:', error)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <SignInButton mode="modal">
        <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
          Sign In
        </button>
      </SignInButton>
      
      {/* Direct button approach */}
      <button 
        onClick={handleSignUpClick}
        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign Up
      </button>
    </div>
  )
} 