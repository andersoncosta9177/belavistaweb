import React, { useState, useEffect } from "react";
import { db } from "../../../../database/firebaseConfig";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import styles from './normas.module.css';

const NormasPublicadas = () => {
  const [normas, setNormas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  // Função para formatar a data
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const normasRef = ref(db, "DadosBelaVista/administracao/normas");

    const unsubscribe = onValue(normasRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const normasArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        normasArray.sort((a, b) => (b.dataPublicacao || 0) - (a.dataPublicacao || 0));
        setNormas(normasArray);
      } else {
        setNormas([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const editarNorma = (item, e) => {
    e.stopPropagation();
    navigate("/src/pages/sindico/pages/normas/editarNormas", {
      state: {
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao,
        sindico: item.sindico,
        dataPublicacao: item.dataPublicacao
      }
    });
  };

  return (
    <div className={styles.gradientContainer}>
      <div className={styles.scrollContainer}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Normas Publicadas</h1>
          <p className={styles.headerSubtitle}>Clique em uma norma para expandir</p>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
        ) : normas.length === 0 ? (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>⚖️</span>
            <p className={styles.emptyText}>Nenhuma norma encontrada</p>
          </div>
        ) : (
          normas.map((item) => (
            <div 
              key={item.id} 
              className={styles.card}
              onClick={() => toggleExpand(item.id)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderContent}>
                  <h3 className={styles.cardTitle}>{item.titulo}</h3>
                </div>
                <span className={styles.chevronIcon}>
                  {expandedId === item.id ? '▲' : '▼'}
                </span>
              </div>
              
              {expandedId === item.id && (
                <div className={styles.expandedContent}>
                  <p className={styles.cardContent}>{item.descricao}</p>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.authorContainer}>
                      <p className={styles.cardAuthor}>{item.sindico}</p>
                      <p className={styles.cardRole}>Síndico(a)</p>
                      <p className={styles.cardDate}>{formatDate(item.dataPublicacao)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NormasPublicadas;