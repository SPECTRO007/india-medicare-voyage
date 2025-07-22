import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Calendar, MapPin, Clock } from 'lucide-react';

export default function Flights() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Flight Booking</h1>
        <p className="text-muted-foreground">Find the best flights to India for your medical journey</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Search Flights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Flight Integration Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              We're working on integrating flight booking services. For now, please contact our travel coordinators.
            </p>
            <Button>Contact Travel Coordinator</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}