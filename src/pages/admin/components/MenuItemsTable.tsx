
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import MenuItemForm from "@/components/admin/MenuItemForm";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type MenuItemsTableProps = {
  menuItems: Tables<'menu_items'>[]; 
  categoryName: string;
  onDeleteItem: (id: string) => Promise<void>;
  onItemSuccess: () => void;
};

const MenuItemsTable = ({ menuItems, categoryName, onDeleteItem, onItemSuccess }: MenuItemsTableProps) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<Tables<'menu_items'> | null>(null);
  const { toast } = useToast();

  // Parse tags from comma-separated string
  const parseTags = (tagsString: string | null): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  return (
    <div key={categoryName} className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h2 className="text-lg font-medium text-green-700">{categoryName}</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead className="hidden md:table-cell">Tags</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((item) => (
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
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 text-xs">
                    Veg
                  </Badge>
                )}
              </TableCell>
              <TableCell>${parseFloat(item.price.toString()).toFixed(2)}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {parseTags(item.tags as unknown as string).map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
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
                      className="border-green-300 text-green-700 hover:text-green-800 hover:bg-green-50"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle className="text-green-800">Edit Menu Item</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <MenuItemForm 
                        kitchenId={item.kitchen_id} 
                        menuItem={item}
                        onSuccess={onItemSuccess} 
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteItem(item.id)}
                  className="border-red-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MenuItemsTable;
