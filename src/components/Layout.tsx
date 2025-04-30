
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { getCurrentUser, logout, isAdmin, AuthUser } from "@/utils/auth";
import { ArrowLeft } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on a kitchen detail page by looking at the URL pattern
  const isKitchenDetailPage = location.pathname.startsWith('/kitchen/');
  // Check if we're on the main page
  const isMainPage = location.pathname === '/';

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-green-600 to-blue-600 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NavigationMenu className="h-16">
            <NavigationMenuList className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-4">
                <NavigationMenuItem>
                  <NavigationMenuLink href="/" className="text-white font-bold text-xl hover:text-green-200">
                    Food Factory
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {!isMainPage && (
                  <NavigationMenuItem>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate(-1)} 
                      className="text-white hover:text-green-200 flex items-center gap-1 p-0"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </NavigationMenuItem>
                )}
              </div>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <footer className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-end">
          {!user ? (
            <Button 
              onClick={() => navigate("/auth")} 
              variant="outline"
              className="text-gray-600 hover:text-gray-800"
            >
              Admin
            </Button>
          ) : (
            <Button onClick={handleLogout} variant="outline" className="text-gray-600 hover:text-gray-800">
              Sign Out
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
