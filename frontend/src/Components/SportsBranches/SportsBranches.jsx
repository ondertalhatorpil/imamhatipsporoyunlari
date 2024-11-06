import React, { useState } from 'react';
import './SportsBranches.css';

const branches = [
  { id: 'dart', name: 'Dart', displayName: 'Dart', icon: 'https://www.turktelekomspor.com.tr/media/1961/icon-sirket-masa-tenisi-light.png' },
  { id: 'futsal', name: 'Futsal', displayName: 'Futsal', icon: 'https://www.turktelekomspor.com.tr/media/1014/futbol-light.png' },
  { id: 'voleybol', name: 'Voleybol', displayName: 'Voleybol', icon: 'https://www.turktelekomspor.com.tr/media/1030/voleybol-light.png' },
  { id: 'atletizm', name: 'Atletizm', displayName: 'Atletizm', icon: 'https://www.turktelekomspor.com.tr/media/1018/atletizm-light.png' },
  { id: 'basketbol', name: '3X3 Basketbol', displayName: '3X3 Basketbol', icon: 'https://www.turktelekomspor.com.tr/media/1924/icon-basketbol-light.png' },
  { id: 'gures', name: 'Güreş', displayName: 'Güreş', icon: 'https://www.turktelekomspor.com.tr/media/1934/icon-gures-light.png' },
  { id: 'bilek-guresi', name: 'Bilek Güreşi', displayName: 'Bilek Güreşi', icon: 'https://www.turktelekomspor.com.tr/media/1933/icon-bilek-guresi-light.png' },
  { id: 'taekwondo', name: 'Taekwondo', displayName: 'Taekwondo', icon: 'https://www.turktelekomspor.com.tr/media/1953/icon-hentbol-light.png' },
  { id: 'okculuk', name: 'Geleneksel Türk Okçuluğu', displayName: 'Geleneksel Türk Okçuluğu', icon: 'https://www.turktelekomspor.com.tr/media/1964/icon-okculuk-light.png' },
  { id: 'badminton', name: 'Badminton', displayName: 'Badminton', icon: 'https://www.turktelekomspor.com.tr/media/1971/icon-oryantiring-light.png' },
  { id: 'masa-tenisi', name: 'MASA TENİSİ', displayName: 'MASA TENİSİ', icon: 'https://www.turktelekomspor.com.tr/media/1961/icon-sirket-masa-tenisi-light.png' }
];

const SportsBranches = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const branchesPerPage = 4;
  const pageCount = Math.ceil(branches.length / branchesPerPage);

  const handleDotClick = (index) => {
    setCurrentPage(index);
  };

  return (
    <section className="sports-branches">
      <div className="branches-grid">
        {branches
          .slice(currentPage * branchesPerPage, (currentPage + 1) * branchesPerPage)
          .map((branch) => (
            <div key={branch.id} className="branch-item">
              <div className="branch-icon">
                <img src={branch.icon} alt={branch.name} />
              </div>
              <h3 dangerouslySetInnerHTML={{ __html: branch.displayName }}></h3>
            </div>
          ))}
      </div>
      <div className="branches-sidebar">
        <h3>BRANŞLAR</h3>
        <div className="navigation-dots">
          {[...Array(pageCount)].map((_, index) => (
            <span
              key={index}
              className={`dot ${currentPage === index ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SportsBranches;