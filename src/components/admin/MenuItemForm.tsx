
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

// Import the new component files
import BasicFields from "./form/BasicFields";
import CategorySelect from "./form/CategorySelect";
import TagsInput from "./form/TagsInput";
import PriceAndImageFields from "./form/PriceAndImageFields";
import ToggleField from "./form/ToggleField";

const menuItemSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  category: z.string().optional(),
  customCategory: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number",
  }),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  is_vegetarian: z.boolean().default(false),
  is_available: z.boolean().default(true),
  tags: z.string().optional(),
});

type MenuItemFormProps = {
  kitchenId: string;
  menuItem?: Tables<'menu_items'>;
  onSuccess: () => void;
};

const MenuItemForm = ({ kitchenId, menuItem, onSuccess }: MenuItemFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: menuItem?.name || "",
      description: menuItem?.description || "",
      category: menuItem?.category || "",
      customCategory: "",
      price: menuItem ? menuItem.price.toString() : "",
      image_url: menuItem?.image_url || "",
      is_vegetarian: menuItem?.is_vegetarian || false,
      is_available: menuItem?.is_available !== false, // defaults to true if undefined
      tags: menuItem?.tags || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof menuItemSchema>) => {
    try {
      setLoading(true);
      
      // Determine the category
      let finalCategory = data.category;
      if (data.category === "custom" && data.customCategory) {
        finalCategory = data.customCategory.trim();
      }
      
      const menuItemData = {
        kitchen_id: kitchenId,
        name: data.name,
        description: data.description || null,
        category: finalCategory || null,
        price: parseFloat(data.price),
        image_url: data.image_url || null,
        is_vegetarian: data.is_vegetarian,
        is_available: data.is_available,
        tags: data.tags || null,
      };

      if (menuItem) {
        const { error } = await supabase
          .from("menu_items")
          .update(menuItemData)
          .eq("id", menuItem.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("menu_items")
          .insert([menuItemData]);
          
        if (error) throw error;
      }

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error saving menu item",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Fields (Name & Description) */}
          <BasicFields />
          
          {/* Category Selection */}
          <CategorySelect kitchenId={kitchenId} />
          
          {/* Price & Image URL */}
          <PriceAndImageFields />
          
          {/* Tags Input */}
          <TagsInput />
          
          {/* Toggle Switches */}
          <div className="grid grid-cols-2 gap-4">
            <ToggleField 
              name="is_vegetarian" 
              label="Vegetarian" 
              description="Is this a vegetarian item?"
            />
            
            <ToggleField 
              name="is_available" 
              label="Available" 
              description="Is this item currently available?"
            />
          </div>
          
          {/* Submit Button */}
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                Saving...
              </span>
            ) : (
              <span>{menuItem ? "Update Menu Item" : "Create Menu Item"}</span>
            )}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
};

export default MenuItemForm;
