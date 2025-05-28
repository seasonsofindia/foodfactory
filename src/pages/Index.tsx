
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

  useEffect(() => {
    fetchKitchens();
  }, []);

  const fetchKitchens = async () => {
    const { data, error } = await supabase
      .from("kitchens")
      .select(`
        *,
        menu_items (*),
        ordering_links (*)
      `)
      .where('active_kitchen',TRUE)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setKitchens(data);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Our Kitchens @ Orlando Kitchen Incubator</h1>
      <div className="flex items-center">
        <MapPin className="mr-2 h-5 w-5 text-green-600" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kitchens.map((kitchen) => (
          <KitchenCard key={kitchen.id} kitchen={kitchen} />
        ))}
      </div>
    </div>
  );
};

export default Index;
