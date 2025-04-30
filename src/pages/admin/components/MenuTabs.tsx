
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from "@/integrations/supabase/types";
import OrderingLinksForm from "@/components/admin/OrderingLinksForm";
import MenuItemsTable from "./MenuItemsTable";
import { AddMenuItemButton } from "./MenuHeader";
import EmptyMenuTable from "./EmptyMenuTable";

type MenuTabsProps = {
  loading: boolean;
  kitchenId: string;
  categories: string[];
  groupedItems: Record<string, Tables<'menu_items'>[]>;
  orderingLinks: Tables<'ordering_links'>[];
  handleDeleteMenuItem: (id: string) => Promise<void>;
  handleMenuItemSuccess: () => void;
  handleOrderingLinkSuccess: () => void;
};

const MenuTabs = ({
  loading,
  kitchenId,
  categories,
  groupedItems,
  orderingLinks,
  handleDeleteMenuItem,
  handleMenuItemSuccess,
  handleOrderingLinkSuccess
}: MenuTabsProps) => {
  return (
    <Tabs defaultValue="menu-items" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
        <TabsTrigger value="ordering-links">Ordering Links</TabsTrigger>
      </TabsList>

      <TabsContent value="menu-items">
        <AddMenuItemButton kitchenId={kitchenId} onMenuItemSuccess={handleMenuItemSuccess} />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.length > 0 ? (
              categories.map(category => (
                <MenuItemsTable 
                  key={category}
                  categoryName={category}
                  menuItems={groupedItems[category]} 
                  onDeleteItem={handleDeleteMenuItem}
                  onItemSuccess={handleMenuItemSuccess}
                />
              ))
            ) : (
              <EmptyMenuTable />
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="ordering-links">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Ordering Links</h2>
          <OrderingLinksForm 
            kitchenId={kitchenId} 
            existingLinks={orderingLinks}
            onSuccess={handleOrderingLinkSuccess}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MenuTabs;
