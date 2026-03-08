import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Phone } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import './Footer.css';

const Footer = () => {
    const { categories } = useShop();

    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <img src="/logo.png" alt="iVault Accessories" className="footer-logo-img" />
                        <span className="logo-text">iVault <span>Accessories</span></span>
                    </Link>
                    <p className="footer-tagline">Premium Accessories & Tech Essentials</p>
                    <div className="footer-socials">
                        <a href="https://instagram.com/ivault._" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <Instagram size={24} />
                        </a>
                        <a href="https://wa.me/917907443251" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                            <Phone size={24} />
                        </a>
                    </div>
                </div>

                <div className="footer-links-group">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">All Products</Link></li>
                        <li><Link to="/trending">Trending</Link></li>
                        <li><Link to="/deals">Flash Deals</Link></li>
                    </ul>
                </div>

                <div className="footer-links-group">
                    <h4>Categories</h4>
                    <ul>
                        {categories && categories.length > 0 ? (
                            categories.slice(0, 5).map((category, index) => (
                                <li key={index}>
                                    <Link to={`/categories?filter=${encodeURIComponent(category.name)}`}>
                                        {category.name}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li><Link to="/products">All Categories</Link></li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        Developed by <a href="https://www.instagram.com/_marvan_kp_?igsh=cmludzkwMm01NWI4" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: '500' }}>MARVAN</a>
                    </p>
                    <p>&copy; 2026 iVault Accessories. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
