import React from 'react'
import './form.css'


import Header from '../../Components/Header/ResponsiveHeader'
import Footer from '../../Components/Footer/Footer'
import FormComponents from '../../Components/FormComponents/FormComponents'

const Form = () => {
  return (
    <>
    <Header />
        <div className='form-container'>
           <div className='form-banner'>
                <h4>İmam Hatip Spor Oyunları Branş Kayıt Formu</h4>
           </div>
           <FormComponents />
        </div>
    <Footer />
    </>
  )
}

export default Form