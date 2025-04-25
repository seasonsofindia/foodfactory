
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type KitchenCardProps = {
  kitchen: Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  };
};

const KitchenCard = ({ kitchen }: KitchenCardProps) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        {kitchen.logo_url && (
          <div className="relative h-48 mb-4">
            <img
              src={kitchen.logo_url}
              alt={kitchen.name}
              className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
            />
          </div>
        )}
        <CardTitle className="text-xl">{kitchen.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-gray-600 mb-4">{kitchen.description}</p>
        <div className="mt-auto space-y-2">
          {kitchen.ordering_links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full justify-between">
                {link.platform_name}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KitchenCard;
