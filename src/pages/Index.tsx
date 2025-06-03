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
      <div className="mt-10 p-6 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center gap-6">
    <img
        src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTNxeDg0Y3h3NGRtb2gxZHkybWlyYmE5a3cyc2J4ZmY3bG5jdzhmNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RGKIlvqNPUnrXn41cK/giphy.gif"
        alt="New"
        className="w-20 h-20 rounded-full border-2 border-green-300 shadow-lg"
    />
    <div>
         <h1 className="text-2xl font-bold">
       Try our Dine-in Location @ Seasons of India
   </h1>
   <div className="flex items-center">
       <a
           href="https://maps.google.com/?q=10501+S+Orange+Ave,+STE+104,+Orlando,+FL,+32824"
           target="_blank"
           rel="noopener noreferrer"
           className="text-xl font-bold hover:text-green-600 transition-colors"
       >
           10501 S Orange Ave, STE 104, Orlando, FL, 32824
       </a>
   </div>
   <div className="flex items-center">
       <PhoneCall className="mr-2 h-5 w-5 text-green-600" />
       <a
           href="tel:+14079878937"
           className="text-xl font-bold hover:text-green-600 transition-colors"
       >
           +1(407)987-8937
       </a>
      </div>
    </div>
  );
};

export default Index;
