
import { Tables } from "@/integrations/supabase/types";
import { MapPin, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";

type LocationCardProps = {
  location: Tables<'locations'>;
};

const LocationCard = ({ location }: LocationCardProps) => {
  const navigate = useNavigate();

  const handleLocationClick = () => {
    navigate(`/location/${location.id}`);
  };

  return (
    <div 
      className="p-6 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
      onClick={handleLocationClick}
    >
      <h2 className="text-xl font-bold mb-4">{location.display_name}</h2>
      <div className="space-y-3">
        <div className="flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-green-600" />
          <span className="text-lg font-medium">
            {location.address}
          </span>
        </div>
        {location.phone_number && (
          <div className="flex items-center">
            <PhoneCall className="mr-2 h-5 w-5 text-green-600" />
            <span className="text-lg font-medium">
              {location.phone_number}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationCard;
