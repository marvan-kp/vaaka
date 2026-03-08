import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
    const { products, banners, categories, toggleWishlist, isWishlisted } = useShop();
    const [timeLeft, setTimeLeft] = useState(3600 * 5); // 5 hours countdown for demo
    const [currentBanner, setCurrentBanner] = useState(0);

    const activeBanners = banners.filter(b => b.isActive);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Autoplay banner carousel
    useEffect(() => {
        if (activeBanners.length <= 1) return;
        const bannerTimer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % activeBanners.length);
        }, 5000); // Change banner every 5 seconds
        return () => clearInterval(bannerTimer);
    }, [activeBanners.length, currentBanner]); // Added currentBanner to dependency so manual clicks reset timer

    const nextBanner = () => {
        setCurrentBanner(prev => (prev + 1) % activeBanners.length);
    };

    const prevBanner = () => {
        setCurrentBanner(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const trendingProducts = products.filter(p => p.isTrending);
    const flashDeals = products.filter(p => p.isFlashDeal);

    return (
        <div className="home-page">
            {/* Hero / Banner Section */}
            {activeBanners.length > 0 ? (
                <section className="dynamic-hero-section">
                    <div className="banner-slider" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
                        {activeBanners.map((banner, index) => (
                            <div className="banner-slide" key={banner.id} style={{ backgroundImage: `url(${banner.image})` }}>
                                <div className="banner-overlay"></div>
                                <div className="container hero-container dynamic-banner-content">
                                    {banner.title && <h1 className="hero-title">{banner.title}</h1>}
                                    {banner.subtitle && <p className="hero-subtitle">{banner.subtitle}</p>}
                                    {banner.buttonText && banner.buttonLink && (
                                        <div className="hero-actions">
                                            <Link to={banner.buttonLink} className="btn-primary">{banner.buttonText}</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {activeBanners.length > 1 && (
                        <>
                            <button className="banner-nav-btn prev" onClick={prevBanner} aria-label="Previous Banner">
                                <ChevronLeft size={28} />
                            </button>
                            <button className="banner-nav-btn next" onClick={nextBanner} aria-label="Next Banner">
                                <ChevronRight size={28} />
                            </button>

                            <div className="banner-dots">
                                {activeBanners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`banner-dot ${idx === currentBanner ? 'active' : ''}`}
                                        onClick={() => setCurrentBanner(idx)}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </section>
            ) : (
                <section className="hero-section">
                    <div className="hero-bg-gradient"></div>
                    <div className="container hero-container">
                        <h1 className="hero-title">iVault Accessories</h1>
                        <p className="hero-subtitle">Premium Accessories & Tech Essentials</p>
                        <div className="hero-actions">
                            <Link to="/products" className="btn-primary">Browse Products</Link>
                            <Link to="/trending" className="btn-secondary">View Trending</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <h2 className="section-title">Shop by Category</h2>
                    <div className="categories-grid">
                        {categories.filter(cat => cat.showOnHome !== false).map(cat => (
                            <Link to={`/categories?filter=${cat.name}`} key={cat.id} className="category-card">
                                <span className="category-icon">
                                    {cat.icon && cat.icon.startsWith('http') ? (
                                        <img src={cat.icon} alt={cat.name} loading="lazy" />
                                    ) : (
                                        cat.icon || '📦'
                                    )}
                                </span>
                                <span className="category-name">{cat.name}</span>
                            </Link>
                        ))}
                        {categories.filter(cat => cat.showOnHome !== false).length === 0 && (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>No categories selected for home page.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Flash Deals Section */}
            {flashDeals.length > 0 && (
                <section className="flash-deals-section">
                    <div className="container">
                        <div className="deals-header">
                            <h2 className="section-title">
                                <span className="deal-icon">⚡</span> Flash Deals
                            </h2>
                            <div className="countdown-timer">
                                <span className="timer-label">Ends in</span>
                                <span className="timer-value">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                        <div className="product-grid">
                            {flashDeals.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    toggleWishlist={toggleWishlist}
                                    isWishlisted={isWishlisted(product.id)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trending Products Section */}
            <section className="trending-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Trending Now</h2>
                        <Link to="/trending" className="view-all-link">View All</Link>
                    </div>

                    {/* Horizontal scroll wrapper */}
                    <div className="trending-carousel">
                        {trendingProducts.map(product => (
                            <div className="carousel-item" key={product.id}>
                                <ProductCard
                                    product={product}
                                    toggleWishlist={toggleWishlist}
                                    isWishlisted={isWishlisted(product.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Instagram Feed Section */}
            <section className="instagram-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Follow Us @ivault._</h2>
                        <a href="https://instagram.com/ivault._" target="_blank" rel="noreferrer" className="btn-secondary">
                            Follow on Instagram
                        </a>
                    </div>
                    <div className="instagram-widget-container" style={{ marginTop: '30px' }}>
                        <div className="elfsight-app-8f445d31-ca81-47a4-81d4-5295906ef1a1" data-elfsight-app-lazy></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
