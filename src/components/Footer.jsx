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
                        <img src="/logo.png" alt="Vaaka" className="footer-logo-img" style={{ height: '40px', objectFit: 'contain' }} />
                        <span className="logo-text" style={{ fontFamily: 'serif', letterSpacing: '1px' }}>വാക</span>
                    </Link>
                    <p className="footer-tagline">The Perfect Outfit.</p>
                    <div className="footer-socials">
                        <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
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
                    <p>&copy; 2026 വാക - The Perfect Outfit. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
