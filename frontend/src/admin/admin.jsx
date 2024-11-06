// components/Admin/AdminDashboard.jsx
import React, { useState } from 'react';
import SportsRegistrationDashboard from './components/SportsRegistrationDashboard/SportsRegistrationDashboard';
import GalleryAdmin from './components/GalleryAdmin/GalleryAdmin';
import SliderAdmin from './components/SliderAdmin/SliderAdmin';
import './admin.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('sports');

    const menuItems = [
        { id: 'sports', title: 'Spor Kayıtları', icon: '🏆' },
        { id: 'gallery', title: 'Galeri Yönetimi', icon: '🖼️' },
        { id: 'slider', title: 'Slider Yönetimi', icon: '🎯' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'sports':
                return <SportsRegistrationDashboard />;
            case 'gallery':
                return <GalleryAdmin />;
            case 'slider':
                return <SliderAdmin />;
            default:
                return null;
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>ÖNCÜ Admin</h2>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.title}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn">
                        <span className="nav-icon">🚪</span>
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-content">
                <div className="content-header">
                    <h1>{menuItems.find(item => item.id === activeTab)?.title}</h1>
                </div>
                <div className="content-body">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;