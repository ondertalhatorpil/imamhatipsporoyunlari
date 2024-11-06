import React from 'react';
import './blog.css';

import banner from '../../assets/haber-banner.png'

const BlogInsights = () => {
  const blogPosts = [
    {
      title: "13. İMAM HATİP SPOR OYUNLARI ÖDÜL TÖRENİ YAPILDI",
      date: "Mart 08, 2024",
      comments: 0,
      image: banner
    },
    {
      title: "14. İMAM HATİP SPOR OYUNLARI BAŞLADI",
      date: "Ekim 08, 2024",
      comments: 0,
      image: banner
    }
  ];

  return (
   <div className='blog-container'>
     <section className="blog-insights">
      <div className="blog-content">
        <span className="blog-tag">HABER & DUYURU</span>
        <h2>Kulübümüzden Haberler</h2>
        <p>Sporcularımızın başarıları, yaklaşan etkinlikler ve kulübümüzden tüm güncel gelişmeler için haberler sayfamızı takip edin.</p>
        <button className="view-all-btn">Tüm Haberleri Görüntüle</button>
      </div>
      <div className="blog-posts">
        {blogPosts.map((post, index) => (
          <div key={index} className="blog-card">
            <img src={post.image} alt={post.title} className="blog-image" />
            <div className="blog-card-content">
              <h3>{post.title}</h3>
              <div className="blog-meta">
                <span>{post.date}</span>
                <span>{post.comments} Yorum</span>
              </div>
              <a href="#" className="read-more">Devamını oku →</a>
            </div>
          </div>
        ))}
      </div>
    </section>
   </div>
  );
};

export default BlogInsights;