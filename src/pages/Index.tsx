
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

  useEffect(() => {
    fetchKitchens();
    fetchLocation();
  }, []);

  const fetchKitchens = async () => {
    const { data, error } = await supabase
      .from("kitchens")
      .select(`
        *,
        menu_items (*),
        ordering_links (*)
      `)
      .eq('active_kitchen', true) 
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setKitchens(data);
    }
  };

  const fetchLocation = async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", DEFAULT_LOCATION_ID)
      .single();
    if (!error && data) {
      setLocation(data);
    }
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kitchens.map((kitchen) => (
          <KitchenCard key={kitchen.id} kitchen={kitchen} />
        ))}
      </div>
    </div>
  );
};

export default Index;
