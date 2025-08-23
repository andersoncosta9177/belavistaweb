import React, { useState, useEffect } from 'react';
import { ref, onValue, off, query, orderByChild } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileImport, 
  faFileExport, 
  faUser, 
  faFile, 
  faShieldAlt,
  faSearch,
  faFileCircleXmark
} from '@fortawesome/free-solid-svg-icons';
import { formatDateWithTime}  from '../../../../../../src/Utils/hourBrazil';
import styles from './documentosRegistrados.module.css';

const ListaProtocolos = () => {
  const [protocolos, setProtocolos] = useState([]);
  const [filteredProtocolos, setFilteredProtocolos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    carregarProtocolos();
    
    return () => {
      off(ref(db, 'DadosBelaVista/administracao/protocolos'));
    };
  }, []);

  useEffect(() => {
    filtrarProtocolos();
  }, [search, protocolos, activeTab]);

  const carregarProtocolos = () => {
    setRefreshing(true);
    const protocolosRef = query(
      ref(db, 'DadosBelaVista/administracao/protocolos'),
      orderByChild('timestamp')
    );

    onValue(protocolosRef, (snapshot) => {
      const data = snapshot.val();
      const protocolosArray = [];

      if (data) {
        Object.keys(data).forEach(key => {
          protocolosArray.push({
            id: key,
            ...data[key]
          });
        });
        
        // Ordena por timestamp (do mais recente para o mais antigo)
        protocolosArray.sort((a, b) => b.timestamp - a.timestamp);
      }

      setProtocolos(protocolosArray);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Erro ao carregar protocolos:', error);
      setLoading(false);
      setRefreshing(false);
    });
  };

  const filtrarProtocolos = () => {
    let resultado = protocolos.filter(protocolo => {
      // Filtro por tab (entrada/saída)
      if (activeTab === 0 && protocolo.tipo !== 'entrada') return false;
      if (activeTab === 1 && protocolo.tipo !== 'saida') return false;
      
      // Filtro por busca
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          protocolo.departamento.toLowerCase().includes(searchLower) ||
          protocolo.responsavel.toLowerCase().includes(searchLower) ||
          (protocolo.documento && protocolo.documento.toLowerCase().includes(searchLower)) ||
          protocolo.nomePorteiro.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    setFilteredProtocolos(resultado);
  };

  const onRefresh = () => {
    carregarProtocolos();
  };

  return (
    <div className={styles.gradientBackground}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Documentos Protocolados</h1>
          <p className={styles.subtitle}>Registros de entrada e saída</p>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchInputContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por departamento, responsável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.tabContainer}>
          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabButton} ${activeTab === 0 ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab(0)}
            >
              <FontAwesomeIcon 
                icon={faFileImport} 
                className={styles.tabIcon} 
              />
              <span>Entradas</span>
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 1 ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab(1)}
            >
              <FontAwesomeIcon 
                icon={faFileExport} 
                className={styles.tabIcon} 
              />
              <span>Saídas</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <div className={styles.protocolsContainer}>
            {filteredProtocolos.length === 0 ? (
              <div className={styles.emptyContainer}>
                <FontAwesomeIcon 
                  icon={faFileCircleXmark} 
                  className={styles.emptyIcon} 
                />
                <p className={styles.emptyText}>
                  {search ? 'Nenhum resultado encontrado' : 'Nenhum protocolo registrado'}
                </p>
              </div>
            ) : (
              filteredProtocolos.map((protocolo) => (
                <div 
                  key={protocolo.id} 
                  className={`${styles.card} ${
                    protocolo.tipo === 'entrada' ? styles.cardEntrada : styles.cardSaida
                  }`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleContainer}>
                      <FontAwesomeIcon
                        icon={protocolo.tipo === 'entrada' ? faFileImport : faFileExport}
                        className={styles.cardIcon}
                      />
                      <h3 className={styles.cardTitle}>
                        {protocolo.departamento}
                      </h3>
                      
                    </div>
                    <span className={styles.cardDate}>
                      {formatDateWithTime(protocolo.data)}
                    </span>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.cardRow}>
                      <FontAwesomeIcon icon={faUser} className={styles.rowIcon} />
                      <p className={styles.cardText}>
                        {protocolo.tipo === 'entrada' ? 'Recebido por: ' : 'Entregue para: '}
                        <span className={styles.cardTextBold}>{protocolo.responsavel}</span>
                      </p>
                    </div>

                    {protocolo.documento && (
                      <div className={styles.cardRow}>
                        <FontAwesomeIcon icon={faFile} className={styles.rowIcon} />
                        <p className={styles.cardText}>
                          Documento: <span className={styles.cardTextBold}>{protocolo.documento}</span>
                        </p>
                      </div>
                    )}

                    <div className={styles.cardRow}>
                      <FontAwesomeIcon icon={faShieldAlt} className={styles.rowIcon} />
                      <p className={styles.cardText}>
                        Porteiro: <span className={styles.cardTextBold}>{protocolo.nomePorteiro}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaProtocolos;