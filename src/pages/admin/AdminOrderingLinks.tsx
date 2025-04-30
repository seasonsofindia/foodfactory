
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import OrderingLinksForm from "@/components/admin/OrderingLinksForm";
import { Tables } from "@/integrations/supabase/types";
import { ArrowLeft } from "lucide-react";

const AdminOrderingLinks = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kitchen, setKitchen] = useState<Tables<'kitchens'> | null>(null);
  const [orderingLinks, setOrderingLinks] = useState<Tables<'ordering_links'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchKitchenData(id);
    }
  }, [id]);

  const fetchKitchenData = async (kitchenId: string) => {
    try {
      setLoading(true);
      
      // Fetch kitchen information
      const { data: kitchenData, error: kitchenError } = await supabase
        .from("kitchens")
        .select("*")
        .eq("id", kitchenId)
        .single();
      
      if (kitchenError) throw kitchenError;
      setKitchen(kitchenData);
      
      // Fetch ordering links
      const { data: linksData, error: linksError } = await supabase
        .from("ordering_links")
        .select("*")
        .eq("kitchen_id", kitchenId);
      
      if (linksError) throw linksError;
      setOrderingLinks(linksData || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Refresh ordering links data
    if (id) {
      fetchKitchenData(id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!kitchen) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold text-red-600">Kitchen not found</h1>
        <Button
          onClick={() => navigate('/admin/kitchens')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Kitchens
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/kitchens')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Kitchens
        </Button>
        <h1 className="text-2xl font-bold text-green-800">{kitchen.name} - Ordering Links</h1>
        <p className="text-gray-600 mt-2">
          Manage the ordering platforms where customers can order from this kitchen
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <OrderingLinksForm 
          kitchenId={id || ''}
          existingLinks={orderingLinks}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default AdminOrderingLinks;
