import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Instagram, Phone, Menu, X, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import CartDrawer from './CartDrawer';
import './Navbar.css';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cart } = useShop();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMenuOpen(false); // Close menu on search
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar glass">
            <div className="container nav-container">
                <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <Link to="/" className="nav-logo" onClick={closeMenu}>
                    <img src="/logo.png" alt="iVault Accessories" className="nav-logo-image" />
                    <span className="logo-text">iVault <span className="logo-subtext">Accessories</span></span>
                </Link>

                <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>

                <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/" onClick={closeMenu}>Home</Link>
                    <Link to="/products" onClick={closeMenu}>Products</Link>
                    <Link to="/categories" onClick={closeMenu}>Categories</Link>
                    <Link to="/trending" onClick={closeMenu}>Trending</Link>
                </div>
                <div className="nav-actions">
                    <form className="search-bar" onSubmit={handleSearch}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                    <Link to="/wishlist" className="action-icon" aria-label="Wishlist">
                        <Heart size={20} />
                    </Link>
                    <button className="action-icon cart-icon-btn" onClick={() => setIsCartOpen(true)} aria-label="Cart">
                        <ShoppingBag size={20} />
                        {cart.length > 0 && <span className="cart-badge">{cart.reduce((total, item) => total + item.quantity, 0)}</span>}
                    </button>
                    <a href="https://instagram.com/ivault._" target="_blank" rel="noreferrer" className="action-icon" aria-label="Instagram">
                        <Instagram size={20} />
                    </a>
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </nav>
    );
};

export default Navbar;
