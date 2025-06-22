import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate password confirmation
    if (password !== passwordConfirmation) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3034/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          password_confirmation: passwordConfirmation 
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }
      
      const data = await response.json()
      
      // Auto-login after successful registration
      localStorage.setItem('auth_token', data.data.token)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Enter your password"
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={passwordConfirmation}
              onChange={e => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
              placeholder="Confirm your password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage 