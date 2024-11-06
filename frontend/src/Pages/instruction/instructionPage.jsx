import React from 'react';
import './instruction.css'; 
import ResponsiveHeader from '../../Components/Header/ResponsiveHeader';
import Footer from '../../Components/Footer/Footer';

const instructionPage = () => {
  const handleDownload = () => {
    const pdfUrl = '/talimatname.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', 'Genel_Talimatname.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
   <>
   <ResponsiveHeader />
    <div className="download-container">
      <div className="download-card">
        <h1>Talimatname İndirme</h1>
        <button onClick={handleDownload} className="download-button">
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
          Genel Talimatnamemizi İndirmek İçin Tıklayınız
        </button>
        <p className="download-note">Not: Talimatname PDF formatındadır ve otomatik olarak indirilecektir.</p>
      </div>
    </div>
    <Footer />
   </>
  );
};

export default instructionPage;