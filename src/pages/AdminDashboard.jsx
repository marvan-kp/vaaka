import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Package, TrendingUp, Zap, AlertTriangle, Plus, Edit2, Trash2, LogOut, Loader, UploadCloud } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { products, categories, promoCodes, banners, isAdmin, authLoading, logoutAdmin, deleteProduct, updateProduct, addProduct, addCategory, deleteCategory, toggleCategoryHomeStatus, addPromoCode, deletePromoCode, togglePromoCodeStatus, addBanner, toggleBannerStatus, deleteBanner } = useShop();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isManagingCategories, setIsManagingCategories] = useState(false);
    const [activeTab, setActiveTab] = useState('products'); // 'products', 'promos', 'banners'
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('');
    const [currentProduct, setCurrentProduct] = useState(null);

    const [newBanner, setNewBanner] = useState({
        image: '',
        title: '',
        subtitle: '',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        isActive: true
    });

    const [newPromo, setNewPromo] = useState({
        code: '',
        discountType: 'percentage', // 'percentage' or 'flat'
        discountValue: 0,
        categories: ['All Categories'],
        isActive: true
    });

    if (authLoading) {
        return <div className="admin-dashboard container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><h2>Loading Admin Details...</h2></div>;
    }

    if (!isAdmin) {
        return <Navigate to="/admin" />;
    }

    // Dashboard Stats
    const totalProducts = products.length;
    const trendingCount = products.filter(p => p.isTrending).length;
    const dealsCount = products.filter(p => p.isFlashDeal).length;
    const lowStockCount = products.filter(p => p.stock < 5).length;

    const handleToggleStatus = (id, field, value) => {
        const product = products.find(p => p.id === id);
        if (product) {
            updateProduct({ ...product, [field]: !value });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    const openAddModal = () => {
        setCurrentProduct({
            name: '',
            brand: '',
            category: 'Accessories',
            image: '',
            media: [],
            mrp: 0,
            discountPrice: 0,
            stock: 0,
            description: '',
            isTrending: false,
            isFlashDeal: false,
            specifications: []
        });
        setIsEditing(true);
    };

    const openEditModal = (product) => {
        // Ensure legacy products get a media array populated using their image
        const media = product.media && product.media.length > 0 ? [...product.media] : (product.image ? [product.image] : []);
        // Ensure legacy products have a specifications array
        const specifications = product.specifications && Array.isArray(product.specifications) ? [...product.specifications] : [];
        setCurrentProduct({ ...product, media, specifications });
        setIsEditing(true);
    };

    const handleSaveProduct = (e) => {
        e.preventDefault();

        // Sync first media item as backward-compatible primary image
        const productToSave = { ...currentProduct };
        if (productToSave.media && productToSave.media.length > 0) {
            productToSave.image = productToSave.media[0];
        }

        if (productToSave.id) {
            updateProduct(productToSave);
        } else {
            addProduct(productToSave);
        }

        setIsEditing(false);
        setCurrentProduct(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('key', '315f617f80eb4a8592a1b143aa1409ee'); // User's API key

        try {
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                const newUrl = data.data.url;
                setCurrentProduct(prev => ({
                    ...prev,
                    image: prev.media?.length === 0 ? newUrl : prev.image,
                    media: [...(prev.media || []), newUrl]
                }));
            } else {
                alert('Image upload failed: ' + (data.error?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please check your connection.');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleRemoveMedia = (indexToRemove) => {
        setCurrentProduct(prev => {
            const newMedia = prev.media.filter((_, idx) => idx !== indexToRemove);
            return {
                ...prev,
                media: newMedia,
                image: newMedia.length > 0 ? newMedia[0] : ''
            };
        });
    };

    const handleAddImageURL = (url) => {
        if (!url.trim()) return;
        setCurrentProduct(prev => ({
            ...prev,
            image: prev.media?.length === 0 ? url : prev.image,
            media: [...(prev.media || []), url]
        }));
    };

    const handleAddSpecification = () => {
        setCurrentProduct(prev => ({
            ...prev,
            specifications: [...(prev.specifications || []), { key: '', value: '' }]
        }));
    };

    const handleRemoveSpecification = (index) => {
        setCurrentProduct(prev => {
            const newSpecs = [...prev.specifications];
            newSpecs.splice(index, 1);
            return { ...prev, specifications: newSpecs };
        });
    };

    const handleSpecificationChange = (index, field, value) => {
        setCurrentProduct(prev => {
            const newSpecs = [...prev.specifications];
            newSpecs[index] = { ...newSpecs[index], [field]: value };
            return { ...prev, specifications: newSpecs };
        });
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim(), newCategoryIcon.trim() || '📦');
            setNewCategoryName('');
            setNewCategoryIcon('');
        }
    };

    const handleDeleteCategory = (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteCategory(id);
        }
    };

    const handleAddPromoCode = async (e) => {
        e.preventDefault();
        if (newPromo.code && newPromo.discountValue > 0) {
            const promoToSave = { ...newPromo };
            if (promoToSave.categories.length === 0) {
                promoToSave.categories = ['All Categories'];
            }
            const result = await addPromoCode(promoToSave);
            if (result.success) {
                setNewPromo({ code: '', discountType: 'percentage', discountValue: 0, categories: ['All Categories'], isActive: true });
            } else {
                alert(result.message);
            }
        } else {
            alert('Please provide a valid code and discount value.');
        }
    };

    const handleDeletePromo = (id) => {
        if (window.confirm('Are you sure you want to delete this promo code?')) {
            deletePromoCode(id);
        }
    };

    const handleCategoryToggle = (catName) => {
        setNewPromo(prev => {
            if (catName === 'All Categories') {
                return { ...prev, categories: ['All Categories'] };
            }

            let newCategories = prev.categories.filter(c => c !== 'All Categories');
            if (newCategories.includes(catName)) {
                newCategories = newCategories.filter(c => c !== catName);
            } else {
                newCategories.push(catName);
            }

            if (newCategories.length === 0) {
                newCategories = ['All Categories'];
            }

            return { ...prev, categories: newCategories };
        });
    };

    const handleBannerImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                // Target wide aspect ratio for the banner (13:4)
                const TARGET_RATIO = 13 / 4;
                const imgRatio = img.width / img.height;

                let drawWidth = img.width;
                let drawHeight = img.height;
                let offsetX = 0;
                let offsetY = 0;

                // Center crop the image perfectly
                if (imgRatio > TARGET_RATIO) {
                    // Image is too wide, crop the left and right edges
                    drawWidth = img.height * TARGET_RATIO;
                    offsetX = (img.width - drawWidth) / 2;
                } else {
                    // Image is too tall, crop the top and bottom
                    drawHeight = img.width / TARGET_RATIO;
                    offsetY = (img.height - drawHeight) / 2;
                }

                canvas.width = drawWidth;
                canvas.height = drawHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);

                // Convert canvas back to a compressed JPEG blob
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        alert('Error processing image crop.');
                        setIsUploading(false);
                        return;
                    }

                    const formData = new FormData();
                    formData.append('image', blob, 'cropped_banner.jpg');
                    formData.append('key', '315f617f80eb4a8592a1b143aa1409ee'); // User's API key

                    try {
                        const response = await fetch('https://api.imgbb.com/1/upload', {
                            method: 'POST',
                            body: formData,
                        });
                        const data = await response.json();
                        if (data.success) {
                            setNewBanner(prev => ({ ...prev, image: data.data.url }));
                        } else {
                            alert('Image upload failed: ' + (data.error?.message || 'Unknown error'));
                        }
                    } catch (error) {
                        console.error('Error uploading image:', error);
                        alert('Error uploading image. Please check your connection.');
                    } finally {
                        setIsUploading(false);
                        e.target.value = '';
                    }
                }, 'image/jpeg', 0.9);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleCategoryIconUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('key', '315f617f80eb4a8592a1b143aa1409ee');

        try {
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                setNewCategoryIcon(data.data.url);
            } else {
                alert('Image upload failed: ' + (data.error?.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading category image. Please check your connection.');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!newBanner.image) {
            alert('Please upload an image for the banner.');
            return;
        }

        const result = await addBanner(newBanner);
        if (result.success) {
            setNewBanner({
                image: '',
                title: '',
                subtitle: '',
                buttonText: 'Shop Now',
                buttonLink: '/products',
                isActive: true
            });
        } else {
            alert(result.message);
        }
    };

    const handleDeleteBanner = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            deleteBanner(id);
        }
    };

    return (
        <div className="admin-dashboard container">
            <div className="admin-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="admin-subtitle">Manage your products and store settings.</p>
                </div>
                <button className="btn-secondary btn-logout" onClick={logoutAdmin}>
                    <LogOut size={18} /> Logout
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#3498db' }}><Package size={24} /></div>
                    <div className="stat-info">
                        <h3>Total Products</h3>
                        <p>{totalProducts}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#e74c3c' }}><TrendingUp size={24} /></div>
                    <div className="stat-info">
                        <h3>Trending</h3>
                        <p>{trendingCount}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#9b59b6' }}><Zap size={24} /></div>
                    <div className="stat-info">
                        <h3>Flash Deals</h3>
                        <p>{dealsCount}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: '#f1c40f' }}><AlertTriangle size={24} /></div>
                    <div className="stat-info">
                        <h3>Low Stock Alerts</h3>
                        <p>{lowStockCount}</p>
                    </div>
                </div>
            </div>

            <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <button
                    className={`btn-secondary ${activeTab === 'products' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('products')}
                    style={{ background: activeTab === 'products' ? 'var(--color-primary)' : 'transparent', border: activeTab === 'products' ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)', color: activeTab === 'products' ? 'var(--color-accent)' : 'inherit' }}
                >
                    Products
                </button>
                <button
                    className={`btn-secondary ${activeTab === 'promos' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('promos')}
                    style={{ background: activeTab === 'promos' ? 'var(--color-primary)' : 'transparent', border: activeTab === 'promos' ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)', color: activeTab === 'promos' ? 'var(--color-accent)' : 'inherit' }}
                >
                    Promo Codes
                </button>
                <button
                    className={`btn-secondary ${activeTab === 'banners' ? 'active-tab' : ''}`}
                    onClick={() => setActiveTab('banners')}
                    style={{ background: activeTab === 'banners' ? 'var(--color-primary)' : 'transparent', border: activeTab === 'banners' ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)', color: activeTab === 'banners' ? 'var(--color-accent)' : 'inherit' }}
                >
                    Home Banners
                </button>
            </div>

            {activeTab === 'products' && (
                <div className="products-manager">
                    <div className="manager-header">
                        <h2>Product Inventory</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-secondary btn-add" onClick={() => setIsManagingCategories(true)}>
                                Manage Categories
                            </button>
                            <button className="btn-primary btn-add" onClick={openAddModal}>
                                <Plus size={18} /> Add Product
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price / MRP</th>
                                    <th>Stock</th>
                                    <th>Status Toggles</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="table-product-cell">
                                                {product.media && product.media[0] ? (
                                                    product.media[0].startsWith('data:video') ? (
                                                        <video src={product.media[0]} className="table-img" style={{ objectFit: 'cover' }} muted />
                                                    ) : (
                                                        <img src={product.media[0]} alt={product.name} className="table-img" />
                                                    )
                                                ) : (
                                                    <img src={product.image || 'https://placehold.co/100x100/1c1c1c/c9a227'} alt={product.name} className="table-img" />
                                                )}
                                                <div>
                                                    <strong>{product.name}</strong>
                                                    <span className="table-category">{product.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-price">₹{product.discountPrice?.toLocaleString()}</div>
                                            <div className="table-mrp">₹{product.mrp?.toLocaleString()}</div>
                                        </td>
                                        <td>
                                            <span className={`stock-badge ${product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : 'in'}`}>
                                                {product.stock} in stock
                                            </span>
                                        </td>
                                        <td>
                                            <div className="status-toggles">
                                                <label className="toggle-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={product.isTrending}
                                                        onChange={() => handleToggleStatus(product.id, 'isTrending', product.isTrending)}
                                                    />
                                                    Trending
                                                </label>
                                                <label className="toggle-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={product.isFlashDeal}
                                                        onChange={() => handleToggleStatus(product.id, 'isFlashDeal', product.isFlashDeal)}
                                                    />
                                                    Flash Deal
                                                </label>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn-icon-small edit" onClick={() => openEditModal(product)}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="btn-icon-small delete" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center">No products found. Add one to get started.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'promos' && (
                <div className="promos-manager">
                    <div className="manager-header" style={{ marginBottom: '20px' }}>
                        <h2>Promo Codes Management</h2>
                    </div>

                    <div className="promo-creation-card glass" style={{ padding: '20px', marginBottom: '30px' }}>
                        <h3>Create New Promo Code</h3>
                        <form onSubmit={handleAddPromoCode} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '15px' }}>
                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label>Code (e.g. SAVE20)</label>
                                <input type="text" required value={newPromo.code} onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} placeholder="SUMMER50" />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 150px' }}>
                                <label>Discount Type</label>
                                <select value={newPromo.discountType} onChange={e => setNewPromo({ ...newPromo, discountType: e.target.value })}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="flat">Flat Amount (₹)</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: '1 1 150px' }}>
                                <label>Value</label>
                                <input type="number" required min="1" value={newPromo.discountValue} onChange={e => setNewPromo({ ...newPromo, discountValue: Number(e.target.value) })} />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 100%' }}>
                                <label>Applicable Categories</label>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                    <label className="toggle-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input
                                            type="checkbox"
                                            checked={newPromo.categories.includes('All Categories')}
                                            onChange={() => handleCategoryToggle('All Categories')}
                                            style={{ margin: 0 }}
                                        />
                                        <span style={{ fontSize: '0.9rem' }}>All Categories</span>
                                    </label>
                                    {categories.map(cat => (
                                        <label key={cat.id} className="toggle-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <input
                                                type="checkbox"
                                                checked={newPromo.categories.includes(cat.name)}
                                                onChange={() => handleCategoryToggle(cat.name)}
                                                style={{ margin: 0 }}
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" style={{ height: '42px', marginBottom: '8px' }}>Add Code</button>
                        </form>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Promo Code</th>
                                    <th>Discount</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Created On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promoCodes.map(promo => (
                                    <tr key={promo.id}>
                                        <td><strong>{promo.code}</strong></td>
                                        <td>
                                            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>
                                                {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                                {(promo.categories || [promo.category || 'All Categories']).join(', ')}
                                            </span>
                                        </td>
                                        <td>
                                            <label className="toggle-label" style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={promo.isActive}
                                                    onChange={() => togglePromoCodeStatus(promo.id, promo.isActive)}
                                                />
                                                <span className={`stock-badge ${promo.isActive ? 'in' : 'out'}`} style={{ marginLeft: '10px' }}>
                                                    {promo.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </label>
                                        </td>
                                        <td>{new Date(promo.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn-icon-small delete" onClick={() => handleDeletePromo(promo.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {promoCodes.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center">No promo codes found. Create one above.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'banners' && (
                <div className="banners-manager">
                    <div className="manager-header" style={{ marginBottom: '20px' }}>
                        <h2>Home Page Banners</h2>
                    </div>

                    <div className="promo-creation-card glass" style={{ padding: '20px', marginBottom: '30px' }}>
                        <h3>Add New Banner</h3>
                        <form onSubmit={handleAddBanner} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '15px' }}>
                            <div className="form-group" style={{ flex: '1 1 100%' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>Banner Image (Ultra-wide Ratio 13:4) <span style={{ color: 'var(--color-danger)' }}>*</span></span>
                                    <label style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#c9a227', color: '#1a1a1a', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, opacity: isUploading ? 0.7 : 1 }}>
                                        {isUploading ? <Loader size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                                        {isUploading ? 'Uploading...' : 'Upload Image'}
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerImageUpload} disabled={isUploading} />
                                    </label>
                                </label>
                                <small style={{ display: 'block', color: 'var(--color-accent)', marginTop: '8px', fontSize: '0.8rem' }}>
                                    * Recommended image shape is ultra-wide (13:4 ratio). System auto-crops to fit.
                                </small>
                                {newBanner.image ? (
                                    <div style={{ marginTop: '10px', width: '200px', height: '100px', overflow: 'hidden', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)' }}>
                                        <img src={newBanner.image} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <input
                                        type="url"
                                        placeholder="Or paste an image URL here..."
                                        value={newBanner.image}
                                        onChange={e => setNewBanner({ ...newBanner, image: e.target.value })}
                                        style={{ marginTop: '5px' }}
                                    />
                                )}
                            </div>

                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label>Title (Optional)</label>
                                <input type="text" value={newBanner.title} onChange={e => setNewBanner({ ...newBanner, title: e.target.value })} placeholder="e.g. Big Summer Sale" />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label>Subtitle (Optional)</label>
                                <input type="text" value={newBanner.subtitle} onChange={e => setNewBanner({ ...newBanner, subtitle: e.target.value })} placeholder="e.g. Up to 50% Off Top Brands" />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 150px' }}>
                                <label>Button Text (Optional)</label>
                                <input type="text" value={newBanner.buttonText} onChange={e => setNewBanner({ ...newBanner, buttonText: e.target.value })} placeholder="e.g. Shop Now" />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label>Button Link</label>
                                <input type="text" value={newBanner.buttonLink} onChange={e => setNewBanner({ ...newBanner, buttonLink: e.target.value })} placeholder="e.g. /products" />
                            </div>

                            <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="submit" className="btn-primary" disabled={isUploading}>Save Banner</button>
                            </div>
                        </form>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Banner Preview</th>
                                    <th>Details</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.map((banner, index) => (
                                    <tr key={banner.id}>
                                        <td>
                                            <div style={{ width: '150px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative' }}>
                                                <img src={banner.image} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', fontSize: '0.7rem', borderBottomRightRadius: 'var(--radius-sm)' }}>
                                                    #{index + 1}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div><strong>{banner.title || '(No Title)'}</strong></div>
                                            {banner.subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{banner.subtitle}</div>}
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginTop: '4px' }}>
                                                🔗 {banner.buttonText} → {banner.buttonLink}
                                            </div>
                                        </td>
                                        <td>
                                            <label className="toggle-label" style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={banner.isActive}
                                                    onChange={() => toggleBannerStatus(banner.id, banner.isActive)}
                                                />
                                                <span className={`stock-badge ${banner.isActive ? 'in' : 'out'}`} style={{ marginLeft: '10px' }}>
                                                    {banner.isActive ? 'Active' : 'Hidden'}
                                                </span>
                                            </label>
                                        </td>
                                        <td>
                                            <button className="btn-icon-small delete" onClick={() => handleDeleteBanner(banner.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {banners.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center">No banners found. Add your first home page banner.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Product Edit/Add Modal */}
            {isEditing && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSaveProduct} className="product-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" required value={currentProduct.name} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Product Images ({currentProduct.media?.length || 0})</span>
                                        <label style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#c9a227', color: '#1a1a1a', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, opacity: isUploading ? 0.7 : 1, transition: 'all 0.2s' }}>
                                            {isUploading ? <Loader size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                            {isUploading ? 'Uploading...' : 'Upload Image'}
                                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUploading} />
                                        </label>
                                    </label>

                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            type="url"
                                            id="manual-url-input"
                                            placeholder="Or paste an image URL here..."
                                            disabled={isUploading}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={(e) => {
                                                const input = document.getElementById('manual-url-input');
                                                handleAddImageURL(input.value);
                                                input.value = '';
                                            }}
                                        >
                                            Add URL
                                        </button>
                                    </div>

                                    {currentProduct.media && currentProduct.media.length > 0 && (
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                            {currentProduct.media.map((url, idx) => (
                                                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: idx === 0 ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.2)' }}>
                                                    <img src={url} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMedia(idx)}
                                                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', padding: 0 }}
                                                        title="Remove Image"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            {currentProduct.media.length > 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '100%', display: 'block', marginTop: '5px' }}>* The first image (highlighted in gold) will be the primary display image.</span>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={currentProduct.category} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}>
                                        {categories.length === 0 && <option value="Accessories">Accessories</option>}
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Brand</label>
                                    <input type="text" required value={currentProduct.brand} onChange={e => setCurrentProduct({ ...currentProduct, brand: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-row three-cols">
                                <div className="form-group">
                                    <label>MRP (₹)</label>
                                    <input type="number" required value={currentProduct.mrp} onChange={e => setCurrentProduct({ ...currentProduct, mrp: Number(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label>Discount Price (₹)</label>
                                    <input type="number" required value={currentProduct.discountPrice} onChange={e => setCurrentProduct({ ...currentProduct, discountPrice: Number(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label>Stock Quantity</label>
                                    <input type="number" required value={currentProduct.stock} onChange={e => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea rows="3" value={currentProduct.description} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}></textarea>
                            </div>

                            <div className="form-group specifications-section" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <label style={{ margin: 0 }}>Product Specifications</label>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={handleAddSpecification}
                                        style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        <Plus size={14} /> Add Spec
                                    </button>
                                </div>

                                {(!currentProduct.specifications || currentProduct.specifications.length === 0) ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>No specifications added yet. Add details like Color, Material, or Compatibility.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {currentProduct.specifications.map((spec, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Name (e.g. Color)"
                                                    value={spec.key}
                                                    onChange={e => handleSpecificationChange(index, 'key', e.target.value)}
                                                    style={{ flex: '1', padding: '8px', fontSize: '0.9rem' }}
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Value (e.g. Black)"
                                                    value={spec.value}
                                                    onChange={e => handleSpecificationChange(index, 'value', e.target.value)}
                                                    style={{ flex: '2', padding: '8px', fontSize: '0.9rem' }}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSpecification(index)}
                                                    style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.2)', padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    title="Remove Spec"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)} disabled={isUploading}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isUploading}>Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Categories Modal */}
            {isManagingCategories && (
                <div className="modal-overlay">
                    <div className="modal-content glass" style={{ maxWidth: '500px' }}>
                        <h2>Manage Categories</h2>

                        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    required
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    placeholder="New category name..."
                                    style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-light)' }}
                                />
                                <button type="submit" className="btn-primary" disabled={isUploading}>Add Category</button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                                <label style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#333', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 500 }}>
                                    {isUploading ? <Loader size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                    Upload Category Icon (Image)
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCategoryIconUpload} disabled={isUploading} />
                                </label>

                                <span style={{ color: 'var(--text-muted)' }}>OR</span>

                                <input
                                    type="text"
                                    value={newCategoryIcon}
                                    onChange={e => setNewCategoryIcon(e.target.value)}
                                    placeholder="Emoji Icon (e.g. 🎧) or Image URL"
                                    style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-light)' }}
                                />
                            </div>

                            {newCategoryIcon && newCategoryIcon.startsWith('http') && (
                                <div style={{ marginTop: '10px', width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', background: 'var(--color-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-accent)' }}>
                                    <img src={newCategoryIcon} alt="Icon Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                            )}
                        </form>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {categories.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No categories found.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {categories.map(cat => (
                                        <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <span style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                                                    {cat.icon && cat.icon.startsWith('http') ? (
                                                        <img src={cat.icon} alt={cat.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                                    ) : (
                                                        cat.icon || '📦'
                                                    )}
                                                </span>
                                                {cat.name}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <label className="toggle-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.8rem', marginRight: '8px', color: 'var(--text-muted)' }}>Show on Home</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={cat.showOnHome !== false}
                                                        onChange={() => toggleCategoryHomeStatus(cat.id, cat.showOnHome !== false)}
                                                    />
                                                    <span className={`stock-badge ${cat.showOnHome !== false ? 'in' : 'out'}`} style={{ marginLeft: '10px' }}>
                                                        {cat.showOnHome !== false ? 'Yes' : 'No'}
                                                    </span>
                                                </label>
                                                <button onClick={() => handleDeleteCategory(cat.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '5px' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <button className="btn-secondary" onClick={() => setIsManagingCategories(false)} style={{ width: '100%' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
