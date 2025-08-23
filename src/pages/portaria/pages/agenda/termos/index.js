import React, { useState, useEffect } from 'react';
import styles from './termos.module.css';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';

const TermosPortaria = () => {
  const [termos, setTermos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const termosRef = ref(db, 'DadosBelaVista/usuarios/usuarioMorador');
    
    const fetchData = onValue(termosRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const termosArray = [];
          
          Object.keys(data).forEach(userId => {
            const user = data[userId];
            if (user.termosResponsabilidade) {
              Object.keys(user.termosResponsabilidade).forEach(termoId => {
                termosArray.push({
                  id: termoId,
                  userId: userId,
                  nome: user.nome || 'Nome não informado',
                  apartamento: user.apartamento || 'Apartamento não informado',
                  ...user.termosResponsabilidade[termoId]
                });
              });
            }
          });

          termosArray.sort((a, b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
          setTermos(termosArray);
        } else {
          setTermos([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao processar dados:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Erro ao buscar termos:', error);
      setLoading(false);
    });

    return () => off(termosRef);
  }, []);

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  };

  const renderItem = (item) => (
    <div className={styles.termoCard}>
      <div 
        className={styles.termoHeader} 
        onClick={() => toggleExpand(item.id)}
      >
        <div className={styles.termoHeaderInfo}>
          <div className={styles.termoTitle}>{item.nome}</div>
          <div className={styles.termoSubtitle}>Apto: {item.apartamento}</div>
        </div>
        <span className={styles.chevronIcon}>
          {expandedItems[item.id] ? '▲' : '▼'}
        </span>
      </div>

      {expandedItems[item.id] && (
        <div className={styles.termoBody}>
          <div className={styles.infoRow}>
            <span className={styles.icon}>📅</span>
            <div className={styles.infoText}>Data do evento: {item.data}</div>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.icon}>⏰</span>
            <div className={styles.infoText}>Horário: {item.horario}</div>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.icon}>📋</span>
            <div className={styles.infoText}>CPF: {item.cpf}</div>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.icon}>📩</span>
            <div className={styles.infoText}>Enviado em: {formatDate(item.dataEnvio)}</div>
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.declaracaoTitle}>Declaração:</div>
          <div className={styles.declaracaoText}>{item.declaracao}</div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingText}>Carregando...</div>
        </div>
      );
    }

    if (termos.length === 0) {
      return (
        <div className={styles.emptyCard}>
          <div className={styles.emptyContent}>
            <span className={styles.infoIcon}>ℹ️</span>
            <div className={styles.emptyText}>Nenhum termo de responsabilidade encontrado</div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.listContainer}>
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <span className={styles.headerIcon}>📋</span>
            <div className={styles.headerTitle}>Termos de Responsabilidade</div>
          </div>
        </div>
        
        <div className={styles.termosList}>
          {termos.map(item => (
            <div key={item.id}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.gradientBackground}></div>
      {renderContent()}
    </div>
  );
};

export default TermosPortaria;