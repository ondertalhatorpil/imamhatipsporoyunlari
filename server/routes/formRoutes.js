const express = require('express');
const router = express.Router();

module.exports = (connection) => {
    router.get('/registrations', (req, res) => {
        const query = 'SELECT * FROM school_sports_registrations ORDER BY created_at DESC';
        
        connection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Veriler çekilirken hata oluştu',
                    error: error.message 
                });
            }
            res.json(results);
        });
    });

    // 2. Yeni Kayıt Ekleme Endpoint'i
    router.post('/submit-form', async (req, res) => {
        // Form verilerini al
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

            // Veritabanına kaydet
            connection.query(
                'INSERT INTO school_sports_registrations SET ?',
                formData,
                (error, results) => {
                    if (error) {
                        console.error('Kayıt hatası:', error);
                        res.status(500).json({
                            success: false,
                            message: 'Kayıt sırasında bir hata oluştu',
                            error: error.message
                        });
                        return;
                    }

                    res.status(201).json({
                        success: true,
                        message: 'Form başarıyla kaydedildi',
                        id: results.insertId
                    });
                }
            );

        } catch (error) {
            console.error('Sunucu hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu',
                error: error.message
            });
        }
    });

  // 3. İlçeye Göre Filtreleme Endpoint'i
  router.get('/registrations/by-district/:district', (req, res) => {
    const { district } = req.params;
    
    const query = `
        SELECT * FROM school_sports_registrations 
        WHERE school_district = ? 
        ORDER BY created_at DESC
    `;

    connection.query(query, [district], (error, results) => {
        if (error) {
            return res.status(500).json({ 
                success: false, 
                message: 'Veriler çekilirken hata oluştu' 
            });
        }
        res.json(results);
    });
});


      // 4. Bölgeye Göre Filtreleme Endpoint'i
      router.get('/registrations/by-region/:region', (req, res) => {
        const { region } = req.params;
        
        const query = `
            SELECT * FROM school_sports_registrations 
            WHERE region = ? 
            ORDER BY created_at DESC
        `;

        connection.query(query, [region], (error, results) => {
            if (error) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Veriler çekilirken hata oluştu' 
                });
            }
            res.json(results);
        });
    });


    // Bölgeye göre kayıtları getir
    router.get('/registrations/by-region/:region', (req, res) => {
        const { region } = req.params;
        
        const query = `
            SELECT *
            FROM school_sports_registrations
            WHERE region = ?
            ORDER BY created_at DESC
        `;

        connection.query(query, [region], (error, results) => {
            if (error) {
                console.error('Veri çekme hatası:', error);
                res.status(500).json({ 
                    success: false, 
                    message: 'Veriler çekilirken bir hata oluştu',
                    error: error.message 
                });
                return;
            }

            res.json(results);
        });
    });

    // Branşa göre kayıtları getir
    router.get('/registrations/by-sport/:sport', (req, res) => {
        const { sport } = req.params;
        
        const query = `
            SELECT *
            FROM school_sports_registrations
            WHERE ${sport} = true
            ORDER BY created_at DESC
        `;

        connection.query(query, (error, results) => {
            if (error) {
                console.error('Veri çekme hatası:', error);
                res.status(500).json({ 
                    success: false, 
                    message: 'Veriler çekilirken bir hata oluştu',
                    error: error.message 
                });
                return;
            }

            res.json(results);
        });
    });

      // 5. İstatistikleri Getiren Endpoint
    router.get('/statistics', (req, res) => {
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

        connection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'İstatistikler çekilirken hata oluştu' 
                });
            }
            res.json(results[0]);
        });
    });

    router.get('/search', (req, res) => {
        const { term } = req.query;
        const searchTerm = `%${term}%`;
        
        const query = `
            SELECT * FROM school_sports_registrations 
            WHERE school_name LIKE ? 
            OR teacher_name LIKE ? 
            OR school_district LIKE ? 
            ORDER BY created_at DESC
        `;

        connection.query(query, [searchTerm, searchTerm, searchTerm], (error, results) => {
            if (error) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Arama yapılırken hata oluştu' 
                });
            }
            res.json(results);
        });
    });

    return router;
};