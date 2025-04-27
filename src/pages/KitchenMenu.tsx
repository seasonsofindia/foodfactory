
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const KitchenMenu = () => {
  const { id } = useParams<{ id: string }>();
  const [kitchen, setKitchen] = useState<Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  } | null>(null);

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
    }
  };

  if (!kitchen) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{kitchen.name}</h1>
      
      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="ordering">Ordering Links</TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kitchen.menu_items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  {item.image_url && (
                    <div className="relative h-48 mb-4">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-lg">${parseFloat(item.price.toString()).toFixed(2)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                  {item.is_vegetarian && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Vegetarian
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ordering">
          <div className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KitchenMenu;
