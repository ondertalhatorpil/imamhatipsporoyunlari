import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './GalleryAdmin.css';

const API_URL = process.env.REACT_APP_API_URL;


const GalleryAdmin = () => {
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newYear, setNewYear] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [description, setDescription] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);

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
            const response = await axios.get(`${API_URL}/api/gallery/years`); // /api eklendi
            setYears(response.data);
        } catch (error) {
            console.error('Yıllar yüklenirken hata:', error);
            toast.error('Yıllar yüklenirken hata oluştu');
        }
    };

    const fetchPhotos = async (year) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/gallery/photos/${year}`); // /api eklendi
            setPhotos(response.data);
        } catch (error) {
            console.error('Fotoğraflar yüklenirken hata:', error);
            toast.error('Fotoğraflar yüklenirken hata oluştu');
        }
        setLoading(false);
    };

    const handleYearAdd = async (e) => {
        e.preventDefault();
        if (!newYear || newYear < 2000 || newYear > 2100) {
            toast.error('Geçerli bir yıl giriniz (2000-2100 arası)');
            return;
        }

        try {
            await axios.post(`${API_URL}/api/gallery/years`, { year: parseInt(newYear) }); // /api eklendi
            toast.success('Yıl başarıyla eklendi');
            setNewYear('');
            fetchYears();
        } catch (error) {
            console.error('Yıl eklenirken hata:', error);
            toast.error(error.response?.data?.message || 'Yıl eklenirken hata oluştu');
        }
    };

    const handlePhotoUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !selectedYear || !description) {
            toast.error('Lütfen tüm alanları doldurunuz');
            return;
        }

        const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('year', selectedYear);
        formData.append('description', description);

        setUploadLoading(true);
        try {
            await axios.post(`${API_URL}/api/gallery/upload`, formData, { // /api eklendi
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Fotoğraf başarıyla yüklendi');
            setSelectedFile(null);
            setDescription('');
            document.getElementById('photoInput').value = '';
            fetchPhotos(selectedYear);
        } catch (error) {
            console.error('Fotoğraf yüklenirken hata:', error);
            toast.error('Fotoğraf yüklenirken hata oluştu');
        }
        setUploadLoading(false);
    };

    const handlePhotoDelete = async (photoId) => {
        if (!window.confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/api/gallery/photos/${photoId}`); // /api eklendi
            toast.success('Fotoğraf başarıyla silindi');
            fetchPhotos(selectedYear);
        } catch (error) {
            console.error('Fotoğraf silinirken hata:', error);
            toast.error('Fotoğraf silinirken hata oluştu');
        }
    };

    return (
        <div className="gallery-admin">
            <div className="admin-header">
                <h1>Galeri Yönetimi</h1>
            </div>

            <div className="admin-section">
                <h2>Yıl Ekle</h2>
                <form onSubmit={handleYearAdd} className="year-form">
                    <input
                        type="number"
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        placeholder="Yeni yıl ekle (örn: 2024)"
                        min="2000"
                        max="2100"
                    />
                    <button type="submit">Yıl Ekle</button>
                </form>
            </div>

            <div className="admin-section">
                <h2>Fotoğraf Yükle</h2>
                <form onSubmit={handlePhotoUpload} className="upload-form">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        required
                    >
                        <option value="">Yıl Seçin</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    <input
                        type="file"
                        id="photoInput"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        accept="image/*"
                        required
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Fotoğraf açıklaması"
                        required
                    />

                    <button type="submit" disabled={uploadLoading}>
                        {uploadLoading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                    </button>
                </form>
            </div>

            <div className="admin-section">
                <h2>Mevcut Fotoğraflar</h2>
                <div className="year-filter">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option value="">Yıl Seçin</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : (
                    <div className="photo-grid">
                        {photos.map((photo) => (
                            <div key={photo.id} className="photo-item">
                                <img src={`${API_URL}${photo.photo_path}`} alt={photo.description} />
                                <div className="photo-details">
                                    <p>{photo.description}</p>
                                    <button
                                        onClick={() => handlePhotoDelete(photo.id)}
                                        className="delete-btn"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && photos.length === 0 && selectedYear && (
                    <div className="no-photos">
                        Bu yıla ait fotoğraf bulunmamaktadır.
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryAdmin;