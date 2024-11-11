import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'leaflet/dist/leaflet.css';
import './information.css';
import logoansfort from './imagenstempo/logouniatenu.svg';
import imagempopulacaocard from './imagenscards/svgpopulacaocard.svg';
import imagemcasoscard from './imagenscards/svgcasoscard.svg';
import imagemtaxacard from './imagenscards/svgtaxacard.svg';
import Select from 'react-select';


// Importando as imagens locais
import nublado from './imagenstempo/Nubla.svg';
import chuvafraca from './imagenstempo/chuvafra.svg';
import chuvaforte from './imagenstempo/chuvaf.svg';
import diaAberto from './imagenstempo/Aberto.svg';

// Nome dentro da barra do gráfico
Chart.register(ChartDataLabels);



const center = [-3.7319, -38.5267];
const zoom = 12;
const bairrosDataUrl = 'http://127.0.0.1:8000/enviar-dados/';
const bairrosComRiscoDeAlagamento = [ 
  'Aeroporto', 'Álvaro Weyne', 'Autran Nunes', 'Bom Jardim', 'Centro', 'Cristo Redentor', 'Damas', 
  'Dom Lustosa', 'Genibaú', 'Granja Lisboa', 'Henrique Jorge', 'Itaoca', 'Jardim América', 
  'Jóquei Clube', 'Meireles', 'Mondubim', 'Montese', 'Parangaba', 'Passaré'
];
function getCookie(name) {
  const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return cookieValue ? cookieValue.pop() : '';
}


function information() {
  const [bairrosData, setBairrosData] = useState([]);
  const [minCases, setMinCases] = useState(0);

  const [maxCases, setMaxCases] = useState(0);
  const [totalPopulacao, setTotalPopulacao] = useState(0);
  const [totalCasos, setTotalCasos] = useState(0);
  const [totalObitos, setTotalObitos] = useState(0);
  const [casosPorPopulacao, setCasosPorPopulacao] = useState(0);
  const [obitosPorCasos, setObitosPorCasos] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedBairro, setSelectedBairro] = useState(null);
  const [filteredBairro, setFilteredBairro] = useState(null);
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
  const [previsaoTempo, setPrevisaoTempo] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    fetch(bairrosDataUrl)
      .then((response) => response.json())
      .then((data) => {
        if (filteredBairro) {
          data = data.filter(bairro => bairro.Bairro === filteredBairro);
        }
  
        setBairrosData(data);
  
        const casesArray = data.map((bairro) => bairro.TOTALCasos);
        setMinCases(Math.min(...casesArray));
        setMaxCases(Math.max(...casesArray));
  
        const populacaoTotal = data.reduce((total, bairro) => total + bairro.População, 0);
        const casosTotal = data.reduce((total, bairro) => total + bairro.TOTALCasos, 0);
        const obitosTotal = data.reduce((total, bairro) => total + bairro.Obitos, 0);
  
        setTotalPopulacao(populacaoTotal);
        setTotalCasos(casosTotal);
        setTotalObitos(obitosTotal);
  
        const casosPorPopulacaoPercent = (casosTotal / populacaoTotal) * 100;
        const obitosPorCasosPercent = (obitosTotal / casosTotal) * 100;
  
        setCasosPorPopulacao(casosPorPopulacaoPercent.toFixed(2));
        setObitosPorCasos(obitosPorCasosPercent.toFixed(2));
  
        createBarChart(data);
      })
      .catch((error) => console.error('Erro ao buscar dados:', error));
  

    const interval = setInterval(fetchPrevisaoTempo, 5 * 60 * 60 * 1000);

    fetchPrevisaoTempo();

    return () => clearInterval(interval);
  }, [filteredBairro]);

  const fetchPrevisaoTempo = () => {
    const apiKey = '68a28ae1d77ac5c5ae315f3a9fe3e0be';
    const cidade = 'Fortaleza';
    const estado = 'CE';
    const pais = 'BR';
    const endpoint = `http://api.openweathermap.org/data/2.5/forecast?q=${cidade},${estado},${pais}&appid=${apiKey}&units=metric`;

    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        console.log('dados tempo=>', data);
        const filteredData = data.list.reduce((acc, previsao) => {
          const dataPrevisao = new Date(previsao.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' });
          const horaPrevisao = new Date(previsao.dt * 1000).getHours();

          if (!acc[dataPrevisao] || horaPrevisao === 12) {
            acc[dataPrevisao] = previsao;
          }

          return acc;
        }, {});

        const previsaoTempoFiltrada = Object.values(filteredData);

        previsaoTempoFiltrada.forEach((item) => {
          item.main.temp_max = Math.round(item.main.temp_max);
          item.main.temp_min = Math.round(item.main.temp_min);
        });

        setPrevisaoTempo(previsaoTempoFiltrada);
        verificarChuvasFortes(previsaoTempoFiltrada);
      })
      .catch((error) => console.error('Erro ao buscar previsão do tempo:', error));
      
  };

  const verificarChuvasFortes = (previsaoTempo) => {
    const bairrosAfetados = bairrosComRiscoDeAlagamento.filter((bairro) =>
      previsaoTempo.some((previsao) => previsao.weather[0].description.includes('light rain') && previsao.weather[0].main === 'Rain')
    );
  
    const dataChuvaForte = previsaoTempo.find(previsao => previsao.weather[0].description.includes('light rain') && previsao.weather[0].main === 'Rain')?.dt_txt;
  
    if (bairrosAfetados.length > 0 && dataChuvaForte) {
      const dataChuvaForteFormatada = new Date(dataChuvaForte).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'numeric' });
      setNotificationMessage(`Atenção! Previsão de chuva leve para ${dataChuvaForteFormatada}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 10000);  // Notificação desaparece após 10 segundos
    }
  };

  const quantidadePrevisaoTempo = () => {
    let setNumItens;
      if( window.innerWidth <= 1150 ){
          setNumItens = 3;
      } else {
        setNumItens = 6;
      }
      return setNumItens;
    };

  function botaoDisabled (){

    return true
  }


  const descricaoTraduzida = {
    'few clouds': 'Nublado',
    'light rain': 'Chuva leve',
    'moderate rain': 'Chuva moderada',
    'heavy rain': 'Chuva forte',
    'scattered clouds': 'Nublado',
    'broken clouds': 'Nublado',
    'clear sky': 'Dia Limpo',
    'overcast clouds': 'Nublado'
  };

  const getWeatherImage = (description) => {
    switch (description) {
      case 'few clouds':
      case 'scattered clouds':
      case 'broken clouds':
      case 'overcast clouds':
        return nublado;
      case 'light rain':
      case 'moderate rain':
        return chuvafraca;
      case 'heavy rain':
        return chuvaforte;
      case 'clear sky':
        return diaAberto;
      default:
        return null;
    }
  };

  const previsaoPorData = previsaoTempo.reduce((acc, previsao) => {
    const data = new Date(previsao.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' });
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(previsao);
    return acc;
  }, {});

  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getColorFromCases = (cases) => {
    const maxCasesValue = maxCases > 0 ? maxCases : 1;
    const value = cases !== null ? cases : 0;
    const normalizedValue = value / maxCasesValue;
  
    // Interpolação de cores de branco (#ffffff) para vermelho (#BC1918)
    const white = [255, 255, 255];
    const yellow = [188, 25, 24];
  
    const r = Math.round(white[0] + normalizedValue * (yellow[0] - white[0]));
    const g = Math.round(white[1] + normalizedValue * (yellow[1] - white[1]));
    const b = Math.round(white[2] + normalizedValue * (yellow[2] - white[2]));
  
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  

  const legendData = [
    { cor: getColorFromCases(maxCases), valor: formatNumber(maxCases) },
    { cor: getColorFromCases(minCases), valor: '0' },
  ];

  
  
  
  
  
// Gráfico
  const createBarChart = (data) => {
    const sortedData = data.sort((a, b) => b.TOTALCasos / b.População - a.TOTALCasos / a.População);
    const top9Bairros = sortedData.slice(0, 9);
    const labels = top9Bairros.map((bairro) => bairro.Bairro);
    const dataValues = top9Bairros.map((bairro) => (bairro.TOTALCasos / bairro.População) * 100);

    const ctx = document.getElementById('barChart');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '% de Casos em relação à População',
          data: dataValues,
          backgroundColor: 'rgb(27, 64, 81)',
          borderColor: 'rgb(27, 64, 81)',
          borderWidth: 1,
        }],
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            display: true,
            color: "rgb(255, 255, 255)",
            anchor: 'center', // Muda para 'end' para posicionar o rótulo na extremidade da barra
            align: 'center',  // Alinha o texto ao final da barra
            formatter: (value, context) => {
              // Retorna o nome do bairro dentro da barra
              return context.chart.data.labels[context.dataIndex];
            },
            font: {
              weight: 'bold'
            }
          },
          title: {
            display: true,
            text: 'Bairros com maior taxa de contaminação relativa',
            color: "rgb(27, 64, 81)",
            font:{
              size: 20,
            },
          },
          legend: {
            labels: {
              color: "rgb(27, 64, 81)",
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value}%`,
              color: "rgb(27, 64, 81)",
            },
          },
          y: {
            ticks: {
              display: false,
              color: "rgb(27, 64, 81)",
              fontWeight: "bold",
            },
            grid: {
              display: false, // Remove as linhas de grade verticais
            },
          },
        },
        responsive: true,
      },
    });
};


  const BairroCard = ({ bairro }) => (
    <div className="bairro-card">
      <h3>{bairro.Bairro}</h3>
      <p>População: {bairro.População}</p>
      <p>Casos: {bairro.TOTALCasos}</p>
      <p>% de Contaminação: {(bairro.TOTALCasos / bairro.População * 100).toFixed(2)}%</p>
      <p>Óbitos: {bairro.Obitos}</p>
    </div>
  );

  const closeModal = () => {
    setShowModal(false);
    setDenunciaData({
      rua: '',
      bairro: '',
      numero: '',
      imagens: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDenunciaData({
      ...denunciaData,
      [name]: value,
    });
    if (!value) {
      setFilteredBairro(null);
    }
  };


  const handleImageChange = (e) => {
    const files = e.target.files;
    console.log(files);
    // Convert FileList to an array for easier manipulation if needed
    const fileList = Array.from(files);
    console.log(fileList);
    
    setDenunciaData({
      ...denunciaData,
      imagens: fileList, // Update imagens to be an array of File objects
    });
  };
  

  const submitDenuncia = (e) => {
    e.preventDefault();
  
    // Fetch CSRF token from cookies
    const csrftoken = getCookie('csrftoken');
  
    const formData = new FormData();
    formData.append('rua', denunciaData.rua);
    formData.append('bairro', denunciaData.bairro);
    formData.append('numero', denunciaData.numero);
    formData.append('cidade', 'Fortaleza');  // Hardcode cidade value
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
          console.log(response)
          console.log('Denúncia enviada com sucesso!');
          closeModal();
        } else {
          console.error('Falha ao enviar denúncia:', response.statusText);
          // Handle error or display error message to user
        }
      })
      .catch((error) => {
        console.error('Erro ao enviar denúncia:', error);
        // Handle error or display error message to user
      });
  };
  
  
  
  const openInfoModal = (bairro) => {
    setInfoModalOpen(true);
    setSelectedBairro(bairro);
  };

  const closeInfoModal = () => {
    setInfoModalOpen(false);
    setSelectedBairro(null);
  };

  return (
    <div className='corpototainformation'>
      <header className='headerlogo'>

        <div className='logoinformation-denuncia-button'>

          <div className='divlogo'>
            <img className='imagemlogo' src={logoansfort} alt="" />
            <h1 className="tituloinformations">
              <span className='tituloinformationsnotifica'>NOTIFICA</span>
              <span className='tituloinformationsfortaleza'>FORTALEZA</span>
            </h1>
          </div>
          
          {showNotification && (
            <div className="notification">
              <button className="close-notification" onClick={() => setShowNotification(false)}>&times;</button>
              <span>{notificationMessage}</span>
            </div>
          )}
          
          <div className="denuncia-button-container-information">
            <button className="denuncia-button-information" onClick={() => setShowModal(true)}>DENUNCIAR</button>
          </div>
          
        </div>
        
        <div className='divselectfilter'>
        
          <div className='selects'>
            <Select
                className="selectfilterinfor"
                placeholder="SELECIONE O BAIRRO"
                options={bairrosData.map((bairro) => ({ value: bairro.Bairro, label: bairro.Bairro }))}
                value={denunciaData.bairro ? { value: denunciaData.bairro, label: denunciaData.bairro } : null}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setDenunciaData({ ...denunciaData, bairro: selectedOption.value });
                    setFilteredBairro(selectedOption.value);
                  } else {
                    setDenunciaData({ ...denunciaData, bairro: '' });
                    setFilteredBairro(null);
                  }
                }}
                isClearable={true}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    fontFamily: 'dosis',
                    fontWeight: 'bold',
                    padding: '2px 15px 2px 15px',
                    backgroundColor: '#1B4051',
                    borderColor: '#1B4051',
                    color: 'white',
                    borderRadius: '10px',
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: 'white',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: 'white',
                  }),
                }}
              />
          </div>
        </div>
      </header>
      
      <div className="card-container">
        <div className="card">
          <img  src={imagempopulacaocard}/>
          <p>{formatNumber(totalPopulacao)}</p>
          <h2>População</h2>
        </div>
        <div className="card">
          <img src={imagemcasoscard}/>
          <p>{totalCasos}</p>
          <h2>Casos</h2>
        </div>
        <div className="card">
          <img src={imagemtaxacard}/>
          <p>{casosPorPopulacao}%</p>
          <h2>Contaminação</h2>
        </div>
        <div className="card">
          <p>{totalObitos}</p>
          <h2>Óbitos</h2>
        </div>
        <div className="card">
          <p>{obitosPorCasos}%</p>
          <h2>% de Óbitos</h2>
        </div>
        <div className="card">
          <p>{obitosPorCasos}</p>
          <h2>Denúncias</h2>
        </div>
      </div>
      
      <div className="previsao-tempo-container">
        <ul className='listadetempo'>
          {Object.keys(previsaoPorData).slice(0, quantidadePrevisaoTempo()).map((data) => (
            <div className='divtempo' key={data}>
              <ul className='listadatatempo'>
                {previsaoPorData[data].map((previsao, index, array) => {
                  const descricao = descricaoTraduzida[previsao.weather[0].description] || previsao.weather[0].description;
                  return (
                    <ul key={index} className={`condicao-tempo ${previsao.weather[0].main.toLowerCase()}`}>
                      <div className="tempo-info">
                        <div className='divimagemtempo'>
                          <img
                              src={getWeatherImage(previsao.weather[0].description)}
                              alt={previsao.weather[0].description}
                              className="weather-icon"
                            />
                        </div>
                        <div className='descricaotempo'>
                          <h4 className='datatitle'>{data}</h4>
                          <div className='divminmax'>
                            <p>Mín: {previsao.main.temp_min}°C | Máx: {previsao.main.temp_max}°C </p>
                            <p>{descricao}</p>
                          </div>    
                      </div>
                      </div>
                    </ul>
                  );
                })}
              </ul>
            </div>
          ))}
        </ul>
      </div>
      
      <div className='corpodosgraficos'>
        <div className='corpomapa'>
          <div className="legend-container">
            <div className="legend">
              <div className="legend-values">
                <div className='lgendamap'> Máx {legendData[0].valor}</div>
                <div className="legend-gradient" style={{ backgroundImage: `linear-gradient(to top, ${legendData[1].cor}, ${legendData[0].cor})` }}></div>
                <div className='lgendamap'>Mín {legendData[1].valor}</div>
              </div>
            </div>
          </div>
            
          <div className="map-container">
            <MapContainer center={center} zoom={zoom} className="map">
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {bairrosData.map((bairro) => (
              <Polygon
                key={bairro.Bairro}
                positions={bairro.Coordenadas}
                pathOptions={{
                  fillColor: getColorFromCases(bairro.TOTALCasos),
                  fillOpacity: 0.5,
                  color: '#1B4051',
                  weight: 2,
                }}
                eventHandlers={{
                  mouseover: () => openInfoModal(bairro),
                  mouseout: closeInfoModal,
                  click: () => {
                    if (!infoModalOpen) {
                      setShowModal(true);
                      setSelectedBairro(bairro);
                    }
                  },
                }}
              />
            ))}
            {infoModalOpen && selectedBairro && (
              <div className="bairro-card-container">
                <BairroCard bairro={selectedBairro} />
              </div>
            )}
            </MapContainer>
          </div>
        </div>
        
        <div className="bar-chart-container">
          <div className="legend-container">
          </div>
          <canvas id="barChart"></canvas>
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
              <button className='butaoenviardenuncia-information'  type="submit">Enviar Denúncia</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default information;