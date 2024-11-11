import React, { useEffect, useState } from 'react';
import './Siderbar.css';
import { Link } from 'react-router-dom';
import Logo from './Logo Finance-14.png';
import { BsGrid1X2Fill, BsFillArchiveFill, BsFillPeopleFill } from 'react-icons/bs';
import { BiLogOut } from 'react-icons/bi';
import axios from 'axios';

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const [user, setUser] = useState(null);
  const handleOverlayClick = () => {
    if (openSidebarToggle) {
      OpenSidebar();
    }
  };

  return (
    <>
      <div className={`overlay ${openSidebarToggle ? 'active' : ''}`} onClick={handleOverlayClick}></div>
      <aside id="sidebar-conversao" className={openSidebarToggle ? "sidebar-responsive-conversao" : ""}>
        <div className='sidebar-title-conversao'>
          <div className='sidebar-brand-conversao'>
            <img src={Logo} alt="Descrição da imagem" />
           
          </div>
        </div>
        <ul className='sidebar-list-conversao'>
          <li className='sidebar-list-item-conversao'>
            <Link to="/Conversao">
              <BsGrid1X2Fill className='icon-conversao' />  Home
            </Link>
          </li>
          <li className='sidebar-list-item-conversao'>
            <Link to="/Clientes">
              <BsFillPeopleFill className='icon-conversao'/> Detalhe
            </Link>
          </li>
          {/* <li className='sidebar-list-item-conversao'>
            <Link to="/ClientesPlanoContas">
              <BsFillArchiveFill className='icon-conversao'/> Plano de Contas
            </Link>
          </li>
          <li className='sidebar-list-item-conversao'>
            <Link to="/Login">
              <BiLogOut className='icon-conversao'/> Sair
            </Link>
          </li> */}
        </ul>
      </aside>
    </>
  );
}

export default Sidebar;
