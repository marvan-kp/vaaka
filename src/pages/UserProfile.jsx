import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Mail, Shield } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // If there's no user loaded yet, show a loader or redirect
    if (!currentUser) {
        return (
            <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
                <p>Loading profile...</p>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <div className="profile-page">
            <div className="container profile-container">
                <div className="profile-header">
                    <h1>My Account</h1>
                    <p>Manage your details and view your activity.</p>
                </div>

                <div className="profile-content">
                    <div className="profile-card glass">
                        <div className="profile-avatar">
                            {currentUser.photoURL ? (
                                <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
                            ) : (
                                <div className="avatar-placeholder">
                                    <User size={48} />
                                </div>
                            )}
                        </div>

                        <div className="profile-info">
                            <h2>{currentUser.displayName || 'Vaaka User'}</h2>
                            <div className="info-item">
                                <Mail size={18} />
                                <span>{currentUser.email}</span>
                            </div>
                            <div className="info-item">
                                <Shield size={18} />
                                <span>{currentUser.providerData[0]?.providerId === 'google.com' ? 'Google Account' : 'Email Account'}</span>
                            </div>
                        </div>

                        <button className="btn-secondary logout-btn" onClick={handleLogout}>
                            <LogOut size={20} />
                            Log Out
                        </button>
                    </div>

                    <div className="profile-details">
                        <div className="details-card glass">
                            <h3>Order History</h3>
                            <div className="empty-state">
                                <p>You haven't placed any orders yet.</p>
                                <button className="btn-primary" onClick={() => navigate('/products')}>Start Shopping</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
