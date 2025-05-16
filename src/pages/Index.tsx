
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import KitchenCard from "@/components/KitchenCard";
import { MapPin, PhoneCall } from "lucide-react";
import LocationSelector from "@/components/LocationSelector";

const Index = () => {
  const [kitchens, setKitchens] = useState<(Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  })[]>([]);
  const [location, setLocation] = useState<Tables<'locations'> | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    fetchDefaultLocation();
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      fetchLocationDetails(selectedLocationId);
      fetchKitchens(selectedLocationId);
    }
  }, [selectedLocationId]);

  const fetchDefaultLocation = async () => {
    // Get the default location
    const { data: locationData, error: locationError } = await supabase
      .from("locations")
      .select("id")
      .eq("is_default", true)
      .limit(1)
      .single();

    if (!locationError && locationData) {
      setSelectedLocationId(locationData.id);
    } else {
      console.error("Error fetching default location:", locationError);
      // Fallback: Get first location if no default is set
      const { data, error } = await supabase
        .from("locations")
        .select("id")
        .limit(1)
        .single();
      
      if (!error && data) {
        setSelectedLocationId(data.id);
      }
    }
  };

  const fetchLocationDetails = async (locationId: string) => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", locationId)
      .single();

    if (!error && data) {
      setLocation(data);
    } else {
      console.error("Error fetching location details:", error);
    }
  };

  const fetchKitchens = async (locationId: string) => {
    const { data, error } = await supabase
      .from("kitchens")
      .select(`
        *,
        menu_items (*),
        ordering_links (*)
      `)
      .eq("location_id", locationId)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setKitchens(data);
    } else {
      console.error("Error fetching kitchens:", error);
    }
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
  };

  if (!location) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Our Kitchens @ {location.name}</h1>
        <LocationSelector 
          onLocationChange={handleLocationChange}
          className="self-start"
        />
      </div>
      <div className="flex items-center">
        <MapPin className="mr-2 h-5 w-5 text-green-600" />
        <a 
          href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xl font-bold hover:text-green-600 transition-colors"
        >
          {location.address}
        </a>
      </div>
      {location.phone_number && (
        <div className="flex items-center">
          <PhoneCall className="mr-2 h-5 w-5 text-green-600" />
          <a 
            href={`tel:${location.phone_number.replace(/\D/g, '')}`}
            className="text-xl font-bold hover:text-green-600 transition-colors"
          >
            {location.phone_number}
          </a>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kitchens.map((kitchen) => (
          <KitchenCard key={kitchen.id} kitchen={kitchen} />
        ))}
      </div>
    </div>
  );
};

export default Index;
