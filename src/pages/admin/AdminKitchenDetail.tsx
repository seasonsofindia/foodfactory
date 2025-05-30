
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KitchenForm from "@/components/admin/KitchenForm";
import { Tables } from "@/integrations/supabase/types";
import { PhoneCall } from "lucide-react";

// Extend the kitchen type to include header_image_url temporarily
type ExtendedKitchen = Tables<'kitchens'> & { header_image_url?: string | null };

const AdminKitchenDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [kitchen, setKitchen] = useState<ExtendedKitchen | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchKitchen();
  }, [id]);

  const fetchKitchen = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("kitchens")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setKitchen(data as ExtendedKitchen);
    } catch (error: any) {
      toast({
        title: "Error fetching kitchen",
        description: error.message,
        variant: "destructive",
      });
      navigate("/admin/kitchens");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    toast({
      title: "Kitchen updated",
      description: "The kitchen has been successfully updated",
    });
    fetchKitchen();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!kitchen) {
    return <div>Kitchen not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-800">{kitchen.name}</h1>
          <p className="text-gray-600">Edit kitchen details</p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/kitchens")}
            className="border-green-300 text-green-700"
          >
            Back to List
          </Button>
          <Button
            onClick={() => navigate(`/admin/kitchens/${id}/menu`)}
            className="bg-green-600 hover:bg-green-700"
          >
            Manage Menu
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Edit Kitchen</CardTitle>
          </CardHeader>
          <CardContent>
            <KitchenForm kitchen={kitchen} onSuccess={handleSuccess} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Kitchen Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kitchen.logo_url && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-800">Logo</h3>
                  <img
                    src={kitchen.logo_url}
                    alt={`${kitchen.name} Logo`}
                    className="h-16 w-16 rounded-full object-cover mt-1"
                  />
                </div>
              )}
              {kitchen.header_image_url && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-800">Header Image</h3>
                  <img
                    src={kitchen.header_image_url}
                    alt={`${kitchen.name} Header`}
                    className="max-h-40 w-full rounded-md object-cover mt-1"
                  />
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-800">Description</h3>
                <p className="text-gray-600">{kitchen.description || "No description provided"}</p>
              </div>
              {kitchen.phone_number && (
                <div>
                  <h3 className="font-medium text-gray-800">Phone</h3>
                  <div className="flex items-center text-gray-600">
                    <PhoneCall className="h-4 w-4 mr-1" /> 
                    {kitchen.phone_number}
                  </div>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-800">Sort Order</h3>
                <p className="text-gray-600">{kitchen.sort_order}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminKitchenDetail;
