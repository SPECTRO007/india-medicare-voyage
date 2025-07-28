import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Dummy flight data structure matching real API responses
const generateFlights = (from: string, to: string, date: string, passengers: number) => {
  const airlines = ['Air India', 'IndiGo', 'SpiceJet', 'Vistara', 'GoAir', 'AirAsia']
  const aircraftTypes = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A330']
  
  return Array.from({ length: 8 }, (_, i) => {
    const airline = airlines[Math.floor(Math.random() * airlines.length)]
    const basePrice = 5000 + Math.random() * 15000
    const duration = 2 + Math.random() * 8 // 2-10 hours
    const departureTime = new Date(date)
    departureTime.setHours(6 + i * 2, Math.random() * 60)
    
    const arrivalTime = new Date(departureTime)
    arrivalTime.setHours(arrivalTime.getHours() + duration)
    
    return {
      id: `flight_${i + 1}_${Date.now()}`,
      airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
      aircraft: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
      from,
      to,
      departure: {
        time: departureTime.toISOString(),
        airport: `${from} Airport`,
        terminal: `Terminal ${Math.floor(1 + Math.random() * 3)}`
      },
      arrival: {
        time: arrivalTime.toISOString(),
        airport: `${to} Airport`,
        terminal: `Terminal ${Math.floor(1 + Math.random() * 3)}`
      },
      duration: `${Math.floor(duration)}h ${Math.floor((duration % 1) * 60)}m`,
      stops: Math.random() > 0.7 ? 1 : 0,
      prices: {
        economy: Math.round(basePrice),
        premium_economy: Math.round(basePrice * 1.5),
        business: Math.round(basePrice * 3),
        first: Math.round(basePrice * 5)
      },
      availability: {
        economy: Math.floor(20 + Math.random() * 100),
        premium_economy: Math.floor(10 + Math.random() * 50),
        business: Math.floor(5 + Math.random() * 20),
        first: Math.floor(1 + Math.random() * 8)
      },
      baggage: {
        cabin: '7kg',
        checked: Math.random() > 0.5 ? '20kg' : '15kg'
      },
      amenities: [
        'WiFi',
        'In-flight Entertainment',
        'Meals',
        'Power Outlets'
      ].filter(() => Math.random() > 0.3),
      cancellation: Math.random() > 0.5 ? 'Free' : 'Paid',
      rating: 3.5 + Math.random() * 1.5
    }
  })
}

const generateSeatMap = (aircraft: string) => {
  const seatLayouts = {
    'Boeing 737': { rows: 32, seatsPerRow: ['A', 'B', 'C', 'D', 'E', 'F'] },
    'Airbus A320': { rows: 30, seatsPerRow: ['A', 'B', 'C', 'D', 'E', 'F'] },
    'Boeing 777': { rows: 42, seatsPerRow: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'] },
    'Airbus A330': { rows: 38, seatsPerRow: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] }
  }
  
  const layout = seatLayouts[aircraft as keyof typeof seatLayouts] || seatLayouts['Boeing 737']
  const seats = []
  
  for (let row = 1; row <= layout.rows; row++) {
    for (const seatLetter of layout.seatsPerRow) {
      const seatNumber = `${row}${seatLetter}`
      const isWindow = seatLetter === 'A' || seatLetter === 'F' || seatLetter === 'K'
      const isAisle = seatLetter === 'C' || seatLetter === 'D' || seatLetter === 'G' || seatLetter === 'H'
      const isPremium = row <= 5
      const isBusiness = row <= 8
      
      let seatClass = 'economy'
      let extraFee = 0
      
      if (row <= 3) {
        seatClass = 'first'
        extraFee = 5000
      } else if (row <= 8) {
        seatClass = 'business' 
        extraFee = 2000
      } else if (row <= 12) {
        seatClass = 'premium_economy'
        extraFee = 500
      } else if (isWindow || isAisle) {
        extraFee = 200
      }
      
      seats.push({
        number: seatNumber,
        row,
        letter: seatLetter,
        class: seatClass,
        type: isWindow ? 'window' : isAisle ? 'aisle' : 'middle',
        available: Math.random() > 0.3, // 70% availability
        extraFee,
        features: [
          isWindow && 'Window View',
          isAisle && 'Easy Access',
          isPremium && 'Extra Legroom',
          isBusiness && 'Lie-flat Bed'
        ].filter(Boolean)
      })
    }
  }
  
  return seats
}

const generateMealOptions = () => [
  {
    id: 'meal_1',
    name: 'Vegetarian Meal',
    description: 'Fresh vegetarian cuisine with seasonal vegetables',
    price: 800,
    dietary: ['Vegetarian'],
    image: '/api/placeholder/150/100'
  },
  {
    id: 'meal_2', 
    name: 'Non-Vegetarian Meal',
    description: 'Choice of chicken or mutton with rice and bread',
    price: 1000,
    dietary: ['Non-Vegetarian'],
    image: '/api/placeholder/150/100'
  },
  {
    id: 'meal_3',
    name: 'Vegan Meal',
    description: 'Plant-based meal with organic ingredients',
    price: 900,
    dietary: ['Vegan'],
    image: '/api/placeholder/150/100'
  },
  {
    id: 'meal_4',
    name: 'Jain Meal',
    description: 'Specially prepared Jain vegetarian meal',
    price: 850,
    dietary: ['Jain', 'Vegetarian'],
    image: '/api/placeholder/150/100'
  }
]

const generateServices = () => [
  {
    id: 'service_1',
    name: 'Extra Baggage',
    description: 'Additional 10kg checked baggage',
    price: 1500,
    category: 'baggage'
  },
  {
    id: 'service_2',
    name: 'Priority Boarding',
    description: 'Board the aircraft before other passengers',
    price: 500,
    category: 'boarding'
  },
  {
    id: 'service_3',
    name: 'Lounge Access',
    description: 'Access to airport lounge with complimentary food and drinks',
    price: 2000,
    category: 'comfort'
  },
  {
    id: 'service_4',
    name: 'Travel Insurance',
    description: 'Comprehensive travel insurance coverage',
    price: 800,
    category: 'insurance'
  },
  {
    id: 'service_5',
    name: 'Fast Track Security',
    description: 'Skip regular security queues',
    price: 300,
    category: 'convenience'
  }
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ...params } = await req.json()
    
    console.log('Flight API request:', { action, params })

    switch (action) {
      case 'search':
        const { from, to, departureDate, passengers = 1, flightClass = 'economy' } = params
        const flights = generateFlights(from, to, departureDate, passengers)
        
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              flights,
              searchParams: { from, to, departureDate, passengers, flightClass },
              totalResults: flights.length
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get-seats':
        const { flightId, aircraft } = params
        const seats = generateSeatMap(aircraft)
        
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              flightId,
              aircraft,
              seats,
              seatMapLayout: {
                rows: Math.max(...seats.map(s => s.row)),
                seatsPerRow: [...new Set(seats.map(s => s.letter))].sort()
              }
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get-meals':
        return new Response(
          JSON.stringify({
            success: true,
            data: generateMealOptions()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get-services':
        return new Response(
          JSON.stringify({
            success: true,
            data: generateServices()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid action'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Flight API error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})