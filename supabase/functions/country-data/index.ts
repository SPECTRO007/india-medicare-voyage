import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Dummy country data - easily replaceable with real API
const countryData = {
  'IN': {
    name: 'India',
    code: 'IN',
    phoneCode: '+91',
    currency: 'INR',
    language: 'Hindi, English',
    timezone: 'IST',
    hospitals: {
      total: 45000,
      multiSpecialty: 1200,
      government: 25000,
      private: 20000,
      specialties: [
        'Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 
        'Gastroenterology', 'Nephrology', 'Pediatrics', 'Gynecology'
      ],
      topHospitals: [
        {
          name: 'AIIMS Delhi',
          type: 'Government',
          specialties: ['Multi-specialty'],
          beds: 2500,
          rating: 4.8
        },
        {
          name: 'Apollo Hospital Chennai',
          type: 'Private',
          specialties: ['Cardiology', 'Oncology', 'Transplants'],
          beds: 1000,
          rating: 4.7
        },
        {
          name: 'Fortis Healthcare',
          type: 'Private',
          specialties: ['Oncology', 'Neurology', 'Orthopedics'],
          beds: 800,
          rating: 4.6
        }
      ]
    },
    hotels: {
      total: 85000,
      luxury: 500,
      budget: 60000,
      midRange: 24500,
      averageRates: {
        luxury: 15000,
        midRange: 4000,
        budget: 1500
      },
      popularChains: [
        'Taj Hotels', 'Oberoi', 'ITC Hotels', 'Marriott', 'Hyatt'
      ]
    },
    cities: [
      {
        name: 'Delhi',
        hospitals: 250,
        hotels: 2500,
        medicalTourism: true,
        airportCode: 'DEL'
      },
      {
        name: 'Mumbai',
        hospitals: 180,
        hotels: 1800,
        medicalTourism: true,
        airportCode: 'BOM'
      },
      {
        name: 'Chennai',
        hospitals: 120,
        hotels: 800,
        medicalTourism: true,
        airportCode: 'MAA'
      },
      {
        name: 'Bangalore',
        hospitals: 150,
        hotels: 1200,
        medicalTourism: true,
        airportCode: 'BLR'
      }
    ]
  },
  'TH': {
    name: 'Thailand',
    code: 'TH',
    phoneCode: '+66',
    currency: 'THB',
    language: 'Thai, English',
    timezone: 'ICT',
    hospitals: {
      total: 1200,
      multiSpecialty: 85,
      government: 800,
      private: 400,
      specialties: [
        'Plastic Surgery', 'Dental Care', 'Cardiology', 'Oncology',
        'Orthopedics', 'Fertility Treatment', 'Wellness'
      ],
      topHospitals: [
        {
          name: 'Bumrungrad International Hospital',
          type: 'Private',
          specialties: ['Multi-specialty', 'Medical Tourism'],
          beds: 580,
          rating: 4.9
        },
        {
          name: 'Bangkok Hospital',
          type: 'Private',
          specialties: ['Cardiology', 'Neurology', 'Oncology'],
          beds: 450,
          rating: 4.7
        }
      ]
    },
    hotels: {
      total: 12000,
      luxury: 300,
      budget: 8000,
      midRange: 3700,
      averageRates: {
        luxury: 8000,
        midRange: 2500,
        budget: 800
      },
      popularChains: [
        'Marriott', 'Hilton', 'Shangri-La', 'InterContinental', 'Centara'
      ]
    },
    cities: [
      {
        name: 'Bangkok',
        hospitals: 45,
        hotels: 2000,
        medicalTourism: true,
        airportCode: 'BKK'
      },
      {
        name: 'Phuket',
        hospitals: 12,
        hotels: 800,
        medicalTourism: true,
        airportCode: 'HKT'
      }
    ]
  },
  'SG': {
    name: 'Singapore',
    code: 'SG',
    phoneCode: '+65',
    currency: 'SGD',
    language: 'English, Mandarin, Malay, Tamil',
    timezone: 'SGT',
    hospitals: {
      total: 28,
      multiSpecialty: 15,
      government: 8,
      private: 20,
      specialties: [
        'Oncology', 'Cardiology', 'Neurology', 'Orthopedics',
        'Transplants', 'Plastic Surgery', 'Advanced Diagnostics'
      ],
      topHospitals: [
        {
          name: 'Singapore General Hospital',
          type: 'Government',
          specialties: ['Multi-specialty', 'Research'],
          beds: 1785,
          rating: 4.9
        },
        {
          name: 'Mount Elizabeth Hospital',
          type: 'Private',
          specialties: ['Cardiology', 'Oncology', 'Neurology'],
          beds: 345,
          rating: 4.8
        }
      ]
    },
    hotels: {
      total: 400,
      luxury: 50,
      budget: 150,
      midRange: 200,
      averageRates: {
        luxury: 25000,
        midRange: 8000,
        budget: 3000
      },
      popularChains: [
        'Marina Bay Sands', 'Raffles', 'Shangri-La', 'Marriott', 'Hilton'
      ]
    },
    cities: [
      {
        name: 'Singapore',
        hospitals: 28,
        hotels: 400,
        medicalTourism: true,
        airportCode: 'SIN'
      }
    ]
  }
  // Add more countries as needed
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    const countryCode = url.searchParams.get('country')
    const city = url.searchParams.get('city')

    console.log('Country data API request:', { action, countryCode, city })

    switch (action) {
      case 'get-country':
        if (!countryCode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Country code required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const country = countryData[countryCode as keyof typeof countryData]
        if (!country) {
          return new Response(
            JSON.stringify({ success: false, error: 'Country not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: country
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get-all-countries':
        return new Response(
          JSON.stringify({
            success: true,
            data: Object.values(countryData)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get-hospitals':
        if (!countryCode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Country code required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const hospitalCountry = countryData[countryCode as keyof typeof countryData]
        if (!hospitalCountry) {
          return new Response(
            JSON.stringify({ success: false, error: 'Country not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        let hospitalData = hospitalCountry.hospitals
        if (city) {
          const cityData = hospitalCountry.cities.find(c => 
            c.name.toLowerCase() === city.toLowerCase()
          )
          if (cityData) {
            hospitalData = {
              ...hospitalData,
              citySpecific: cityData
            }
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: hospitalData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get-hotels':
        if (!countryCode) {
          return new Response(
            JSON.stringify({ success: false, error: 'Country code required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const hotelCountry = countryData[countryCode as keyof typeof countryData]
        if (!hotelCountry) {
          return new Response(
            JSON.stringify({ success: false, error: 'Country not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: hotelCountry.hotels
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid action. Available actions: get-country, get-all-countries, get-hospitals, get-hotels'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Country data API error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})