const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Tüm kayıtları getir
    router.get('/registrations', async (req, res) => {
        try {
            const query = 'SELECT * FROM school_sports_registrations ORDER BY created_at DESC';
            const results = await db.executeQuery(query);
            res.json(results);
        } catch (error) {
            console.error('Kayıtları getirme hatası:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Veriler çekilirken hata oluştu',
                error: error.message 
            });
        }
    });

    // Yeni Kayıt Ekleme
    router.post('/submit-form', async (req, res) => {
        const {
            school_name,
            school_district,
            region,
            school_type,
            teacher_name,
            teacher_contact,
            other_branches,
            notes,
            sports_data
        } = req.body;

        try {
            // Boolean değerleri hazırla
            const sportFields = {
                voleybol_yildiz_kiz: sports_data.voleybol?.includes('Yıldız Kız') || false,
                voleybol_genc_kiz: sports_data.voleybol?.includes('Genç Kız') || false,
                
                basketbol_genc_kiz: sports_data.basketbol?.includes('Genç Kız') || false,
                basketbol_genc_erkek: sports_data.basketbol?.includes('Genç Erkek') || false,
                
                futsal_genc_erkek: sports_data.futsal?.includes('Genç Erkek') || false,
                futsal_yildiz_erkek: sports_data.futsal?.includes('Yıldız Erkek') || false,
                
                gures_genc_erkek: sports_data.gures?.includes('Genç Erkek') || false,
                gures_yildiz_erkek: sports_data.gures?.includes('Yıldız Erkek') || false,
                
                bilek_guresi_genc_erkek: sports_data.bilek_guresi?.includes('Genç Erkek') || false,
                bilek_guresi_yildiz_erkek: sports_data.bilek_guresi?.includes('Yıldız Erkek') || false,
                
                okculuk_genc_kiz: sports_data.okculuk?.includes('Genç Kız') || false,
                okculuk_genc_erkek: sports_data.okculuk?.includes('Genç Erkek') || false,
                okculuk_yildiz_erkek: sports_data.okculuk?.includes('Yıldız Erkek') || false,
                okculuk_yildiz_kiz: sports_data.okculuk?.includes('Yıldız Kız') || false,
                
                atletizm_kucuk_erkek: sports_data.atletizm?.includes('Küçük Erkek') || false,
                atletizm_genc_erkek: sports_data.atletizm?.includes('Genç Erkek') || false,
                atletizm_yildiz_erkek: sports_data.atletizm?.includes('Yıldız Erkek') || false,
                
                masa_tenisi_genc_kiz: sports_data.masa_tenisi?.includes('Genç Kız') || false,
                masa_tenisi_genc_erkek: sports_data.masa_tenisi?.includes('Genç Erkek') || false,
                masa_tenisi_yildiz_erkek: sports_data.masa_tenisi?.includes('Yıldız Erkek') || false,
                masa_tenisi_yildiz_kiz: sports_data.masa_tenisi?.includes('Yıldız Kız') || false,
                
                dart_genc_kiz: sports_data.dart?.includes('Genç Kız') || false,
                dart_genc_erkek: sports_data.dart?.includes('Genç Erkek') || false,
                dart_yildiz_erkek: sports_data.dart?.includes('Yıldız Erkek') || false,
                dart_yildiz_kiz: sports_data.dart?.includes('Yıldız Kız') || false,
                
                taekwondo_genc_kiz: sports_data.taekwondo?.includes('Genç Kız') || false,
                taekwondo_genc_erkek: sports_data.taekwondo?.includes('Genç Erkek') || false,
                taekwondo_yildiz_erkek: sports_data.taekwondo?.includes('Yıldız Erkek') || false,
                taekwondo_yildiz_kiz: sports_data.taekwondo?.includes('Yıldız Kız') || false,
                
                badminton_genc_kiz: sports_data.badminton?.includes('Genç Kız') || false,
                badminton_genc_erkek: sports_data.badminton?.includes('Genç Erkek') || false,
                badminton_yildiz_erkek: sports_data.badminton?.includes('Yıldız Erkek') || false,
                badminton_yildiz_kiz: sports_data.badminton?.includes('Yıldız Kız') || false
            };

            // Tüm verileri birleştir
            const formData = {
                school_name,
                school_district,
                region,
                school_type,
                teacher_name,
                teacher_contact,
                other_branches,
                notes,
                ...sportFields
            };

            // Veritabanına kaydet - Promise tabanlı sorgu kullan
            const query = 'INSERT INTO school_sports_registrations SET ?';
            const results = await db.executeQuery(query, [formData]);

            res.status(201).json({
                success: true,
                message: 'Form başarıyla kaydedildi',
                id: results.insertId
            });
        } catch (error) {
            console.error('Form kayıt hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Kayıt sırasında bir hata oluştu',
                error: error.message
            });
        }
    });

    // İlçeye Göre Filtreleme
    router.get('/registrations/by-district/:district', async (req, res) => {
        try {
            const { district } = req.params;
            
            const query = `
                SELECT * FROM school_sports_registrations 
                WHERE school_district = ? 
                ORDER BY created_at DESC
            `;

            const results = await db.executeQuery(query, [district]);
            res.json(results);
        } catch (error) {
            console.error('İlçe filtreleme hatası:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Veriler çekilirken hata oluştu',
                error: error.message
            });
        }
    });

    // Bölgeye Göre Filtreleme (tekrarlanan endpoint düzeltildi)
    router.get('/registrations/by-region/:region', async (req, res) => {
        try {
            const { region } = req.params;
            
            const query = `
                SELECT * FROM school_sports_registrations 
                WHERE region = ? 
                ORDER BY created_at DESC
            `;

            const results = await db.executeQuery(query, [region]);
            res.json(results);
        } catch (error) {
            console.error('Bölge filtreleme hatası:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Veriler çekilirken hata oluştu',
                error: error.message
            });
        }
    });

    // Branşa göre kayıtları getir
    router.get('/registrations/by-sport/:sport', async (req, res) => {
        try {
            const { sport } = req.params;
            
            // SQL enjeksiyonuna karşı koruma
            const validSportColumns = [
                'voleybol_yildiz_kiz', 'voleybol_genc_kiz',
                'basketbol_genc_kiz', 'basketbol_genc_erkek',
                'futsal_genc_erkek', 'futsal_yildiz_erkek',
                'gures_genc_erkek', 'gures_yildiz_erkek',
                'bilek_guresi_genc_erkek', 'bilek_guresi_yildiz_erkek',
                'okculuk_genc_kiz', 'okculuk_genc_erkek', 'okculuk_yildiz_erkek', 'okculuk_yildiz_kiz',
                'atletizm_kucuk_erkek', 'atletizm_genc_erkek', 'atletizm_yildiz_erkek',
                'masa_tenisi_genc_kiz', 'masa_tenisi_genc_erkek', 'masa_tenisi_yildiz_erkek', 'masa_tenisi_yildiz_kiz',
                'dart_genc_kiz', 'dart_genc_erkek', 'dart_yildiz_erkek', 'dart_yildiz_kiz',
                'taekwondo_genc_kiz', 'taekwondo_genc_erkek', 'taekwondo_yildiz_erkek', 'taekwondo_yildiz_kiz',
                'badminton_genc_kiz', 'badminton_genc_erkek', 'badminton_yildiz_erkek', 'badminton_yildiz_kiz'
            ];
            
            if (!validSportColumns.includes(sport)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz branş parametresi'
                });
            }
            
            const query = `
                SELECT *
                FROM school_sports_registrations
                WHERE ${sport} = true
                ORDER BY created_at DESC
            `;

            const results = await db.executeQuery(query);
            res.json(results);
        } catch (error) {
            console.error('Branş filtreleme hatası:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Veriler çekilirken bir hata oluştu',
                error: error.message 
            });
        }
    });

    // İstatistikleri Getir
    router.get('/statistics', async (req, res) => {
        try {
            const query = `
                SELECT 
                    COUNT(DISTINCT school_name) as total_schools,
                    COUNT(*) as total_registrations,
                    COUNT(DISTINCT region) as active_regions,
                    COUNT(DISTINCT school_district) as total_districts,
                    SUM(CASE WHEN school_type = 'Lise' THEN 1 ELSE 0 END) as high_schools,
                    SUM(CASE WHEN school_type = 'Orta Okul' THEN 1 ELSE 0 END) as middle_schools
                FROM school_sports_registrations
            `;

            const results = await db.executeQuery(query);
            res.json(results[0]);
        } catch (error) {
            console.error('İstatistik hatası:', error);
            res.status(500).json({ 
                success: false, 
                message: 'İstatistikler çekilirken hata oluştu',
                error: error.message
            });
        }
    });

    // Arama Yapma
    router.get('/search', async (req, res) => {
        try {
            const { term } = req.query;
            
            if (!term || term.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Arama terimi en az 2 karakter olmalıdır'
                });
            }
            
            const searchTerm = `%${term}%`;
            
            const query = `
                SELECT * FROM school_sports_registrations 
                WHERE school_name LIKE ? 
                OR teacher_name LIKE ? 
                OR school_district LIKE ? 
                ORDER BY created_at DESC
                LIMIT 100
            `;

            const results = await db.executeQuery(query, [searchTerm, searchTerm, searchTerm]);
            res.json(results);
        } catch (error) {
            console.error('Arama hatası:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Arama yapılırken hata oluştu',
                error: error.message
            });
        }
    });

    // Tekil kayıt getirme
    router.get('/registration/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            const query = 'SELECT * FROM school_sports_registrations WHERE id = ?';
            const results = await db.executeQuery(query, [id]);
            
            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Kayıt bulunamadı'
                });
            }
            
            res.json(results[0]);
        } catch (error) {
            console.error('Kayıt getirme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Kayıt getirilirken hata oluştu',
                error: error.message
            });
        }
    });

    return router;
};