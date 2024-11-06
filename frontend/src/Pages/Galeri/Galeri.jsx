import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './galeri.css';
import ResponsiveHeader from '../../Components/Header/ResponsiveHeader';
import Footer from '../../Components/Footer/Footer';

const API_URL = process.env.REACT_APP_API_URL;


const GalleryPage = () => {
    const [selectedYear, setSelectedYear] = useState(null);
    const [years, setYears] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchYears();
    }, []);

    useEffect(() => {
        if (selectedYear) {
            fetchPhotos(selectedYear);
        }
    }, [selectedYear]);

    const fetchYears = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/gallery/years`);
            if (response.data && response.data.length > 0) {
                setYears(response.data);
                setSelectedYear(response.data[0]);
            } else {
                toast.info('Henüz fotoğraf galerisi oluşturulmamış');
            }
        } catch (error) {
            console.error('Yıllar yüklenirken hata:', error);
            toast.error('Yıllar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const fetchPhotos = async (year) => {
        try {
            const response = await axios.get(`${API_URL}/api/gallery/photos/${year}`);
            if (response.data) {
                setPhotos(response.data);
                if (response.data.length === 0) {
                    toast.info(`${year} yılına ait fotoğraf bulunamadı`);
                }
            }
        } catch (error) {
            console.error('Fotoğraflar yüklenirken hata:', error);
            toast.error('Fotoğraflar yüklenirken bir hata oluştu');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <>
            <ResponsiveHeader />
            <div className="gallery-container">
                <h1>Fotoğraf Galerisi</h1>

                {years.length > 0 ? (
                    <>
                        <div className="year-buttons">
                            {years.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`year-button ${
                                        selectedYear === year ? 'active' : ''
                                    }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>

                        {selectedYear && (
                            <div className="photo-grid">
                                {photos.map((photo, index) => (
                                    <div key={photo.id} className="photo-item">
                                        <div className="photo-wrapper">
                                        <img
                                        src={`${API_URL}${photo.photo_path}`} // URL düzeltildi
                                        alt={`Fotoğraf ${index + 1} - ${selectedYear}`}
                                        loading="lazy"
                                    />
                                        </div>
                                        <div className="photo-overlay">
                                            <p>
                                                {photo.description ||
                                                    `${selectedYear} - Fotoğraf ${index + 1}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-content">
                        <p>Henüz fotoğraf galerisi oluşturulmamış</p>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default GalleryPage;