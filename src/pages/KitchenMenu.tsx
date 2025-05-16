
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, PhoneCall } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Parse tags from comma-separated string
  const parseTags = (tagsString: string | null): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
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

  // Format phone number for tel: link
  const formatPhoneForDialing = (phoneNumber: string | null) => {
    if (!phoneNumber) return '';
    // Remove all non-digit characters for dialing
    return `tel:${phoneNumber.replace(/\D/g, '')}`;
  };

  // Get name initials for avatar fallback
  const getNameInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

  if (!kitchen) {
    return <div className="text-center p-8">Loading...</div>;
  }

  // Get items organized by category
  const itemsByCategory = getMenuItemsByCategory();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-gray-200">
            {kitchen.logo_url ? (
              <AvatarImage src={kitchen.logo_url} alt={kitchen.name} />
            ) : (
              <AvatarFallback className="bg-green-100 text-green-800">
                {getNameInitials(kitchen.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{kitchen.name}</h1>
            {location && (
              <p className="text-sm text-gray-500">{location.name}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {kitchen.phone_number && (
            <Button
              onClick={() => window.location.href = formatPhoneForDialing(kitchen.phone_number)}
              variant="outline"
              className="flex items-center gap-2"
            >
              Call Now <PhoneCall className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => setShowOrderingLinks(true)}
            className="flex items-center gap-2"
          >
            Order Now <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Location information */}
      {location && (
        <div className="mb-6 bg-green-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <PhoneCall className="h-4 w-4 text-green-600 mr-2" />
            <a href={formatPhoneForDialing(location.phone_number || '')} className="text-green-700 font-medium">
              {location.phone_number || "No phone number available"}
            </a>
          </div>
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-green-600 mr-2 mt-1" />
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(location.address)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-700 font-medium"
            >
              {location.address}
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 mt-4">
        {/* Categories sidebar */}
        {categories.length > 0 && (
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h2 className="font-medium text-lg mb-3 text-green-700 border-b pb-2">Categories</h2>
              <div className="space-y-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeCategory === category
                        ? "bg-green-100 text-green-800 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Menu items display - now showing all categories */}
        <div className="flex-1">
          <ScrollArea className="h-[calc(100vh-150px)]">
            {categories.map(category => (
              <div 
                key={category}
                ref={el => categoryRefs.current[category] = el}
                className="mb-10"
              >
                <h2 className="text-xl font-semibold mb-3 text-green-700 border-b border-green-200 pb-2">
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itemsByCategory[category]?.map((item) => (
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
                          {parseTags(item.tags as unknown as string).map((tag, index) => (
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
            ))}
          </ScrollArea>
        </div>
      </div>

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
