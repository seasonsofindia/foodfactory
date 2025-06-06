
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import LocationCard from "@/components/LocationCard";

const Locations = () => {
  const [locations, setLocations] = useState<Tables<'locations'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq('active_location', true)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setLocations(data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading locations...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Our Locations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.length > 0 ? (
          locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No active locations found.
          </div>
        )}
      </div>

      <div className="mt-10 p-6 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center gap-6">
        <img
          src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTNxeDg0Y3h3NGRtb2gxZHkybWlyYmE5a3cyc2J4ZmY3bG5jdzhmNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RGKIlvqNPUnrXn41cK/giphy.gif"
          alt="New"
          className="w-20 h-20 rounded-full border-2 border-green-300 shadow-lg"
        />
        <div>
          <h1 className="text-2xl font-bold">
            Try our Dine-in Location @{" "}
            <a
              href="https://www.seasonsofindia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline hover:text-green-900 transition-colors"
            >
              Seasons of India
            </a>
          </h1>
          <div className="flex items-center">
            <a
              href="https://maps.app.goo.gl/T8hViqsBawbjD1VX8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold hover:text-green-600 transition-colors"
            >
              7085 S Orange Blossom Trail, Orlando, FL, 32809
            </a>
          </div>
          <div className="flex items-center">
            <span className="mr-2 h-5 w-5 text-green-600">📞</span>
            <a
              href="tel:+6892424441"
              className="text-xl font-bold hover:text-green-600 transition-colors"
            >
              +1(689)242-4441
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;
