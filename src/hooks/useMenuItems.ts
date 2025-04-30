
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export function useMenuItems(kitchenId: string | undefined) {
  const [menuItems, setMenuItems] = useState<Tables<'menu_items'>[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (kitchenId) {
      fetchMenuItems();
    }
  }, [kitchenId]);

  const fetchMenuItems = async () => {
    if (!kitchenId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("kitchen_id", kitchenId)
        .order("category", { ascending: true })
        .order("name");
        
      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching menu items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group menu items by category
  const getItemsByCategory = () => {
    if (!menuItems || menuItems.length === 0) return {};
    
    const itemsByCategory: Record<string, Tables<'menu_items'>[]> = {};
    
    menuItems.forEach(item => {
      const category = item.category || "Uncategorized";
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    });
    
    return itemsByCategory;
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Menu item deleted",
        description: "The menu item has been successfully removed",
      });
      
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: "Error deleting menu item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const groupedItems = getItemsByCategory();
  const categories = Object.keys(groupedItems).sort();

  return {
    menuItems,
    loading,
    fetchMenuItems,
    handleDeleteMenuItem,
    groupedItems,
    categories
  };
}
