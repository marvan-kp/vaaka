import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { HeartCrack } from 'lucide-react';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, toggleWishlist, isWishlisted } = useShop();

    return (
        <div className="wishlist-page container">
            <div className="page-header">
                <h1 className="page-title">Your Wishlist</h1>
                <p className="results-count">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
            </div>

            {wishlist.length === 0 ? (
                <div className="empty-wishlist">
                    <HeartCrack size={64} className="empty-icon" />
                    <h2>Your wishlist is empty</h2>
                    <p>Save items you love to view them later.</p>
                    <Link to="/products" className="btn-primary">Discover Products</Link>
                </div>
            ) : (
                <div className="product-grid">
                    {wishlist.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            toggleWishlist={toggleWishlist}
                            isWishlisted={isWishlisted(product.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
