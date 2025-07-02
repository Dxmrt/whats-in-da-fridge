'use client'

import { useEffect } from 'react'
import { InteractiveFridge } from '@/components/interactive-fridge'
import { WalletDonation } from '@/components/wallet-donation'

export default function Home(): JSX.Element {
  useEffect(() => {
    // Inform Farcaster that the Mini-App is ready (after render)
    if (typeof window !== 'undefined') {
      const timeout = setTimeout(() => {
        window.parent?.postMessage({ type: 'ready' }, '*')
      }, 300) // 300ms delay to ensure rendering is done

      return () => clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Top-left wallet connection */}
      <div className="absolute top-4 left-4 z-10">
        <WalletDonation compact={true} />
      </div>
      <br />
      <main className="flex min-h-screen flex-col items-center justify-start px-4 py-6">
        {/* Header */}
        <div className="text-center mt-3 mb-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold bg-gradient-to-r from-purple-800 via-pink-600 to-purple-900 bg-clip-text text-transparent drop-shadow-lg transition-transform duration-300 hover:scale-105">
            WHAT'S IN DA
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold bg-gradient-to-r from-purple-800 via-pink-600 to-purple-900 bg-clip-text text-transparent drop-shadow-lg transition-transform duration-300 hover:scale-105">
              FRIDGE
            </h1>
            <div className="flex gap-1 ml-2">
              {['🥛', '🥚', '🍅', '🧀', '🥬'].map((emoji, index) => (
                <span
                  key={index}
                  className="text-2xl sm:text-3xl cursor-pointer transition-transform duration-200 hover:scale-125 animate-bounce"
                  style={{
                    animationDelay: `${index * 0.4}s`,
                    animationDuration: '2s'
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-base sm:text-lg text-gray-700 mb-8 text-center max-w-2xl">
          Turn random ingredients into amazing recipes. Built for degens who cook!
        </p>

        {/* Interactive Fridge */}
        <InteractiveFridge />

        {/* Support Section */}
        <div className="mt-8 w-full max-w-4xl">
          <WalletDonation compact={false} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 via-pink-800 to-purple-900 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="text-sm opacity-90">
            Built with Farcaster Frame SDK & OnchainKit
          </p>
          <p className="text-xs opacity-75">
            Powered by{' '}
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300 transition-colors duration-200"
            >
              Base
            </a>
            {' + '}
            <a
              href="https://farcaster.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-300 transition-colors duration-200"
            >
              Farcaster
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
