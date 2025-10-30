import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Search,
  Filter,
  Camera,
  Utensils,
  Mountain,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function TourPackages() {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const cities = ['Chennai', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi', 'Kolkata', 'Kerala', 'Goa'];
  const categories = ['Cultural', 'Spiritual', 'Adventure', 'Wellness', 'Heritage', 'Nature'];

  const categoryIcons = {
    'Cultural': Building,
    'Spiritual': Mountain,
    'Adventure': Camera,
    'Wellness': Star,
    'Heritage': Building,
    'Nature': Mountain
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTourPackages();
  }, [user, navigate]);

  useEffect(() => {
    filterPackages();
  }, [packages, searchTerm, selectedCity, selectedCategory]);

  const fetchTourPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching tour packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPackages = () => {
    let filtered = packages;

    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(pkg => pkg.city === selectedCity);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pkg => pkg.category === selectedCategory);
    }

    setFilteredPackages(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Tour Packages</h1>
        <p className="text-muted-foreground">
          Discover India's rich culture and heritage while receiving world-class medical care
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Destinations</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Popular Packages Highlight */}
      <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Popular Medical + Tourism Combinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="font-semibold">Kerala Ayurveda Retreat</h3>
            <p className="text-sm text-muted-foreground">Wellness treatments + backwater tours</p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="font-semibold">Delhi Heritage Tour</h3>
            <p className="text-sm text-muted-foreground">Cardiac surgery + historical sites</p>
          </div>
          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="font-semibold">Chennai Cultural Experience</h3>
            <p className="text-sm text-muted-foreground">Orthopedic care + temple tours</p>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          const IconComponent = categoryIcons[pkg.category] || MapPin;
          
          return (
            <Card key={pkg.id} className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="relative">
                <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                  <IconComponent className="h-16 w-16 text-primary" />
                </div>
                <Badge className="absolute top-2 right-2 bg-white text-primary">
                  {pkg.category}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{pkg.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{pkg.city}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {pkg.description}
                </p>

                {pkg.highlights && pkg.highlights.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm">Highlights:</h4>
                    <div className="space-y-1">
                      {pkg.highlights.slice(0, 3).map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-xs text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">per person</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      View Details
                    </Button>
                    <Button className="flex-1" size="sm">
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPackages.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No packages found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all packages
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCity('all');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}