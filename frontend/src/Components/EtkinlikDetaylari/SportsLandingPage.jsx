import React from 'react';

import './SportsLandingPage.css'

const SportsGridLayout = () => {
  return (
    <div className="container">
      <header className="main-header">
        <h1>İmam Hatip Spor Oyunları</h1>
      </header>

      <div className="grid-container">
        <div className="grid-item">
          <h2>Gençlere Sporun Gücüyle Değer Kazandırma</h2>
          <p>Gençleri; sporun birleştirici ve disipline edici yönüyle buluşturmayı amaçlayan, imam hatip öğrencilerine özel olarak düzenlenen bir spor etkinliğidir. Öncü Spor Kulübü tarafından organize edilen etkinlik, gençlere sadece sportif beceriler değil, aynı zamanda manevi ve ahlaki değerler kazandırmayı hedeflemektedir.</p>
        </div>
        
        <div className="grid-item">
          <h2>Geniş Katılım ve Çeşitli Spor Dalları</h2>
          <p>Bu özel spor etkinliği, çeşitli branşlarda yarışmalar içermekte olup, futboldan basketbola, atletizmden güreşe kadar geniş bir yelpazede spor dallarını kapsamaktadır. Böylece öğrenciler ilgi duydukları spor dallarında yeteneklerini sergileyip geliştirme fırsatı bulurken, farklı spor dallarıyla tanışarak spor sevgisini artırmaktadır.</p>
        </div>
        
        <div className="grid-item">
          <h2>Takım Ruhu ve Dayanışma</h2>
          <p>İmam Hatip Spor Oyunları, öğrenciler arasında takım ruhunu ve dayanışma duygusunu güçlendirmeyi hedefleyen bir yapıya sahiptir. Takım sporları aracılığıyla öğrenciler, ortak hedeflerle birbirine destek olmanın önemini öğrenmektedir.</p>
        </div>
        
        <div className="grid-item">
          <h2>Manevi ve Ahlaki Değerler</h2>
          <p>Öncü Spor Kulübü'nün düzenlediği İmam Hatip Spor Oyunları'nda sporun fiziksel faydalarının ötesinde manevi ve ahlaki değerler de ön plana çıkarılmaktadır. Fair play ruhuyla rekabet eden öğrenciler; dostluk, saygı, hoşgörü ve sabır gibi erdemleri sahada ve tribünlerde sergilemektedir.</p>
        </div>
      </div>
    </div>
  );
};

export default SportsGridLayout;