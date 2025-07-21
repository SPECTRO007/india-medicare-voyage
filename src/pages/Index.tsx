import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import Treatments from "@/components/Treatments";
import Cities from "@/components/Cities";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Treatments />
        <Cities />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
