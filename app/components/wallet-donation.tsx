'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet } from 'lucide-react'
import {
  useAccount,
  useConnect,
  useSendTransaction
} from 'wagmi'
import { parseEther } from 'viem'

interface WalletDonationProps {
  compact?: boolean
}

export function WalletDonation({ compact = false }: WalletDonationProps): JSX.Element {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { sendTransactionAsync, isPending } = useSendTransaction()

  const [isDonating, setIsDonating] = useState(false)
  const [showThanks, setShowThanks] = useState(false)

  const connectWallet = async (): Promise<void> => {
    try {
      const connector = connectors[0]
      if (connector) {
        await connect({ connector })
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }

  const playSound = () => {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(880, ctx.currentTime)
    g.gain.setValueAtTime(0.1, ctx.currentTime)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.2)
  }

  const makeDonation = async (amount: string): Promise<void> => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    setIsDonating(true)
    try {
      const tx = await sendTransactionAsync({
        to: '0x3f9B873aC41E33054e6aF55221aA0e5aFf8d72EC',
        value: parseEther(amount)
      })
      console.log('Donation TX sent:', tx)
      playSound()
      setShowThanks(true)
      setTimeout(() => setShowThanks(false), 3000)
    } catch (error) {
      console.error('Donation failed:', error)
      alert('Donation failed. Please try again.')
    } finally {
      setIsDonating(false)
    }
  }

  if (compact) {
    return (
      <motion.button
        onClick={isConnected ? undefined : connectWallet}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base backdrop-blur-sm bg-opacity-90"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline">
          {isConnected ? `Connected: ${address?.slice(0, 6)}...` : 'Connect Wallet'}
        </span>
        <span className="sm:hidden">
          {isConnected ? 'Connected' : 'Connect'}
        </span>
      </motion.button>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 relative overflow-hidden">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🥰</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Loving this app?</h3>
        <p className="text-gray-600">
          If this helped you discover a tasty recipe, consider buying us a coffee! ☕
        </p>
      </div>

      {!isConnected ? (
        <div className="text-center">
          <motion.button
            onClick={connectWallet}
            disabled={isPending}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPending ? 'Connecting...' : 'Connect & Support'}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-center">
            {['0.0003', '0.0006'].map((eth) => (
              <motion.button
                key={eth}
                onClick={() => makeDonation(eth)}
                disabled={isDonating || isPending}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {eth} ETH
              </motion.button>
            ))}
          </div>

          {(isDonating || isPending) && (
            <div className="text-center mt-2">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Processing donation...
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showThanks && (
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-pink-100 border border-pink-300 px-6 py-2 rounded-xl text-pink-700 font-semibold shadow-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            ❤️ Thank you for your donation!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
