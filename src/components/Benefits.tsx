import { Card } from "@/components/ui/card";
import { 
  DollarSign, 
  Clock, 
  Award, 
  Users, 
  Plane, 
  HeartHandshake,
  Shield,
  Stethoscope 
} from "lucide-react";

const Benefits = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "70% Cost Savings",
      description: "Get world-class treatment at a fraction of Western prices without compromising on quality.",
      color: "text-green-600"
    },
    {
      icon: Clock,
      title: "No Waiting Lists",
      description: "Skip the long wait times. Get your treatment scheduled within days, not months.",
      color: "text-blue-600"
    },
    {
      icon: Award,
      title: "JCI Accredited Hospitals",
      description: "All our partner hospitals meet international standards with JCI accreditation.",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "Internationally Trained Doctors",
      description: "Our doctors are trained in top medical schools in US, UK, and Europe.",
      color: "text-primary"
    },
    {
      icon: Plane,
      title: "Complete Travel Support",
      description: "From visa assistance to local transport, we handle everything for your journey.",
      color: "text-orange-600"
    },
    {
      icon: HeartHandshake,
      title: "Personalized Care",
      description: "Dedicated care coordinators ensure your comfort throughout the treatment.",
      color: "text-red-600"
    },
    {
      icon: Shield,
      title: "Insurance Coordination",
      description: "We work with your insurance provider to maximize your coverage benefits.",
      color: "text-indigo-600"
    },
    {
      icon: Stethoscope,
      title: "Latest Technology",
      description: "Access to cutting-edge medical equipment and advanced treatment procedures.",
      color: "text-teal-600"
    }
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose Medical Tourism in India?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            India has become the world's leading destination for medical tourism, 
            combining excellent healthcare with significant cost savings and rich cultural experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="p-6 h-full hover:shadow-card transition-all duration-300 hover:scale-105 animate-fade-in bg-gradient-card border-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`p-3 rounded-full bg-white shadow-md ${benefit.color}`}>
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="mt-20 bg-white rounded-2xl p-8 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-primary mb-2">$4.4B</div>
              <div className="text-muted-foreground">Medical Tourism Market</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl font-bold text-primary mb-2">2M+</div>
              <div className="text-muted-foreground">Annual Medical Tourists</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-4xl font-bold text-primary mb-2">43</div>
              <div className="text-muted-foreground">JCI Accredited Hospitals</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Patient Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;