
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CategorySelectProps = {
  kitchenId: string;
};

const CategorySelect = ({ kitchenId }: CategorySelectProps) => {
  const [existingCategories, setExistingCategories] = useState<{name: string, sortOrder: number}[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const { control, setValue } = useFormContext();

  useEffect(() => {
    fetchCategories();
  }, [kitchenId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("category, category_sort_order")
        .eq("kitchen_id", kitchenId);

      if (!error && data) {
        // Group by category and get the min sort order for each category
        const categoriesMap = data.reduce<Record<string, number>>((acc, item) => {
          if (!item.category) return acc;
          
          const sortOrder = item.category_sort_order || 100;
          if (!acc[item.category] || sortOrder < acc[item.category]) {
            acc[item.category] = sortOrder;
          }
          return acc;
        }, {});
        
        // Convert to array of objects with name and sortOrder
        const categories = Object.entries(categoriesMap)
          .filter(([category]) => category !== null && category !== undefined && category !== "")
          .map(([name, sortOrder]) => ({ name, sortOrder }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        
        setExistingCategories(categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "custom") {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
    }
    setValue("category", value);
    
    // Set the category_sort_order based on the selected category
    const selectedCategory = existingCategories.find(cat => cat.name === value);
    if (selectedCategory) {
      setValue("category_sort_order", selectedCategory.sortOrder);
    } else {
      setValue("category_sort_order", 100); // Default sort order
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select
              onValueChange={handleCategoryChange}
              defaultValue={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {existingCategories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">
                  <span className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" /> Add New Category
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showCustomCategory && (
        <div className="space-y-4">
          <FormField
            control={control}
            name="customCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter new category name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="category_sort_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Sort Order</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter sort order (lower numbers show first)" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                    value={field.value || 100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
