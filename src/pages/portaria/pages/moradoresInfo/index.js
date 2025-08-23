import React, { useState, useEffect } from "react";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { db } from "../../../../database/firebaseConfig";
import { useNavigate } from "react-router-dom";
import styles from './moradoresInfo.module.css';

const PerfilMorador = () => {
  const [loading, setLoading] = useState(true);
  const [moradores, setMoradores] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMorador, setSelectedMorador] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [membros, setMembros] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const navigate = useNavigate();

  const buscarMoradores = () => {
    const moradoresRef = ref(db, "DadosBelaVista/usuarios/usuarioMorador");
    onValue(moradoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listaMoradores = Object.keys(data).map((id) => ({
          id: id,
          nome: data[id].nome || "Não informado",
          apartamento: data[id].apartamento || "Não informado",
          telefone: data[id].telefone || "Não informado",
          email: data[id].email || "Não informado",
          avatar: data[id].fotoPerfil || null
        }));
        setMoradores(listaMoradores);
      } else {
        setMoradores([]);
      }
      setLoading(false);
    });
  };

  const buscarDetalhesMorador = (userId) => {
    setLoadingDetalhes(true);
    
    // Busca membros
    const membrosRef = query(
      ref(db, `DadosBelaVista/usuarios/usuarioMorador/${userId}/membros`),
      orderByChild('dataCadastro')
    );
    
    onValue(membrosRef, (snapshot) => {
      const data = snapshot.val();
      setMembros(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });

    // Busca veículos
    const veiculosRef = query(
      ref(db, `DadosBelaVista/usuarios/usuarioMorador/${userId}/veiculos`),
      orderByChild('dataCadastro')
    );
    
    onValue(veiculosRef, (snapshot) => {
      const data = snapshot.val();
      setVeiculos(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
      setLoadingDetalhes(false);
    }, (error) => {
      console.error('Erro ao carregar detalhes:', error);
      setLoadingDetalhes(false);
    });
  };

  useEffect(() => {
    buscarMoradores();
  }, []);

  const filteredMoradores = moradores.filter(
    (morador) =>
      morador.nome.toLowerCase().includes(search.toLowerCase()) ||
      morador.apartamento.toLowerCase().includes(search.toLowerCase())
  );

  const handleWhatsAppPress = (phoneNumber) => {
  if (!phoneNumber || phoneNumber === "Não informado") {
    alert("Atenção: Número de telefone não disponível");
    return;
  }
  
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const url = `https://wa.me/55${cleanNumber}`;
  
  try {
    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      alert("Erro: Não foi possível abrir o WhatsApp. Verifique se os pop-ups estão bloqueados.");
    }
  } catch (err) {
    alert("Erro: Não foi possível abrir o WhatsApp");
    console.error("Erro ao abrir WhatsApp:", err);
  }
};

const handleCallPress = (phoneNumber) => {
  if (!phoneNumber || phoneNumber === "Não informado") {
    alert("Atenção: Número de telefone não disponível");
    return;
  }
  
  const url = `tel:${phoneNumber}`;
  
  try {
    const newWindow = window.open(url, '_self');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      alert("Erro: Não foi possível realizar a chamada");
    }
  } catch (err) {
    alert("Erro: Não foi possível realizar a chamada");
    console.error("Erro ao chamar:", err);
  }
};

  const openDetailsModal = (morador) => {
    setSelectedMorador(morador);
    setModalVisible(true);
    buscarDetalhesMorador(morador.id);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMorador(null);
    setMembros([]);
    setVeiculos([]);
  };

  const formatarPlaca = (placa) => {
    return placa.replace(/([A-Za-z]{3})([0-9A-Za-z]{4})/, '$1-$2');
  };

  const renderItem = (item) => (
    <div 
      key={item.id}
      className={styles.cardContainer}
      onClick={() => openDetailsModal(item)}
    >
      <div className={styles.cardGradient}>
        {/* Cabeçalho Compacto */}
        <div className={styles.cardHeader}>
          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.nome}
              className={styles.avatar}
            />
          ) : (
            <div className={`${styles.avatar} ${styles.avatarDefault}`}>
              <span className={styles.avatarIcon}>👤</span>
            </div>
          )}
          
          <div className={styles.cardTextContainer}>
            <h3 className={styles.nome}>{item.nome}</h3>
            <div className={styles.cardDetails}>
              <span className={styles.homeIcon}>🏠</span>
              <span className={styles.apartamento}>Apto {item.apartamento}</span>
            </div>
          </div>
          
          <div className={styles.cardActions}>
            <button 
              className={styles.whatsappIcon}
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsAppPress(item.telefone);
              }}
            >
              <span className={styles.whatsappIcon}>📱</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Carregando moradores...</p>
      </div>
    );
  }

  return (
    <div className={styles.gradientContainer}>
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h1 className={styles.headerTitle}>Moradores

          </h1>
          <span className={styles.countBadge}>{moradores.length}</span>

        </div>

        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Pesquisar por nome ou apartamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.listContainer}>
          {filteredMoradores.length > 0 ? (
            filteredMoradores.map((item) => renderItem(item))
          ) : (
            <div className={styles.emptyContainer}>
              <span className={styles.emptyIcon}>👥</span>
              <p className={styles.emptyText}>Nenhum morador encontrado</p>
            </div>
          )}
        </div>

        {/* Modal de Detalhes */}
        {modalVisible && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalContainer}>
                <button 
                  className={styles.closeButton}
                  onClick={closeModal}
                >
                  <span className={styles.closeIcon}>✕</span>
                </button>

                {selectedMorador && (
                  <div className={styles.modalContent}>
                    {/* Cabeçalho */}
                    <div className={styles.modalHeader}>
                      {selectedMorador.avatar ? (
                        <img
                          src={selectedMorador.avatar}
                          alt={selectedMorador.nome}
                          className={styles.modalAvatar}
                        />
                      ) : (
                        <div className={`${styles.modalAvatar} ${styles.modalAvatarDefault}`}>
                          <span className={styles.modalAvatarIcon}>👤</span>
                        </div>
                      )}
                      <h2 className={styles.modalNome}>{selectedMorador.nome}</h2>
                      <div className={styles.modalApartamentoContainer}>
                        <span className={styles.homeIcon}>🏠</span>
                        <span className={styles.modalApartamento}>Apto {selectedMorador.apartamento}</span>
                      </div>
                    </div>

                    <div className={styles.modalDivider}></div>

                    {/* Seção de Contato */}
                    <div className={styles.infoSection}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionIcon}>📞</span>
                        <h3 className={styles.sectionTitle}>Contato</h3>
                      </div>
                      
                      <div className={styles.infoItem}>
                        <div className={styles.infoIcon}>
                          <span className={styles.phoneIcon}>📞</span>
                        </div>
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>Telefone</span>
                          <div className={styles.phoneActions}>
                            <span className={styles.infoText}>{selectedMorador.telefone || 'Não informado'}</span>
                            <button 
                              className={styles.callButton}
                              onClick={() => handleCallPress(selectedMorador.telefone)}
                            >
                              <span className={styles.callIcon}>📞</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className={styles.infoItem}>
                        <div className={styles.infoIcon}>
                          <span className={styles.emailIcon}>✉️</span>
                        </div>
                        <div className={styles.infoContent}>
                          <span className={styles.infoLabel}>E-mail</span>
                          <span className={styles.infoText}>{selectedMorador.email || 'Não informado'}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.modalDivider}></div>

                    {/* Seção de Membros */}
                    <div className={styles.infoSection}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionIcon}>👨‍👩‍👧‍👦</span>
                        <h3 className={styles.sectionTitle}>
                          Membros da Família {loadingDetalhes && <span className={styles.smallSpinner}></span>}
                        </h3>
                      </div>
                      
                      {loadingDetalhes ? (
                        <div className={styles.loadingSmall}>
                          <span className={styles.smallSpinner}></span>
                        </div>
                      ) : membros.length > 0 ? (
                        membros.map((membro) => (
                          <div key={membro.id} className={styles.infoItem}>
                            <div className={styles.infoIcon}>
                              <span className={styles.memberIcon}>👤</span>
                            </div>
                            <div className={styles.infoContent}>
                              <span className={styles.infoText}>{membro.nome}</span>
                              <div className={styles.infoRow}>
                                <span className={styles.relationIcon}>👥</span>
                                <span className={styles.infoSubtext}>
                                  {membro.relacao || 'Relação não informada'}
                                </span>
                              </div>
                              {membro.telefone && (
                                <div className={styles.infoRow}>
                                  <span className={styles.phoneSmallIcon}>📞</span>
                                  <span className={styles.infoSubtext}>
                                    {membro.telefone}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className={styles.infoText}>Nenhum membro cadastrado</span>
                      )}
                    </div>
                    <div className={styles.modalDivider}></div>

                    {/* Seção de Veículos */}
                    <div className={styles.infoSection}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionIcon}>🚗</span>
                        <h3 className={styles.sectionTitle}>
                          Veículos {loadingDetalhes && <span className={styles.smallSpinner}></span>}
                        </h3>
                      </div>
                      
                      {loadingDetalhes ? (
                        <div className={styles.loadingSmall}>
                          <span className={styles.smallSpinner}></span>
                        </div>
                      ) : veiculos.length > 0 ? (
                        veiculos.map((veiculo) => (
                          <div key={veiculo.id} className={styles.infoItem}>
                            <div className={styles.infoIcon}>
                              <span className={styles.carIcon}>🚗</span>
                            </div>
                            <div className={styles.infoContent}>
                              <span className={styles.infoText}>
                                {veiculo.marca} {veiculo.modelo || ''} • {formatarPlaca(veiculo.placa)}
                              </span>
                              {veiculo.cor && (
                                <div className={styles.infoRow}>
                                  <span className={styles.colorIcon}>🎨</span>
                                  <span className={styles.infoSubtext}>
                                    Cor: {veiculo.cor}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className={styles.infoText}>Nenhum veículo cadastrado</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilMorador;