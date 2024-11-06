import React from 'react'

import './contact.css'

import { FaMapLocationDot } from "react-icons/fa6";
import { FaPhoneSquareAlt } from "react-icons/fa";
import { IoMailUnread } from "react-icons/io5";

import Logo from '../../Components/Header/assets/images/YatayLogo.png'


import Header from '../../Components/Header/ResponsiveHeader'
import Footer from '../../Components/Footer/Footer'



const Contact = () => {



    const officeLocation = {
        address: "Akşemsettin Mh. Şair Fuzuli Sk. No: 22 Fatih - İstanbul",
        mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.279304538311!2d28.94977297672728!3d41.01762017134385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab9f11e6745e3%3A0x1d3b7e17a5d8c3d3!2sAksemsettin%2C%20Fuzuli%20Cd.%20No%3A22%2C%2034080%20Fatih%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1708642151749!5m2!1str!2str"
      };



  return (
    <>
        <Header />
        <div  className='contact-container'>
        <div className='contact-form'>
            <div className='contact-desc'>
                <div className='a-div'>
                <a href="#">
                    <FaMapLocationDot  className='form-icons'/>
                    <span>Akşemsettin Mh. Şair Fuzuli <br /> Sk. No: 22 Fatih - İstanbul</span>
                </a>
                <a href="#">
                    <FaPhoneSquareAlt  className='form-icons'/>
                    <span>0530 915 92 93</span>
                </a>
                <a href="#">
                    <IoMailUnread  className='form-icons'/>
                    <span>oncugeclikvespor@gmail.com</span>
                </a>
                </div>
                <img src={Logo} alt="Öncü Spor Kulübü Logo" className='yataylogocontact' />
                {/* <div className='form-desing-div'>wdfedv</div> */}
            </div>
        </div>
        <div className="office-map-container">
      <div className="map-content">
        <div className="map-frame">
          <iframe
            src={officeLocation.mapUrl}
            width="100%"
            height="900px"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Office Location"
          ></iframe>
        </div>
      </div>
    </div>
    </div>
    <Footer />
    </>
  )
}

export default Contact