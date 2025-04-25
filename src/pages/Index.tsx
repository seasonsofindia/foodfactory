
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";

const Index = () => {
  const [kitchens, setKitchens] = useState<Tables<'kitchens'>[]>([]);

  useEffect(() => {
    fetchKitchens();
  }, []);

  const fetchKitchens = async () => {
    const { data, error } = await supabase
      .from("kitchens")
      .select(`
        *,
        menu_items (*),
        ordering_links (*)
      `);

    if (!error && data) {
      setKitchens(data);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Our Cloud Kitchens</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kitchens.map((kitchen) => (
          <Card key={kitchen.id}>
            <CardHeader>
              {kitchen.logo_url && (
                <img
                  src={kitchen.logo_url}
                  alt={kitchen.name}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
              )}
              <CardTitle>{kitchen.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{kitchen.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
