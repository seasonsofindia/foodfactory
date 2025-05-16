
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import KitchenHeader from "@/components/kitchen/KitchenHeader";
import LocationInfo from "@/components/kitchen/LocationInfo";
import MenuCategory from "@/components/kitchen/MenuCategory";
import CategoriesSidebar from "@/components/kitchen/CategoriesSidebar";
import OrderingLinksDialog from "@/components/kitchen/OrderingLinksDialog";

const KitchenMenu = () => {
  const { id } = useParams<{ id: string }>();
  const [kitchen, setKitchen] = useState<Tables<'kitchens'> & {
    menu_items: Tables<'menu_items'>[];
    ordering_links: Tables<'ordering_links'>[];
  } | null>(null);
  const [showOrderingLinks, setShowOrderingLinks] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [location, setLocation] = useState<Tables<'locations'> | null>(null);
  
  // Create refs for each category section
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      
      // Fetch location data
      if (data.location_id) {
        const { data: locationData, error: locationError } = await supabase
          .from("locations")
          .select("*")
          .eq("id", data.location_id)
          .single();
        
        if (!locationError && locationData) {
          setLocation(locationData);
        }
      }
      
      // Extract unique categories
      if (data.menu_items && data.menu_items.length > 0) {
        const uniqueCategories = Array.from(
          new Set(
            data.menu_items
              .map(item => item.category || "Uncategorized")
              .filter(category => category)
          )
        );
        // Sort categories based on the category_sort_order of the first item in each category
        const sortedCategories = [...uniqueCategories].sort((a, b) => {
          const aItems = data.menu_items.filter(item => (item.category || "Uncategorized") === a);
          const bItems = data.menu_items.filter(item => (item.category || "Uncategorized") === b);
          
          const aOrder = aItems.length > 0 ? aItems[0].category_sort_order || 100 : 100;
          const bOrder = bItems.length > 0 ? bItems[0].category_sort_order || 100 : 100;
          
          return aOrder - bOrder;
        });
        
        setCategories(sortedCategories);
        setActiveCategory(sortedCategories[0] || null);
      }
    }
  };

  // Get menu items organized by category
  const getMenuItemsByCategory = () => {
    if (!kitchen?.menu_items) return {};
    
    const itemsByCategory: Record<string, Tables<'menu_items'>[]> = {};
    
    // Group items by category
    kitchen.menu_items.forEach(item => {
      const category = item.category || "Uncategorized";
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    });
    
    // Sort items within each category
    Object.keys(itemsByCategory).forEach(category => {
      itemsByCategory[category].sort((a, b) => {
        // First sort by name if we need a secondary sort criteria
        return a.name.localeCompare(b.name);
      });
    });
    
    return itemsByCategory;
  };

  // Handle category click - scroll to the category section
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    
    // Scroll to the category section
    if (categoryRefs.current[category]) {
      categoryRefs.current[category]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Set reference for a category section
  const setCategoryRef = (category: string, element: HTMLDivElement | null) => {
    categoryRefs.current[category] = element;
  };

  if (!kitchen) {
    return <div className="text-center p-8">Loading...</div>;
  }

  // Get items organized by category
  const itemsByCategory = getMenuItemsByCategory();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <KitchenHeader 
        kitchen={kitchen}
        location={location}
        onShowOrderingLinks={() => setShowOrderingLinks(true)}
      />
      
      <LocationInfo location={location} />

      <div className="flex flex-col md:flex-row gap-6 mt-4">
        <CategoriesSidebar 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />

        {/* Menu items display */}
        <div className="flex-1">
          <ScrollArea className="h-[calc(100vh-150px)]">
            {categories.map(category => (
              <MenuCategory
                key={category}
                category={category}
                items={itemsByCategory[category] || []}
                setRef={setCategoryRef}
              />
            ))}
          </ScrollArea>
        </div>
      </div>

      <OrderingLinksDialog
        kitchenName={kitchen.name}
        orderingLinks={kitchen.ordering_links}
        open={showOrderingLinks}
        onOpenChange={setShowOrderingLinks}
      />
    </div>
  );
};

export default KitchenMenu;
