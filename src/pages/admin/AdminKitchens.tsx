
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Menu } from "lucide-react";
import KitchenForm from "@/components/admin/KitchenForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tables } from "@/integrations/supabase/types";

const AdminKitchens = () => {
  const [kitchens, setKitchens] = useState<Tables<'kitchens'>[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchKitchens();
  }, []);

  const fetchKitchens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("kitchens")
        .select("*")
        .order("name");

      if (error) throw error;
      setKitchens(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching kitchens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("kitchens").delete().eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Kitchen deleted",
        description: "The kitchen has been successfully removed",
      });
      
      fetchKitchens();
    } catch (error: any) {
      toast({
        title: "Error deleting kitchen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleKitchenCreated = () => {
    fetchKitchens();
    toast({
      title: "Kitchen created",
      description: "New kitchen has been added successfully",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-800">Manage Kitchens</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" /> Add Kitchen
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-green-800">Add New Kitchen</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <KitchenForm onSuccess={handleKitchenCreated} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[100px]">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[300px]">Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kitchens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No kitchens found. Add your first kitchen!
                  </TableCell>
                </TableRow>
              ) : (
                kitchens.map((kitchen) => (
                  <TableRow key={kitchen.id}>
                    <TableCell>
                      {kitchen.logo_url ? (
                        <img 
                          src={kitchen.logo_url} 
                          alt={kitchen.name} 
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                          No Logo
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{kitchen.name}</TableCell>
                    <TableCell className="text-sm text-gray-600 truncate">
                      {kitchen.description || "No description"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/kitchens/${kitchen.id}`)}
                        className="border-green-300 text-green-700 hover:text-green-800 hover:bg-green-50"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/kitchens/${kitchen.id}/menu`)}
                        className="border-blue-300 text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Menu className="h-4 w-4 mr-1" /> Menu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(kitchen.id)}
                        className="border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminKitchens;
