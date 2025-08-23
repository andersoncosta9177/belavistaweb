import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../../database/firebaseConfig';
import styles from './prestadores.module.css';
import   WhatsApp  from "@mui/icons-material/WhatsApp";
import FilterList from '@mui/icons-material/FilterList';
import { Phone } from '@mui/icons-material';


const PrestadoresServicos = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [prestadores, setPrestadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros disponíveis
  const filters = [
    'Todos', 'Pintores', 'Eletricistas', 'Encanadores', 'Diaristas', 'Marceneiros',
    'Pedreiros', 'Jardineiro', 'Piscineiro', 'Técnico em Ar Condicionado', 'Vidraceiro',
    'Serralheiro', 'Gesseiro', 'Ladrilheiro', 'Tapeceiro', 'Técnico em Eletrônica',
    'Montador de Móveis', 'Instalador de Cortinas', 'Dedetizador', 'Limpeza de Fachada',
    'Técnico em Segurança', 'Instalador de Alarmes', 'Técnico em Câmeras', 'Encanador Industrial',
    'Eletricista Industrial', 'Soldador', 'Carpinteiro', 'Açougueiro', 'Churrasqueiro',
    'Chaveiro', 'Detetizador', 'Babá', 'Professor de Idiomas', 'Técnico em Informática',
    'Técnico em Mecânica', 'Personal Trainner'
  ];

  // Função para abrir WhatsApp
  const openWhatsApp = (phone) => {
    const cleanNumber = phone.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanNumber}`;
    window.open(url, '_blank');
  };

  // Função para fazer ligação
  const handleCallPress = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === "Não informado") {
      alert("Número de telefone não disponível");
      return;
    }
    
    const url = `tel:${phoneNumber}`;
    window.open(url, '_self');
  };

  // Buscar prestadores no Firebase
  useEffect(() => {
    const prestadoresRef = ref(db, 'DadosBelaVista/DadosGerais/PrestadoresDeServicos');
    
    const unsubscribe = onValue(prestadoresRef, (snapshot) => {
      try {
        setLoading(true);
        const data = snapshot.val();
        
        if (data) {
          const prestadoresArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
            avaliacao: data[key].avaliacao || '0',
            servicosRealizados: data[key].servicosRealizados || '0',
            foto: data[key].foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(data[key].nome || '')}&background=random`,
            formasPagamento: data[key].formasPagamento || {
              pix: false,
              cartaoDebito: false,
              cartaoCredito: false,
              boleto: false
            }
          }));
          setPrestadores(prestadoresArray);
        } else {
          setPrestadores([]);
        }
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar prestadores:", err);
        setError("Erro ao carregar prestadores");
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Erro na leitura:", error);
      setError("Erro na conexão com o banco de dados");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar prestadores
  const filteredPrestadores = prestadores.filter(prestador => {
    const matchesSearch = prestador.nome?.toLowerCase().includes(search.toLowerCase()) || 
                         prestador.descricao?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'Todos' || prestador.categoria === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Obter ícone por categoria
  const getCategoryIcon = (category) => {
    const icons = {
      'Pintores': '🎨',
      'Eletricistas': '⚡',
      'Encanadores': '🔧',
      'Diaristas': '🧹',
      'Marceneiros': '🔨',
      'Pedreiros': '🧱',
      'Jardineiro': '🌿',
      'Piscineiro': '🏊',
      'Técnico em Ar Condicionado': '❄️',
      'Vidraceiro': '🪟',
      'Serralheiro': '⚙️',
      'Gesseiro': '🏗️',
      'Ladrilheiro': '🧱',
      'Tapeceiro': '🛋️',
      'Técnico em Eletrônica': '📱',
      'Montador de Móveis': '🪑',
      'Instalador de Cortinas': '🪟',
      'Dedetizador': '🐜',
      'Limpeza de Fachada': '🏢',
      'Técnico em Segurança': '🔒',
      'Instalador de Alarmes': '🚨',
      'Técnico em Câmeras': '📷',
      'Encanador Industrial': '🏭',
      'Eletricista Industrial': '⚡',
      'Soldador': '🔗',
      'Carpinteiro': '🪵',
      'Açougueiro': '🥩',
      'Churrasqueiro': '🍖',
      'Chaveiro': '🔑',
      'Detetizador': '🐞',
      'Babá': '👶',
      'Professor de Idiomas': '📚',
      'Técnico em Informática': '💻',
      'Técnico em Mecânica': '🔧',
      'Personal Trainner': '💪'
    };
    return icons[category] || '👤';
  };

  // Renderizar formas de pagamento
  const renderPaymentMethods = (formasPagamento) => {
    return (
      <div className={styles.paymentMethodsContainer}>
        <span className={styles.paymentMethodsTitle}>Formas de Pagamento:</span>
        <div className={styles.paymentMethodsIcons}>
          {formasPagamento.pix && (
            <div className={styles.paymentMethod}>
              <span className={styles.paymentIcon}>💳</span>
              <span className={styles.paymentMethodText}>PIX</span>
            </div>
          )}
          {formasPagamento.cartaoDebito && (
            <div className={styles.paymentMethod}>
              <span className={styles.paymentIcon}>💳</span>
              <span className={styles.paymentMethodText}>Débito</span>
            </div>
          )}
          {formasPagamento.cartaoCredito && (
            <div className={styles.paymentMethod}>
              <span className={styles.paymentIcon}>💳</span>
              <span className={styles.paymentMethodText}>Crédito</span>
            </div>
          )}
          {formasPagamento.boleto && (
            <div className={styles.paymentMethod}>
              <span className={styles.paymentIcon}>📄</span>
              <span className={styles.paymentMethodText}>Boleto</span>
            </div>
          )}
          {!formasPagamento.pix && !formasPagamento.cartaoDebito && 
           !formasPagamento.cartaoCredito && !formasPagamento.boleto && (
            <span className={styles.noPaymentMethods}>Não informado</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Carregando prestadores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <span className={styles.errorIcon}>❌</span>
        <p className={styles.errorText}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Prestadores de Serviços</h1>
        <p className={styles.headerSubtitle}>Encontre os melhores profissionais</p>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBarContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar prestadores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className={styles.clearButton}
            >
              ✕
            </button>
          )}
          
        </div>
                <button 
  className={styles.filterButton}
  onClick={() => setIsFilterVisible(true)}
>
  <FilterList className={styles.filterIcon} />
</button>
        

      </div>

      {/* Filtro ativo */}
      <div className={styles.activeFilterContainer}>
        <span className={styles.activeFilterText}>Categoria: </span>
        <span className={styles.badge}>{activeFilter}</span>
      </div>

      {/* Lista de prestadores */}
      <div className={styles.scrollContainer}>
        {filteredPrestadores.length > 0 ? (
          filteredPrestadores.map((prestador) => (
            <div key={prestador.id} className={styles.card}>
              <div className={styles.cardGradient}>
                <div className={styles.cardHeader}>
                  <img
                    src={prestador.foto}
                    alt={prestador.nome}
                    className={styles.avatar}
                  />
                  <div className={styles.cardHeaderInfo}>
                    <h3 className={styles.cardTitle}>{prestador.nome}</h3>
                    <div className={styles.categoryContainer}>
                      <div className={styles.categoryBadge}>
                        <span className={styles.categoryIcon}>{getCategoryIcon(prestador.categoria)}</span>
                        <span className={styles.categoryText}>{prestador.categoria}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.divider}></div>

                <p className={styles.cardDescription}>{prestador.descricao}</p>
                <div className={styles.divider}></div>

                {/* Formas de pagamento */}
                {renderPaymentMethods(prestador.formasPagamento)}

                <div className={styles.divider}></div>

                <div className={styles.infoContainer}>
                  <span className={styles.infoText}>Atendemos em:</span>
                  <span className={styles.infoText}>{prestador.endereco}</span>
                  <span className={styles.locationIcon}>📍</span>
                </div>

                <div className={styles.contactButtonsContainer}>
                  <button 
                    className={`${styles.contactButton} ${styles.whatsappButton}`}
                    onClick={() => openWhatsApp(prestador.telefone)}
                  >
                    <WhatsApp className={styles.whatsappIcon} />
                    <span className={styles.contactButtonText}>WhatsApp</span>
                  </button>

                  <button 
                    className={`${styles.contactButton} ${styles.callButton}`}
                    onClick={() => handleCallPress(prestador.telefone)}
                  >
                    <Phone className={styles.callIcon} />
                    <span className={styles.contactButtonText}>Ligar</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>🔍</span>
            <p className={styles.emptyText}>Nenhum prestador encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Filtros */}
      {isFilterVisible && (
        <div className={styles.modalOverlay} onClick={() => setIsFilterVisible(false)}>
          <div className={styles.filterSheet} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.filterTitle}>Filtrar por Categoria</h3>
            <div className={styles.sheetDivider}></div>
            
            <div className={styles.filterList}>
              {filters.map((filter, i) => (
                <div
                  key={i}
                  className={`${styles.filterItem} ${activeFilter === filter ? styles.activeFilterItem : ''}`}
                  onClick={() => {
                    setActiveFilter(filter);
                    setIsFilterVisible(false);
                  }}
                >
                  <span className={styles.filterItemText}>{filter}</span>
                  {activeFilter === filter && (
                    <span className={styles.checkIcon}>✓</span>
                  )}
                </div>
              ))}
            </div>
            
            <button
              className={styles.closeFilterButton}
              onClick={() => setIsFilterVisible(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestadoresServicos;