import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  Brain, 
  Eye, 
  Bone, 
  Baby, 
  Scissors,
  Activity,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categoryIcons = {
    'Cardiac': Heart,
    'Orthopedic': Bone,
    'Eye Care': Eye,
    'Neurosurgery': Brain,
    'Fertility': Baby,
    'Cosmetic': Scissors,
    'Oncology': Activity,
    'Wellness': Plus
  };

  const cities = ['Chennai', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Delhi', 'Kolkata'];
  const categories = ['Cardiac', 'Orthopedic', 'Eye Care', 'Neurosurgery', 'Fertility', 'Cosmetic', 'Oncology', 'Wellness'];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTreatments();
  }, [user, navigate]);

  useEffect(() => {
    filterTreatments();
  }, [treatments, searchTerm, selectedCity, selectedCategory]);

  const fetchTreatments = async () => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .order('featured', { ascending: false });

      if (error) throw error;
      setTreatments(data || []);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTreatments = () => {
    let filtered = treatments;

    if (searchTerm) {
      filtered = filtered.filter(treatment =>
        treatment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(treatment => treatment.city === selectedCity);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(treatment => treatment.category === selectedCategory);
    }

    setFilteredTreatments(filtered);
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
        <h1 className="text-3xl font-bold mb-2">Medical Treatments</h1>
        <p className="text-muted-foreground">
          Explore world-class medical treatments at Indian hospitals with significant cost savings
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Treatments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
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

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {filteredTreatments.length} treatment{filteredTreatments.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Treatments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTreatments.map((treatment) => {
          const IconComponent = categoryIcons[treatment.category] || Activity;
          
          return (
            <Card key={treatment.id} className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
              {treatment.featured && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-secondary text-secondary-foreground">Featured</Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{treatment.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{treatment.city}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {treatment.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(treatment.price_inr)}
                    </span>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground line-through">
                        US: {formatPrice(treatment.price_usd)}
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Save {treatment.savings_percent}%
                      </Badge>
                    </div>
                  </div>
                  
                  {treatment.duration && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {treatment.duration}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1">
                    Book Consultation
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTreatments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No treatments found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all treatments
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