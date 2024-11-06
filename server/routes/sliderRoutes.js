const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

// Uploads klasörünü kontrol et ve oluştur
const createUploadsFolder = () => {
    const dir = path.join(__dirname, '..', 'uploads', 'slider');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

createUploadsFolder();

// Multer yapılandırması
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = path.join(__dirname, '..', 'uploads', 'slider');
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir!'));
        }
    }
});

module.exports = (connection) => {
    // Tüm sliderları getir
    router.get('/sliders', async (req, res) => {
        try {
            const [rows] = await connection.promise().query(
                'SELECT * FROM sliders ORDER BY order_number ASC'
            );
            res.json(rows);
        } catch (error) {
            console.error('Veritabanı hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Slider verileri getirilirken bir hata oluştu'
            });
        }
    });

    // Yeni slider ekle
    router.post('/sliders', upload.fields([
        { name: 'webImage', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 }
    ]), async (req, res) => {
        try {
            const { link, orderNumber } = req.body;
            
            if (!req.files.webImage) {
                return res.status(400).json({
                    success: false,
                    message: 'Web görüntüsü gereklidir'
                });
            }

            const webImagePath = '/uploads/slider/' + req.files.webImage[0].filename;
            const mobileImagePath = req.files.mobileImage ? 
                '/uploads/slider/' + req.files.mobileImage[0].filename : 
                webImagePath;

            const [result] = await connection.promise().query(
                'INSERT INTO sliders (web_image, mobile_image, link, order_number) VALUES (?, ?, ?, ?)',
                [webImagePath, mobileImagePath, link || '', parseInt(orderNumber) || 0]
            );

            res.json({
                success: true,
                message: 'Slider başarıyla eklendi',
                id: result.insertId
            });
        } catch (error) {
            console.error('Ekleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Slider eklenirken bir hata oluştu'
            });
        }
    });

    // Slider güncelle
    router.put('/sliders/:id', upload.fields([
        { name: 'webImage', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 }
    ]), async (req, res) => {
        try {
            const { id } = req.params;
            const { link, orderNumber } = req.body;

            // Mevcut slider'ı getir
            const [slider] = await connection.promise().query(
                'SELECT * FROM sliders WHERE id = ?',
                [id]
            );

            if (slider.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Slider bulunamadı'
                });
            }

            let webImagePath = slider[0].web_image;
            let mobileImagePath = slider[0].mobile_image;

            // Yeni resimler yüklendiyse eskilerini sil ve yenilerini kaydet
            if (req.files.webImage) {
                await fsPromises.unlink(path.join(__dirname, '..', slider[0].web_image))
                    .catch(console.error);
                webImagePath = '/uploads/slider/' + req.files.webImage[0].filename;
            }

            if (req.files.mobileImage) {
                if (slider[0].mobile_image !== slider[0].web_image) {
                    await fsPromises.unlink(path.join(__dirname, '..', slider[0].mobile_image))
                        .catch(console.error);
                }
                mobileImagePath = '/uploads/slider/' + req.files.mobileImage[0].filename;
            }

            await connection.promise().query(
                'UPDATE sliders SET web_image = ?, mobile_image = ?, link = ?, order_number = ? WHERE id = ?',
                [webImagePath, mobileImagePath, link || '', parseInt(orderNumber) || 0, id]
            );

            res.json({
                success: true,
                message: 'Slider başarıyla güncellendi'
            });
        } catch (error) {
            console.error('Güncelleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Slider güncellenirken bir hata oluştu'
            });
        }
    });

    // Slider sil
    router.delete('/sliders/:id', async (req, res) => {
        try {
            const { id } = req.params;

            const [slider] = await connection.promise().query(
                'SELECT web_image, mobile_image FROM sliders WHERE id = ?',
                [id]
            );

            if (slider.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Slider bulunamadı'
                });
            }

            // Veritabanından sil
            await connection.promise().query('DELETE FROM sliders WHERE id = ?', [id]);

            // Dosyaları sil
            if (slider[0].web_image) {
                await fsPromises.unlink(path.join(__dirname, '..', slider[0].web_image))
                    .catch(console.error);
            }
            if (slider[0].mobile_image && slider[0].mobile_image !== slider[0].web_image) {
                await fsPromises.unlink(path.join(__dirname, '..', slider[0].mobile_image))
                    .catch(console.error);
            }

            res.json({
                success: true,
                message: 'Slider başarıyla silindi'
            });
        } catch (error) {
            console.error('Silme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Slider silinirken bir hata oluştu'
            });
        }
    });

    // Tek bir slider getir
    router.get('/sliders/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await connection.promise().query(
                'SELECT * FROM sliders WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Slider bulunamadı'
                });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Veritabanı hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Slider getirilirken bir hata oluştu'
            });
        }
    });

    return router;
};