import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import './ProductCard.css';

const ProductCard = ({ product, toggleWishlist, isWishlisted }) => {
    const { addToCart } = useShop();
    const {
        id,
        name,
        category,
        image,
        mrp,
        discountPrice,
        stock,
        isTrending,
        isFlashDeal,
        media
    } = product;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const discountPercentage = Math.round(((mrp - discountPrice) / mrp) * 100);

    const getStockBadge = () => {
        if (stock === 0) return <span className="badge badge-error">Out of Stock</span>;
        if (stock < 5) return <span className="badge badge-warning">Only {stock} Left</span>;
        return null;
    };

    const mediaList = media && media.length > 0 ? media : [image];
    const activeMedia = mediaList[currentImageIndex];
    const isVideo = activeMedia && activeMedia.startsWith('data:video');

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % mediaList.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <Link to={`/product/${id}`} style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
                    {isVideo ? (
                        <video src={activeMedia} className="product-image" style={{ objectFit: 'cover' }} autoPlay muted loop playsInline />
                    ) : (
                        <img src={activeMedia || "https://placehold.co/400x400/1c1c1c/c9a227?text=Product"} alt={name} className="product-image" loading="lazy" />
                    )}

                    {/* Image Navigation Arrows */}
                    {mediaList.length > 1 && (
                        <>
                            <button className="carousel-arrow carousel-prev" onClick={prevImage} aria-label="Previous image">
                                &#10094;
                            </button>
                            <button className="carousel-arrow carousel-next" onClick={nextImage} aria-label="Next image">
                                &#10095;
                            </button>
                            <div className="carousel-dots">
                                {mediaList.map((_, idx) => (
                                    <div key={idx} className={`carousel-dot ${idx === currentImageIndex ? 'active' : ''}`} />
                                ))}
                            </div>
                        </>
                    )}
                </Link>

                <div className="product-badges">
                    {discountPercentage > 0 && <span className="badge badge-accent">-{discountPercentage}%</span>}
                    {isTrending && <span className="badge badge-trending">🔥 Trending</span>}
                    {isFlashDeal && <span className="badge badge-deal">⚡ Flash Deal</span>}
                    {getStockBadge()}
                </div>

                <button
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                    }}
                    aria-label="Toggle Wishlist"
                >
                    <Heart size={18} fill={isWishlisted ? 'var(--color-accent)' : 'none'} />
                </button>
            </div>

            <div className="product-info">
                <p className="product-category">{category}</p>
                <h3 className="product-name"><Link to={`/product/${id}`}>{name}</Link></h3>

                <div className="product-price-row">
                    <span className="price-discount">₹{discountPrice?.toLocaleString()}</span>
                    {mrp > discountPrice && <span className="price-mrp">₹{mrp?.toLocaleString()}</span>}
                </div>

                <div className="product-actions">
                    <Link to={`/product/${id}`} className="btn-icon btn-view">
                        <Eye size={18} />
                    </Link>
                    <button
                        className={`btn-primary btn-buy ${stock === 0 ? 'disabled' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            if (stock > 0) addToCart(product);
                        }}
                        disabled={stock === 0}
                    >
                        <ShoppingBag size={18} />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
