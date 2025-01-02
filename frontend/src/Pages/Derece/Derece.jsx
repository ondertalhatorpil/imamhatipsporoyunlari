import React from 'react';
import Header from '../../Components/Header/ResponsiveHeader';
import Footer from '../../Components/Footer/Footer';
import { useWinnersData, sports } from './DereceDataProvider';
import './derece.css';

const SportFilter = ({ title, icon, isActive, onClick }) => {
  return (
    <button className={`sport-filter ${isActive ? 'active' : ''}`} onClick={onClick}>
      <span>{icon}</span>
      <span>{title}</span>
    </button>
  );
};

const WinnerCard = ({ rank, name, school, category, weight }) => {
  return (
    <div className="winner-card">
      <div className="winner-header">
        <div className={`rank-badge rank-${rank}`}>
          {rank}
        </div>
        <div className="winner-info">
          {name && <h3>{name}</h3>}
          <div className="category">
            {weight ? `${category} - ${weight}` : category}
          </div>
        </div>
      </div>
      <div className="winner-school">{school}</div>
    </div>
  );
};

const CategorySection = ({ title, winners }) => {
  return (
    <div className="category-section">
      <h2 className="category-title">{title}</h2>
      <div className="winners-grid">
        {winners.map((winner, idx) => (
          <WinnerCard key={idx} {...winner} />
        ))}
      </div>
    </div>
  );
};

const DerecePage = () => {
  const { groupedByCategory, selectedSport, setSelectedSport } = useWinnersData();

  return (
    <>
      <Header />
      <div className="winners-container">
        <div className="page-title">
          <h1>Şampiyonlar 🏆</h1>
          <p>15. İmam Hatip Spor Oyunları'nda dereceye giren başarılı sporcularımız</p>
        </div>

        <div className="sport-filters">
          {sports.map(sport => (
            <SportFilter
              key={sport.id}
              title={sport.title}
              icon={sport.icon}
              isActive={selectedSport === sport.id}
              onClick={() => setSelectedSport(sport.id)}
            />
          ))}
        </div>

        {groupedByCategory.map(group => 
          group.winners.length > 0 && (
            <CategorySection
              key={group.category}
              title={group.category}
              winners={group.winners}
            />
          )
        )}
      </div>
      <Footer />
    </>
  );
};

export default DerecePage;