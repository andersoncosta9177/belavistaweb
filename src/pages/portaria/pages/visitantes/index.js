import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../../../database/firebaseConfig';
import styles from './visitantes.module.css';

const AutorizacaoVisitantes = () => {
  const [visitantes, setVisitantes] = useState([]);

  useEffect(() => {
    const visitantesRef = ref(db, 'DadosBelaVista/DadosMoradores/visitantes');

    const unsubscribe = onValue(visitantesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, valor]) => ({
          id,
          nome: valor.nome,
          documento: valor.documento,
          data: valor.data || '',
          horario: valor.horario || '',
          timestamp: valor.timestamp || '',
          autorizado: valor.autorizado || false,
          observacoes: valor.observacoes || ''
        }));
        setVisitantes(lista.reverse());
      } else {
        setVisitantes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAutorizar = (id) => {
    const visitanteRef = ref(db, `DadosBelaVista/DadosMoradores/visitantes/${id}`);
    update(visitanteRef, { 
      autorizado: true,
      autorizadoEm: new Date().toISOString() 
    })
      .then(() => console.log(`Visitante ${id} autorizado com sucesso.`))
      .catch((err) => console.error('Erro ao autorizar visitante:', err));
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return '--:--';
      
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '--:--';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--/--/----';
      
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return '--/--/----';
    }
  };

  return (
    <div className={styles.gradientContainer}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            <span className={styles.avatarIcon}>👤✅</span>
          </div>
          <h1 className={styles.title}>Autorização de Visitantes</h1>
          <p className={styles.subtitle}>Gerencie as solicitações de acesso</p>
        </div>

        {visitantes.length === 0 ? (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>👥❌</span>
            <p className={styles.emptyText}>Nenhum visitante pendente</p>
          </div>
        ) : (
          visitantes.map((visitante) => (
            <div
              key={visitante.id}
              className={`${styles.card} ${visitante.autorizado ? styles.cardAutorizado : ''}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleContainer}>
                  <h3 className={styles.cardTitle}>{visitante.nome || 'Visitante'}</h3>
                  <p className={styles.cardSubtitle}>Documento: {visitante.documento}</p>
                </div>
                {visitante.autorizado ? (
                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                    AUTORIZADO
                  </span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgeWarning}`}>
                    PENDENTE
                  </span>
                )}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.infoContainer}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📅</span>
                    <span className={styles.infoLabel}>Data: </span>
                    <span className={styles.infoValue}>{formatDate(visitante.data)}</span>
                  </div>

                  <div className={styles.separator}></div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>⏰</span>
                    <span className={styles.infoLabel}>Hora: </span>
                    <span className={styles.infoValue}>{formatTime(visitante.horario)}</span>
                  </div>
                </div>

                {visitante.observacoes && (
                  <div className={styles.observacoesContainer}>
                    <div className={styles.observacoesHeader}>
                      <span className={styles.observacoesIcon}>📝</span>
                      <span className={styles.observacoesLabel}>Observações:</span>
                    </div>
                    <p className={styles.observacoesText}>{visitante.observacoes}</p>
                  </div>
                )}
              </div>

              {!visitante.autorizado && (
                <button
                  className={styles.button}
                  onClick={() => handleAutorizar(visitante.id)}
                >
                  <span className={styles.buttonText}>AUTORIZAR ACESSO</span>
                  <span className={styles.buttonIcon}>✅</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AutorizacaoVisitantes;