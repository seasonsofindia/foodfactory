
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

type LocationSelectorProps = {
  onLocationChange?: (locationId: string) => void;
  className?: string;
  defaultToPreferred?: boolean;
};

const LocationSelector = ({ onLocationChange, className, defaultToPreferred = true }: LocationSelectorProps) => {
  const [locations, setLocations] = useState<Tables<'locations'>[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchLocations();
  }, []);
  
  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name");
      
    if (!error && data) {
      setLocations(data);
      
      // Set default location
      const defaultLocation = defaultToPreferred 
        ? data.find(loc => loc.is_default) || data[0]
        : data[0];
        
      if (defaultLocation) {
        setSelectedLocationId(defaultLocation.id);
        if (onLocationChange) {
          onLocationChange(defaultLocation.id);
        }
      }
    }
  };
  
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    if (onLocationChange) {
      onLocationChange(locationId);
    }
  };
  
  if (locations.length <= 1) {
    return null; // Don't show selector if there's only one location
  }
  
  return (
    <div className={`flex items-center ${className || ''}`}>
      <MapPin className="mr-2 h-4 w-4 text-green-600" />
      <Select value={selectedLocationId || ''} onValueChange={handleLocationChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map(location => (
            <SelectItem key={location.id} value={location.id}>
              {location.name} {location.is_default ? "(Default)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationSelector;
