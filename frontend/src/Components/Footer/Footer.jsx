import React from 'react'
import './footer.css'
import Logo from '../../assets/İHL_SPOR_LOGO_BEYAZ.png'

const Footer = () => {
  return (
    <div className='footer'>
        <p>ÖNCE SPOR</p>
        <img src={Logo} alt="Öncü Spor Logo" />
        <p>© All Copyright 2024 by ÖNCÜ SPOR KULÜBÜ</p>
    </div>
  )
}

export default Footer