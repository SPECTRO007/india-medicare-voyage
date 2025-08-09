import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Shield, Star } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="World-class medical facility in India" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary-light/30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Medical Tourism in India
            <span className="block text-secondary">World-class care, start to finish</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Discover India’s leading hospitals and renowned specialists through our platform. From treatment planning to travel arrangements, we offer transparent pricing, personalized care, and end-to-end support — so you can focus on your health while we handle the rest.
          </p>

          {/* Key Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl font-bold text-secondary">0</div>
              <div className="text-sm text-white/80">Countries Served</div>
            </div>
            <div className="text-center animate-scale-in" style={{ animationDelay: '0.5s' }}>
              <div className="text-3xl font-bold text-secondary">0+</div>
              <div className="text-sm text-white/80">Partner Hospitals</div>
            </div>
            <div className="text-center animate-scale-in" style={{ animationDelay: '0.7s' }}>
              <div className="text-3xl font-bold text-secondary">0</div>
              <div className="text-sm text-white/80">Happy Patients</div>
            </div>
            <div className="text-center animate-scale-in" style={{ animationDelay: '0.9s' }}>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-secondary fill-current" />
                <span className="text-3xl font-bold text-secondary">0</span>
              </div>
              <div className="text-sm text-white/80">Patient Rating</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4 h-14 animate-scale-in"
              style={{ animationDelay: '1.1s' }}
              onClick={() => navigate('/treatments')}
            >
              Explore Treatments
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 h-14 text-primary border-primary hover:bg-primary hover:text-white animate-scale-in"
              style={{ animationDelay: '1.3s' }}
              onClick={() => navigate('/auth')}
            >
              Free Consultation
            </Button>


          </div>

          <div className="mt-8 text-white/70 animate-fade-in" style={{ animationDelay: '1.5s' }}>
            <p className="text-sm">✓ No hidden fees  ✓ 24/7 support  ✓ Verified hospitals</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-white/70 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;