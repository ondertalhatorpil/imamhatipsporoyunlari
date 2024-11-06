import React from 'react'
import Header from '../../Components/Header/ResponsiveHeader'
import Footer from '../../Components/Footer/Footer'
import './fikstür.css'


const Fixture = () => {
  return (
    <>
        <Header />
        <div className='fikstür'>
          <h1>! Sezon henüz başlamadığı için fikstür sonuçlarımız bulunmamaktadır.</h1>
        </div>
        <Footer />
    </>
  )
}

export default Fixture