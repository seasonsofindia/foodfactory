
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { MapPin, PhoneCall } from "lucide-react";

const Locations = () => {
  const [locations, setLocations] = useState<Tables<'locations'>[]>([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq('active_location', true)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setLocations(data);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Our Locations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((location) => (
          <div key={location.id} className="p-6 rounded-lg bg-green-50 border border-green-200">
            <h2 className="text-xl font-bold mb-4">{location.display_name}</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-green-600" />
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-medium hover:text-green-600 transition-colors"
                >
                  {location.address}
                </a>
              </div>
              {location.phone_number && (
                <div className="flex items-center">
                  <PhoneCall className="mr-2 h-5 w-5 text-green-600" />
                  <a 
                    href={`tel:${location.phone_number}`}
                    className="text-lg font-medium hover:text-green-600 transition-colors"
                  >
                    {location.phone_number}
                  </a>
                </div>
              )}
            </div>
          </div>
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
            <PhoneCall className="mr-2 h-5 w-5 text-green-600" />
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
