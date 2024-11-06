import React, { useEffect, useState } from 'react';
import './SportsRegistrationDashboard.css';

import { serializeToCSV } from '../utils';


const API_URL = process.env.REACT_APP_API_URL;


const SportsDashboard = () => {
    const [registrations, setRegistrations] = useState([]);
    const [statistics, setStatistics] = useState({
        total_schools: 0,
        total_registrations: 0,
        high_schools: 0,
        middle_schools: 0,
        total_sports: 11
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [selectedSport, setSelectedSport] = useState('all');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);





    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/api/registrations`);

            if (!response.ok) {
                throw new Error('Veriler alınamadı');
            }

            const data = await response.json();
            setRegistrations(data);
            calculateStatistics(data);
            setLoading(false);
        } catch (err) {
            setError('Veri yükleme sırasında bir hata oluştu');
            setLoading(false);
            console.error('Veri çekme hatası:', err);
        }
    };

    // İstatistik hesaplamasını güncelle
    const calculateStatistics = (data) => {
        const stats = {
            total_schools: new Set(data.map(r => r.school_name)).size,
            total_registrations: data.length,
            high_schools: data.filter(r => r.school_type === 'Lise').length,
            middle_schools: data.filter(r => r.school_type === 'Orta Okul').length,
            total_sports: 11
        };
        setStatistics(stats);
    };

    const getSportCategories = (registration) => {
        const categories = [];

        // Voleybol kategorileri
        if (registration.voleybol_yildiz_kiz) categories.push({ sport: 'Voleybol', category: 'Yıldız Kız' });
        if (registration.voleybol_genc_kiz) categories.push({ sport: 'Voleybol', category: 'Genç Kız' });

        // Basketbol kategorileri
        if (registration.basketbol_genc_kiz) categories.push({ sport: 'Basketbol', category: 'Genç Kız' });
        if (registration.basketbol_genc_erkek) categories.push({ sport: 'Basketbol', category: 'Genç Erkek' });

        // Futsal kategorileri
        if (registration.futsal_genc_erkek) categories.push({ sport: 'Futsal', category: 'Genç Erkek' });
        if (registration.futsal_yildiz_erkek) categories.push({ sport: 'Futsal', category: 'Yıldız Erkek' });

        // Güreş kategorileri
        if (registration.gures_genc_erkek) categories.push({ sport: 'Güreş', category: 'Genç Erkek' });
        if (registration.gures_yildiz_erkek) categories.push({ sport: 'Güreş', category: 'Yıldız Erkek' });

        // Bilek Güreşi kategorileri
        if (registration.bilek_guresi_genc_erkek) categories.push({ sport: 'Bilek Güreşi', category: 'Genç Erkek' });
        if (registration.bilek_guresi_yildiz_erkek) categories.push({ sport: 'Bilek Güreşi', category: 'Yıldız Erkek' });

        // Okçuluk kategorileri
        if (registration.okculuk_genc_kiz) categories.push({ sport: 'Okçuluk', category: 'Genç Kız' });
        if (registration.okculuk_genc_erkek) categories.push({ sport: 'Okçuluk', category: 'Genç Erkek' });
        if (registration.okculuk_yildiz_erkek) categories.push({ sport: 'Okçuluk', category: 'Yıldız Erkek' });
        if (registration.okculuk_yildiz_kiz) categories.push({ sport: 'Okçuluk', category: 'Yıldız Kız' });

        // Atletizm kategorileri
        if (registration.atletizm_kucuk_erkek) categories.push({ sport: 'Atletizm', category: 'Küçük Erkek' });
        if (registration.atletizm_genc_erkek) categories.push({ sport: 'Atletizm', category: 'Genç Erkek' });
        if (registration.atletizm_yildiz_erkek) categories.push({ sport: 'Atletizm', category: 'Yıldız Erkek' });

        // Masa Tenisi kategorileri
        if (registration.masa_tenisi_genc_kiz) categories.push({ sport: 'Masa Tenisi', category: 'Genç Kız' });
        if (registration.masa_tenisi_genc_erkek) categories.push({ sport: 'Masa Tenisi', category: 'Genç Erkek' });
        if (registration.masa_tenisi_yildiz_erkek) categories.push({ sport: 'Masa Tenisi', category: 'Yıldız Erkek' });
        if (registration.masa_tenisi_yildiz_kiz) categories.push({ sport: 'Masa Tenisi', category: 'Yıldız Kız' });

        // Dart kategorileri
        if (registration.dart_genc_kiz) categories.push({ sport: 'Dart', category: 'Genç Kız' });
        if (registration.dart_genc_erkek) categories.push({ sport: 'Dart', category: 'Genç Erkek' });
        if (registration.dart_yildiz_erkek) categories.push({ sport: 'Dart', category: 'Yıldız Erkek' });
        if (registration.dart_yildiz_kiz) categories.push({ sport: 'Dart', category: 'Yıldız Kız' });

        // Taekwondo kategorileri
        if (registration.taekwondo_genc_kiz) categories.push({ sport: 'Taekwondo', category: 'Genç Kız' });
        if (registration.taekwondo_genc_erkek) categories.push({ sport: 'Taekwondo', category: 'Genç Erkek' });
        if (registration.taekwondo_yildiz_erkek) categories.push({ sport: 'Taekwondo', category: 'Yıldız Erkek' });
        if (registration.taekwondo_yildiz_kiz) categories.push({ sport: 'Taekwondo', category: 'Yıldız Kız' });

        // Badminton kategorileri
        if (registration.badminton_genc_kiz) categories.push({ sport: 'Badminton', category: 'Genç Kız' });
        if (registration.badminton_genc_erkek) categories.push({ sport: 'Badminton', category: 'Genç Erkek' });
        if (registration.badminton_yildiz_erkek) categories.push({ sport: 'Badminton', category: 'Yıldız Erkek' });
        if (registration.badminton_yildiz_kiz) categories.push({ sport: 'Badminton', category: 'Yıldız Kız' });


        return categories;
    };

    const filteredRegistrations = registrations.filter(reg => {
        const matchesSearch =
            reg.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.school_district?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRegion = selectedRegion === 'all' || reg.region === selectedRegion;
        const matchesDistrict = selectedDistrict === 'all' || reg.school_district?.toLowerCase() === selectedDistrict.toLowerCase();

        const sportCategories = getSportCategories(reg);
        const matchesSport = selectedSport === 'all' ||
            sportCategories.some(category =>
                category.sport.toLowerCase().includes(selectedSport.toLowerCase())
            );

        return matchesSearch && matchesRegion && matchesSport && matchesDistrict;
    });

    const handleRefresh = () => {
        fetchData();
    };


    const handleExportToExcel = () => {
        const csvData = serializeToCSV(filteredRegistrations);
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`);
        downloadLink.setAttribute('download', 'sports-registrations.csv');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const DISTRICTS = {
        'Avrupa Yakası': [
            'Arnavutköy', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Bakırköy',
            'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beylikdüzü', 'Beyoğlu',
            'Büyükçekmece', 'Çatalca', 'Esenler', 'Esenyurt', 'Eyüp',
            'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kağıthane', 'Küçükçekmece',
            'Sarıyer', 'Silivri', 'Sultangazi', 'Şişli', 'Zeytinburnu'
        ],
        'Anadolu Yakası': [
            'Adalar', 'Ataşehir', 'Beykoz', 'Çekmeköy', 'Kadıköy',
            'Kartal', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sultanbeyli',
            'Şile', 'Tuzla', 'Ümraniye', 'Üsküdar'
        ]
    };

    useEffect(() => {
        if (selectedRegion === 'all') {
            setSelectedDistrict('all');
        }
    }, [selectedRegion]);



    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Spor Branşları Kayıt Sistemi</h1>
                <div className="header-actions">
                    <button onClick={handleRefresh} className="refresh-button">
                        Yenile
                    </button>
                    <button onClick={handleExportToExcel} className="export-button">
                        Excel'e Aktar
                    </button>
                </div>
            </header>

            {/* İstatistik Kartları */}
            <div className="stats-container">
                <div className="stat-card" data-type="school">
                    <div className="stat-icon">🏫</div>
                    <div className="stat-info">
                        <h3>Toplam Okul</h3>
                        <p>{statistics.total_schools}</p>
                    </div>
                </div>
                <div className="stat-card" data-type="registration">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>Toplam Kayıt</h3>
                        <p>{statistics.total_registrations}</p>
                    </div>
                </div>
                <div className="stat-card" data-type="high-school">
                    <div className="stat-icon">🎓</div>
                    <div className="stat-info">
                        <h3>Lise Kayıtları</h3>
                        <p>{statistics.high_schools}</p>
                    </div>
                </div>
                <div className="stat-card" data-type="middle-school">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <h3>Ortaokul Kayıtları</h3>
                        <p>{statistics.middle_schools}</p>
                    </div>
                </div>
            </div>

            {/* Filtreler */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Okul veya öğretmen ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">Tüm Bölgeler</option>
                    <option value="Avrupa Yakası">Avrupa Yakası</option>
                    <option value="Anadolu Yakası">Anadolu Yakası</option>
                </select>

                <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="filter-select"
                    disabled={selectedRegion === 'all'} // Bölge seçilmeden ilçe seçilemez
                >
                    <option value="all">Tüm İlçeler</option>
                    {selectedRegion !== 'all' && DISTRICTS[selectedRegion].map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">Tüm Branşlar</option>
                    <option value="voleybol">Voleybol</option>
                    <option value="basketbol">Basketbol</option>
                    <option value="futsal">Futsal</option>
                    <option value="Güreş">Güreş</option>
                    <option value="bilek">Bilek Güreşi</option>
                    <option value="Okçuluk">Okçuluk</option>
                    <option value="atletizm">Atletizm</option>
                    <option value="masa">Masa Tenisi</option>
                    <option value="dart">Dart</option>
                    <option value="taekwondo">Taekwondo</option>
                    <option value="badminton">Badminton</option>
                </select>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="table-container">
                {loading ? (
                    <div className="loading">Veriler yükleniyor...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Okul Adı</th>
                                <th>İlçe</th>
                                <th>Bölge</th>
                                <th>Okul Tipi</th>
                                <th>Öğretmen</th>
                                <th>İletişim Adresi</th>
                                <th>Branşlar</th>
                                <th>Talep Edilen Branşlar</th>
                                <th>Not</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRegistrations.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="no-data">
                                        Kayıt bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredRegistrations.map((reg, index) => (
                                    <tr key={index}>
                                        <td>{reg.school_name}</td>
                                        <td>{reg.school_district}</td> 
                                        <td>
                                            <span className={`region-badge ${reg.region === 'Avrupa Yakası' ? 'europe' : 'asia'}`}>
                                                {reg.region}
                                            </span>
                                        </td>
                                        <td>{reg.school_type}</td>
                                        <td>{reg.teacher_name}</td>
                                        <td>{reg.teacher_contact}</td>
                                        <td>
                                            <div className="sports-badges">
                                                {getSportCategories(reg)
                                                    .filter(item => item.sport !== 'Diğer Branşlar')
                                                    .map((item, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="sport-badge"
                                                            data-sport={item.sport.toLowerCase()}
                                                        >
                                                            {`${item.sport} - ${item.category}`}
                                                        </span>
                                                    ))
                                                }
                                            </div>
                                        </td>
                                        <td className="other-branches">
                                            {reg.other_branches || '-'}
                                        </td>
                                        <td>{reg.notes || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SportsDashboard;