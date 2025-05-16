
import { MapPin, PhoneCall } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface LocationInfoProps {
  location: Tables<'locations'> | null;
}

const LocationInfo = ({ location }: LocationInfoProps) => {
  if (!location) return null;
  
  // Format phone number for tel: link
  const formatPhoneForDialing = (phoneNumber: string | null) => {
    if (!phoneNumber) return '';
    // Remove all non-digit characters for dialing
    return `tel:${phoneNumber.replace(/\D/g, '')}`;
  };
  
  return (
    <div className="mb-6 bg-green-50 p-4 rounded-lg">
      <div className="flex items-center mb-2">
        <PhoneCall className="h-4 w-4 text-green-600 mr-2" />
        <a href={formatPhoneForDialing(location.phone_number || '')} className="text-green-700 font-medium">
          {location.phone_number || "No phone number available"}
        </a>
      </div>
      <div className="flex items-start">
        <MapPin className="h-4 w-4 text-green-600 mr-2 mt-1" />
        <a 
          href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-green-700 font-medium"
        >
          {location.address}
        </a>
      </div>
    </div>
  );
};

export default LocationInfo;
