import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { Lock } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginAdmin } = useShop();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await loginAdmin(email, password);
        if (res?.success) {
            navigate('/admin/dashboard');
        } else {
            setError(res?.message || 'Login failed.');
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card glass">
                <div className="login-icon-wrapper">
                    <Lock size={32} />
                </div>
                <h2>Admin Access</h2>
                <p>Login to manage iVault Accessories</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Admin Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter admin email address"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-100" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Login to Dashboard'}
                    </button>
                </form>


            </div>
        </div>
    );
};

export default AdminLogin;
