import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { flightService, type Seat, type Flight } from '@/services/FlightService';

interface SeatSelectorProps {
  flight: Flight;
  passengers: number;
  onSeatsSelected: (seats: Seat[]) => void;
  selectedSeats: Seat[];
}

export function SeatSelector({ flight, passengers, onSeatsSelected, selectedSeats }: SeatSelectorProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatMapLayout, setSeatMapLayout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSeatMap();
  }, [flight.id]);

  const loadSeatMap = async () => {
    try {
      setLoading(true);
      const { seats: seatData, seatMapLayout: layout } = await flightService.getSeatMap(flight.id, flight.aircraft);
      setSeats(seatData);
      setSeatMapLayout(layout);
    } catch (error) {
      console.error('Error loading seat map:', error);
      toast({
        title: "Error",
        description: "Failed to load seat map",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.available) return;

    const isSelected = selectedSeats.some(s => s.number === seat.number);
    
    if (isSelected) {
      // Remove seat
      const newSelectedSeats = selectedSeats.filter(s => s.number !== seat.number);
      onSeatsSelected(newSelectedSeats);
    } else {
      // Add seat if not exceeding passenger count
      if (selectedSeats.length < passengers) {
        onSeatsSelected([...selectedSeats, seat]);
      } else {
        toast({
          title: "Seat limit reached",
          description: `You can only select ${passengers} seat(s)`,
          variant: "destructive",
        });
      }
    }
  };

  const getSeatColor = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.number === seat.number);
    
    if (isSelected) return 'bg-primary text-primary-foreground';
    if (!seat.available) return 'bg-muted text-muted-foreground cursor-not-allowed';
    
    switch (seat.class) {
      case 'first': return 'bg-purple-100 hover:bg-purple-200 border-purple-300';
      case 'business': return 'bg-blue-100 hover:bg-blue-200 border-blue-300';
      case 'premium_economy': return 'bg-green-100 hover:bg-green-200 border-green-300';
      default: return 'bg-gray-50 hover:bg-gray-100 border-gray-300';
    }
  };

  const getSeatIcon = (seat: Seat) => {
    if (seat.type === 'window') return '🪟';
    if (seat.type === 'aisle') return '🚶';
    return '◯';
  };

  const totalExtraFees = selectedSeats.reduce((sum, seat) => sum + seat.extraFee, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Your Seats</CardTitle>
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
        <CardTitle>Select Your Seats - {flight.aircraft}</CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
            <span>First Class</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Business</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Premium Economy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
            <span>Economy</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Seat Map */}
          <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
            <div className="text-center text-sm text-muted-foreground mb-4">← Front of Aircraft</div>
            
            <div className="grid gap-1 min-w-max mx-auto" style={{ 
              gridTemplateColumns: `repeat(${seatMapLayout?.seatsPerRow?.length || 6}, 1fr)` 
            }}>
              {/* Seat letters header */}
              {seatMapLayout?.seatsPerRow?.map((letter: string) => (
                <div key={letter} className="w-8 h-6 flex items-center justify-center text-xs font-medium">
                  {letter}
                </div>
              ))}
              
              {/* Seat rows */}
              {Array.from({ length: seatMapLayout?.rows || 0 }, (_, rowIndex) => {
                const rowNumber = rowIndex + 1;
                const rowSeats = seats.filter(seat => seat.row === rowNumber);
                
                return rowSeats.map(seat => (
                  <button
                    key={seat.number}
                    onClick={() => handleSeatClick(seat)}
                    disabled={!seat.available}
                    className={`
                      w-8 h-8 text-xs border rounded transition-colors flex items-center justify-center
                      ${getSeatColor(seat)}
                      ${seat.available ? 'cursor-pointer' : 'cursor-not-allowed'}
                    `}
                    title={`Seat ${seat.number} - ${seat.type} - ${seat.class} ${seat.extraFee > 0 ? `(+₹${seat.extraFee})` : ''}`}
                  >
                    {getSeatIcon(seat)}
                  </button>
                ));
              })}
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-4">← Rear of Aircraft</div>
          </div>

          {/* Selected Seats Summary */}
          {selectedSeats.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Seats:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(seat => (
                  <Badge key={seat.number} variant="secondary" className="flex items-center gap-1">
                    {seat.number} ({seat.type})
                    {seat.extraFee > 0 && <span className="text-xs">+₹{seat.extraFee}</span>}
                    <button 
                      onClick={() => handleSeatClick(seat)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              {totalExtraFees > 0 && (
                <p className="text-sm text-muted-foreground">
                  Total seat fees: ₹{totalExtraFees}
                </p>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span>🪟 Window</span>
              <span>🚶 Aisle</span>
              <span>◯ Middle</span>
            </div>
            <p className="text-muted-foreground">
              Select {passengers} seat(s) for your passengers. Extra fees may apply for premium seats.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}