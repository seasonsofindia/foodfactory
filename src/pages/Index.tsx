
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locationNickname) {
      fetchLocationAndKitchens();
    }
  }, [locationNickname]);

  const fetchLocationAndKitchens = async () => {
    if (!locationNickname) return;

    try {
      console.log("Fetching location with nick_name:", locationNickname);
      
      // First fetch the location details by nick_name
      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .select("*")
        .eq("nick_name", locationNickname)
        .maybeSingle();

      console.log("Location query result:", { locationData, locationError });

      if (locationError) {
        console.error("Location error:", locationError);
        setError(`Error fetching location: ${locationError.message}`);
        setLoading(false);
        return;
      }

      if (!locationData) {
        console.error("No location found with nick_name:", locationNickname);
        setError(`Location "${locationNickname}" not found`);
        setLoading(false);
        return;
      }

      setLocation(locationData);

      // Then fetch all kitchens that match this location
      console.log("Fetching kitchens for location:", locationData.id);
      const { data: kitchensData, error: kitchensError } = await supabase
        .from("kitchens")
        .select(`
          *,
          menu_items (*),
          ordering_links (*)
        `)
        .eq('locationids', locationData.id)
        .order('sort_order', { ascending: true });

      console.log("Kitchens query result:", { kitchensData, kitchensError });

      if (kitchensError) {
        console.error("Kitchens error:", kitchensError);
        setError(`Error fetching kitchens: ${kitchensError.message}`);
      } else if (kitchensData) {
        console.log("Kitchens loaded:", kitchensData.length, "kitchens");
        setKitchens(kitchensData);
      } else {
        console.log("No kitchens data returned");
        setKitchens([]);
      }
    } catch (error) {
      console.error("Exception in fetchLocationAndKitchens:", error);
      setError("An unexpected error occurred");
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
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
