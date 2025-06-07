
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import KitchenCard from "@/components/KitchenCard";
import { MapPin, PhoneCall } from "lucide-react";

const DEFAULT_LOCATION_ID = '331c7d5d-ec2b-4289-81f8-dccb74d39571';

const Index = () => {
  const [kitchens, setKitchens] = useState<(Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  })[]>([]);
  const [location, setLocation] = useState<null | Tables<'locations'>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching default location and its kitchens...");
      
      // Fetch default location
      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .select("*")
        .eq("id", DEFAULT_LOCATION_ID)
        .single();
      
      console.log("Default location data:", locationData);
      console.log("Default location error:", locationError);
      
      if (locationError) {
        console.error("Error fetching location:", locationError);
        setError(`Error fetching location: ${locationError.message}`);
        return;
      }
      
      setLocation(locationData);

      // Fetch kitchens for the default location
      const { data: kitchensData, error: kitchensError } = await supabase
        .from("kitchens")
        .select(`
          *,
          menu_items (*),
          ordering_links (*)
        `)
        .eq('locationids', DEFAULT_LOCATION_ID)
        .eq('active_kitchen', true)
        .order('sort_order', { ascending: true });

      console.log("Kitchens for default location:", kitchensData);
      console.log("Kitchens error:", kitchensError);

      if (kitchensError) {
        console.error("Error fetching kitchens:", kitchensError);
        setError(`Error fetching kitchens: ${kitchensError.message}`);
        return;
      }

      setKitchens(kitchensData || []);
    } catch (error) {
      console.error("Unexpected error:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Our Kitchens @ {location ? location.display_name : "Loading..."}
      </h1>
      <div className="flex items-center">
        <MapPin className="mr-2 h-5 w-5 text-green-600" />
        <a 
          href={location ? `https://maps.google.com/?q=${encodeURIComponent(location.address)}` : "#"}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xl font-bold hover:text-green-600 transition-colors"
        >
          {location ? location.address : "Loading..."}
        </a>
      </div>
      <div className="flex items-center">
        <PhoneCall className="mr-2 h-5 w-5 text-green-600" />
        <a 
          href={location ? `tel:${location.phone_number}` : "#"}
          className="text-xl font-bold hover:text-green-600 transition-colors"
        >
          {location ? location.phone_number : "Loading..."}
        </a>
      </div>
      
      {kitchens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchens.map((kitchen) => (
            <KitchenCard key={kitchen.id} kitchen={kitchen} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div>No kitchens found for this location.</div>
          <div className="text-sm mt-2">Check console for debug information.</div>
        </div>
      )}
    </div>
  );
};

export default Index;
