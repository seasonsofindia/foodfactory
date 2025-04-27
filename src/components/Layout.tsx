
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
    if (!error) {
      setIsAdmin(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
                {user && isAdmin && (
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuLink href="/admin/kitchens" className="text-white hover:text-green-200">
                        Manage Kitchens
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </>
                )}
              </div>
              <div>
                {user ? (
                  <Button onClick={handleLogout} variant="outline" className="text-white border-white hover:bg-green-700">
                    Sign Out
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate("/auth")} 
                    className="bg-white text-green-600 hover:bg-green-100 hover:text-green-700"
                  >
                    Admin
                  </Button>
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
    </div>
  );
};

export default Layout;
