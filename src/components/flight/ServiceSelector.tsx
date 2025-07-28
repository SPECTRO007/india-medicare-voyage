import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { flightService, type ServiceOption } from '@/services/FlightService';

interface ServiceSelectorProps {
  onServicesSelected: (services: ServiceOption[]) => void;
  selectedServices: ServiceOption[];
}

export function ServiceSelector({ onServicesSelected, selectedServices }: ServiceSelectorProps) {
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadServiceOptions();
  }, []);

  const loadServiceOptions = async () => {
    try {
      setLoading(true);
      const services = await flightService.getServiceOptions();
      setServiceOptions(services);
    } catch (error) {
      console.error('Error loading service options:', error);
      toast({
        title: "Error",
        description: "Failed to load service options",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service: ServiceOption, checked: boolean) => {
    if (checked) {
      onServicesSelected([...selectedServices, service]);
    } else {
      onServicesSelected(selectedServices.filter(s => s.id !== service.id));
    }
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const groupedServices = serviceOptions.reduce((groups, service) => {
    const category = service.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(service);
    return groups;
  }, {} as Record<string, ServiceOption[]>);

  const totalServiceCost = selectedServices.reduce((sum, service) => sum + service.price, 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'baggage': return '🧳';
      case 'boarding': return '🎫';
      case 'comfort': return '🛋️';
      case 'insurance': return '🛡️';
      case 'convenience': return '⚡';
      default: return '📋';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'baggage': return 'Baggage Services';
      case 'boarding': return 'Boarding Services';
      case 'comfort': return 'Comfort & Lounge';
      case 'insurance': return 'Insurance & Protection';
      case 'convenience': return 'Convenience Services';
      default: return 'Other Services';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Additional Services (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Services (Optional)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enhance your travel experience with these optional services.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Service Categories */}
          {Object.entries(groupedServices).map(([category, services]) => (
            <div key={category} className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span>{getCategoryIcon(category)}</span>
                {getCategoryTitle(category)}
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                {services.map(service => {
                  const isSelected = isServiceSelected(service.id);
                  
                  return (
                    <div 
                      key={service.id} 
                      className={`border rounded-lg p-4 transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={service.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <label 
                            htmlFor={service.id}
                            className="font-medium cursor-pointer"
                          >
                            {service.name}
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.description}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">₹{service.price}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Selected Services Summary */}
          {selectedServices.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Selected Services:</h4>
              <div className="space-y-2">
                {selectedServices.map(service => (
                  <div key={service.id} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span>{getCategoryIcon(service.category)}</span>
                      {service.name}
                    </span>
                    <span className="font-medium">₹{service.price}</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total Service Cost:</span>
                  <span>₹{totalServiceCost}</span>
                </div>
              </div>
            </div>
          )}

          {selectedServices.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No additional services selected.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}