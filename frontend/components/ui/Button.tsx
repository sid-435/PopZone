import React from 'react'

const Button = ({ children, onClick, type = 'button', className = '' }: { children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit' | 'reset'; className?: string }) => (
  <button
    type={type}
    onClick={onClick}
    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
  >
    {children}
  </button>
)

export default Button