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
  const [isOpen, setIsOpen] = useState<boolean>(false)
  
  // Separate state for demo and connected user
  const [demoIngredients, setDemoIngredients] = useState<Ingredient[]>(initialDemoIngredients)
  const [userIngredients, setUserIngredients] = useState<Ingredient[]>([])
  const [hasInitializedUserIngredients, setHasInitializedUserIngredients] = useState<boolean>(false)
  
  const [newIngredient, setNewIngredient] = useState<string>('')
  const [showRecipes, setShowRecipes] = useState<boolean>(false)
  const [isBlinking, setIsBlinking] = useState<boolean>(false)
  const { toast } = useToast()
  const audioContextRef = useRef<AudioContext | null>(null)

  // When user connects wallet, copy demo ingredients as starter pack
  useEffect(() => {
    if (isConnected && !hasInitializedUserIngredients) {
      setUserIngredients([...initialDemoIngredients])
      setHasInitializedUserIngredients(true)
      toast({
        title: "Wallet connected! 🎉",
        description: "You have some ingredients to start with. Add more if you want!",
        duration: 4000,
      })
    }
  }, [isConnected, hasInitializedUserIngredients, toast])

  // Function to get current ingredients based on wallet state
  const getCurrentIngredients = (): Ingredient[] => {
    return isConnected ? userIngredients : demoIngredients
  }

  // Function to update ingredients based on wallet state
  const updateIngredients = (newIngredientsList: Ingredient[]): void => {
    if (isConnected) {
      setUserIngredients(newIngredientsList)
    } else {
      setDemoIngredients(newIngredientsList)
    }
  }

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 300)
    }, Math.random() * (5000 - 3000) + 3000)

    return () => clearInterval(blinkInterval)
  }, [])

  const playSound = (frequency: number, duration: number, type: 'open' | 'close' = 'open'): void => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      
      if (type === 'open') {
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, audioContextRef.current.currentTime + duration)
      } else {
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioContextRef.current.currentTime + duration)
      }

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    } catch (error) {
      console.log('Audio not supported')
    }
  }

  const toggleFridge = (): void => {
    const newState = !isOpen
    setIsOpen(newState)
    
    if (newState) {
      playSound(800, 0.3, 'open')
    } else {
      playSound(400, 0.3, 'close')
    }
  }

  const removeIngredient = (ingredientId: string): void => {
    const currentIngredients = getCurrentIngredients()
    const updatedIngredients = currentIngredients.filter(ing => ing.id !== ingredientId)
    updateIngredients(updatedIngredients)
    
    if (isConnected) {
      toast({
        title: "Ingredient removed from your fridge permanently! 🗑️",
        duration: 3000,
      })
    } else {
      toast({
        title: "Ingredient removed from demo. Connect wallet to save changes!",
        duration: 3000,
      })
    }
  }

  const addIngredient = (): void => {
    if (!newIngredient.trim()) return

    const newIng: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.trim(),
      emoji: getEmojiForIngredient(newIngredient.trim()),
      category: getCategoryForIngredient(newIngredient.trim())
    }

    const currentIngredients = getCurrentIngredients()
    updateIngredients([...currentIngredients, newIng])
    setNewIngredient('')
    
    if (isConnected) {
      toast({
        title: `${newIngredient} added to your fridge! 🎉`,
        description: "Saved permanently to your wallet",
        duration: 3000,
      })
    } else {
      toast({
        title: `${newIngredient} added to demo! 🎉`,
        description: "Connect wallet to save permanently",
        duration: 3000,
      })
    }
  }

  const generateRecipes = (): void => {
    setShowRecipes(true)
  }

  const getIngredientsByCategory = (category: string): Ingredient[] => {
    const currentIngredients = getCurrentIngredients()
    return currentIngredients.filter(ing => ing.category === category)
  }

  // Helper function to automatically assign emojis
  const getEmojiForIngredient = (name: string): string => {
    const lowerName = name.toLowerCase()
    const emojiMap: { [key: string]: string } = {
      'milk': '🥛',
      'egg': '🥚', 'eggs': '🥚',
      'tomato': '🍅', 'tomatoes': '🍅',
      'cheese': '🧀',
      'lettuce': '🥬',
      'bread': '🍞',
      'chicken': '🍗',
      'fish': '🐟',
      'rice': '🍚',
      'pasta': '🍝',
      'apple': '🍎',
      'banana': '🍌',
      'carrot': '🥕',
      'onion': '🧅',
      'potato': '🥔',
      'beef': '🥩',
      'pork': '🥓',
      'broccoli': '🥦',
      'mushroom': '🍄', 'mushrooms': '🍄',
      'garlic': '🧄',
      'lemon': '🍋',
      'orange': '🍊'
    }
    
    return emojiMap[lowerName] || '🥘'
  }

  // Helper function to automatically categorize
  const getCategoryForIngredient = (name: string): 'dairy' | 'meat' | 'vegetable' | 'other' => {
    const lowerName = name.toLowerCase()
    
    if (['milk', 'cheese', 'yogurt', 'butter', 'cream'].includes(lowerName)) {
      return 'dairy'
    }
    if (['egg', 'eggs', 'chicken', 'fish', 'meat', 'beef', 'pork'].includes(lowerName)) {
      return 'meat'
    }
    if (['lettuce', 'tomato', 'tomatoes', 'carrot', 'onion', 'potato', 'broccoli'].includes(lowerName)) {
      return 'vegetable'
    }
    return 'other'
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-4xl mx-auto">
      {/* Fridge Container */}
      <div className="relative">
        <motion.div
          className="relative cursor-pointer transform-gpu hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          onClick={toggleFridge}
          whileHover={{ scale: 1.02 }}
          style={{
            width: 'min(400px, 90vw)',
            height: 'min(420px, 60vh)',
            aspectRatio: '3/4'
          }}
        >
          {/* Fridge Body */}
          <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 rounded-3xl shadow-2xl border-4 border-gray-300 relative overflow-hidden">
            {/* Cute Face */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <motion.div
                className="w-3 h-3 bg-black rounded-full"
                animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
                transition={{ duration: 0.1 }}
              />
              <motion.div
                className="w-3 h-3 bg-black rounded-full"
                animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Door */}
            <motion.div
              className="absolute inset-2 bg-gradient-to-b from-white to-gray-100 rounded-2xl shadow-inner border border-gray-200"
              animate={{
                rotateY: isOpen ? -75 : 0,
                transformOrigin: 'left center'
              }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Door Handle */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-gray-400 rounded-full shadow-md" />
            </motion.div>

            {/* Interior (visible when open) */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="absolute inset-2 bg-gradient-to-b from-yellow-50 to-white rounded-2xl shadow-inner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {/* LED Light */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-yellow-200 rounded-full shadow-lg" />
                  
                  {/* Shelves with Ingredients */}
                  <div className="p-4 h-full flex flex-col justify-between">
                    {/* Top Shelf - Dairy */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-gray-200 min-h-[60px]">
                      <div className="text-[8px] font-semibold text-gray-600 mb-1">Dairy</div>
                      <div className="flex flex-wrap gap-1">
                        {getIngredientsByCategory('dairy').map((ingredient) => (
                          <motion.div
                            key={ingredient.id}
                            className="bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm cursor-pointer hover:bg-red-50 hover:scale-110 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeIngredient(ingredient.id)
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <div className="text-lg">{ingredient.emoji}</div>
                            <div className="text-[8px] font-medium text-center">{ingredient.name}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Middle Shelf - Meat/Other */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-gray-200 min-h-[60px]">
                      <div className="text-[8px] font-semibold text-gray-600 mb-1">Protein</div>
                      <div className="flex flex-wrap gap-1">
                        {getIngredientsByCategory('meat').concat(getIngredientsByCategory('other')).map((ingredient) => (
                          <motion.div
                            key={ingredient.id}
                            className="bg-white rounded-lg px-2 py-1 border border-gray-200 shadow-sm cursor-pointer hover:bg-red-50 hover:scale-110 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeIngredient(ingredient.id)
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <div className="text-lg">{ingredient.emoji}</div>
                            <div className="text-[8px] font-medium text-center">{ingredient.name}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Crisper - Vegetables */}
                    <div className="bg-green-50/80 backdrop-blur-sm rounded-lg p-2 border border-green-200 min-h-[60px]">
                      <div className="text-[8px] font-semibold text-green-700 mb-1">Fresh</div>
                      <div className="flex flex-wrap gap-1">
                        {getIngredientsByCategory('vegetable').map((ingredient) => (
                          <motion.div
                            key={ingredient.id}
                            className="bg-white rounded-lg px-2 py-1 border border-green-200 shadow-sm cursor-pointer hover:bg-red-50 hover:scale-110 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeIngredient(ingredient.id)
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <div className="text-lg">{ingredient.emoji}</div>
                            <div className="text-[8px] font-medium text-center">{ingredient.name}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-center text-sm text-gray-600 mt-4">
          {isOpen ? 'Click ingredients inside to remove them!' : 'Click the fridge to open it! 👆'}
        </p>
      </div>

      {/* Your Ingredients Section */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          {isConnected ? 'Your Personal Fridge' : 'Demo Ingredients'}
        </h3>
        
        {/* Explanatory message */}
        {!isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700 text-center">
              🎯 These are demo ingredients. Connect your wallet to save your favorite ingredients inside da fridge!
            </p>
          </div>
        )}
        
        {isConnected && hasInitializedUserIngredients && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-700 text-center">
              ✅ Your fridge is ready with your favorite ingredients!
            </p>
          </div>
        )}
        
       {/* Add Ingredient Section */}
<div className="mb-4 flex gap-2">
  <input
    type="text"
    value={newIngredient}
    onChange={(e) => setNewIngredient(e.target.value)}
    placeholder={isConnected ? "Add ingredient to your fridge..." : "Add ingredient (demo)..."}
    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 text-black"
    onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
  />
  <button
    onClick={addIngredient}
    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
  >
    {isConnected ? 'Add' : 'Add (Demo)'}
  </button>
</div>


        {/* Ingredients Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {getCurrentIngredients().map((ingredient) => (
            <div
              key={ingredient.id}
              className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200 hover:bg-gray-100 transition-colors duration-200 relative group"
            >
              <div className="text-2xl mb-1">{ingredient.emoji}</div>
              <div className="text-sm font-medium text-gray-700">{ingredient.name}</div>
              
              {/* Show badge if it's an original ingredient */}
              {initialDemoIngredients.some(demo => demo.name === ingredient.name) && isConnected && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="text-center text-sm text-gray-500 mb-4">
          {getCurrentIngredients().length} ingredients in your fridge
        </div>

        {/* Recipe Ideas Button */}
        <div className="text-center">
          <button
            onClick={generateRecipes}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Based chef cooking... 👨‍🍳
          </button>
        </div>
      </div>

      {/* Recipe Suggestions */}
      <AnimatePresence>
        {showRecipes && (
          <motion.div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center">Recipe Ideas</h3>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {demoRecipes.map((recipe, index) => (
                <motion.div
                  key={index}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-200 hover:bg-blue-100 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <h4 className="font-bold text-blue-900 text-lg mb-2">{recipe.name}</h4>
                  <p className="text-blue-700 text-sm mb-3">{recipe.instructions}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {recipe.prepTime}
                    </span>
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {recipe.difficulty}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => setShowRecipes(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Close Recipes
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}