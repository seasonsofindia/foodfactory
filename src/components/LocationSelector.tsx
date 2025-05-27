
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

  // Default location when no data is available
  const defaultLocation: Tables<'locations'> = {
    id: 'default-orlando',
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
      console.log("Fetching locations...");
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("display_name", { ascending: true });

      console.log("Locations query result:", { data, error });

      if (error) {
        console.error("Error fetching locations:", error);
        setError(error.message);
        // Set default location on error
        setLocations([defaultLocation]);
      } else if (data && data.length > 0) {
        console.log("Locations loaded:", data.length, "locations");
        setLocations(data);
      } else {
        console.log("No locations data returned, using default location");
        setLocations([defaultLocation]);
      }
    } catch (error) {
      console.error("Exception while fetching locations:", error);
      setError("Failed to fetch locations");
      // Set default location on exception
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
            <p className="text-yellow-600 mb-2">Unable to load locations from database: {error}</p>
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
