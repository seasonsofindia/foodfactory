
interface CategoriesSidebarProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryClick: (category: string) => void;
}

const CategoriesSidebar = ({ 
  categories, 
  activeCategory, 
  onCategoryClick 
}: CategoriesSidebarProps) => {
  if (categories.length === 0) return null;
  
  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow p-4 sticky top-4">
        <h2 className="font-medium text-lg mb-3 text-green-700 border-b pb-2">Categories</h2>
        <div className="space-y-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryClick(category)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                activeCategory === category
                  ? "bg-green-100 text-green-800 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesSidebar;
