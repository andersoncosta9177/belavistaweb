import React, { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db, auth } from "../../../../database/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import styles from './garagem.module.css';
import {
  WhatsApp,

} from "@mui/icons-material";

function VagasDisponiveis() {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserData(userData);
            setTelefone(userData.telefone);
          }
          setLoading(false);
        }, (error) => {
          console.error("Erro ao buscar dados do usuário:", error);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    carregarVagas();
    
    return () => {
      const vagasRef = ref(db, 'DadosBelaVista/administracao/vagasGaragem');
      off(vagasRef);
      unsubscribeAuth();
    };
  }, []);

  const openWhatsApp = (phoneNumber) => {
    if (!phoneNumber) {
      alert("Número de telefone não disponível");
      return;
    }

    const cleaned = phoneNumber.replace(/\D/g, '');
    const phone = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
    const url = `https://wa.me/${phone}`;
    
    window.open(url, '_blank').catch(err => {
      console.error("Erro ao abrir WhatsApp:", err);
      alert("Não foi possível abrir o WhatsApp");
    });
  };

  const carregarVagas = () => {
    setLoading(true);
    const vagasRef = ref(db, 'DadosBelaVista/administracao/vagasGaragem');
    
    onValue(vagasRef, (snapshot) => {
      const data = snapshot.val();
      const vagasArray = [];
      
      if (data) {
        Object.keys(data).forEach((key) => {
          if (data[key].status === 'disponível') {
            vagasArray.push({
              id: key,
              ...data[key]
            });
          }
        });
      }
      
      setVagas(vagasArray);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      setRefreshing(false);
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarVagas();
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR').slice(0, 5);
  };

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        <div className={styles.header}>
          <div className={styles.icon}>🚗</div>
          <h1 className={styles.title}>Vagas Disponíveis</h1>
          <p className={styles.subtitle}>Confira as vagas de garagem disponíveis no condomínio</p>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Carregando vagas...</p>
          </div>
        ) : vagas.length === 0 ? (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>🚫🚗</span>
            <p className={styles.emptyText}>Nenhuma vaga disponível no momento</p>
            <p className={styles.emptySubtext}>Quando alguém anunciar uma vaga, ela aparecerá aqui</p>
          </div>
        ) : (
          vagas.map((vaga) => (
            <div key={vaga.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Vaga de Garagem</h3>
                <div className={styles.valorContainer}>
                  <span className={styles.valorText}>{vaga.valor}</span>
                </div>
              </div>
              
              {vaga.observacoes && (
                <div className={styles.observacoesContainer}>
                  <span className={styles.infoIcon}>ℹ️</span>
                  <p className={styles.observacoesText}>{vaga.observacoes}</p>
                </div>
              )}
              
              <div className={styles.infoContainer}>
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}>👤</span>
                  <span className={styles.infoText}>Anunciante: {vaga.nome}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}>🏠</span>
                  <span className={styles.infoText}>Apartamento: {vaga.apartamento}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoIcon}>📅</span>
                  <span className={styles.infoText}>Publicado em: {formatarData(vaga.criadoEm)}</span>
                </div>
              </div>
              
              <button 
                className={styles.contactButton}
                onClick={() => openWhatsApp(vaga.telefone)}
              >
                <WhatsApp className={styles.contactButtonIcon} />
                <span className={styles.contactButtonText}>WhatsApp</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VagasDisponiveis;