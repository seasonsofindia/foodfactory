
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
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const { control, setValue } = useFormContext();

  useEffect(() => {
    fetchCategories();
  }, [kitchenId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("category")
        .eq("kitchen_id", kitchenId);

      if (!error && data) {
        const categories = data
          .map(item => item.category)
          .filter((category): category is string => 
            category !== null && category !== undefined && category !== ""
          );
        
        // Get unique categories
        const uniqueCategories = Array.from(new Set(categories));
        setExistingCategories(uniqueCategories);
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
                  <SelectItem key={category} value={category}>
                    {category}
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
      )}
    </div>
  );
};

export default CategorySelect;
