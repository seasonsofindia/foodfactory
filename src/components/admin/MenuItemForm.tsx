
import MenuItemFormDialog from "./form/MenuItemFormDialog";
import { Tables } from "@/integrations/supabase/types";

type MenuItemFormProps = {
  kitchenId: string;
  menuItem?: Tables<'menu_items'>;
  onSuccess: () => void;
};

const MenuItemForm = ({ kitchenId, menuItem, onSuccess }: MenuItemFormProps) => {
  return (
    <MenuItemFormDialog 
      kitchenId={kitchenId} 
      menuItem={menuItem} 
      onSuccess={onSuccess} 
    />
  );
};

export default MenuItemForm;
