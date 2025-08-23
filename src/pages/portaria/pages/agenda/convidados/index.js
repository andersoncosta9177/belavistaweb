import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import {
  Groups,
  Search,
  Person,
  CheckBox,
  CheckBoxOutlineBlank
} from "@mui/icons-material";
import styles from './convidados.module.css';

const ConvidadosPortaria = () => {
  const [convidados, setConvidados] = useState([]);
  const [search, setSearch] = useState("");

  // ID do morador que a portaria está visualizando
  const uidMorador = 'DdVGD3l013gdBWInRgFAV8rRQUi1'; // Substitua pelo ID real ou passe por props

  useEffect(() => {
    const convidadosRef = ref(
      db,
      `DadosBelaVista/usuarios/usuarioMorador/${uidMorador}/convidados`
    );

    const unsubscribe = onValue(convidadosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const convidadosArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          nome: value.nome,
          presente: value.presente || false,
        }));
        setConvidados(convidadosArray);
      } else {
        setConvidados([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const totalPresentes = convidados.filter((c) => c.presente).length;

  const convidadosFiltrados = convidados.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.gradientBackground}>
      <div className={styles.container}>
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.headerBadge}>
              <Groups className={styles.headerBadgeIcon} />
              <span className={styles.headerBadgeText}>{convidados.length}</span>
            </div>
            <div className={styles.headerTextContainer}>
              <h2 className={styles.headerTitle}>Lista de Convidados</h2>
              <p className={styles.headerSubtitle}>
                {totalPresentes} de {convidados.length} presentes
              </p>
            </div>
            <div className={styles.presentBadge}>
              <span className={styles.badgeText}>{totalPresentes}</span>
            </div>
          </div>
        </div>

        {convidados.length > 0 && (
          <div className={styles.searchContainer}>
            <div className={styles.searchInputContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Pesquisar convidado"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        )}

        <div className={styles.scrollContent}>
          {convidadosFiltrados.length > 0 ? (
            convidadosFiltrados.map((convidado) => (
              <div className={styles.cardItem} key={convidado.id}>
                <div className={styles.itemContainer}>
                  <div className={styles.checkbox}>
                    {convidado.presente ? (
                      <CheckBox className={styles.checkedIcon} />
                    ) : (
                      <CheckBoxOutlineBlank className={styles.uncheckedIcon} />
                    )}
                  </div>
                  <div className={styles.itemTextContainer}>
                    <span className={`${styles.itemText} ${convidado.presente ? styles.strikethrough : ''}`}>
                      {convidado.nome}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyCard}>
              <Person className={styles.emptyIcon} />
              <p className={styles.noGuestsText}>Nenhum convidado encontrado</p>
             
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConvidadosPortaria;