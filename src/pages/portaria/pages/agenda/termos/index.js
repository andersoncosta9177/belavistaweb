import React, { useState, useEffect } from 'react';
import styles from './termos.module.css';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import { useParams } from 'react-router-dom';

const TermosPortaria = () => {
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const [termos, setTermos] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const termosRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}/termosDeResponsabilidade`);
    
    const fetchData = onValue(termosRef, (snapshot) => {
      try {
        const data = snapshot.val();
        console.log('Dados recebidos do Firebase:', data);
        
        if (data) {
          // Se os dados são um objeto direto (não contém usuários)
          if (data.dataEnvio) {
            // É um único termo direto
            const termo = {
              id: 'termo-unico',
              nome: data.nome || 'Nome não informado',
              apartamento: data.apartamento || 'Apartamento não informado',
              cpf: data.cpf || '',
              data: data.data || '',
              horario: data.horario || '',
              dataEnvio: data.dataEnvio || '',
              declaracao: data.declaracao || ''
            };
            setTermos([termo]);
          } else {
            // Se for um objeto com múltiplos campos mas não é um termo completo
            const termosArray = [];
            
            // Verifica se há campos de termo no objeto principal
            if (data.cpf || data.dataEnvio) {
              termosArray.push({
                id: 'termo-principal',
                nome: data.nome || 'Nome não informado',
                apartamento: data.apartamento || 'Apartamento não informado',
                cpf: data.cpf || '',
                data: data.data || '',
                horario: data.horario || '',
                dataEnvio: data.dataEnvio || '',
                declaracao: data.declaracao || ''
              });
            }
            
            setTermos(termosArray);
          }
        } else {
          console.log('Nenhum termo encontrado');
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
  }, [id]);

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Data inválida' 
        : date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    } catch {
      return 'Data inválida';
    }
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
            <div className={styles.infoText}>Data do evento: {item.data || 'Não informado'}</div>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.icon}>⏰</span>
            <div className={styles.infoText}>Horário: {item.horario || 'Não informado'}</div>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.icon}>📋</span>
            <div className={styles.infoText}>CPF: {item.cpf || 'Não informado'}</div>
          </div>
          
          <div className={styles.infoRow}>
            <span className={styles.icon}>📩</span>
            <div className={styles.infoText}>Enviado em: {formatDate(item.dataEnvio)}</div>
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.declaracaoTitle}>Declaração:</div>
          <div className={styles.declaracaoText}>{item.declaracao || 'Declaração não informada'}</div>
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