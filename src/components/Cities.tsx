import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Hospital, Plane, Star } from "lucide-react";
import citiesImage from "@/assets/cities-collage.jpg";

const Cities = () => {
  const cities = [
    {
      name: "Chennai",
      subtitle: "Healthcare Capital of India",
      description: "Home to Apollo Hospitals and world-renowned cardiac care centers. Known for exceptional medical expertise at affordable costs.",
      specialties: ["Cardiac Surgery", "Oncology", "Orthopedics", "Organ Transplants"],
      hospitals: "50+ Partner Hospitals",
      rating: 4.8,
      highlight: "Leading cardiac care destination"
    },
    {
      name: "Bengaluru",
      subtitle: "Silicon Valley of India",
      description: "Combines cutting-edge technology with medical excellence. Top destination for neurology and advanced surgical procedures.",
      specialties: ["Neurosurgery", "Plastic Surgery", "IVF", "Robotic Surgery"],
      hospitals: "40+ Partner Hospitals",
      rating: 4.9,
      highlight: "Most advanced medical technology"
    },
    {
      name: "Hyderabad",
      subtitle: "Cyberabad Medical Hub",
      description: "Modern medical infrastructure with international standards. Excellent for complex surgeries and specialized treatments.",
      specialties: ["Gastroenterology", "Urology", "Pediatrics", "Dermatology"],
      hospitals: "35+ Partner Hospitals",
      rating: 4.7,
      highlight: "Cost-effective quality care"
    },
    {
      name: "Mumbai",
      subtitle: "Commercial Capital",
      description: "Premier medical facilities with world-class infrastructure. Gateway to India with excellent connectivity and luxury amenities.",
      specialties: ["Cancer Treatment", "Eye Care", "Cosmetic Surgery", "Fertility"],
      hospitals: "60+ Partner Hospitals",
      rating: 4.8,
      highlight: "Luxury medical tourism hub"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Top Medical Tourism Destinations
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover India's leading healthcare cities, each offering unique advantages 
            and specialized medical expertise for international patients.
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-16 relative rounded-3xl overflow-hidden shadow-hero">
          <img 
            src={citiesImage} 
            alt="Medical tourism cities in India" 
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Four World-Class Medical Destinations</h3>
              <p className="text-white/90">Chennai • Bengaluru • Hyderabad • Mumbai</p>
            </div>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cities.map((city, index) => (
            <Card 
              key={city.name}
              className="p-8 h-full hover:shadow-card transition-all duration-300 hover:scale-[1.02] animate-fade-in bg-gradient-card border-0"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-foreground">{city.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{city.rating}</span>
                    </div>
                  </div>
                  <p className="text-primary font-medium">{city.subtitle}</p>
                  <p className="text-muted-foreground leading-relaxed">{city.description}</p>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Medical Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {city.specialties.map((specialty) => (
                      <span 
                        key={specialty}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Hospital className="w-4 h-4" />
                    <span>{city.hospitals}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{city.highlight}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex gap-3">
                  <Button variant="default" size="sm" className="flex-1">
                    <Plane className="w-4 h-4" />
                    View Packages
                  </Button>
                  <Button variant="soft" size="sm" className="flex-1">
                    Find Doctors
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-primary/5 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Not sure which city is right for you?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our medical advisors will help you choose the best destination based on your 
              specific treatment needs, budget, and preferences.
            </p>
            <Button variant="hero" size="lg">
              Get Personalized Recommendations
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cities;