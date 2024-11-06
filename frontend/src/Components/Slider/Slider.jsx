import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Slider.css';

const API_URL = process.env.REACT_APP_API_URL;


const Slider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSliders();
    }, []);

    const fetchSliders = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/sliders`);
            setSlides(response.data);
        } catch (error) {
            console.error('Slider verileri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Resimlerin yüklenmesini bekle
        const preloadImages = () => {
            const imagePromises = slides.map(slide => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    // URL'leri düzelt
                    img.src = `${API_URL}${slide.web_image}`; // web_image kullan
                    img.onload = resolve;
                    img.onerror = reject;
                });
            });

            Promise.all(imagePromises)
                .then(() => {
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Resim yükleme hatası:', error);
                    setLoading(false);
                });
        };

        if (slides.length > 0) {
            preloadImages();
        }
    }, [slides]);

    useEffect(() => {
        if (slides.length === 0) return;

        const timer = setInterval(() => {
            if (!isAnimating) {
                setIsAnimating(true);
                setTimeout(() => {
                    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
                    setIsAnimating(false);
                }, 500);
            }
        }, 7000);

        return () => clearInterval(timer);
    }, [isAnimating, slides.length]);

    const handleDotClick = (index) => {
        if (!isAnimating && index !== currentSlide) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentSlide(index);
                setIsAnimating(false);
            }, 500);
        }
    };

    if (loading) {
        return <div>Yükleniyor...</div>;
    }

    if (slides.length === 0) {
        return null;
    }

    return (
        <div className="slider-container">
            <a href={slides[currentSlide].link} className="slider-link">
                <picture>
                    <source
                        media="(max-width: 768px)"
                        srcSet={`${API_URL}${slides[currentSlide].mobile_image}`} // /api kaldırıldı
                    />
                    <img
                        src={`${API_URL}${slides[currentSlide].web_image}`} // /api kaldırıldı
                        alt={slides[currentSlide].title || 'Slider içeriği'}
                        className={`slider-image ${isAnimating ? 'fade-out' : 'fade-in'}`}
                    />
                </picture>
            </a>
            <div className="slider-dots">
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className={`dot ${currentSlide === index ? 'active' : ''}`}
                        onClick={() => handleDotClick(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Slider;