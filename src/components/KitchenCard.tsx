
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

type KitchenCardProps = {
  kitchen: Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  };
};

const KitchenCard = ({ kitchen }: KitchenCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="h-32 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/kitchen/${kitchen.id}`)}
    >
      <CardContent className="flex p-3 h-full">
        {kitchen.logo_url && (
          <div className="w-16 h-16 flex-shrink-0 mr-3">
            <img
              src={kitchen.logo_url}
              alt={kitchen.name}
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <h3 className="text-sm font-semibold mb-1">{kitchen.name}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{kitchen.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KitchenCard;
