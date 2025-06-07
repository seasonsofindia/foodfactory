
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DatabaseDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      console.log("=== DATABASE DEBUG INFO ===");
      
      // Fetch all locations
      const { data: allLocations, error: locationsError } = await supabase
        .from("locations")
        .select("*")
        .order('sort_order', { ascending: true });
      
      console.log("All locations:", allLocations);
      console.log("Locations error:", locationsError);

      // Fetch all kitchens
      const { data: allKitchens, error: kitchensError } = await supabase
        .from("kitchens")
        .select("*")
        .order('sort_order', { ascending: true });
      
      console.log("All kitchens:", allKitchens);
      console.log("Kitchens error:", kitchensError);

      // Check kitchen-location relationships
      if (allKitchens && allLocations) {
        const locationIds = allLocations.map(l => l.id);
        const kitchenLocationMappings = allKitchens.map(k => ({
          kitchen_id: k.id,
          kitchen_name: k.name,
          locationids: k.locationids,
          location_exists: locationIds.includes(k.locationids),
          active_kitchen: k.active_kitchen
        }));
        
        console.log("Kitchen-Location mappings:", kitchenLocationMappings);
        
        setDebugInfo({
          allLocations,
          allKitchens,
          kitchenLocationMappings,
          locationsError,
          kitchensError
        });
      }
    } catch (error) {
      console.error("Debug fetch error:", error);
    }
  };

  if (!debugInfo) {
    return <div className="p-4 bg-gray-100 rounded">Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded text-sm">
      <h3 className="font-bold mb-2">Database Debug Info (Check Console for Details)</h3>
      <div className="space-y-2">
        <div>Locations found: {debugInfo.allLocations?.length || 0}</div>
        <div>Kitchens found: {debugInfo.allKitchens?.length || 0}</div>
        <div>Active kitchens: {debugInfo.allKitchens?.filter((k: any) => k.active_kitchen)?.length || 0}</div>
        {debugInfo.locationsError && (
          <div className="text-red-600">Locations Error: {debugInfo.locationsError.message}</div>
        )}
        {debugInfo.kitchensError && (
          <div className="text-red-600">Kitchens Error: {debugInfo.kitchensError.message}</div>
        )}
      </div>
      <button 
        onClick={fetchDebugInfo}
        className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
      >
        Refresh Debug Info
      </button>
    </div>
  );
};

export default DatabaseDebug;
