import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export const sports = [
    { id: 'archery', title: 'Geleneksel Türk Okçuluğu', icon: '🎯' },
    { id: 'taekwondo', title: 'Taekwondo', icon: '🥋' },
    { id: 'tableTennis', title: 'Masa Tenisi', icon: '🏓' },
    { id: 'dart', title: 'Dart', icon: '🎯' },
  ];

const sportSheetMap = {
  'GELENEKSEL TÜRK OKÇULUĞU': 'archery',
  'DART': 'dart',
  'TAEKWONDO': 'taekwondo',
  'MASA TENİSİ': 'tableTennis'
};

const processSheetData = (sheetName, data) => {
  // İlk birkaç satırı atlayalım (başlıklar vs.)
  const rows = data.filter(row => row.length > 0);
  let startIndex = 0;
  
  // Gerçek veri başlangıcını bulalım
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].includes('DERECE')) {
      startIndex = i + 1;
      break;
    }
  }

  if (sheetName === 'TAEKWONDO') {
    return rows.slice(startIndex)
      .filter(row => row.length >= 5)
      .filter(row => row[1] && row[1] !== 'AD/SOYAD') 
      .map(row => ({
        sport: 'taekwondo',
        rank: row[0],
        name: row[1] || '',
        school: row[2] || '',
        weight: row[3] || '', 
        category: row[4] || ''
      }));
  }
  
  // Dart için özel işleme
  if (sheetName === 'DART') {
    return rows.slice(startIndex)
      .filter(row => row.length >= 3)
      .map(row => ({
        sport: 'dart',
        rank: row[0],
        name: '', // Dart'ta okul takımı olarak yarışılıyor
        school: row[1] || '',
        category: row[2] || ''
      }));
  }

  // Diğer sporlar için standart işleme
  return rows.slice(startIndex)
    .filter(row => row.length >= 4)
    .map(row => ({
      sport: sportSheetMap[sheetName] || 'other',
      rank: row[0],
      name: row[1] || '',
      school: row[2] || '',
      category: row[3] || ''
    }));
};

export const useWinnersData = () => {
  const [winners, setWinners] = useState([]);
  const [selectedSport, setSelectedSport] = useState('all');

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        const response = await fetch('/kazananlar/derece.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, {
          cellStyles: true,
          cellDates: true,
          cellNF: true,
        });

        const allWinners = [];

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const processedData = processSheetData(sheetName, data);

          if (processedData.length > 0) {
            allWinners.push({
              sport: sportSheetMap[sheetName] || 'other',
              data: processedData
            });
          }
        });

        setWinners(allWinners);
      } catch (error) {
        console.error('Excel dosyası yüklenirken hata:', error);
      }
    };

    loadExcelData();
  }, []);

  // Kategorileri spor dalına göre dinamik olarak alalım
  const getCategories = (sportId) => {
    const sportData = winners.find(w => w.sport === sportId)?.data || [];
    return [...new Set(sportData.map(item => item.category))].filter(Boolean);
  };

  // Seçili spora göre filtrelenmiş verileri al
  const filteredWinners = winners
    .filter(sportGroup => selectedSport === 'all' || sportGroup.sport === selectedSport)
    .flatMap(sportGroup => sportGroup.data);

  // Kategorilere göre grupla
  const categories = selectedSport === 'all' 
    ? [...new Set(filteredWinners.map(w => w.category))].filter(Boolean)
    : getCategories(selectedSport);

  const groupedByCategory = categories.map(category => ({
    category,
    winners: filteredWinners.filter(winner => winner.category === category)
  }));

  return {
    groupedByCategory,
    selectedSport,
    setSelectedSport
  };
};