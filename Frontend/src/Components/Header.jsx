import React from 'react'
import './Header.css'
import 
 { BsJustify}
 from 'react-icons/bs'
 import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';


 function Header({ OpenSidebar }) {
  return (
    <header className='header-Conversaoofx'>
      <div className='menu-icon-Conversaoofx'>
        <BsJustify className='icon-Conversaoofx' onClick={OpenSidebar} />
      </div>
      <div className='header-left-Conversaoofx'></div>
      <div className='header-right-Conversaoofx'>
        
      </div>
    </header>
  );
}



export default Header