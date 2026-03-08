import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Wishlist from './pages/Wishlist';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

import ScrollToTop from './components/ScrollToTop';

const Placeholder = ({ title }) => <div className="container" style={{ paddingTop: '100px', minHeight: '80vh' }}><h1>{title}</h1></div>;

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />

            <Route path="/categories" element={<Products />} />
            <Route path="/trending" element={<Products />} />
            <Route path="/deals" element={<Products />} />

            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
