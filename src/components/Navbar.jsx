import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Instagram, Menu, X, ShoppingBag, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';
import './Navbar.css';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cart } = useShop();
    const { currentUser } = useAuth();
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
                    <img src="/logo.png" alt="Vaaka" className="nav-logo-image" style={{ height: '55px', objectFit: 'contain' }} />
                </Link>

                <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}></div>

                <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/" onClick={closeMenu}>Home</Link>
                    <Link to="/products" onClick={closeMenu}>Collection</Link>
                    <Link to="/products?category=Men" onClick={closeMenu}>Men</Link>
                    <Link to="/products?category=Women" onClick={closeMenu}>Women</Link>
                    <Link to="/products?category=Others" onClick={closeMenu}>Others</Link>
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
                    <Link to={currentUser ? "/profile" : "/login"} className="action-icon" aria-label="Login">
                        <User size={20} />
                    </Link>
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
