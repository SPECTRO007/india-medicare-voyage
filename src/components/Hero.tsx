import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Shield, Star } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

const Hero = () => {
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

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 animate-float">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Heart className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            World-Class Healthcare
            <span className="block text-secondary">at Indian Prices</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Access premium medical treatments in India's top hospitals. Save up to 70% while experiencing 
            exceptional care from internationally trained doctors.
          </p>

          {/* Key Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl font-bold text-secondary">70%</div>
              <div className="text-sm text-white/80">Cost Savings</div>
            </div>
            <div className="text-center animate-scale-in" style={{ animationDelay: '0.5s' }}>
              <div className="text-3xl font-bold text-secondary">500+</div>
              <div className="text-sm text-white/80">Partner Hospitals</div>
            </div>
            <div className="text-center animate-scale-in" style={{ animationDelay: '0.7s' }}>
              <div className="text-3xl font-bold text-secondary">50,000+</div>
              <div className="text-sm text-white/80">Happy Patients</div>
            </div>
            <div className="text-center animate-scale-in" style={{ animationDelay: '0.9s' }}>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-secondary fill-current" />
                <span className="text-3xl font-bold text-secondary">4.9</span>
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
            >
              Explore Treatments
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 h-14 text-white border-white hover:bg-white hover:text-primary animate-scale-in"
              style={{ animationDelay: '1.3s' }}
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