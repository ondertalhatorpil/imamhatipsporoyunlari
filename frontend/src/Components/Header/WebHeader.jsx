import React, { useState, useEffect } from 'react';
import './assets/WebHeader.css'
import Logo from './assets/images/oncu_logo_altii.png'
import { Link, useLocation } from 'react-router-dom'


import { FaWhatsappSquare } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaInstagramSquare } from "react-icons/fa";


const WebHeader = () => {
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const location = useLocation();
    const [activeLink, setActiveLink] = useState('Anasayfa');

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };

    window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navLinks = [
        { name: 'Anasayfa', path: '/' },
        { name: 'Fikstür', path: '/fikstür' },
        { name: 'Talimatname', path: '/talimatname' },
        { name: 'Galeri', path: '/galeri' },
        { name: 'İletişim', path: '/contact' },
    ];

    useEffect(() => {
        // URL'e göre aktif linki güncelle
        const currentPath = location.pathname;
        const activeNavLink = navLinks.find(link => link.path === currentPath);
        if (activeNavLink) {
            setActiveLink(activeNavLink.name);
        }
    }, [location]);

    return (
        <header className="web-header">
            <div className='header-bottom'>
                <div className='header-radio'>
                    {isSmallScreen && (
                        <div className='header-logo'>
                            <Link to="/">
                                <img src={Logo} alt="Öncü Spor Logo" />
                            </Link>
                        </div>
                    )}
                    <ul>
                        {navLinks.map((link) => (
                            <li
                                key={link.name}
                                className={activeLink === link.name ? 'active' : ''}
                                onClick={() => setActiveLink(link.name)}
                            >
                                <Link to={link.path}>{link.name}</Link>
                            </li>
                        ))}
                    </ul>
                    <div className='header-right'> 
                    <button className='formButton'><Link to="/form" >Kayıt Ol</Link></button>
                       <div className='icons-header'>
                        <FaInstagramSquare className='icon-header' />
                        <FaSquareXTwitter className='icon-header' />
                        <FaWhatsappSquare className='icon-header' />
                        <FaFacebookSquare className='icon-header' />
                       </div>
                    </div>
                </div>
            </div>
            {!isSmallScreen && (
                <div className='header-logo'>
                    <Link to="/">
                        <img src={Logo} alt="Öncü Spor Logo" />
                    </Link>
                </div>
            )}
        </header>
    );
};

export default WebHeader;