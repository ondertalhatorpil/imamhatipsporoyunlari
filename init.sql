CREATE TABLE school_sports_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_name VARCHAR(255) NOT NULL,
    school_district VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    school_type VARCHAR(50) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    teacher_contact VARCHAR(100) NOT NULL,
    other_branches TEXT,
    notes TEXT,
    
    -- Voleybol kategorileri
    voleybol_yildiz_kiz BOOLEAN DEFAULT FALSE,
    voleybol_genc_kiz BOOLEAN DEFAULT FALSE,
    
    -- Basketbol kategorileri
    basketbol_genc_kiz BOOLEAN DEFAULT FALSE,
    basketbol_genc_erkek BOOLEAN DEFAULT FALSE,
    
    -- Futsal kategorileri
    futsal_genc_erkek BOOLEAN DEFAULT FALSE,
    futsal_yildiz_erkek BOOLEAN DEFAULT FALSE,
    
    -- Güreş kategorileri
    gures_genc_erkek BOOLEAN DEFAULT FALSE,
    gures_yildiz_erkek BOOLEAN DEFAULT FALSE,
    
    -- Bilek Güreşi kategorileri
    bilek_guresi_genc_erkek BOOLEAN DEFAULT FALSE,
    bilek_guresi_yildiz_erkek BOOLEAN DEFAULT FALSE,
    
    -- Okçuluk kategorileri
    okculuk_genc_kiz BOOLEAN DEFAULT FALSE,
    okculuk_genc_erkek BOOLEAN DEFAULT FALSE,
    okculuk_yildiz_erkek BOOLEAN DEFAULT FALSE,
    okculuk_yildiz_kiz BOOLEAN DEFAULT FALSE,
    
    -- Atletizm kategorileri
    atletizm_kucuk_erkek BOOLEAN DEFAULT FALSE,
    atletizm_genc_erkek BOOLEAN DEFAULT FALSE,
    atletizm_yildiz_erkek BOOLEAN DEFAULT FALSE,
    
    -- Masa Tenisi kategorileri
    masa_tenisi_genc_kiz BOOLEAN DEFAULT FALSE,
    masa_tenisi_genc_erkek BOOLEAN DEFAULT FALSE,
    masa_tenisi_yildiz_erkek BOOLEAN DEFAULT FALSE,
    masa_tenisi_yildiz_kiz BOOLEAN DEFAULT FALSE,
    
    -- Dart kategorileri
    dart_genc_kiz BOOLEAN DEFAULT FALSE,
    dart_genc_erkek BOOLEAN DEFAULT FALSE,
    dart_yildiz_erkek BOOLEAN DEFAULT FALSE,
    dart_yildiz_kiz BOOLEAN DEFAULT FALSE,
    
    -- Taekwondo kategorileri
    taekwondo_genc_kiz BOOLEAN DEFAULT FALSE,
    taekwondo_genc_erkek BOOLEAN DEFAULT FALSE,
    taekwondo_yildiz_erkek BOOLEAN DEFAULT FALSE,
    taekwondo_yildiz_kiz BOOLEAN DEFAULT FALSE,
    
    -- Badminton kategorileri
    badminton_genc_kiz BOOLEAN DEFAULT FALSE,
    badminton_genc_erkek BOOLEAN DEFAULT FALSE,
    badminton_yildiz_erkek BOOLEAN DEFAULT FALSE,
    badminton_yildiz_kiz BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Galeri Yılları Tablosu
CREATE TABLE gallery_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Galeri Fotoğrafları Tablosu
CREATE TABLE gallery_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year INT NOT NULL,
    photo_path VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (year) REFERENCES gallery_years(year)
);

-- Slider Tablosu
CREATE TABLE sliders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    web_image VARCHAR(255) NOT NULL,
    mobile_image VARCHAR(255) NOT NULL,
    link VARCHAR(255),
    order_number INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- İndeksler
CREATE INDEX idx_school_district ON school_sports_registrations(school_district);
CREATE INDEX idx_region ON school_sports_registrations(region);
CREATE INDEX idx_school_type ON school_sports_registrations(school_type);
CREATE INDEX idx_gallery_year ON gallery_photos(year);
CREATE INDEX idx_slider_order ON sliders(order_number);




INSERT INTO school_sports_registrations 
(school_name, school_district, region, school_type, teacher_name, teacher_contact, other_branches, notes,
voleybol_yildiz_kiz, voleybol_genc_kiz, basketbol_genc_kiz, basketbol_genc_erkek, futsal_genc_erkek) 
VALUES 
('İmam Hatip Lisesi', 'Pendik', 'Anadolu Yakası', 'Lise', 'Ahmet Yılmaz', '05551234567', 'Karate', 'Turnuvaya hazırız',
true, true, true, false, true),

('Anadolu İmam Hatip Lisesi', 'Kartal', 'Anadolu Yakası', 'Lise', 'Mehmet Demir', '05551234568', 'Yüzme', 'Spor salonu tadilatta',
false, true, true, true, false),

('Kız İmam Hatip Lisesi', 'Üsküdar', 'Anadolu Yakası', 'Lise', 'Ayşe Kaya', '05551234569', 'Hentbol', 'Yeni malzeme siparişi verildi',
true, true, false, false, false),

('İmam Hatip Ortaokulu', 'Ümraniye', 'Anadolu Yakası', 'Orta Okul', 'Fatma Şahin', '05551234570', 'Jimnastik', 'Antrenmanlar başladı',
true, false, true, true, true);

-- Galeri Yılları için örnek veriler
INSERT INTO gallery_years (year) VALUES 
(2024),
(2023),
(2022),
(2021);

-- Galeri Fotoğrafları için örnek veriler
INSERT INTO gallery_photos (year, photo_path, description) VALUES 
(2024, '/uploads/gallery/sample1.jpg', 'Voleybol Turnuvası Final Maçı'),
(2024, '/uploads/gallery/sample2.jpg', 'Basketbol Turnuvası Açılış Seremonisi'),
(2023, '/uploads/gallery/sample3.jpg', 'Futsal Turnuvası Şampiyonluk Kupası'),
(2023, '/uploads/gallery/sample4.jpg', 'Güreş Müsabakaları'),
(2022, '/uploads/gallery/sample5.jpg', 'Okçuluk Yarışması'),
(2022, '/uploads/gallery/sample6.jpg', 'Masa Tenisi Turnuvası');

-- Slider için örnek veriler
INSERT INTO sliders (web_image, mobile_image, link, order_number) VALUES 
('/uploads/slider/web_slider1.jpg', '/uploads/slider/mobile_slider1.jpg', 'https://imamhatipsporoyunlari.com/turnuva/voleybol', 1),
('/uploads/slider/web_slider2.jpg', '/uploads/slider/mobile_slider2.jpg', 'https://imamhatipsporoyunlari.com/turnuva/basketbol', 2),
('/uploads/slider/web_slider3.jpg', '/uploads/slider/mobile_slider3.jpg', 'https://imamhatipsporoyunlari.com/turnuva/futsal', 3),
('/uploads/slider/web_slider4.jpg', '/uploads/slider/mobile_slider4.jpg', 'https://imamhatipsporoyunlari.com/galeri', 4); 