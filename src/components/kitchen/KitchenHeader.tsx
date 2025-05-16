
import { ExternalLink, PhoneCall } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface KitchenHeaderProps {
  kitchen: Tables<'kitchens'>;
  location: Tables<'locations'> | null;
  onShowOrderingLinks: () => void;
}

const KitchenHeader = ({ kitchen, location, onShowOrderingLinks }: KitchenHeaderProps) => {
  // Format phone number for tel: link
  const formatPhoneForDialing = (phoneNumber: string | null) => {
    if (!phoneNumber) return '';
    // Remove all non-digit characters for dialing
    return `tel:${phoneNumber.replace(/\D/g, '')}`;
  };
  
  // Get name initials for avatar fallback
  const getNameInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-gray-200">
          {kitchen.logo_url ? (
            <AvatarImage src={kitchen.logo_url} alt={kitchen.name} />
          ) : (
            <AvatarFallback className="bg-green-100 text-green-800">
              {getNameInitials(kitchen.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{kitchen.name}</h1>
          {location && (
            <p className="text-sm text-gray-500">{location.name}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {kitchen.phone_number && (
          <Button
            onClick={() => window.location.href = formatPhoneForDialing(kitchen.phone_number)}
            variant="outline"
            className="flex items-center gap-2"
          >
            Call Now <PhoneCall className="h-4 w-4" />
          </Button>
        )}
        <Button 
          variant="outline"
          onClick={onShowOrderingLinks}
          className="flex items-center gap-2"
        >
          Order Now <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default KitchenHeader;
