
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import KitchenCard from "@/components/KitchenCard";
import { ArrowLeft, MapPin, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

const LocationKitchens = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Tables<'locations'> | null>(null);
  const [kitchens, setKitchens] = useState<(Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLocationAndKitchens();
    }
  }, [id]);

  const fetchLocationAndKitchens = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Fetch location details
      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .select("*")
        .eq("id", id)
        .single();

      if (locationError) throw locationError;
      setLocation(locationData);

      // Fetch kitchens for this location
      const { data: kitchensData, error: kitchensError } = await supabase
        .from("kitchens")
        .select(`
          *,
          menu_items (*),
          ordering_links (*)
        `)
        .eq('locationids', id)
        .eq('active_kitchen', true)
        .order('sort_order', { ascending: true });

      if (kitchensError) throw kitchensError;
      setKitchens(kitchensData || []);
    } catch (error) {
      console.error("Error fetching location and kitchens:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!location) {
    return <div className="text-center p-8">Location not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/locations")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Locations
        </Button>
      </div>

      <h1 className="text-2xl font-bold">
        Kitchens @ {location.display_name}
      </h1>
      
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
            href={`tel:${location.phone_number}`}
            className="text-xl font-bold hover:text-green-600 transition-colors"
          >
            {location.phone_number}
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kitchens.length > 0 ? (
          kitchens.map((kitchen) => (
            <KitchenCard key={kitchen.id} kitchen={kitchen} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No active kitchens found for this location.
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationKitchens;
