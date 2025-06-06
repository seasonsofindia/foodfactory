
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import BasicFields from "./BasicFields";
import PriceAndImageFields from "./PriceAndImageFields";
import CategorySelect from "./CategorySelect";
import TagsInput from "./TagsInput";
import ToggleField from "./ToggleField";

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

type MenuItemFormDialogProps = {
  kitchenId: string;
  menuItem?: Tables<'menu_items'>;
  onSuccess: () => void;
};

const MenuItemFormDialog = ({ kitchenId, menuItem, onSuccess }: MenuItemFormDialogProps) => {
  const { toast } = useToast();

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
      const upsertData = {
        kitchen_id: kitchenId,
        name: values.name,
        description: values.description || null,
        price: values.price,
        image_url: values.image_url || null,
        is_available: values.is_available,
        is_vegetarian: values.is_vegetarian,
        category: values.category || null,
        category_sort_order: values.category_sort_order || 100,
        tags: values.tags || null,
      };

      if (menuItem) {
        const { error } = await supabase
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
        const { error } = await supabase
          .from("menu_items")
          .insert(upsertData);

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <BasicFields />
          <PriceAndImageFields />
          <CategorySelect kitchenId={kitchenId} />
          <TagsInput />
          
          <div className="grid grid-cols-2 gap-4">
            <ToggleField 
              name="is_available" 
              label="Available" 
              description="Is this item currently available for order?" 
            />
            <ToggleField 
              name="is_vegetarian" 
              label="Vegetarian" 
              description="Is this a vegetarian item?" 
            />
          </div>

          <Button type="submit" className="w-full">
            {menuItem ? "Update Menu Item" : "Create Menu Item"}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
};

export default MenuItemFormDialog;
