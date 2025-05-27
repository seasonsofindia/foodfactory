
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import KitchenCard from "@/components/KitchenCard";
import { MapPin, PhoneCall } from "lucide-react";

const Index = () => {
  const { locationNickname } = useParams<{ locationNickname: string }>();
  const [location, setLocation] = useState<Tables<'locations'> | null>(null);
  const [kitchens, setKitchens] = useState<(Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locationNickname) {
      fetchLocationAndKitchens();
    }
  }, [locationNickname]);

  const fetchLocationAndKitchens = async () => {
    if (!locationNickname) return;

    try {
      // First fetch the location details by nick_name
      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .select("*")
        .eq("nick_name", locationNickname)
        .single();

      if (locationError || !locationData) {
        console.error("Location not found:", locationError);
        setLoading(false);
        return;
      }

      setLocation(locationData);

      // Then fetch all kitchens (since location_ids column doesn't exist yet)
      const { data: kitchensData, error: kitchensError } = await supabase
        .from("kitchens")
        .select(`
          *,
          menu_items (*),
          ordering_links (*)
        `)
        .order('sort_order', { ascending: true });

      if (!kitchensError && kitchensData) {
        // For now, show all kitchens since location filtering isn't set up yet
        setKitchens(kitchensData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!location) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Our Kitchens @ {location.display_name}</h1>
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
        {kitchens.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No kitchens available at this location yet.</p>
          </div>
        ) : (
          kitchens.map((kitchen) => (
            <KitchenCard key={kitchen.id} kitchen={kitchen} />
          ))
        )}
      </div>
    </div>
  );
};

export default Index;
