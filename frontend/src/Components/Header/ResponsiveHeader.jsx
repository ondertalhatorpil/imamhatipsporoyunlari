import {useState, useEffect} from 'react'

import MobileMenu from "./MobileMenu";
import WebHeader from "./WebHeader";

const ResponsiveHeader = () => {
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      const checkScreenSize = () => {
        setIsMobile(window.innerWidth < 1200); 
      };
  
      checkScreenSize(); 
      window.addEventListener('resize', checkScreenSize);
  
      return () => window.removeEventListener('resize', checkScreenSize);
    }, []);
  
    return (
      <>
        {isMobile ? <MobileMenu /> : <WebHeader />}
      </>
    );
  };
  
  export default ResponsiveHeader;