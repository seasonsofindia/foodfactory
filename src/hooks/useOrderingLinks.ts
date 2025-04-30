
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export function useOrderingLinks(kitchenId: string | undefined) {
  const [orderingLinks, setOrderingLinks] = useState<Tables<'ordering_links'>[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (kitchenId) {
      fetchOrderingLinks();
    }
  }, [kitchenId]);

  const fetchOrderingLinks = async () => {
    if (!kitchenId) return;
    
    try {
      const { data, error } = await supabase
        .from("ordering_links")
        .select("*")
        .eq("kitchen_id", kitchenId);
        
      if (error) throw error;
      setOrderingLinks(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching ordering links",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOrderingLinkSuccess = () => {
    fetchOrderingLinks();
    toast({
      title: "Ordering links saved",
      description: "Ordering links have been successfully updated",
    });
  };

  return {
    orderingLinks,
    fetchOrderingLinks,
    handleOrderingLinkSuccess
  };
}
