import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';


const API_URL = process.env.REACT_APP_API_URL;



const SPORTS_CONFIG = {
    VOLEYBOL: {
      title: "Voleybol",
      key: "voleybol",
      categories: ["Yıldız Kız", "Genç Kız"]
    },
    BASKETBOL: {
      title: "3X3 Basketbol",
      key: "basketbol",
      categories: ["Genç Kız", "Genç Erkek"]
    },
    FUTSAL: {
      title: "Futsal",
      key: "futsal",
      categories: ["Genç Erkek", "Yıldız Erkek"]
    },
    GURES: {
      title: "Güreş",
      key: "gures",
      categories: ["Genç Erkek", "Yıldız Erkek"]
    },
    BILEK_GURESI: {
      title: "Bilek Güreşi",
      key: "bilek_guresi",
      categories: ["Genç Erkek", "Yıldız Erkek"]
    },
    OKCULUK: {
      title: "Geleneksel Türk Okçuluğu",
      key: "okculuk",
      categories: ["Genç Kız", "Genç Erkek", "Yıldız Erkek", "Yıldız Kız"]
    },
    ATLETIZM: {
      title: "Atletizm",
      key: "atletizm",
      categories: ["Küçük Erkek", "Genç Erkek", "Yıldız Erkek"]
    },
    MASA_TENISI: {
      title: "Masa Tenisi",
      key: "masa_tenisi",
      categories: ["Genç Kız", "Genç Erkek", "Yıldız Erkek", "Yıldız Kız"]
    },
    DART: {
      title: "Dart",
      key: "dart",
      categories: ["Genç Kız", "Genç Erkek", "Yıldız Erkek", "Yıldız Kız"]
    },
    TAEKWONDO: {
      title: "Taekwondo",
      key: "taekwondo",
      categories: ["Genç Kız", "Genç Erkek", "Yıldız Erkek", "Yıldız Kız"]
    },
    BADMINTON: {
      title: "Badminton",
      key: "badminton",
      categories: ["Genç Kız", "Genç Erkek", "Yıldız Erkek", "Yıldız Kız"]
    }
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
  

const FormComponents = () => {
    const [schools, setSchools] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        school_name: '',
        region: '',
        school_type: '',
        school_district: '', // school_city yerine school_district
        teacher_name: '',
        teacher_contact: '',
        other_branches: '',
        notes: '',
        sports_data: {
            voleybol: [],
            basketbol: [],
            futsal: [],
            gures: [],
            bilek_guresi: [],
            okculuk: [],
            atletizm: [],
            masa_tenisi: [],
            dart: [],
            taekwondo: [],
            badminton: []
        }
    });

    // Excel'den okulları yükleme
    useEffect(() => {
        const loadSchools = async () => {
            try {
                const response = await fetch('/okullar.xlsx');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const buffer = await response.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const data = XLSX.utils.sheet_to_json(worksheet, {
                    range: 2
                });

                const schoolList = data
                    .map(row => row['Adalar AİHL'])
                    .filter(Boolean)
                    .sort();

                setSchools(schoolList);
                setError(null);
            } catch (error) {
                console.error('Dosya yükleme hatası:', error);
                setError(error.message);
            }
        };

        loadSchools();
    }, []);

    // Spor seçimlerini handle etme
    const handleSportChange = (sport, category, checked) => {
        setFormData(prev => ({
            ...prev,
            sports_data: {
                ...prev.sports_data,
                [sport]: checked
                    ? [...(prev.sports_data[sport] || []), category]
                    : (prev.sports_data[sport] || []).filter(c => c !== category)
            }
        }));
    };

    // Input değişikliklerini handle etme
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Form gönderimi
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/api/submit-form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Form başarıyla gönderildi!');
                // Formu sıfırla
                setFormData({
                    school_name: '',
                    region: '',
                    school_type: '',
                    school_district: '', // school_city yerine school_district
                    teacher_name: '',
                    teacher_contact: '',
                    other_branches: '',
                    notes: '',
                    sports_data: {
                        voleybol: [],
                        basketbol: [],
                        futsal: [],
                        gures: [],
                        bilek_guresi: [],
                        okculuk: [],
                        atletizm: [],
                        masa_tenisi: [],
                        dart: [],
                        taekwondo: [],
                        badminton: []
                    }
                });
            } else {
                alert('Form gönderilirken bir hata oluştu!');
            }
        } catch (error) {
            console.error('Form gönderme hatası:', error);
            alert('Form gönderilirken bir hata oluştu!');
        }
    };


     // SportSection bileşenini FormComponents içinde tanımlıyoruz
     const SportSection = ({ sport, formData, handleSportChange }) => (
        <div className='formVoleyball'>
            <h2>{sport.title}:</h2>
            <div className='form-details-sports'>
                {sport.categories.map((category) => (
                    <label key={`${sport.key}-${category}`} className="checkbox__label">
                        <span className="checkbox__container">
                            <input
                                type="checkbox"
                                checked={formData.sports_data[sport.key].includes(category)}
                                onChange={(e) => handleSportChange(sport.key, category, e.target.checked)}
                            />
                            <span className="checkbox__label--text">{category}</span>
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );


    return (
        <form onSubmit={handleSubmit} className='FormComponentsContainer'>
          <div className='form-left'>
            {/* Bölge Seçimi */}
            <div className='checkbox-left'>
              <div className='form-yaka'>
                <label className="checkbox__label">
                  <span className="checkbox__container">
                    <input
                      type="radio"
                      name="region"
                      value="Avrupa Yakası"
                      checked={formData.region === 'Avrupa Yakası'}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="checkbox__label--text yakaText">Avrupa Yakası</span>
                  </span>
                </label>
                <label className="checkbox__label">
                  <span className="checkbox__container">
                    <input
                      type="radio"
                      name="region"
                      value="Anadolu Yakası"
                      checked={formData.region === 'Anadolu Yakası'}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="checkbox__label--text yakaText">Anadolu Yakası</span>
                  </span>
                </label>
              </div>
    
              {/* Okul Tipi Seçimi */}
              <div className='form-okul'>
                <label className="checkbox__label">
                  <span className="checkbox__container">
                    <input
                      type="radio"
                      name="school_type"
                      value="Lise"
                      checked={formData.school_type === 'Lise'}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="checkbox__label--text yakaText">Lise</span>
                  </span>
                </label>
                <label className="checkbox__label">
                  <span className="checkbox__container">
                    <input
                      type="radio"
                      name="school_type"
                      value="Orta Okul"
                      checked={formData.school_type === 'Orta Okul'}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="checkbox__label--text yakaText">Orta Okul</span>
                  </span>
                </label>
              </div>
            </div>
    
            {/* Okul Seçimi */}
            <div className="coolinput">
              <label htmlFor="school_name" className="text">Okul Adı:</label>
              <select
                id="text"
                name="school_name"
                value={formData.school_name}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Okul seçiniz... ({schools.length} okul)</option>
                {schools.map((school, index) => (
                  <option key={index} value={school}>{school}</option>
                ))}
              </select>
            </div>

            <div className="coolinput">
  <label htmlFor="school_district" className="text">Okulun Bulunduğu İlçe:</label>
  <select
    id="school_district"
    name="school_district"
    value={formData.school_district}
    onChange={handleInputChange}
    className="input"
    required
    disabled={!formData.region} // Bölge seçilmeden ilçe seçilemesin
  >
    <option value="">İlçe seçiniz...</option>
    {formData.region && DISTRICTS[formData.region].map((district, index) => (
      <option key={index} value={district}>
        {district}
      </option>
    ))}
  </select>
</div>
            {/* Öğretmen Bilgileri */}
            <div className="coolinput">
              <label htmlFor="teacher_name" className="text">Sorumlu Öğretmen Ad/Soyad:</label>
              <input
                type="text"
                id="teacher_name"
                name="teacher_name"
                value={formData.teacher_name}
                onChange={handleInputChange}
                placeholder="Buraya yazın..."
                className="input"
                required
              />
            </div>
    
            <div className="coolinput">
              <label htmlFor="teacher_contact" className="text">Sorumlu Öğretmen İletişim Numarası:</label>
              <input
                type="text"
                id="teacher_contact"
                name="teacher_contact"
                value={formData.teacher_contact}
                onChange={handleInputChange}
                placeholder="Buraya yazın..."
                className="input"
                required
              />
            </div>
    
            {/* Diğer Alanlar */}
            <div className="coolinput">
              <label htmlFor="other_branches" className="text">Talep edilen Diğer Branşlar:</label>
              <input
                type="text"
                id="other_branches"
                name="other_branches"
                value={formData.other_branches}
                onChange={handleInputChange}
                placeholder="Buraya yazın..."
                className="input"
              />
            </div>
    
            <div className="coolinput">
              <label htmlFor="notes" className="text">İletmek istediğiniz bir NOT varsa ekleyebilirsiniz:</label>
              <input
                type="text"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Buraya yazın..."
                className="input"
              />
            </div>
          </div>
    
          <div className='form-right'>
            {/* Spor Bölümleri */}
            {Object.values(SPORTS_CONFIG).map((sport) => (
              <SportSection
                key={sport.key}
                sport={sport}
                formData={formData}
                handleSportChange={handleSportChange}
              />
            ))}
    
            {/* Gönder Butonu */}
            <button type="submit" className='form-button'>
              Formu Gönder
            </button>
          </div>
        </form>
      );
};

export default FormComponents;