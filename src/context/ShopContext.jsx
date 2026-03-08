import React, { createContext, useState, useEffect, useContext } from 'react';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { database, auth } from '../config/firebase';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

const initialProducts = [
    {
        id: 1,
        name: 'Apple iPhone 15 Pro Max',
        category: 'Used Mobiles',
        brand: 'Apple',
        image: 'https://placehold.co/400x400/1c1c1c/c9a227?text=iPhone+15+Pro',
        mrp: 159900,
        discountPrice: 139900,
        stock: 2,
        isTrending: true,
        isFlashDeal: false,
        description: 'Premium used mobile in excellent condition.'
    },
    {
        id: 2,
        name: 'Luxury Leather Back Cover for iPhone 14',
        category: 'Back Covers',
        brand: 'Apple',
        image: 'https://placehold.co/400x400/1c1c1c/c9a227?text=Leather+Cover',
        mrp: 2999,
        discountPrice: 1499,
        stock: 15,
        isTrending: true,
        isFlashDeal: true,
        description: 'High-quality leather back cover with MagSafe support.'
    },
    {
        id: 3,
        name: 'AirPods Pro (2nd Generation)',
        category: 'AirPods',
        brand: 'Apple',
        image: 'https://placehold.co/400x400/1c1c1c/c9a227?text=AirPods+Pro',
        mrp: 24900,
        discountPrice: 22900,
        stock: 0,
        isTrending: true,
        isFlashDeal: false,
        description: 'Rich, high-quality audio and voice.'
    },
    {
        id: 4,
        name: 'Samsung Galaxy Watch 6 Classic',
        category: 'Smart Watches',
        brand: 'Samsung',
        image: 'https://placehold.co/400x400/1c1c1c/c9a227?text=Galaxy+Watch',
        mrp: 36999,
        discountPrice: 32999,
        stock: 4,
        isTrending: false,
        isFlashDeal: true,
        description: 'Premium smartwatch with rotating bezel.'
    }
];

export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [promoCodes, setPromoCodes] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    // Listen for Realtime Database changes
    useEffect(() => {
        const productsRef = ref(database, 'products');
        const unsubscribeProducts = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Firebase stores it as an object dictionary if added with specific IDs
                const productList = Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
                setProducts(productList);
            } else {
                setProducts([]);
            }
        }, (error) => {
            console.error("Error fetching products from Firebase:", error);
        });

        // Listen for Categories
        const categoriesRef = ref(database, 'categories');
        const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const categoryList = Object.values(data).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
                setCategories(categoryList);
            } else {
                setCategories([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching categories from Firebase:", error);
            setLoading(false);
        });

        // Listen for Promo Codes
        const promoCodesRef = ref(database, 'promoCodes');
        const unsubscribePromoCodes = onValue(promoCodesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const promoList = Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                setPromoCodes(promoList);
            } else {
                setPromoCodes([]);
            }
        }, (error) => {
            console.error("Error fetching promo codes from Firebase:", error);
        });

        // Listen for Banners
        const bannersRef = ref(database, 'banners');
        const unsubscribeBanners = onValue(bannersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const bannersList = Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                setBanners(bannersList);
            } else {
                setBanners([]);
            }
        }, (error) => {
            console.error("Error fetching banners from Firebase:", error);
        });

        // Cleanup listener on unmount
        return () => {
            unsubscribeProducts();
            unsubscribeCategories();
            unsubscribePromoCodes();
            unsubscribeBanners();
        };
    }, []);

    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('ivault_wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('ivault_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [isAdmin, setIsAdmin] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Listen to Firebase Auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAdmin(!!user);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        localStorage.setItem('ivault_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    useEffect(() => {
        localStorage.setItem('ivault_cart', JSON.stringify(cart));
    }, [cart]);

    const toggleWishlist = (product) => {
        setWishlist(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                return prev.filter(item => item.id !== product.id);
            }
            return [...prev, product];
        });
    };

    const isWishlisted = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    // Cart Methods
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, amount) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQuantity = Math.max(1, item.quantity + amount);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
    };

    // General Products Methods
    const addProduct = async (product) => {
        try {
            const id = Date.now();
            const newProduct = { ...product, id, createdAt: id };
            const productRef = ref(database, `products/${id}`);
            await set(productRef, newProduct);
        } catch (error) {
            console.error("Error adding product", error);
        }
    };

    const updateProduct = async (updated) => {
        try {
            const productRef = ref(database, `products/${updated.id}`);
            await update(productRef, updated);
        } catch (error) {
            console.error("Error updating product", error);
        }
    };

    const deleteProduct = async (id) => {
        try {
            const productRef = ref(database, `products/${id}`);
            await remove(productRef);
        } catch (error) {
            console.error("Error deleting product", error);
        }
    };

    // Category Methods
    const addCategory = async (categoryName, iconStr = '📦') => {
        try {
            const id = Date.now().toString();
            const newCategory = { id, name: categoryName, icon: iconStr, showOnHome: true, createdAt: Date.now() };
            const categoryRef = ref(database, `categories/${id}`);
            await set(categoryRef, newCategory);
        } catch (error) {
            console.error("Error adding category", error);
        }
    };

    const deleteCategory = async (id) => {
        try {
            const categoryRef = ref(database, `categories/${id}`);
            await remove(categoryRef);
        } catch (error) {
            console.error("Error deleting category", error);
        }
    };

    const toggleCategoryHomeStatus = async (id, currentStatus) => {
        try {
            const categoryRef = ref(database, `categories/${id}`);
            // If currentStatus is undefined (old category), we assume it was true, so passing false.
            await update(categoryRef, { showOnHome: currentStatus === false ? true : false });
        } catch (error) {
            console.error("Error updating category home status", error);
        }
    };

    // Promo Code Methods
    const addPromoCode = async (promoData) => {
        try {
            // Assume promoData contains { code: 'SAVE10', discountType: 'percentage', discountValue: 10, isActive: true }
            const id = promoData.code.toUpperCase(); // Ensure codes are uppercase and serve as the unique ID
            const newPromo = { ...promoData, id, code: id, createdAt: Date.now() };
            const promoRef = ref(database, `promoCodes/${id}`);
            await set(promoRef, newPromo);
            return { success: true };
        } catch (error) {
            console.error("Error adding promo code", error);
            return { success: false, message: error.message };
        }
    };

    const togglePromoCodeStatus = async (id, currentStatus) => {
        try {
            const promoRef = ref(database, `promoCodes/${id}`);
            await update(promoRef, { isActive: !currentStatus });
        } catch (error) {
            console.error("Error updating promo code", error);
        }
    };

    const deletePromoCode = async (id) => {
        try {
            const promoRef = ref(database, `promoCodes/${id}`);
            await remove(promoRef);
        } catch (error) {
            console.error("Error deleting promo code", error);
        }
    };

    // Banner Methods
    const addBanner = async (bannerData) => {
        try {
            const id = Date.now().toString();
            const newBanner = { ...bannerData, id, createdAt: Date.now() };
            const bannerRef = ref(database, `banners/${id}`);
            await set(bannerRef, newBanner);
            return { success: true };
        } catch (error) {
            console.error("Error adding banner:", error);
            return { success: false, message: error.message };
        }
    };

    const updateBanner = async (updatedBanner) => {
        try {
            const bannerRef = ref(database, `banners/${updatedBanner.id}`);
            await update(bannerRef, updatedBanner);
        } catch (error) {
            console.error("Error updating banner:", error);
        }
    };

    const toggleBannerStatus = async (id, currentStatus) => {
        try {
            const bannerRef = ref(database, `banners/${id}`);
            await update(bannerRef, { isActive: !currentStatus });
        } catch (error) {
            console.error("Error toggling banner status:", error);
        }
    };

    const deleteBanner = async (id) => {
        try {
            const bannerRef = ref(database, `banners/${id}`);
            await remove(bannerRef);
        } catch (error) {
            console.error("Error deleting banner:", error);
        }
    };

    const loginAdmin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);
            let message = "Invalid email or password.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = "Invalid email or password.";
            } else if (error.code === 'auth/invalid-email') {
                message = "Invalid email format.";
            } else if (error.code === 'auth/too-many-requests') {
                message = "Too many attempts. Try again later.";
            }
            return { success: false, message };
        }
    };

    const logoutAdmin = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <ShopContext.Provider value={{
            products,
            categories,
            promoCodes,
            loading,
            authLoading,
            wishlist,
            cart,
            isAdmin,
            toggleWishlist,
            isWishlisted,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            addProduct,
            updateProduct,
            deleteProduct,
            addCategory,
            deleteCategory,
            toggleCategoryHomeStatus,
            addPromoCode,
            togglePromoCodeStatus,
            deletePromoCode,
            banners,
            addBanner,
            updateBanner,
            deleteBanner,
            toggleBannerStatus,
            loginAdmin,
            logoutAdmin
        }}>
            {children}
        </ShopContext.Provider>
    );
};
