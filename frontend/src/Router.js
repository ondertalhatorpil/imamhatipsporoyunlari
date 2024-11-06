import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

//Pages
import Home from './Pages/HomePage/Home'
import Fixture from './Pages/Fikstür/Fixture'
import Contact from './Pages/Contact/Contact'
import Form from './Pages/Form/Form'
import Galeri from './Pages/Galeri/Galeri'
import Talimatname from './Pages/instruction/instructionPage'
import Admin from './admin/admin'





const Router = () => {
  return (
    <>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/fikstür' element={<Fixture />} />
                <Route path='/contact' element={<Contact />} />
                <Route path='/form' element={<Form />} />
                <Route path='/galeri' element={<Galeri />} />
                <Route path='/talimatname' element={<Talimatname />} />
                <Route path='/admin' element={<Admin />} />

            </Routes>
        </BrowserRouter>
    </>
  )
}

export default Router