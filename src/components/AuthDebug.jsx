import React, { useState, useEffect } from 'react';
import { secureTokenStorage } from '../utils/security';

const AuthDebug = () => {
  const [authStatus, setAuthStatus] = useState({
    hasToken: false,
    tokenValue: null,
    tokenExpires: null,
    isValid: false
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = secureTokenStorage.getToken();
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      
      setAuthStatus({
        hasToken: !!token,
        tokenValue: token ? `${token.substring(0, 20)}...` : null,
        tokenExpires: expiresAt ? new Date(parseInt(expiresAt)).toLocaleString() : null,
        isValid: secureTokenStorage.isTokenValid()
      });
    };

    checkAuth();
    const interval = setInterval(checkAuth, 2000);
    return () => clearInterval(interval);
  }, []);

  const testAuth = async () => {
    try {
      const response = await fetch('https://despy-ai-production.up.railway.app/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${secureTokenStorage.getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Auth test successful! User: ' + JSON.stringify(data));
      } else {
        const error = await response.text();
        alert('Auth test failed: ' + error);
      }
    } catch (error) {
      alert('Auth test error: ' + error.message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm z-50">
      <h3 className="text-white font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1 text-gray-300">
        <div>Has Token: <span className={authStatus.hasToken ? 'text-green-400' : 'text-red-400'}>{authStatus.hasToken ? 'Yes' : 'No'}</span></div>
        <div>Token Valid: <span className={authStatus.isValid ? 'text-green-400' : 'text-red-400'}>{authStatus.isValid ? 'Yes' : 'No'}</span></div>
        {authStatus.tokenValue && <div>Token: {authStatus.tokenValue}</div>}
        {authStatus.tokenExpires && <div>Expires: {authStatus.tokenExpires}</div>}
      </div>
      <button 
        onClick={testAuth}
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
      >
        Test Auth
      </button>
    </div>
  );
};

export default AuthDebug; 