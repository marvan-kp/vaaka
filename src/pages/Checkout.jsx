import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowLeft, CreditCard } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const { cart, calculateTotal, clearCart } = useShop();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [shippingDetails, setShippingDetails] = useState({
        fullName: currentUser?.displayName || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);

    if (cart.length === 0 && !orderComplete) {
        return (
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
                <h2>Your cart is empty</h2>
                <p style={{ marginTop: '20px' }}>Please add some items to your cart before proceeding to checkout.</p>
                <button className="btn-primary" style={{ marginTop: '30px' }} onClick={() => navigate('/products')}>
                    Browse Collection
                </button>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Mock payment processing delay
        setTimeout(() => {
            setIsProcessing(false);
            setOrderComplete(true);
            clearCart();
        }, 2000);
    };

    if (orderComplete) {
        return (
            <div className="container checkout-complete">
                <ShieldCheck size={64} className="success-icon" color="var(--color-success)" />
                <h2>Order Confirmed!</h2>
                <p>Thank you for shopping with Vaaka.</p>
                <p>Your order ID is: #{Math.floor(100000 + Math.random() * 900000)}</p>
                <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '30px' }}>
                    Return to Home
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page container">
            <button className="btn-back" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                <ArrowLeft size={20} />
                <span>Back to Cart</span>
            </button>

            <h1 className="checkout-title">Checkout</h1>

            <div className="checkout-layout">
                <div className="checkout-form-section">
                    <form onSubmit={handlePlaceOrder}>
                        <div className="checkout-card glass">
                            <h3>Shipping Details</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Full Name</label>
                                    <input type="text" name="fullName" required value={shippingDetails.fullName} onChange={handleInputChange} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Street Address</label>
                                    <input type="text" name="address" required value={shippingDetails.address} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" name="city" required value={shippingDetails.city} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input type="text" name="state" required value={shippingDetails.state} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Card/PIN Code</label>
                                    <input type="text" name="pincode" required value={shippingDetails.pincode} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" name="phone" required value={shippingDetails.phone} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        <div className="checkout-card glass">
                            <h3>Payment Method</h3>
                            <p className="payment-note">Cash on Delivery is <strong>not available</strong> for Vaaka Premium Items.</p>

                            <div className="payment-options">
                                <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                    <CreditCard size={20} />
                                    <span>Credit / Debit Card</span>
                                </label>
                                <label className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}>
                                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                                    <span>UPI / NetBanking</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary btn-checkout-submit" disabled={isProcessing}>
                            {isProcessing ? 'Processing Payment...' : `Pay ₹${calculateTotal().toLocaleString()}`}
                        </button>
                    </form>
                </div>

                <div className="checkout-summary-section glass">
                    <h3>Order Summary</h3>
                    <div className="summary-items">
                        {cart.map(item => (
                            <div key={item.id} className="summary-item">
                                <div className="summary-item-info">
                                    <span className="summary-item-name">{item.name}</span>
                                    <span className="summary-item-qty">x {item.quantity}</span>
                                </div>
                                <span className="summary-item-price">₹{(item.discountPrice * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="summary-total">
                        <span>Total to Pay:</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
