import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './Home.css';
import logos from './simbolos.svg';
import fotodohomem from './fotodohomem.svg';
import mosquito from './mosquito.svg';
import Select from 'react-select';

const bairrosDataUrl = 'http://127.0.0.1:8000/enviar-dados/';

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [denunciaData, setDenunciaData] = useState({
    rua: '',
    bairro: '',
    numero: '',
    cidade: 'Fortaleza',
    estado: 'Ceara',
    descricao: '',
    doenca: 'Dengue',
    imagens: [],
  });

  const [bairrosData, setBairrosData] = useState([]);

  useEffect(() => {
    fetch(bairrosDataUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setBairrosData(data);
      })
      .catch((error) => console.error('Erro ao buscar dados:', error));
  }, []);

  const closeModal = () => {
    setShowModal(false);
    setDenunciaData({
      rua: '',
      bairro: '',
      numero: '',
      cidade: 'Fortaleza',
      estado: 'Ceara',
      descricao: '',
      doenca: 'Dengue',
      imagens: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDenunciaData({
      ...denunciaData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    const fileList = Array.from(files);

    setDenunciaData({
      ...denunciaData,
      imagens: fileList,
    });
  };

  function getCookie(name) {
    if (typeof document !== 'undefined') {
      const cookieValue = document.cookie.split('; ')
        .find(cookie => cookie.startsWith(name + '='))
        ?.split('=')[1];
      return cookieValue;
    }
    return null;
  }
  
  
  const submitDenuncia = (e) => {
    e.preventDefault();
  
    const csrftoken = getCookie('csrftoken'); // Obter o token CSRF
  
    const formData = new FormData();
    formData.append('rua', denunciaData.rua);
    formData.append('bairro', denunciaData.bairro);
    formData.append('numero', denunciaData.numero);
    formData.append('cidade', 'Fortaleza');
    formData.append('estado', 'Ceará');
    formData.append('descricao', denunciaData.descricao);
    formData.append('doenca', 'Dengue');
    denunciaData.imagens.forEach((imagem) => {
      formData.append('imagens', imagem);
    });
  
    fetch('http://127.0.0.1:8000/denuncias/', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': csrftoken,
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log('Denúncia enviada com sucesso!');
          closeModal();
          alert('Denúncia enviada com sucesso!');
        } else {
          console.error('Falha ao enviar denúncia:', response.statusText);
        }
      })
      .catch((error) => {
        console.error('Erro ao enviar denúncia:', error);
      });
  };

  return (
    <div className='homeinicio'>
      <header className='homeinicioheader'>
          <div className='textoheader'>
              <h4 className='tituloheader'>Fortaleza precisa de você. </h4>
              <h5 className='tituloheader2'><strong>Denuncie</strong> e transforme nossa cidade!</h5>
           </div>
          <div className='imagemhomem'>
            <img src={fotodohomem} alt="" />
          </div>
      </header>

      <div className='homeinformations'>
        <div className='formhome'>
          <div className='formhomeinformations'>
            <div className='hometitulototal'>
              <img className='imagemmosquito' src={mosquito} alt="" />
              <h2 className='titulohome'>Notifica</h2>
              <h3 className='titulohome2'>Fortaleza</h3>
            </div>

            <div className="homefinal">
              <div className='paragrafosfinal'>
                <p className='paragrafohome'>Denuncie em um instante, ajude a criar</p>
                <p className='paragrafohome'> um futuro mais seguro.</p>
              </div>

              <div className='homebotoes'>
                  <Link to="/information">
                  <button className='buttondeanalisar'>Analisar</button>
                  </Link>
                  <button className="buttondedenuncia" onClick={() => setShowModal(true)}>Denunciar</button>

              </div>

            </div>
            <img className='imagemlogoshome' src={logos} alt="" />
          </div>
        </div>
      </div>

      <div className={`modal-information ${showModal ? 'show-information' : ''}`}>
        <div className="modal-content-information">
          <div className='header-modal-information'>
            <span className="close-information" onClick={closeModal}>&times;</span>
            <h2 className='titulomodal-information'>Faça sua Denúncia</h2>
            </div>
          <form className="denuncia-form-information" onSubmit={submitDenuncia}>
            <label htmlFor="rua">Rua:</label>
            <input type="text" id="rua" name="rua" value={denunciaData.rua} onChange={handleInputChange} required />
            
            <label htmlFor="bairro">Bairro:</label>
            <Select
              className="select-bairro-information"
              options={bairrosData.map((bairro) => ({ value: bairro.Bairro, label: bairro.Bairro }))}
              value={{ value: denunciaData.bairro, label: denunciaData.bairro }}
              onChange={(selectedOption) => setDenunciaData({ ...denunciaData, bairro: selectedOption.value })}
            />
            
            <label htmlFor="numero">Número mais próximo:</label>
            <input type="text" id="numero" name="numero" value={denunciaData.numero} onChange={handleInputChange} required />
            
            <label htmlFor="rua">Descreva:</label>
            <textarea  type="text" id="Informacoes" name="descricao" value={denunciaData.descricao} onChange={handleInputChange} required />
            
            <div className='inputarquivosdenuncia-information'>
              <label htmlFor="imagens" className="custom-file-upload-information">
                Selecionar Imagens
              </label>
              <input type="file" id="imagens" name="imagens" multiple onChange={handleImageChange} required />
            </div>
            
            <div className='divbotaoenviardenuncia-information'>
              <button className='butaoenviardenuncia-information' type="submit">Enviar Denúncia</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
      

export default Home;
