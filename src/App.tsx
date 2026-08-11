import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

import Profile from './pages/Profile';
import Support from './pages/Support';
import AuthCallback from './pages/AuthCallback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Sell from './pages/Sell';
import Repair from './pages/Repair';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';

import SignUp from './pages/SignUp';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <WishlistProvider>
                <Layout>
                <Helmet>
                  <title>John20 Deals | Your Smart Tech Plug</title>
                  <meta name="description" content="High-quality laptops, smartphones, and accessories in Ghana. Fast delivery and secure payments." />
                </Helmet>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/login/*" element={<Login />} />
                  <Route path="/signup/*" element={<SignUp />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/sell" element={<Sell />} />
                  <Route path="/repair" element={<Repair />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
