
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

// Sample menu data for Little Curry House
const littleCurryHouseMenu = [
  // Appetizers
  {
    name: "Vegetable Samosas",
    description: "Crispy pastries filled with spiced potatoes and peas",
    category: "Appetizers",
    price: 5.99,
    is_vegetarian: true,
    tags: "Fried,Popular,Vegetarian"
  },
  {
    name: "Chicken Pakora",
    description: "Spiced chicken fritters fried until golden brown",
    category: "Appetizers",
    price: 7.99,
    is_vegetarian: false,
    tags: "Fried,Spicy"
  },
  {
    name: "Paneer Tikka",
    description: "Marinated cottage cheese cubes grilled in the tandoor",
    category: "Appetizers",
    price: 8.99,
    is_vegetarian: true,
    tags: "Grilled,Popular,Vegetarian"
  },
  
  // Tandoori Specialties
  {
    name: "Tandoori Chicken",
    description: "Chicken marinated in yogurt and spices, roasted in the clay oven",
    category: "Tandoori Specialties",
    price: 15.99,
    is_vegetarian: false,
    tags: "Popular,Spicy"
  },
  {
    name: "Chicken Tikka",
    description: "Boneless chicken pieces marinated and grilled in the tandoor",
    category: "Tandoori Specialties",
    price: 14.99,
    is_vegetarian: false,
    tags: "Grilled"
  },
  {
    name: "Seekh Kebab",
    description: "Minced lamb mixed with herbs and spices, skewered and grilled",
    category: "Tandoori Specialties",
    price: 16.99,
    is_vegetarian: false,
    tags: "Grilled,Spicy"
  },
  
  // Vegetarian Curries
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese cubes in a rich tomato cream sauce",
    category: "Vegetarian Curries",
    price: 13.99,
    is_vegetarian: true,
    tags: "Popular,Creamy,Vegetarian"
  },
  {
    name: "Chana Masala",
    description: "Chickpeas cooked with onions, tomatoes and traditional spices",
    category: "Vegetarian Curries",
    price: 11.99,
    is_vegetarian: true,
    tags: "Vegetarian"
  },
  {
    name: "Aloo Gobi",
    description: "Potatoes and cauliflower cooked with Indian spices",
    category: "Vegetarian Curries",
    price: 12.99,
    is_vegetarian: true,
    tags: "Vegetarian,Gluten-free"
  },
  
  // Non-Vegetarian Curries
  {
    name: "Chicken Tikka Masala",
    description: "Grilled chicken chunks in a creamy tomato sauce",
    category: "Non-Vegetarian Curries",
    price: 14.99,
    is_vegetarian: false,
    tags: "Popular,Creamy"
  },
  {
    name: "Lamb Rogan Josh",
    description: "Tender lamb pieces cooked in a rich aromatic gravy",
    category: "Non-Vegetarian Curries",
    price: 16.99,
    is_vegetarian: false,
    tags: "Spicy"
  },
  {
    name: "Butter Chicken",
    description: "Tandoori chicken simmered in a buttery tomato cream sauce",
    category: "Non-Vegetarian Curries",
    price: 15.99,
    is_vegetarian: false,
    tags: "Popular,Creamy"
  },
  
  // Rice Dishes
  {
    name: "Vegetable Biryani",
    description: "Basmati rice cooked with mixed vegetables and aromatic spices",
    category: "Rice Dishes",
    price: 12.99,
    is_vegetarian: true,
    tags: "Vegetarian"
  },
  {
    name: "Chicken Biryani",
    description: "Basmati rice cooked with chicken and aromatic spices",
    category: "Rice Dishes",
    price: 14.99,
    is_vegetarian: false,
    tags: "Popular"
  },
  {
    name: "Lamb Biryani",
    description: "Basmati rice cooked with lamb and aromatic spices",
    category: "Rice Dishes",
    price: 16.99,
    is_vegetarian: false,
    tags: "Spicy"
  },
  
  // Breads
  {
    name: "Naan",
    description: "Traditional leavened bread baked in the tandoor",
    category: "Breads",
    price: 2.99,
    is_vegetarian: true,
    tags: "Popular,Vegetarian"
  },
  {
    name: "Garlic Naan",
    description: "Naan bread topped with garlic and herbs",
    category: "Breads",
    price: 3.99,
    is_vegetarian: true,
    tags: "Popular,Vegetarian"
  },
  {
    name: "Roti",
    description: "Whole wheat unleavened bread",
    category: "Breads",
    price: 2.49,
    is_vegetarian: true,
    tags: "Vegetarian,Healthy"
  },
  
  // Desserts
  {
    name: "Gulab Jamun",
    description: "Deep-fried milk solids soaked in sugar syrup",
    category: "Desserts",
    price: 4.99,
    is_vegetarian: true,
    tags: "Sweet,Vegetarian"
  },
  {
    name: "Kheer",
    description: "Traditional rice pudding flavored with cardamom and nuts",
    category: "Desserts",
    price: 5.99,
    is_vegetarian: true,
    tags: "Sweet,Vegetarian"
  }
];

// Ordering links for the kitchen
const orderingLinks = [
  {
    platform_name: "UberEats",
    url: "https://www.ubereats.com/store/little-curry-house-orlando",
  },
  {
    platform_name: "DoorDash",
    url: "https://www.doordash.com/store/little-curry-house-orlando",
  },
  {
    platform_name: "Grubhub",
    url: "https://www.grubhub.com/restaurant/little-curry-house-orlando",
  }
];

const CreateLittleCurryHouse = () => {
  const [loading, setLoading] = useState(false);
  const [createdKitchenId, setCreatedKitchenId] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    kitchen: false,
    menuItems: 0,
    orderingLinks: 0,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const createKitchen = async () => {
    try {
      setLoading(true);

      // Step 1: Create kitchen
      const { data: kitchenData, error: kitchenError } = await supabase
        .from("kitchens")
        .insert([
          {
            name: "Little Curry House",
            description: "Authentic Indian cuisine featuring flavorful curries, tandoori specialties, and freshly baked breads.",
            logo_url: "https://assets.tmecosys.com/image/upload/t_web600x528/img/recipe/ras/Assets/c658bfc7-34e3-4112-a5bc-4db3dd1da33c/Derivates/4b8b4a5e-062f-427b-9e53-0bb9a8540323.jpg", // Example Indian food image
          }
        ])
        .select()
        .single();

      if (kitchenError) throw kitchenError;
      
      setCreatedKitchenId(kitchenData.id);
      setProgress((prev) => ({ ...prev, kitchen: true }));
      
      toast({
        title: "Kitchen created",
        description: `Created Little Curry House successfully`,
      });
      
      // Step 2: Create menu items
      for (const menuItem of littleCurryHouseMenu) {
        const { error: menuItemError } = await supabase
          .from("menu_items")
          .insert([
            {
              kitchen_id: kitchenData.id,
              name: menuItem.name,
              description: menuItem.description,
              category: menuItem.category,
              price: menuItem.price,
              is_vegetarian: menuItem.is_vegetarian,
              tags: menuItem.tags,
              is_available: true
            }
          ]);
          
        if (menuItemError) throw menuItemError;
        
        setProgress((prev) => ({ 
          ...prev, 
          menuItems: prev.menuItems + 1 
        }));
      }
      
      toast({
        title: "Menu Items created",
        description: `Added ${littleCurryHouseMenu.length} menu items to the kitchen`,
      });
      
      // Step 3: Create ordering links
      for (const link of orderingLinks) {
        const { error: linkError } = await supabase
          .from("ordering_links")
          .insert([
            {
              kitchen_id: kitchenData.id,
              platform_name: link.platform_name,
              url: link.url
            }
          ]);
          
        if (linkError) throw linkError;
        
        setProgress((prev) => ({ 
          ...prev, 
          orderingLinks: prev.orderingLinks + 1 
        }));
      }
      
      toast({
        title: "Ordering links created",
        description: `Added ${orderingLinks.length} ordering links to the kitchen`,
      });
      
      // Navigate to the kitchen menu page
      navigate(`/admin/kitchens/${kitchenData.id}/menu`);
    } catch (error: any) {
      toast({
        title: "Error creating kitchen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-green-800">Create Little Curry House</h1>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">This will create a new kitchen called "Little Curry House" with {littleCurryHouseMenu.length} menu items and {orderingLinks.length} ordering links.</p>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${progress.kitchen ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                {progress.kitchen ? '✓' : '1'}
              </div>
              <span className="text-sm">Creating Kitchen {progress.kitchen ? '(Done)' : '...'}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${progress.menuItems === littleCurryHouseMenu.length ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                {progress.menuItems === littleCurryHouseMenu.length ? '✓' : '2'} 
              </div>
              <span className="text-sm">Creating Menu Items ({progress.menuItems} of {littleCurryHouseMenu.length})</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${progress.orderingLinks === orderingLinks.length ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                {progress.orderingLinks === orderingLinks.length ? '✓' : '3'}
              </div>
              <span className="text-sm">Creating Ordering Links ({progress.orderingLinks} of {orderingLinks.length})</span>
            </div>
            
            <div className="flex justify-center mt-6">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          </div>
        ) : (
          <Button 
            onClick={createKitchen} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            Create Little Curry House
          </Button>
        )}
        
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/kitchens')}
            className="border-green-300 text-green-700"
            disabled={loading}
          >
            Back to Kitchens
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateLittleCurryHouse;
