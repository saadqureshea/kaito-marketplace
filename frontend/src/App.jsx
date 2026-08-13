import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Cart from "./pages/Cart.jsx";
import Favourites from "./pages/Favourites.jsx";
import Checkout from "./pages/Checkout.jsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";
import Category from "./pages/Category.jsx";
import Search from "./pages/Search.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import ServiceDetail from "./pages/ServiceDetail.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Talent from "./pages/Talent.jsx";
import TalentDetail from "./pages/TalentDetail.jsx";
import BuyerDashboard from "./pages/Dashboard/BuyerDashboard.jsx";
import SellerDashboard from "./pages/Dashboard/SellerDashboard.jsx";
import WorkerDashboard from "./pages/Dashboard/WorkerDashboard.jsx";
import EmployerDashboard from "./pages/Dashboard/EmployerDashboard.jsx";
import AdminDashboard from "./pages/Dashboard/AdminDashboard.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* Keyed on pathname so each route change replays the fade. */}
      <main key={location.pathname} className="page-enter flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />

          <Route path="/digital-products" element={<Category section="digital-products" />} />
          <Route path="/made-to-order" element={<Category section="made-to-order" />} />
          <Route path="/services" element={<Category section="services" />} />
          <Route path="/remote-work" element={<Category section="remote-work" />} />
          <Route path="/search" element={<Search />} />

          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/talent" element={<Talent />} />
          <Route path="/talent/:id" element={<TalentDetail />} />

          <Route
            path="/dashboard/buyer"
            element={<ProtectedRoute roles={["buyer", "seller", "worker", "employer", "admin"]}><BuyerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/seller"
            element={<ProtectedRoute roles={["seller", "admin"]}><SellerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/worker"
            element={<ProtectedRoute roles={["worker", "admin"]}><WorkerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/employer"
            element={<ProtectedRoute roles={["employer", "admin"]}><EmployerDashboard /></ProtectedRoute>}
          />
          <Route
            path="/dashboard/admin"
            element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
