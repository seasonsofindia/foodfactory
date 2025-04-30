
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export function useKitchenData(kitchenId: string | undefined) {
  const [kitchen, setKitchen] = useState<Tables<'kitchens'> | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (kitchenId) {
      fetchKitchen();
    }
  }, [kitchenId]);

  const fetchKitchen = async () => {
    if (!kitchenId) return;
    
    try {
      const { data, error } = await supabase
        .from("kitchens")
        .select("*")
        .eq("id", kitchenId)
        .single();
        
      if (error) throw error;
      setKitchen(data);
    } catch (error: any) {
      toast({
        title: "Error fetching kitchen",
        description: error.message,
        variant: "destructive",
      });
      navigate("/admin/kitchens");
    } finally {
      setLoading(false);
    }
  };

  return { kitchen, loading, fetchKitchen };
}
