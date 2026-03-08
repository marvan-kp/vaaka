import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import './Products.css';

const Products = () => {
    const { products, categories, toggleWishlist, isWishlisted } = useShop();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // States for filters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('filter') || 'All');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Extract unique brands (keep brands dynamic based on products for now)
    const brands = ['All', ...new Set(products.map(p => p.brand))];

    // Build the category list from our dynamic Firebase categories
    const categoryNames = ['All', ...categories.map(c => c.name)];
    // Fallback if categories are empty (e.g. initial load) but products exist
    if (categories.length === 0 && products.length > 0) {
        const uniqueProductCategories = new Set(products.map(p => p.category));
        uniqueProductCategories.forEach(cat => {
            if (!categoryNames.includes(cat)) {
                categoryNames.push(cat);
            }
        });
    }

    // Apply filters
    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
        return matchesSearch && matchesCategory && matchesBrand;
    });

    // Update selected category and search when URL query param changes
    useEffect(() => {
        const filter = searchParams.get('filter');
        if (filter) {
            setSelectedCategory(filter);
        }

        const search = searchParams.get('search');
        if (search !== null) {
            setSearchTerm(search);
        }
    }, [searchParams]);

    // Apply special page routing filters
    let pageFilteredProducts = filteredProducts;
    let pageTitle = "Shop Collection";

    if (location.pathname === '/trending') {
        pageFilteredProducts = filteredProducts.filter(p => p.isTrending);
        pageTitle = "Trending Products";
    } else if (location.pathname === '/deals') {
        pageFilteredProducts = filteredProducts.filter(p => p.isFlashDeal);
        pageTitle = "Flash Deals";
    } else if (location.pathname === '/categories') {
        pageTitle = "All Categories";
    }

    // Apply sorting to the final list
    pageFilteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.discountPrice - b.discountPrice;
            case 'price-high':
                return b.discountPrice - a.discountPrice;
            default: // 'newest'
                return b.id - a.id;
        }
    });

    const FilterSidebar = () => (
        <div className="filter-sidebar">
            <div className="filter-header-mobile">
                <h3>Filters</h3>
                <button className="close-filter" onClick={() => setIsMobileFilterOpen(false)}>
                    <X size={24} />
                </button>
            </div>

            <div className="filter-group">
                <h4>Category</h4>
                <div className="filter-options">
                    {categoryNames.map(cat => (
                        <label key={cat} className="custom-radio">
                            <input
                                type="radio"
                                name="category"
                                value={cat}
                                checked={selectedCategory === cat}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSearchParams(e.target.value === 'All' ? {} : { filter: e.target.value });
                                }}
                            />
                            <span className="radio-label">{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="filter-group">
                <h4>Brand</h4>
                <div className="filter-options">
                    {brands.map(brand => (
                        <label key={brand} className="custom-radio">
                            <input
                                type="radio"
                                name="brand"
                                value={brand}
                                checked={selectedBrand === brand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                            />
                            <span className="radio-label">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="products-page container">
            <div className="page-header">
                <h1 className="page-title">{pageTitle}</h1>

                <div className="products-toolbar">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="toolbar-controls">
                        <button className="btn-filter-mobile" onClick={() => setIsMobileFilterOpen(true)}>
                            <SlidersHorizontal size={20} />
                            <span>Filters</span>
                        </button>

                        <select
                            className="sort-dropdown"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest Arrivals</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="products-layout">
                <div className={`sidebar-wrapper ${isMobileFilterOpen ? 'open' : ''}`}>
                    <div className="sidebar-backdrop" onClick={() => setIsMobileFilterOpen(false)}></div>
                    <FilterSidebar />
                </div>

                <div className="products-grid-container">
                    {pageFilteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <h2>No products found</h2>
                            <p>Try adjusting your search or filters.</p>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('All');
                                    setSelectedBrand('All');
                                    setSearchParams({});
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="results-count">Showing {pageFilteredProducts.length} results</p>
                            <div className="product-grid">
                                {pageFilteredProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        toggleWishlist={toggleWishlist}
                                        isWishlisted={isWishlisted(product.id)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;
