
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

const menuItemSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number",
  }),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  is_vegetarian: z.boolean().default(false),
  is_available: z.boolean().default(true),
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
      price: menuItem ? menuItem.price.toString() : "",
      image_url: menuItem?.image_url || "",
      is_vegetarian: menuItem?.is_vegetarian || false,
      is_available: menuItem?.is_available !== false, // defaults to true if undefined
    },
  });

  const onSubmit = async (data: z.infer<typeof menuItemSchema>) => {
    try {
      setLoading(true);
      
      const menuItemData = {
        kitchen_id: kitchenId,
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        price: parseFloat(data.price),
        image_url: data.image_url || null,
        is_vegetarian: data.is_vegetarian,
        is_available: data.is_available,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="Menu item name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the menu item" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Appetizers, Mains" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input placeholder="9.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="is_vegetarian"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Vegetarian</FormLabel>
                  <FormDescription className="text-xs">
                    Is this a vegetarian item?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="is_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Available</FormLabel>
                  <FormDescription className="text-xs">
                    Is this item currently available?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
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
  );
};

export default MenuItemForm;
