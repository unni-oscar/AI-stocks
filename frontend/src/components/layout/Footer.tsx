import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="kt-container-fixed">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 gap-4">
          <div>2025 &copy; <span className="font-medium text-gray-500">Smadau.</span></div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Docs</a>
            <a href="#" className="hover:underline">Purchase</a>
            <a href="#" className="hover:underline">FAQ</a>
            <a href="#" className="hover:underline">Support</a>
            <a href="#" className="hover:underline">License</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 