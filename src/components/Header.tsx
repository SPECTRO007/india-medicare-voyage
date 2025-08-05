import { Button } from "@/components/ui/button";
import { Heart, Menu, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: "Treatments", href: "/treatments" },
    { name: "Hospitals", href: "/hospitals" },
    { name: "Tour Packages", href: "/tour-packages" },
    { name: "Doctors", href: "/doctors" },
    { name: "About", href: "#about" }
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      {/* Top Bar */}
      <div className="border-b border-border/50 bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>+91-8592857418</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>medglobal.zync@gmail.com</span>
              </div>
            </div>
            <div className="text-xs">
              🌍 Global Network • 🛡️ Verified Hospitals • 💰 Transparent Pricing
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="MEDGLOBAL_logo.png" 
              alt="MedGlobal Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <div className="font-bold text-xl text-foreground">MedGlobal</div>
              <div className="text-xs text-muted-foreground -mt-1">Global Medical Tourism</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              item.href.startsWith('#') ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button variant="hero" size="sm" onClick={() => navigate('/auth')}>
              Free Consultation
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navigation.map((item) => (
                item.href.startsWith('#') ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-foreground hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block text-foreground hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              <div className="border-t pt-4 space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" className="w-full" onClick={() => navigate('/auth')}>
                  Free Consultation
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;