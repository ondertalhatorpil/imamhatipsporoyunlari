import React from 'react'
import ResponsiveHeader from '../../Components/Header/ResponsiveHeader'
import Slider from '../../Components/Slider/Slider'
import SportsBranches from '../../Components/SportsBranches/SportsBranches'
import BlogInsights from '../../Components/Blogs/Blog'
import StatsCounter from '../../Components/StatsCounter/StatsCounter'
import VideoPreview from '../../Components/VideoPreview/VideoPreview'
import Footer from '../../Components/Footer/Footer'
import SportsLandingPage from '../../Components/EtkinlikDetaylari/SportsLandingPage'
const index = () => {
  return (
    <div>
        <ResponsiveHeader />
        <Slider />
        <SportsBranches />
        <SportsLandingPage />
        <BlogInsights />
        <StatsCounter />
        <VideoPreview />
        <Footer />
    </div>
  )
}

export default index