import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../../../database/firebaseConfig";
import { useNavigate } from "react-router-dom";
import formatDate from "../../../../../src/Utils/formateDate";
import styles from './comunicados.module.css';

const ComunicadoPublicado = () => {
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const comunicadosRef = ref(db, "DadosBelaVista/administracao/comunicados");

    const unsubscribe = onValue(comunicadosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const comunicadosArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        comunicadosArray.sort((a, b) => new Date(b.data) - new Date(a.data));
        setComunicados(comunicadosArray);
      } else {
        setComunicados([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={styles.gradientContainer}>
      <div className={styles.scrollContainer}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Comunicados Publicados</h1>
          <p className={styles.headerSubtitle}>Clique em um comunicado para expandir</p>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
        ) : comunicados.length === 0 ? (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>📢</span>
            <p className={styles.emptyText}>Nenhum comunicado encontrado</p>
          </div>
        ) : (
          comunicados.map((item) => (
            <div 
              key={item.id} 
              className={styles.card}
              onClick={() => toggleExpand(item.id)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderContent}>
                  <h3 className={styles.cardTitle}>{item.titulo}</h3>
                  <span className={styles.cardDate}>{formatDate(item.data)}</span>
                </div>
                <span className={styles.chevronIcon}>
                  {expandedId === item.id ? '▲' : '▼'}
                </span>
              </div>
              
              {expandedId === item.id && (
                <div className={styles.expandedContent}>
                  <p className={styles.cardContent}>{item.comunicado}</p>
                  
                  <div className={styles.cardFooter}>
                    <span className={styles.cardAuthor}>{item.nomeSindico}</span>
                    <span className={styles.cardRole}>Síndico(a)</span>
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

export default ComunicadoPublicado;