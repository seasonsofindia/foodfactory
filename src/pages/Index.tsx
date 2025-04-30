
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import KitchenCard from "@/components/KitchenCard";

const Index = () => {
  const [kitchens, setKitchens] = useState<(Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  })[]>([]);

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Our Kitchens @ Orlando Kitchen Incubator</h1>
      <h2 className="text-xl font-bold">@ 📌 10501 S Orange Ave, STE 104, Orlando, FL, 32824</h2>
      <h2 className="text-xl font-bold">@ 📞 +1(407)987-8937</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kitchens.map((kitchen) => (
          <KitchenCard key={kitchen.id} kitchen={kitchen} />
        ))}
      </div>
    </div>
  );
};

export default Index;
