import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Calendar,
  Mail,
  FileText,
  UserPlus,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Wallpaper
} from 'lucide-react';
import './assets/MobilMenu.css';
import Logo from './assets/images/oncu_logo_altii.png';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      icon: <Home size={20} />,
      text: 'Anasayfa',
      to: '/'
    },
    {
      icon: <FileText size={20} />,
      text: 'Talimatname',
      to: '/talimatname'
    },
    {
      icon: <Wallpaper size={20} />,
      text: 'Galeri',
      to: '/galeri'
    },
    {
      icon: <UserPlus size={20} />,
      text: 'Kayıt Ol',
      to: '/form'
    },
    {
      icon: <Mail size={20} />,
      text: 'İletişim',
      to: '/contact'
    }
  ];

  const socialIcons = [
    { icon: <Instagram size={20} />, href: 'https://www.instagram.com/oncugenclikspor/' },
    { icon: <Twitter size={20} />, href: 'https://x.com/oncugenclikspor' },
    { icon: <Facebook size={20} />, href: 'https://www.facebook.com/OncuGenclikveSpor/' },
    { icon: <Youtube size={20} />, href: 'https://www.youtube.com/@ÖncüSporKulübü' },
  ];

  return (
    <div className="mobile-menu">
      <nav className="nav">
        <div className="nav-content">
          <div className="logo">
            <Link to="/">
              <img src={Logo} alt="İmam Hatip Spor Oyunları" />
            </Link>
          </div>
          <button onClick={toggleMenu} className="menu-button">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <div
        className={`overlay ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      ></div>

      <div className={`menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-content">
          <ul className="menu-list">
            {menuItems.map((item, index) => (
              <li key={index} className="menu-item">
                <Link
                  to={item.to}
                  className="menu-link"
                  onClick={toggleMenu}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="social-icons">
            {socialIcons.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;