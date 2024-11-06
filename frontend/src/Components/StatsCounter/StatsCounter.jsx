import React, { useState, useEffect, useRef } from 'react';

import './StatsCounter.css'

const StatsCounter = () => {
  const [counts, setCounts] = useState({
    cups: 0,
    branches: 0,
    athletes: 0,
    schools: 0
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  
  const targets = {
    cups: 20,
    branches: 11,
    athletes: 500,
    schools: 400
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
        }
      },
      { threshold: 0.5 } 
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let interval;
    
    if (isVisible) {
      interval = setInterval(() => {
        setCounts(prevCounts => ({
          cups: prevCounts.cups < targets.cups ? prevCounts.cups + 1 : targets.cups,
          branches: prevCounts.branches < targets.branches ? prevCounts.branches + 1 : targets.branches,
          athletes: prevCounts.athletes < targets.athletes ? prevCounts.athletes + 10 : targets.athletes,
          schools: prevCounts.schools < targets.schools ? prevCounts.schools + 5 : targets.schools
        }));
      }, 50);
    }

    return () => clearInterval(interval);
  }, [isVisible]); // isVisible değiştiğinde effect'i tekrar çalıştır

  const statsData = [
    { label: 'Kupa', value: counts.cups, suffix: '+' },
    { label: 'Branş', value: counts.branches, suffix: '+' },
    { label: 'Sporcu', value: counts.athletes, suffix: '+' },
    { label: 'Okul', value: counts.schools, suffix: '+' }
  ];

  return (
    <div ref={containerRef} className="stats-counter">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-value">
            {stat.value}
            <span className="stat-suffix">{stat.suffix}</span>
          </div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCounter;