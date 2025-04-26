
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MenuItemForm from "@/components/admin/MenuItemForm";
import { Tables } from "@/integrations/supabase/types";
import OrderingLinksForm from "@/components/admin/OrderingLinksForm";

const AdminMenuItems = () => {
  const { id: kitchenId } = useParams<{ id: string }>();
  const [menuItems, setMenuItems] = useState<Tables<'menu_items'>[]>([]);
  const [kitchen, setKitchen] = useState<Tables<'kitchens'> | null>(null);
  const [orderingLinks, setOrderingLinks] = useState<Tables<'ordering_links'>[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<Tables<'menu_items'> | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (kitchenId) {
      fetchKitchen();
      fetchMenuItems();
      fetchOrderingLinks();
    }
  }, [kitchenId]);

  const fetchKitchen = async () => {
    if (!kitchenId) return;
    
    try {
      const { data, error } = await supabase
        .from("kitchens")
        .select("*")
        .eq("id", kitchenId)
        .single();
        
      if (error) throw error;
      setKitchen(data);
    } catch (error: any) {
      toast({
        title: "Error fetching kitchen",
        description: error.message,
        variant: "destructive",
      });
      navigate("/admin/kitchens");
    }
  };

  const fetchMenuItems = async () => {
    if (!kitchenId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("kitchen_id", kitchenId)
        .order("name");
        
      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching menu items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderingLinks = async () => {
    if (!kitchenId) return;
    
    try {
      const { data, error } = await supabase
        .from("ordering_links")
        .select("*")
        .eq("kitchen_id", kitchenId);
        
      if (error) throw error;
      setOrderingLinks(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching ordering links",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Menu item deleted",
        description: "The menu item has been successfully removed",
      });
      
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: "Error deleting menu item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMenuItemSuccess = () => {
    fetchMenuItems();
    setSelectedMenuItem(null);
    toast({
      title: "Menu item saved",
      description: "Menu item has been successfully saved",
    });
  };

  const handleOrderingLinkSuccess = () => {
    fetchOrderingLinks();
    toast({
      title: "Ordering links saved",
      description: "Ordering links have been successfully updated",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-purple-800">
            {kitchen ? kitchen.name : "Loading..."} Menu
          </h1>
          <p className="text-gray-600">Manage menu items and ordering links</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/kitchens/${kitchenId}`)}
            className="border-purple-300 text-purple-700"
          >
            Back
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-blue-300 text-blue-700">
                Ordering Links
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-purple-800">Manage Ordering Links</DialogTitle>
              </DialogHeader>
              <OrderingLinksForm 
                kitchenId={kitchenId || ""} 
                existingLinks={orderingLinks}
                onSuccess={handleOrderingLinkSuccess}
              />
            </DialogContent>
          </Dialog>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" /> Add Menu Item
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="text-purple-800">Add New Menu Item</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <MenuItemForm 
                  kitchenId={kitchenId || ""} 
                  onSuccess={handleMenuItemSuccess} 
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[200px]">Category</TableHead>
                <TableHead className="w-[100px]">Price</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No menu items found. Add your first menu item!
                  </TableCell>
                </TableRow>
              ) : (
                menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.name}
                      {item.is_vegetarian && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Veg
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{item.category || "Uncategorized"}</TableCell>
                    <TableCell>${parseFloat(item.price.toString()).toFixed(2)}</TableCell>
                    <TableCell>
                      {item.is_available ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Unavailable
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMenuItem(item)}
                            className="border-purple-300 text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle className="text-purple-800">Edit Menu Item</SheetTitle>
                          </SheetHeader>
                          <div className="py-4">
                            <MenuItemForm 
                              kitchenId={kitchenId || ""} 
                              menuItem={item}
                              onSuccess={handleMenuItemSuccess} 
                            />
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
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

export default AdminMenuItems;
