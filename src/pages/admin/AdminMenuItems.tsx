
import { useParams } from "react-router-dom";
import { useKitchenData } from "@/hooks/useKitchenData";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useOrderingLinks } from "@/hooks/useOrderingLinks";
import MenuHeader from "./components/MenuHeader";
import MenuTabs from "./components/MenuTabs";

const AdminMenuItems = () => {
  const { id: kitchenId } = useParams<{ id: string }>();
  const { kitchen } = useKitchenData(kitchenId);
  const { loading, categories, groupedItems, handleDeleteMenuItem, fetchMenuItems } = useMenuItems(kitchenId);
  const { orderingLinks, handleOrderingLinkSuccess } = useOrderingLinks(kitchenId);

  const handleMenuItemSuccess = () => {
    fetchMenuItems();
  };

  return (
    <div className="container mx-auto py-6">
      <MenuHeader 
        kitchen={kitchen} 
        kitchenId={kitchenId || ""} 
        onMenuItemSuccess={handleMenuItemSuccess} 
      />

      <MenuTabs 
        loading={loading}
        kitchenId={kitchenId || ""}
        categories={categories}
        groupedItems={groupedItems}
        orderingLinks={orderingLinks}
        handleDeleteMenuItem={handleDeleteMenuItem}
        handleMenuItemSuccess={handleMenuItemSuccess}
        handleOrderingLinkSuccess={handleOrderingLinkSuccess}
      />
    </div>
  );
};

export default AdminMenuItems;
