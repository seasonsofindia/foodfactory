
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MenuItemProps {
  item: Tables<'menu_items'>;
}

const MenuItem = ({ item }: MenuItemProps) => {
  // Parse tags from comma-separated string
  const parseTags = (tagsString: string | null): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };
  
  return (
    <Card className="h-auto">
      <CardContent className="p-3">
        {item.image_url && (
          <div className="h-16 mb-2">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-medium">{item.name}</h3>
          <span className="text-green-600 font-medium text-sm whitespace-nowrap">
            ${parseFloat(item.price.toString()).toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {item.is_vegetarian && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Vegetarian
            </Badge>
          )}
          {parseTags(item.tags as unknown as string).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItem;
