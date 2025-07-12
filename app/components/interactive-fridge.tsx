'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useToast } from '@/components/hooks/use-toast'

interface Ingredient {
  id: string
  name: string
  emoji: string
  category: 'dairy' | 'meat' | 'vegetable' | 'other'
}

const initialDemoIngredients: Ingredient[] = [
  { id: '1', name: 'Milk', emoji: '🥛', category: 'dairy' },
  { id: '2', name: 'Eggs', emoji: '🥚', category: 'meat' },
  { id: '3', name: 'Tomatoes', emoji: '🍅', category: 'vegetable' },
  { id: '4', name: 'Cheese', emoji: '🧀', category: 'dairy' },
  { id: '5', name: 'Lettuce', emoji: '🥬', category: 'vegetable' }
]

const demoRecipes = [
  {
    name: 'Fluffy Scrambled Eggs',
    ingredients: ['Eggs', 'Milk'],
    instructions: 'Beat eggs with milk, cook in butter over low heat, stirring constantly.',
    prepTime: '5 mins',
    difficulty: 'Easy'
  },
  {
    name: 'Fresh Garden Salad',
    ingredients: ['Lettuce', 'Tomatoes'],
    instructions: 'Chop lettuce and tomatoes, toss with olive oil and vinegar.',
    prepTime: '10 mins',
    difficulty: 'Easy'
  },
  {
    name: 'Quick Cheese Omelette',
    ingredients: ['Eggs', 'Cheese'],
    instructions: 'Beat eggs, cook in pan, add cheese, fold in half.',
    prepTime: '8 mins',
    difficulty: 'Easy'
  }
]

export function InteractiveFridge(): JSX.Element {
  const { address, isConnected } = useAccount()
  const connectedAddress = address
  const isInsideFrame = typeof window !== 'undefined' && window?.frameElement !== null

  const [isOpen, setIsOpen] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const [demoIngredients, setDemoIngredients] = useState<Ingredient[]>(initialDemoIngredients)
  const [userIngredients, setUserIngredients] = useState<Ingredient[]>([])
  const [hasInitializedUserIngredients, setHasInitializedUserIngredients] = useState(false)
  const [newIngredient, setNewIngredient] = useState('')
  const [showRecipes, setShowRecipes] = useState(false)

  const { toast } = useToast()
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (isConnected && !hasInitializedUserIngredients) {
      setUserIngredients([...initialDemoIngredients])
      setHasInitializedUserIngredients(true)
      toast({
        title: 'Wallet detected! 🎉',
        description: 'You have some ingredients to start with. Add more if you want!',
        duration: 4000
      })
    }
  }, [isConnected, hasInitializedUserIngredients, toast])

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 300)
    }, Math.random() * (5000 - 3000) + 3000)

    return () => clearInterval(blinkInterval)
  }, [])

  const getCurrentIngredients = () =>
    isConnected ? userIngredients : demoIngredients

  const updateIngredients = (newList: Ingredient[]) => {
    if (isConnected) {
      setUserIngredients(newList)
    } else {
      setDemoIngredients(newList)
    }
  }

  const toggleFridge = () => {
    const newState = !isOpen
    setIsOpen(newState)
    playSound(newState ? 800 : 400, 0.3, newState ? 'open' : 'close')
  }

  const playSound = (frequency: number, duration: number, type: 'open' | 'close') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        type === 'open' ? frequency * 0.5 : frequency * 1.5,
        audioContextRef.current.currentTime + duration
      )
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    } catch (e) {
      console.log('Audio not supported')
    }
  }

  const addIngredient = () => {
    if (!newIngredient.trim()) return

    const newIng: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.trim(),
      emoji: getEmojiForIngredient(newIngredient.trim()),
      category: getCategoryForIngredient(newIngredient.trim())
    }

    const updated = [...getCurrentIngredients(), newIng]
    updateIngredients(updated)
    setNewIngredient('')
    toast({
      title: `${newIng.name} added to ${isConnected ? 'your fridge' : 'demo'}!`,
      duration: 3000
    })
  }

  const removeIngredient = (id: string) => {
    const updated = getCurrentIngredients().filter(i => i.id !== id)
    updateIngredients(updated)
    toast({
      title: isConnected
        ? 'Ingredient removed permanently 🗑️'
        : 'Removed from demo. Connect wallet to save changes!',
      duration: 3000
    })
  }

  const generateRecipes = () => setShowRecipes(true)

  const getEmojiForIngredient = (name: string) => {
    const emojiMap: { [key: string]: string } = {
      milk: '🥛',
      eggs: '🥚',
      tomato: '🍅',
      cheese: '🧀',
      lettuce: '🥬',
      bread: '🍞',
      chicken: '🍗',
      fish: '🐟',
      rice: '🍚',
      apple: '🍎',
      banana: '🍌',
      carrot: '🥕',
      onion: '🧅',
      potato: '🥔'
    }
    return emojiMap[name.toLowerCase()] || '🥘'
  }

  const getCategoryForIngredient = (name: string): Ingredient['category'] => {
    const n = name.toLowerCase()
    if (['milk', 'cheese', 'yogurt'].includes(n)) return 'dairy'
    if (['eggs', 'meat', 'chicken', 'fish'].includes(n)) return 'meat'
    if (['lettuce', 'tomato', 'carrot', 'onion', 'potato'].includes(n)) return 'vegetable'
    return 'other'
  }

  const getIngredientsByCategory = (category: Ingredient['category']) =>
    getCurrentIngredients().filter(i => i.category === category)

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-4xl mx-auto">
      {!isInsideFrame && connectedAddress && (
        <p className="text-sm text-gray-500">
          Connected as {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
        </p>
      )}

      <div className="relative">
        <motion.div
          className="relative cursor-pointer"
          onClick={toggleFridge}
          whileHover={{ scale: 1.02 }}
          style={{ width: 'min(400px, 90vw)', aspectRatio: '3/4' }}
        >
          <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 rounded-3xl shadow-2xl border-4 border-gray-300 relative overflow-hidden">
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <motion.div className="w-3 h-3 bg-black rounded-full" animate={{ scaleY: isBlinking ? 0.1 : 1 }} transition={{ duration: 0.1 }} />
              <motion.div className="w-3 h-3 bg-black rounded-full" animate={{ scaleY: isBlinking ? 0.1 : 1 }} transition={{ duration: 0.1 }} />
            </div>

            <motion.div
              className="absolute inset-2 bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-inner border border-gray-200"
              animate={{ rotateY: isOpen ? -75 : 0, transformOrigin: 'left center' }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-gray-400 rounded-full" />
            </motion.div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="absolute inset-2 bg-yellow-50 rounded-2xl shadow-inner p-4 flex flex-col justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {(['dairy', 'meat', 'vegetable'] as const).map((cat) => (
                    <div key={cat} className="bg-white/80 p-2 rounded-lg border mb-2">
                      <div className="text-[10px] font-semibold text-gray-600 mb-1 capitalize">{cat}</div>
                      <div className="flex flex-wrap gap-1">
                        {getIngredientsByCategory(cat).map((i) => (
                          <motion.div
                            key={i.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              removeIngredient(i.id)
                            }}
                            className="bg-white rounded-lg px-2 py-1 border shadow-sm cursor-pointer hover:bg-red-50 hover:scale-110 transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                          >
                            <div className="text-lg">{i.emoji}</div>
                            <div className="text-[8px] text-center">{i.name}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        <p className="text-center text-sm text-gray-600 mt-4">
          {isOpen ? 'Click ingredients inside to remove them!' : 'Click the fridge to open it! 👆'}
        </p>
      </div>

      <div className="w-full max-w-md flex gap-2">
        <input
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
          placeholder="Add ingredient..."
          className="flex-1 px-4 py-2 border rounded-lg text-black"
        />
        <button onClick={addIngredient} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add
        </button>
      </div>

      <button
        onClick={generateRecipes}
        className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:scale-105 transition"
      >
        Based chef cooking... 👨‍🍳
      </button>

      <AnimatePresence>
        {showRecipes && (
          <motion.div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 border border-gray-200 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">Recipe Ideas</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {demoRecipes.map((r, i) => (
                <motion.div
                  key={i}
                  className="bg-blue-50 rounded-xl p-4 border hover:bg-blue-100 transition hover:scale-105 shadow-md"
                >
                  <h4 className="font-bold text-blue-900 text-lg mb-2">{r.name}</h4>
                  <p className="text-blue-700 text-sm mb-3">{r.instructions}</p>
                  <div className="flex justify-between">
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{r.prepTime}</span>
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{r.difficulty}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-6">
              <button onClick={() => setShowRecipes(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Close Recipes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
