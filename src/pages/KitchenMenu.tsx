
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const KitchenMenu = () => {
  const { id } = useParams<{ id: string }>();
  const [kitchen, setKitchen] = useState<Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  } | null>(null);
  const [showOrderingLinks, setShowOrderingLinks] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchKitchenDetails();
  }, [id]);

  const fetchKitchenDetails = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("kitchens")
      .select(`
        *,
        menu_items (*),
        ordering_links (*)
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      setKitchen(data);
      
      // Extract unique categories
      if (data.menu_items && data.menu_items.length > 0) {
        const uniqueCategories = Array.from(
          new Set(
            data.menu_items
              .map(item => item.category || "Uncategorized")
              .filter(category => category)
          )
        );
        setCategories(uniqueCategories);
      }
    }
  };

  // Parse tags from comma-separated string
  const parseTags = (tagsString: string | null): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  // Get menu items by category
  const getItemsByCategory = (categoryName: string) => {
    if (!kitchen?.menu_items) return [];
    
    return kitchen.menu_items.filter(item => {
      const itemCategory = item.category || "Uncategorized";
      return itemCategory === categoryName;
    });
  };

  if (!kitchen) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{kitchen.name}</h1>
        <Button 
          variant="outline"
          onClick={() => setShowOrderingLinks(true)}
          className="flex items-center gap-2"
        >
          Order Now <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {categories.length > 0 ? (
        categories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-green-700 border-b border-green-200 pb-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getItemsByCategory(category).map((item) => (
                <Card key={item.id} className="h-auto">
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
                      {parseTags(item.tags).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {kitchen.menu_items.map((item) => (
            <Card key={item.id} className="h-auto">
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
                  {parseTags(item.tags).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showOrderingLinks} onOpenChange={setShowOrderingLinks}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order from {kitchen.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KitchenMenu;
