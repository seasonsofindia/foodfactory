import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import CategorySelect from "./form/CategorySelect";

const menuItemSchema = z.object({
  name: z.string().min(2, {
    message: "Menu item name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  price: z.number().min(0, {
    message: "Price must be a positive number.",
  }),
  image_url: z.string().url("Invalid URL").optional().nullable(),
  is_available: z.boolean().default(true),
  is_vegetarian: z.boolean().default(false),
  category: z.string().optional().nullable(),
  category_sort_order: z.number().optional().nullable(),
  tags: z.string().optional().nullable(),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

type MenuItemFormProps = {
  kitchenId: string;
  menuItem?: Tables<'menu_items'>;
  onSuccess: () => void;
};

const MenuItemForm = ({ kitchenId, menuItem, onSuccess }: MenuItemFormProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: menuItem
      ? {
        name: menuItem.name,
        description: menuItem.description || "",
        price: menuItem.price,
        image_url: menuItem.image_url || "",
        is_available: menuItem.is_available ?? true,
        is_vegetarian: menuItem.is_vegetarian ?? false,
        category: menuItem.category || "",
        category_sort_order: menuItem.category_sort_order || 100,
        tags: menuItem.tags || "",
      }
      : {
        name: "",
        description: "",
        price: 0,
        image_url: "",
        is_available: true,
        is_vegetarian: false,
        category: "",
        category_sort_order: 100,
        tags: "",
      },
    mode: "onChange",
  });

  const onSubmit = async (values: MenuItemFormValues) => {
    try {
      const { category, category_sort_order, ...menuItemValues } = values;

      const upsertData = {
        ...menuItemValues,
        kitchen_id: kitchenId,
        category: values.category === "custom" ? values.category : values.category,
        category_sort_order: values.category_sort_order || 100,
      };

      if (menuItem) {
        // Update existing menu item
        const { data, error } = await supabase
          .from("menu_items")
          .update(upsertData)
          .eq("id", menuItem.id);

        if (error) {
          console.error("Error updating menu item:", error);
          toast({
            title: "Error updating menu item",
            description: "Failed to update the menu item. Please try again.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Create new menu item
        const { data, error } = await supabase
          .from("menu_items")
          .insert([upsertData]);

        if (error) {
          console.error("Error creating menu item:", error);
          toast({
            title: "Error creating menu item",
            description: "Failed to create the menu item. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: menuItem ? "Menu item updated successfully!" : "Menu item created successfully!",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Menu Item Name" {...field} />
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
                      placeholder="A short description about the menu item"
                      className="resize-none"
                      {...field}
                    />
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
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parsedValue = parseFloat(value);
                        field.onChange(isNaN(parsedValue) ? 0 : parsedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Image URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CategorySelect kitchenId={kitchenId} />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Comma-separated tags (e.g., spicy, popular)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-0.5">
                      <FormLabel>Available</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_vegetarian"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-0.5">
                      <FormLabel>Vegetarian</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button type="submit">
            {menuItem ? "Update Menu Item" : "Create Menu Item"}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
};

export default MenuItemForm;
