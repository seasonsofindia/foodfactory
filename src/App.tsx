
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminKitchens from "./pages/admin/AdminKitchens";
import AdminKitchenDetail from "./pages/admin/AdminKitchenDetail";
import AdminMenuItems from "./pages/admin/AdminMenuItems";
import AdminLocations from "./pages/admin/AdminLocations";
import KitchenMenu from "./pages/KitchenMenu";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/kitchen/:id" element={<KitchenMenu />} />
            <Route path="/admin/kitchens" element={<AdminKitchens />} />
            <Route path="/admin/locations" element={<AdminLocations />} />
            <Route path="/admin/kitchens/:id" element={<AdminKitchenDetail />} />
            <Route path="/admin/kitchens/:id/menu" element={<AdminMenuItems />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
