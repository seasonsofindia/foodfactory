
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import KitchenCard from "@/components/KitchenCard";
import { MapPin, PhoneCall } from "lucide-react";

const Index = () => {
  const [kitchens, setKitchens] = useState<(Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  })[]>([]);
  const [location, setLocation] = useState<Tables<'locations'> | null>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    // Get the default location or first location
    const { data: locationData, error: locationError } = await supabase
      .from("locations")
      .select("*")
      .order("is_default", { ascending: false })
      .limit(1)
      .single();

    if (!locationError && locationData) {
      setLocation(locationData);
      fetchKitchens(locationData.id);
    } else {
      console.error("Error fetching location:", locationError);
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

  if (!location) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Our Kitchens @ {location.name}</h1>
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
