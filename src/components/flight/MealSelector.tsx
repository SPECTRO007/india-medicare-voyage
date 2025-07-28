import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { flightService, type MealOption } from '@/services/FlightService';

interface MealSelectorProps {
  passengers: number;
  onMealsSelected: (meals: MealOption[]) => void;
  selectedMeals: MealOption[];
}

export function MealSelector({ passengers, onMealsSelected, selectedMeals }: MealSelectorProps) {
  const [mealOptions, setMealOptions] = useState<MealOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMealOptions();
  }, []);

  const loadMealOptions = async () => {
    try {
      setLoading(true);
      const meals = await flightService.getMealOptions();
      setMealOptions(meals);
    } catch (error) {
      console.error('Error loading meal options:', error);
      toast({
        title: "Error",
        description: "Failed to load meal options",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMealSelect = (meal: MealOption) => {
    const existingMealIndex = selectedMeals.findIndex(m => m.id === meal.id);
    
    if (existingMealIndex >= 0) {
      // Remove one instance of this meal
      const newSelectedMeals = [...selectedMeals];
      newSelectedMeals.splice(existingMealIndex, 1);
      onMealsSelected(newSelectedMeals);
    } else {
      // Add meal if not exceeding passenger count
      if (selectedMeals.length < passengers) {
        onMealsSelected([...selectedMeals, meal]);
      } else {
        toast({
          title: "Meal limit reached",
          description: `You can only select ${passengers} meal(s)`,
          variant: "destructive",
        });
      }
    }
  };

  const getMealCount = (mealId: string) => {
    return selectedMeals.filter(m => m.id === mealId).length;
  };

  const totalMealCost = selectedMeals.reduce((sum, meal) => sum + meal.price, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Meals (Optional)</CardTitle>
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
        <CardTitle>Select Meals (Optional)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose special meals for your flight. You can select up to {passengers} meal(s).
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Meal Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealOptions.map(meal => {
              const count = getMealCount(meal.id);
              
              return (
                <div key={meal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{meal.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {meal.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {meal.dietary.map(diet => (
                          <Badge key={diet} variant="outline" className="text-xs">
                            {diet}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-medium">₹{meal.price}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMealSelect(meal)}
                        disabled={count === 0}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{count}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMealSelect(meal)}
                        disabled={selectedMeals.length >= passengers}
                      >
                        +
                      </Button>
                    </div>
                    
                    {count > 0 && (
                      <div className="text-sm font-medium">
                        ₹{meal.price * count}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Meals Summary */}
          {selectedMeals.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Selected Meals:</h4>
              <div className="space-y-2">
                {mealOptions
                  .filter(meal => getMealCount(meal.id) > 0)
                  .map(meal => {
                    const count = getMealCount(meal.id);
                    return (
                      <div key={meal.id} className="flex justify-between items-center text-sm">
                        <span>{meal.name} × {count}</span>
                        <span className="font-medium">₹{meal.price * count}</span>
                      </div>
                    );
                  })}
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total Meal Cost:</span>
                  <span>₹{totalMealCost}</span>
                </div>
              </div>
            </div>
          )}

          {selectedMeals.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No meals selected. Standard meal service will be provided on this flight.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}