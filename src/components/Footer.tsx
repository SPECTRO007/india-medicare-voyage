import { Button } from "@/components/ui/button";
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl">MedGlobal</div>
                <div className="text-sm text-primary-foreground/80">Medical Tourism</div>
              </div>
            </div>
            
            <p className="text-primary-foreground/90 leading-relaxed max-w-md">
              Connecting patients worldwide with India's finest healthcare facilities. 
              Experience world-class medical treatment at affordable prices with complete 
              care coordination and travel support.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+91-8592857418 (24/7)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">medglobal.zync@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Manipal, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Medical Services</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/90">
              <li><Link to="/treatments" className="hover:text-white transition-colors">Cardiac Surgery</Link></li>
              <li><Link to="/treatments" className="hover:text-white transition-colors">Orthopedic Surgery</Link></li>
              <li><Link to="/treatments" className="hover:text-white transition-colors">Cancer Treatment</Link></li>
              <li><Link to="/treatments" className="hover:text-white transition-colors">Neurosurgery</Link></li>
              <li><Link to="/treatments" className="hover:text-white transition-colors">IVF & Fertility</Link></li>
              <li><Link to="/treatments" className="hover:text-white transition-colors">Eye Care</Link></li>
              <li><Link to="/treatments" className="hover:text-white transition-colors">Cosmetic Surgery</Link></li>
            </ul>
          </div>

          {/* Destinations */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Destinations</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/90">
              <li><Link to="/hospitals" className="hover:text-white transition-colors">Chennai</Link></li>
              <li><Link to="/hospitals" className="hover:text-white transition-colors">Bengaluru</Link></li>
              <li><Link to="/hospitals" className="hover:text-white transition-colors">Hyderabad</Link></li>
              <li><Link to="/hospitals" className="hover:text-white transition-colors">Mumbai</Link></li>
              <li><Link to="/hospitals" className="hover:text-white transition-colors">Delhi</Link></li>
              <li><Link to="/hospitals" className="hover:text-white transition-colors">Kochi</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Company</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/90">
              <li><span className="hover:text-white transition-colors cursor-pointer">About Us</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Our Mission</span></li>
              <li><Link to="/hospitals" className="hover:text-white transition-colors">Partner Hospitals</Link></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Success Stories</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Blog</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Careers</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Contact</span></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-primary-foreground/90 text-sm">
              Get the latest updates on treatments, offers, and medical travel tips.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-foreground bg-white/10 border border-white/20 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button variant="secondary" size="sm" className="px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Social Links & Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center md:text-right text-sm text-primary-foreground/80">
              <div className="mb-1">
                © 2025 MedGlobal Medical Tourism. All rights reserved.
              </div>
              <div className="space-x-4">
                <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
                <span>•</span>
                <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
                <span>•</span>
                <span className="hover:text-white transition-colors cursor-pointer">Medical Disclaimer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="border-t border-primary-foreground/20 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-primary-foreground/70">
            <span>🏥 JCI Accredited Hospitals</span>
            <span>🔒 HIPAA Compliant</span>
            <span>✅ ISO 9001:2015 Certified</span>
            <span>🛡️ Medical Insurance Accepted</span>
            <span>📞 24/7 Emergency Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;