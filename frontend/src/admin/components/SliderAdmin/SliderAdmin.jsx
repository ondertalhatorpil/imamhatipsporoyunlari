// components/Admin/SliderAdmin/index.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SliderAdmin.css';

const API_URL = process.env.REACT_APP_API_URL;

const SliderAdmin = () => {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        webImage: null,
        mobileImage: null,
        link: '',
        orderNumber: 0
    });
    const [previews, setPreviews] = useState({
        web: '',
        mobile: ''
    });
    const [editingSlider, setEditingSlider] = useState(null);

    useEffect(() => {
        fetchSliders();
    }, []);

    const fetchSliders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/sliders`); // /api eklendi
            setSliders(response.data);
        } catch (error) {
            console.error('Slider verilerini getirme hatası:', error);
            toast.error('Slider verileri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    // Form input değişikliklerini handle et
    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            if (file) {
                // Dosya boyutu kontrolü (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
                    return;
                }

                setFormData(prev => ({
                    ...prev,
                    [name]: file
                }));

                // Önizleme için URL oluştur
                const previewType = name === 'webImage' ? 'web' : 'mobile';
                setPreviews(prev => ({
                    ...prev,
                    [previewType]: URL.createObjectURL(file)
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'orderNumber' ? parseInt(value) || 0 : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.webImage && !editingSlider) {
            toast.error('Lütfen web görüntüsü seçin');
            return;
        }

        const submitData = new FormData();
        if (formData.webImage) submitData.append('webImage', formData.webImage);
        if (formData.mobileImage) submitData.append('mobileImage', formData.mobileImage);
        submitData.append('link', formData.link);
        submitData.append('orderNumber', formData.orderNumber);

        setSubmitting(true);
        try {
            if (editingSlider) {
                await axios.put(`${API_URL}/api/sliders/${editingSlider.id}`, submitData); // /api eklendi
                toast.success('Slider başarıyla güncellendi');
            } else {
                await axios.post(`${API_URL}/api/sliders`, submitData);
                toast.success('Slider başarıyla eklendi');
            }
            resetForm();
            fetchSliders();
        } catch (error) {
            console.error('Slider kaydetme hatası:', error);
            toast.error(
                error.response?.data?.message ||
                'Slider kaydedilirken bir hata oluştu'
            );
            toast.error(error.response?.data?.message || 'Slider kaydedilirken bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    // Slider silme işlemi
    const handleDelete = async (id) => {
        if (!window.confirm('Bu slider\'ı silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/api/sliders/${id}`); // /api eklendi
            toast.success('Slider başarıyla silindi');
            fetchSliders();
        } catch (error) {
            console.error('Slider silme hatası:', error);
            toast.error('Slider silinirken bir hata oluştu');
        }
    };

    // Düzenleme moduna geç
    const handleEdit = (slider) => {
        setEditingSlider(slider);
        setFormData({
            link: slider.link || '',
            orderNumber: slider.order_number || 0,
            webImage: null,
            mobileImage: null
        });
        setPreviews({
            web: `${API_URL}${slider.web_image}`,
            mobile: slider.mobile_image ?
                `${API_URL}${slider.mobile_image}` : ''
        });
    };

    // Formu sıfırla
    const resetForm = () => {
        setEditingSlider(null);
        setFormData({
            webImage: null,
            mobileImage: null,
            link: '',
            orderNumber: 0
        });
        setPreviews({ web: '', mobile: '' });
    };

    if (loading) {
        return (
            <div className="slider-admin-loading">
                <div className="loading-spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="slider-admin">
            <div className="admin-header">
                <h1>{editingSlider ? 'Slider Düzenle' : 'Yeni Slider Ekle'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="slider-form">
                <div className="form-group">
                    <label>Web Görüntüsü {!editingSlider && '*'}</label>
                    <input
                        type="file"
                        name="webImage"
                        onChange={handleInputChange}
                        accept="image/*"
                    />
                    {previews.web && (
                        <div className="image-preview">
                            <img src={previews.web} alt="Web önizleme" />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Mobil Görüntüsü (Opsiyonel)</label>
                    <input
                        type="file"
                        name="mobileImage"
                        onChange={handleInputChange}
                        accept="image/*"
                    />
                    {previews.mobile && (
                        <div className="image-preview">
                            <img src={previews.mobile} alt="Mobil önizleme" />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Link</label>
                    <input
                        type="url"
                        name="link"
                        value={formData.link}
                        onChange={handleInputChange}
                        placeholder="https://onder.org.tr"
                    />
                </div>

                <div className="form-group">
                    <label>Sıra Numarası</label>
                    <input
                        type="number"
                        name="orderNumber"
                        value={formData.orderNumber}
                        onChange={handleInputChange}
                        min="0"
                    />
                </div>

                <div className="button-group">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitting}
                    >
                        {submitting ? 'Kaydediliyor...' :
                            editingSlider ? 'Güncelle' : 'Ekle'}
                    </button>
                    {editingSlider && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="cancel-btn"
                            disabled={submitting}
                        >
                            İptal
                        </button>
                    )}
                </div>
            </form>

            <div className="sliders-list">
                <h2>Mevcut Sliderlar</h2>
                {sliders.length > 0 ? (
                    <div className="sliders-grid">
                        {sliders.map((slider) => (
                            <div key={slider.id} className="slider-item">
                                <div className="slider-image-container">
                                    <img
                                        src={`${API_URL}${slider.web_image}`}
                                        alt="Slider"
                                    />
                                </div>
                                <div className="slider-info">
                                    <p>Sıra: {slider.order_number}</p>
                                    {slider.link && (
                                        <a
                                            href={slider.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Linke Git
                                        </a>
                                    )}
                                </div>
                                <div className="slider-actions">
                                    <button
                                        onClick={() => handleEdit(slider)}
                                        className="edit-btn"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slider.id)}
                                        className="delete-btn"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-sliders">
                        Henüz slider eklenmemiş
                    </div>
                )}
            </div>
        </div>
    );
};

export default SliderAdmin;