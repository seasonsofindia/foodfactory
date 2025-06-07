
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import LocationCard from "@/components/LocationCard";
import DatabaseDebug from "@/components/DatabaseDebug";
import { Button } from "@/components/ui/button";

const DEFAULT_LOCATION_ID = '331c7d5d-ec2b-4289-81f8-dccb74d39571';

const Locations = () => {
  const [locations, setLocations] = useState<Tables<'locations'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching locations...");
      
      // Get only active locations
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq('active_location', true)
        .order('sort_order', { ascending: true });

      console.log("Active locations:", data);
      console.log("Active locations error:", error);

      if (error) {
        console.error("Database error:", error);
        setError(error.message);
        return;
      }

      // If no active locations found, fallback to default location behavior
      if (!data || data.length === 0) {
        console.log("No active locations found, redirecting to default location...");
        navigate("/default-location");
        return;
      }

      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading locations...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">Error loading locations: {error}</div>
        <div className="space-x-4">
          <button 
            onClick={fetchLocations}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
          <Button 
            onClick={() => navigate("/default-location")}
            variant="outline"
          >
            Go to Default Location
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Our Locations</h1>
      
      <DatabaseDebug />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.length > 0 ? (
          locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            <div>No active locations found.</div>
            <div className="text-sm mt-2">Redirecting to default location...</div>
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
