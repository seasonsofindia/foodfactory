
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type OrderingLinksFormProps = {
  kitchenId: string;
  existingLinks: Tables<'ordering_links'>[];
  onSuccess: () => void;
};

type OrderingLink = {
  id?: string;
  platform_name: string;
  url: string;
  logo_url?: string;
};

const OrderingLinksForm = ({ kitchenId, existingLinks, onSuccess }: OrderingLinksFormProps) => {
  const [links, setLinks] = useState<OrderingLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize form with existing links or an empty one
    if (existingLinks.length > 0) {
      setLinks(existingLinks.map(link => ({
        id: link.id,
        platform_name: link.platform_name,
        url: link.url,
        logo_url: link.logo_url || undefined,
      })));
    } else {
      setLinks([{ platform_name: "", url: "" }]);
    }
  }, [existingLinks]);

  const addLink = () => {
    setLinks([...links, { platform_name: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const updateLink = (index: number, field: keyof OrderingLink, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate links
    const invalidLinks = links.filter(
      link => !link.platform_name.trim() || !link.url.trim()
    );
    
    if (invalidLinks.length > 0) {
      toast({
        title: "Validation error",
        description: "Platform name and URL are required for all links",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Get existing link IDs to determine which to delete
      const existingIds = existingLinks.map(link => link.id);
      const currentIds = links.filter(link => link.id).map(link => link.id);
      const idsToDelete = existingIds.filter(id => !currentIds.includes(id));
      
      // Delete removed links
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("ordering_links")
          .delete()
          .in("id", idsToDelete);
          
        if (deleteError) throw deleteError;
      }
      
      // Update existing links and add new ones
      for (const link of links) {
        const linkData = {
          kitchen_id: kitchenId,
          platform_name: link.platform_name.trim(),
          url: link.url.trim(),
          logo_url: link.logo_url?.trim() || null,
        };
        
        if (link.id) {
          // Update existing link
          const { error: updateError } = await supabase
            .from("ordering_links")
            .update(linkData)
            .eq("id", link.id);
            
          if (updateError) throw updateError;
        } else {
          // Insert new link
          const { error: insertError } = await supabase
            .from("ordering_links")
            .insert([linkData]);
            
          if (insertError) throw insertError;
        }
      }
      
      toast({
        title: "Links updated",
        description: "Ordering links have been successfully saved",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error saving links",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {links.map((link, index) => (
        <div key={index} className="space-y-2 pb-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Ordering Platform {index + 1}</h3>
            {links.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLink(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Platform Name</label>
            <Input
              value={link.platform_name}
              onChange={e => updateLink(index, "platform_name", e.target.value)}
              placeholder="e.g., UberEats, DoorDash"
              className="mb-2"
            />
            
            <label className="text-sm font-medium">URL</label>
            <Input
              value={link.url}
              onChange={e => updateLink(index, "url", e.target.value)}
              placeholder="https://example.com/order"
              className="mb-2"
            />
            
            <label className="text-sm font-medium">Logo URL (Optional)</label>
            <Input
              value={link.logo_url || ""}
              onChange={e => updateLink(index, "logo_url", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      ))}
      
      <Button
        type="button"
        onClick={addLink}
        variant="outline"
        className="w-full border-dashed border-gray-300 text-gray-600"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Another Platform
      </Button>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
              Saving...
            </span>
          ) : (
            "Save All Links"
          )}
        </Button>
      </div>
    </form>
  );
};

export default OrderingLinksForm;
