import React from 'react';
import './instruction.css';
import ResponsiveHeader from '../../Components/Header/ResponsiveHeader';
import Footer from '../../Components/Footer/Footer';

const InstructionPage = () => {
  const instructions = [
    {
      title: 'Genel Talimatname',
      filename: 'talimatname.pdf',
      downloadName: 'Genel_Talimatname.pdf',
      icon: '🏆'
    },
    {
      title: 'Dart',
      filename: 'dart.pdf',
      downloadName: 'Dart Talimatmane.pdf',
      icon: '🎯'
    },
    {
      title: 'Geleneksel Türk Okçuluğu',
      filename: 'GelenekselTürkOkçuluğu.pdf',
      downloadName: 'GelenekselTürkOkçuluğu.pdf',
      icon: '🏹'
    },
    {
      title: 'Masa Tenisi',
      filename: 'MasaTenisiTurnuvası.pdf',
      downloadName: 'MasaTenisiTurnuvası.pdf',
      icon: '🏓'
    },
    {
      title: 'Taekwondo',
      filename: 'taekwondotalimatnamesi.pdf',
      downloadName: 'taekwondotalimatnamesi.pdf',
      icon: '🥋'
    }
  ];

  const handleDownload = (filename, downloadName) => {
    const pdfUrl = `/${filename}`;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <ResponsiveHeader />
      <div className="instructions-container">
        <div className="instructions-header">
          <h1>Spor Talimatnameleri</h1>
          <p>Branşlara özel talimatnameleri buradan indirebilirsiniz</p>
        </div>
        <div className="instructions-grid">
          {instructions.map((instruction, index) => (
            <div key={index} className="instruction-card">
              <div className="card-icon">{instruction.icon}</div>
              <h2>{instruction.title}</h2>
              <button
                onClick={() => handleDownload(instruction.filename, instruction.downloadName)}
                className="download-button"
              >
                <span className="button-text">Talimatnameyi İndir</span>
                <svg
                  className="download-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InstructionPage;