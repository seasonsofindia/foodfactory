
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
      className="h-auto cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/kitchen/${kitchen.id}`)}
    >
      <CardContent className="flex flex-col p-3 h-full">
        {kitchen.logo_url && (
          <div className="w-full h-32 mb-3">
            <img
              src={kitchen.logo_url}
              alt={kitchen.name}
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
        <div className="w-full">
          <h3 className="text-md font-semibold mb-2">{kitchen.name}</h3>
          <p className="text-sm text-gray-600">{kitchen.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KitchenCard;
