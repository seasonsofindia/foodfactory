
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, PhoneCall } from "lucide-react";

interface LocationSelectorProps {
  onLocationSelect: (location: Tables<'locations'>) => void;
}

const LocationSelector = ({ onLocationSelect }: LocationSelectorProps) => {
  const [locations, setLocations] = useState<Tables<'locations'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default location with the specified ID
  const defaultLocation: Tables<'locations'> = {
    id: '331c7d5d-ec2b-4289-81f8-dccb74d39571',
    display_name: 'Orlando Kitchen Incubator',
    nick_name: 'orlando',
    address: '123 Innovation Way, Orlando, FL 32801',
    phone_number: '(407) 555-0123',
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      console.log("Fetching locations from Supabase...");
      
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("sort_order", { ascending: true });

      console.log("Locations query response:", { data, error });

      if (error) {
        console.error("Supabase error fetching locations:", error);
        setError(`Database error: ${error.message}`);
        // Use default location on error
        console.log("Using default location due to error");
        setLocations([defaultLocation]);
      } else {
        if (data && data.length > 0) {
          console.log(`Successfully loaded ${data.length} locations:`, data);
          setLocations(data);
        } else {
          console.log("No locations found in database, using default location");
          setLocations([defaultLocation]);
        }
      }
    } catch (exception) {
      console.error("Exception while fetching locations:", exception);
      setError("Failed to connect to database");
      // Use default location on exception
      console.log("Using default location due to exception");
      setLocations([defaultLocation]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Food Factory</h1>
          <p className="text-xl text-gray-600">Choose your location to explore our kitchens</p>
        </div>
        
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-600 mb-2">Unable to load locations: {error}</p>
            <p className="text-sm text-yellow-500">Showing default location below</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-green-700">{location.display_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="text-sm">{location.address}</span>
                </div>
                {location.phone_number && (
                  <div className="flex items-center text-gray-600">
                    <PhoneCall className="mr-2 h-4 w-4" />
                    <span className="text-sm">{location.phone_number}</span>
                  </div>
                )}
                <Button 
                  onClick={() => onLocationSelect(location)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  View Kitchens at {location.nick_name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
