import React, { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import styles from './termos.module.css';

// Importando ícones do Material-UI
import {
  ExpandLess as ChevronUpIcon,
  ExpandMore as ChevronDownIcon,
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  CreditCard as CardAccountDetailsIcon,
  CalendarMonth as CalendarClockIcon,
  InfoOutlined as InformationOutlineIcon,
  Assignment as ClipboardListIcon,
} from '@mui/icons-material';

const TermosPortaria = () => {
  const [termos, setTermos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  
  // Obter ID da URL
  const getEventIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  };
  
  const id = getEventIdFromUrl();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const termosRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}/termosDeResponsabilidade`);
    
    const fetchData = onValue(termosRef, (snapshot) => {
      try {
        const data = snapshot.val();
        
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
    <div key={item.id} className={styles.termoCard}>
      <div 
        className={styles.termoHeader} 
        onClick={() => toggleExpand(item.id)}
      >
        <div className={styles.termoHeaderInfo}>
          <h3 className={styles.termoTitle}>{item.nome}</h3>
          <p className={styles.termoSubtitle}>Apto: {item.apartamento}</p>
        </div>
        {expandedItems[item.id] ? (
          <ChevronUpIcon className={styles.chevronIcon} />
        ) : (
          <ChevronDownIcon className={styles.chevronIcon} />
        )}
      </div>

      {expandedItems[item.id] && (
        <div className={styles.termoBody}>
          <div className={styles.infoRow}>
            <CalendarIcon className={styles.infoIcon} />
            <span className={styles.infoText}>Data do evento: {item.data || 'Não informado'}</span>
          </div>
          
          <div className={styles.infoRow}>
            <ClockIcon className={styles.infoIcon} />
            <span className={styles.infoText}>Horário: {item.horario || 'Não informado'}</span>
          </div>
          
          <div className={styles.infoRow}>
            <CardAccountDetailsIcon className={styles.infoIcon} />
            <span className={styles.infoText}>CPF: {item.cpf || 'Não informado'}</span>
          </div>
          
          <div className={styles.infoRow}>
            <CalendarClockIcon className={styles.infoIcon} />
            <span className={styles.infoText}>Enviado em: {formatDate(item.dataEnvio)}</span>
          </div>
          
          <hr className={styles.divider} />
          
          <h4 className={styles.declaracaoTitle}>Declaração:</h4>
          <p className={styles.declaracaoText}>{item.declaracao || 'Declaração não informada'}</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <p className={styles.loadingText}>Carregando termos...</p>
        </div>
      );
    }

    if (termos.length === 0) {
      return (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyContent}>
              <InformationOutlineIcon className={styles.emptyIcon} />
              <p className={styles.emptyText}>Nenhum termo de responsabilidade encontrado</p>
              <p className={styles.emptySubtext}>Os moradores ainda não enviaram termos para esta reserva.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.listContent}>
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <ClipboardListIcon className={styles.headerIcon} />
            <h2 className={styles.headerTitle}>
              Termo de Responsabilidade
            </h2>
          </div>
        </div>
        
        {termos.map(item => renderItem(item))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {renderContent()}
    </div>
  );
};

export default TermosPortaria;