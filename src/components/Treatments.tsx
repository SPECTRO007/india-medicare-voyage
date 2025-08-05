import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Brain, 
  Eye, 
  Bone, 
  Baby, 
  Scissors,
  Activity,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Treatments = () => {
  const navigate = useNavigate();
  
  const treatments = [
    {
      icon: Heart,
      name: "Cardiac Surgery",
      description: "World-class heart treatments including bypass, valve replacement, and angioplasty",
      priceRange: "$3,000 - $8,000",
      westernPrice: "$40,000 - $200,000",
      savings: "85%",
      duration: "5-7 days",
      popular: true
    },
    {
      icon: Bone,
      name: "Orthopedic Surgery",
      description: "Hip/knee replacements, spine surgery, and sports medicine treatments",
      priceRange: "$4,000 - $7,000",
      westernPrice: "$35,000 - $100,000",
      savings: "80%",
      duration: "7-10 days",
      popular: true
    },
    {
      icon: Eye,
      name: "Eye Care",
      description: "LASIK, cataract surgery, retinal treatments, and corneal transplants",
      priceRange: "$500 - $2,000",
      westernPrice: "$3,000 - $15,000",
      savings: "75%",
      duration: "2-3 days",
      popular: false
    },
    {
      icon: Brain,
      name: "Neurosurgery",
      description: "Brain tumor removal, spine surgery, and neurological treatments",
      priceRange: "$5,000 - $12,000",
      westernPrice: "$50,000 - $250,000",
      savings: "88%",
      duration: "7-14 days",
      popular: false
    },
    {
      icon: Baby,
      name: "IVF & Fertility",
      description: "In vitro fertilization, fertility treatments, and reproductive health",
      priceRange: "$2,500 - $4,000",
      westernPrice: "$15,000 - $30,000",
      savings: "78%",
      duration: "2-4 weeks",
      popular: true
    },
    {
      icon: Scissors,
      name: "Cosmetic Surgery",
      description: "Plastic surgery, hair transplant, and aesthetic procedures",
      priceRange: "$1,500 - $5,000",
      westernPrice: "$8,000 - $25,000",
      savings: "70%",
      duration: "3-5 days",
      popular: false
    },
    {
      icon: Activity,
      name: "Cancer Treatment",
      description: "Comprehensive oncology care with latest treatments and therapies",
      priceRange: "$3,000 - $15,000",
      westernPrice: "$30,000 - $200,000",
      savings: "85%",
      duration: "2-8 weeks",
      popular: true
    },
    {
      icon: Plus,
      name: "Wellness Packages",
      description: "Preventive health checkups and comprehensive medical screenings",
      priceRange: "$300 - $800",
      westernPrice: "$2,000 - $5,000",
      savings: "70%",
      duration: "1-2 days",
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Popular Medical Treatments
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our most sought-after medical procedures, all performed by internationally 
            trained doctors at world-class hospitals with significant cost savings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {treatments.map((treatment, index) => (
            <Card 
              key={treatment.name}
              className="p-6 h-full hover:shadow-card transition-all duration-300 hover:scale-105 animate-fade-in bg-gradient-card border-0 relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {treatment.popular && (
                <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
                  Popular
                </div>
              )}
              
              <div className="space-y-4">
                {/* Icon & Title */}
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <treatment.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{treatment.name}</h3>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {treatment.description}
                </p>

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">{treatment.priceRange}</div>
                    <div className="text-xs text-muted-foreground line-through">
                      International Price: {treatment.westernPrice}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-success/10 text-success px-2 py-1 rounded font-medium">
                      Save {treatment.savings}
                    </span>
                    <span className="text-muted-foreground">{treatment.duration} stay</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <Button variant="default" size="sm" className="w-full" onClick={() => navigate('/treatments')}>
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-card">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Treatment Options</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-card">
            <div className="text-3xl font-bold text-primary mb-2">100+</div>
            <div className="text-muted-foreground">Specialist Doctors</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-card">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Medical Support</div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-primary/5 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Can't find the treatment you're looking for?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We offer comprehensive medical services across all specialties. 
              Contact our medical advisors for personalized treatment options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate('/treatments')}>
                Get Custom Treatment Plan
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/treatments')}>
                Browse All Treatments
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Treatments;