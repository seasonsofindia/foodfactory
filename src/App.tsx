import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminKitchens from './pages/admin/AdminKitchens';
import AdminMenuItems from './pages/admin/AdminMenuItems';
import KitchenMenu from './pages/KitchenMenu';
import AdminOrderingLinks from './pages/admin/AdminOrderingLinks';
import CreateLittleCurryHouse from './pages/admin/CreateLittleCurryHouse';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/kitchens" element={<AdminKitchens />} />
        <Route path="/admin/kitchens/:id/menu" element={<AdminMenuItems />} />
        <Route path="/kitchens/:id" element={<KitchenMenu />} />
        <Route path="/admin/kitchens/:id/ordering-links" element={<AdminOrderingLinks />} />
        <Route path="/admin/create-little-curry-house" element={<CreateLittleCurryHouse />} />
      </Routes>
    </Router>
  );
}

export default App;
