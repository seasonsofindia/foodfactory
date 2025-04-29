
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Tag } from "lucide-react";

const TagsInput = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl>
            <div className="relative">
              <Tag className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Spicy, Sweet, Vegan, Gluten-free (comma separated)" 
                className="pl-8" 
                {...field} 
                value={field.value || ""} 
              />
            </div>
          </FormControl>
          <FormDescription className="text-xs">
            Enter tags separated by commas (e.g., "Spicy, Healthy, Featured")
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TagsInput;
