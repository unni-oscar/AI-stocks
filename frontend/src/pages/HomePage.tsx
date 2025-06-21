import React from 'react'
import { Link } from 'react-router-dom'

const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Stock Market Analysis
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive stock market analysis with automated NSE data fetching, 
          technical analysis, and long-term investment insights.
        </p>
        <Link 
          to="/dashboard" 
          className="btn-primary text-lg px-8 py-3"
        >
          Get Started
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Real-time Analysis</h3>
          <p className="text-gray-600">
            Get real-time market data and technical indicators for informed decisions.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
          <p className="text-gray-600">
            Advanced algorithms provide long-term investment recommendations.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-semibold mb-2">NSE Data Integration</h3>
          <p className="text-gray-600">
            Automated daily data fetching from National Stock Exchange.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Frontend Features</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Modern Dashboard with real-time statistics</li>
              <li>• Interactive TradingView-style charts</li>
              <li>• Detailed stock analysis with technical indicators</li>
              <li>• Responsive design for all devices</li>
              <li>• Professional light theme</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Backend Features</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Automated NSE data fetching</li>
              <li>• Comprehensive technical analysis</li>
              <li>• AI-powered investment scoring</li>
              <li>• RESTful API endpoints</li>
              <li>• PostgreSQL database management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage 