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

   

    const handleDownload = async (photo) => {
        try {
            console.log('İndirme başlatılıyor:', photo.id);
            
            // Fotoğraf URL'ini oluştur
            const imageUrl = `${API_URL}${photo.photo_path}`;
            console.log('İndirilecek resim URL:', imageUrl);
    
            // Önce resmi indirmeyi dene
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error('Resim indirilemedi');
            }
            
            const blob = await imageResponse.blob();
            
            // İndirme işlemi başarılıysa sayacı artır
            try {
                const incrementUrl = `${API_URL}/api/gallery/increment-download/${photo.id}`;
                console.log('Sayaç güncelleme URL:', incrementUrl);
                await axios.post(incrementUrl);
            } catch (error) {
                console.error('Sayaç güncelleme hatası:', error);
                // Sayaç hatası olsa bile indirmeye devam et
            }
    
            // Dosya adını ayarla ve indirme işlemini başlat
            const fileName = photo.photo_path.split('/').pop();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName || 'photo.jpg';
            
            // İndirme işlemini gerçekleştir
            document.body.appendChild(link);
            link.click();
            
            // Temizlik
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);
    
            toast.success('Dosya indirme başladı');
            
            // Fotoğrafları yenile
            await fetchPhotos(selectedYear);
        } catch (error) {
            console.error('İndirme hatası:', error);
            toast.error(`İndirme hatası: ${error.message}`);
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
                <div className="archive-link-container">
                    <a
                        href="https://drive.google.com/drive/folders/13u3KOYN7elfUP0Dpqd04aMCwxJ10J5Rc?usp=drive_link"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="archive-button"
                    >
                        15. İmam Hatip Spor Oyunları Fotoğraf Arşivi için tıklayınız
                    </a>
                </div>

                {years.length > 0 ? (
                    <>
                        <div className="year-buttons">
                            {years.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`year-button ${selectedYear === year ? 'active' : ''}`}
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
                                                src={`${API_URL}${photo.photo_path}`}
                                                alt={`Fotoğraf ${index + 1} - ${selectedYear}`}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="photo-overlay">
                                            <p>
                                                {photo.description || `${selectedYear} - Fotoğraf ${index + 1}`}
                                            </p>
                                            <div className="download-section">
                                                <button
                                                    className="download-button"
                                                    onClick={() => handleDownload(photo)}
                                                >
                                                    İndir
                                                </button>
                                                <span className="download-count">
                                                    {photo.download_count || 0} kez indirildi
                                                </span>
                                            </div>
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