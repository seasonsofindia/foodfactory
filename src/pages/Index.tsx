
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
    } else {
      // If no location nickname, fetch default location
      fetchDefaultLocationAndKitchens();
    }
  }, [locationNickname]);

  const fetchLocationAndKitchens = async () => {
    if (!locationNickname) return;

    try {
      console.log("Fetching location with nick_name:", locationNickname);
      
      // Fetch the location details by nick_name
      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .select("*")
        .eq("nick_name", locationNickname)
        .eq("active_location", true)
        .maybeSingle();

      console.log("Location query result:", { locationData, locationError });

      if (locationError) {
        console.error("Location error:", locationError);
        setError(`Error fetching location: ${locationError.message}`);
        setLoading(false);
        return;
      }

      if (!locationData) {
        console.error("No active location found with nick_name:", locationNickname);
        setError(`Active location "${locationNickname}" not found`);
        setLoading(false);
        return;
      }

      await fetchKitchensForLocation(locationData);
    } catch (error) {
      console.error("Exception in fetchLocationAndKitchens:", error);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const fetchDefaultLocationAndKitchens = async () => {
    try {
      console.log("Fetching default location by ID: 331c7d5d-ec2b-4289-81f8-dccb74d39571");
      
      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .select("*")
        .eq("id", "331c7d5d-ec2b-4289-81f8-dccb74d39571")
        .maybeSingle();

      console.log("Default location query result:", { locationData, locationError });

      if (locationError) {
        console.error("Default location error:", locationError);
        setError(`Error fetching default location: ${locationError.message}`);
        setLoading(false);
        return;
      }

      if (!locationData) {
        console.error("No default location found");
        setError("No default location available");
        setLoading(false);
        return;
      }

      await fetchKitchensForLocation(locationData);
    } catch (error) {
      console.error("Exception in fetchDefaultLocationAndKitchens:", error);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const fetchKitchensForLocation = async (locationData: Tables<'locations'>) => {
    try {
      setLocation(locationData);
      console.log("Location found:", locationData);

      // Fetch active kitchens that match this location ID
      console.log("Fetching active kitchens for location ID:", locationData.id);
      const { data: kitchensData, error: kitchensError } = await supabase
        .from("kitchens")
        .select(`
          *,
          menu_items (*),
          ordering_links (*)
        `)
        .eq('locationids', locationData.id)
        .eq('active_location', true)
        .order('sort_order', { ascending: true });

      console.log("Kitchens query result:", { kitchensData, kitchensError });

      if (kitchensError) {
        console.error("Kitchens error:", kitchensError);
        setError(`Error fetching kitchens: ${kitchensError.message}`);
      } else if (kitchensData) {
        console.log(`Successfully loaded ${kitchensData.length} active kitchens:`, kitchensData);
        setKitchens(kitchensData);
      } else {
        console.log("No kitchens data returned");
        setKitchens([]);
      }
    } catch (error) {
      console.error("Exception in fetchKitchensForLocation:", error);
      setError("An unexpected error occurred while fetching kitchens");
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
            <p className="text-gray-500 text-lg">No active kitchens available at this location yet.</p>
            <p className="text-gray-400 text-sm mt-2">Location ID: {location.id}</p>
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
