
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import MenuItemForm from "@/components/admin/MenuItemForm";
import { Tables } from "@/integrations/supabase/types";

type MenuHeaderProps = {
  kitchen: Tables<'kitchens'> | null;
  kitchenId: string;
  onMenuItemSuccess: () => void;
};

const MenuHeader = ({ kitchen, kitchenId, onMenuItemSuccess }: MenuHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-green-800">
          {kitchen ? kitchen.name : "Loading..."} Menu Management
        </h1>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(`/admin/kitchens`)}
          className="border-green-300 text-green-700"
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export const AddMenuItemButton = ({ kitchenId, onMenuItemSuccess }: { kitchenId: string, onMenuItemSuccess: () => void }) => {
  return (
    <div className="flex justify-end mb-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Add Menu Item
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-green-800">Add New Menu Item</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <MenuItemForm 
              kitchenId={kitchenId} 
              onSuccess={onMenuItemSuccess} 
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuHeader;
