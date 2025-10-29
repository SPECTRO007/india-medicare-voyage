import { Card, CardContent } from "@/components/ui/card";
import hospital1 from "@/assets/hospital-1.jpg";
import hospital2 from "@/assets/hospital-2.jpg";
import hospital3 from "@/assets/hospital-3.jpg";
import hospital4 from "@/assets/hospital-4.jpg";

const HospitalShowcase = () => {
  const hospitals = [
    {
      image: hospital1,
      title: "State-of-the-Art Facilities",
      description: "Modern architecture and world-class infrastructure designed for your comfort and care"
    },
    {
      image: hospital2,
      title: "Advanced ICU & Critical Care",
      description: "Equipped with cutting-edge medical technology and 24/7 expert monitoring"
    },
    {
      image: hospital3,
      title: "Premium Patient Experience",
      description: "Luxurious lobbies and comfortable waiting areas that prioritize your well-being"
    },
    {
      image: hospital4,
      title: "Advanced Surgical Excellence",
      description: "Modern operating rooms with the latest surgical equipment and expert medical teams"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            World-Class Indian Hospitals
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Experience India's finest medical facilities, combining international standards with compassionate care and affordable pricing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {hospitals.map((hospital, index) => (
            <Card 
              key={index} 
              className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2"
            >
              <div className="relative overflow-hidden aspect-video">
                <img 
                  src={hospital.image} 
                  alt={hospital.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {hospital.title}
                </h3>
                <p className="text-muted-foreground">
                  {hospital.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>JCI Accredited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>NABH Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>International Standards</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Expert Medical Teams</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalShowcase;
