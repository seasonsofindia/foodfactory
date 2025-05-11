
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

// Extend the kitchen type to include header_image_url temporarily
type ExtendedKitchen = Tables<'kitchens'> & { header_image_url?: string | null };

const kitchenSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().optional(),
  logo_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  header_image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  phone_number: z.string().optional().refine(value => {
    if (!value) return true;
    // Allow only digits, spaces, dashes, and parentheses
    return /^[0-9\s\-\(\)]*$/.test(value);
  }, { message: "Invalid phone number format" }),
  sort_order: z.coerce.number(),
});

type KitchenFormProps = {
  kitchen?: ExtendedKitchen;
  onSuccess: () => void;
};

const KitchenForm = ({ kitchen, onSuccess }: KitchenFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof kitchenSchema>>({
    resolver: zodResolver(kitchenSchema),
    defaultValues: {
      name: kitchen?.name || "",
      description: kitchen?.description || "",
      logo_url: kitchen?.logo_url || "",
      header_image_url: kitchen?.header_image_url || "",
      phone_number: kitchen?.phone_number || "",
      sort_order: kitchen?.sort_order || 0,
    },
  });

  const onSubmit = async (data: z.infer<typeof kitchenSchema>) => {
    try {
      setLoading(true);
      
      // Add the header_image_url to the kitchen data
      const kitchenData: TablesInsert<'kitchens'> & { header_image_url?: string | null } = {
        name: data.name,
        description: data.description || null,
        logo_url: data.logo_url || null,
        header_image_url: data.header_image_url || null,
        phone_number: data.phone_number || null,
        sort_order: data.sort_order,
      };

      if (kitchen) {
        const { error } = await supabase
          .from("kitchens")
          .update(kitchenData)
          .eq("id", kitchen.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("kitchens")
          .insert([kitchenData]);
          
        if (error) throw error;
      }

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error saving kitchen",
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
              <FormLabel>Kitchen Name</FormLabel>
              <FormControl>
                <Input placeholder="Kitchen name" {...field} />
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
                  placeholder="Brief description of the kitchen" 
                  className="min-h-[100px]" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="header_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/header.jpg" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(407) 987-8937" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="sort_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
              Saving...
            </span>
          ) : (
            <span>{kitchen ? "Update Kitchen" : "Create Kitchen"}</span>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default KitchenForm;
