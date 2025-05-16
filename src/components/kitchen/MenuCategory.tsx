
import { Tables } from "@/integrations/supabase/types";
import MenuItem from "./MenuItem";

interface MenuCategoryProps {
  category: string;
  items: Tables<'menu_items'>[];
  setRef: (category: string, element: HTMLDivElement | null) => void;
}

const MenuCategory = ({ category, items, setRef }: MenuCategoryProps) => {
  return (
    <div 
      ref={(el) => setRef(category, el)}
      className="mb-10"
    >
      <h2 className="text-xl font-semibold mb-3 text-green-700 border-b border-green-200 pb-2">
        {category}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MenuCategory;
