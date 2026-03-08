import React from 'react';
import { X, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, promoCodes, removeFromCart, updateQuantity } = useShop();
    const navigate = useNavigate();
    const [promoInput, setPromoInput] = React.useState('');
    const [appliedPromo, setAppliedPromo] = React.useState(null);
    const [promoError, setPromoError] = React.useState('');

    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + (item.discountPrice * item.quantity), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        if (!appliedPromo) return subtotal;

        let eligibleSubtotal = subtotal;
        const promoCategories = appliedPromo.categories || [appliedPromo.category || 'All Categories'];

        if (!promoCategories.includes('All Categories')) {
            eligibleSubtotal = cart
                .filter(item => promoCategories.includes(item.category))
                .reduce((total, item) => total + (item.discountPrice * item.quantity), 0);
        }

        if (appliedPromo.discountType === 'percentage') {
            const discountAmount = eligibleSubtotal * (appliedPromo.discountValue / 100);
            return Math.max(0, subtotal - discountAmount);
        } else {
            const discountAmount = Math.min(eligibleSubtotal, appliedPromo.discountValue);
            return Math.max(0, subtotal - discountAmount);
        }
    };

    const handleApplyPromo = () => {
        setPromoError('');
        if (!promoInput.trim()) return;

        const code = promoInput.trim().toUpperCase();
        const promo = promoCodes.find(p => p.code === code);

        if (!promo) {
            setPromoError('Invalid promo code.');
        } else if (!promo.isActive) {
            setPromoError('This promo code is no longer active.');
        } else {
            const promoCategories = promo.categories || [promo.category || 'All Categories'];

            if (!promoCategories.includes('All Categories')) {
                const hasEligibleItem = cart.some(item => promoCategories.includes(item.category));
                if (!hasEligibleItem) {
                    setPromoError(`This promo code is only valid for: ${promoCategories.join(', ')}.`);
                    return;
                }
            }
            setAppliedPromo(promo);
            setPromoInput('');
        }
    };

    const removePromo = () => {
        setAppliedPromo(null);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        onClose();
        navigate('/checkout');
    };

    if (!isOpen && cart.length === 0) return null;

    return (
        <div className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`cart-drawer glass ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="cart-header">
                    <h2><ShoppingBag size={20} /> Your Cart</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close Cart">
                        <X size={24} />
                    </button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingBag size={48} />
                            <p>Your cart is empty.</p>
                            <button className="btn-secondary" onClick={onClose}>Continue Shopping</button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="cart-item">
                                <img src={item.media?.[0] || item.image} alt={item.name} className="cart-item-image" />
                                <div className="cart-item-details">
                                    <h4>{item.name}</h4>
                                    <p className="cart-item-price">₹{item.discountPrice.toLocaleString()}</p>

                                    <div className="cart-item-actions">
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                disabled={item.stock <= item.quantity}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="promo-section" style={{ marginBottom: '15px' }}>
                            {!appliedPromo ? (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter Promo Code"
                                        value={promoInput}
                                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                        style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-light)', textTransform: 'uppercase' }}
                                    />
                                    <button className="btn-secondary" onClick={handleApplyPromo} style={{ padding: '8px 15px' }}>Apply</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201, 162, 39, 0.1)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)' }}>
                                    <div>
                                        <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{appliedPromo.code}</span> applied!
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Saving {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}%` : `₹${appliedPromo.discountValue}`}
                                        </div>
                                    </div>
                                    <button onClick={removePromo} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            {promoError && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '5px' }}>{promoError}</p>}
                        </div>

                        {appliedPromo && (
                            <div className="cart-subtotal" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: 'var(--text-muted)' }}>
                                <span>Subtotal</span>
                                <span>₹{calculateSubtotal().toLocaleString()}</span>
                            </div>
                        )}
                        <div className="cart-total" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderTop: appliedPromo ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingTop: appliedPromo ? '10px' : '0' }}>
                            <span>Total</span>
                            <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                        <p className="checkout-note" style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Secure checkout with Vaaka.</p>
                        <button className="btn-primary btn-checkout" onClick={handleCheckout} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}>
                            <CreditCard size={18} /> Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
