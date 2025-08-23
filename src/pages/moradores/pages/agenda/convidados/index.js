import React, { useState, useEffect, useMemo } from "react";
import { ref, onValue, push, remove, set } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { 
  Groups, 
  Search, 
  Person, 
  CheckBox, 
  CheckBoxOutlineBlank,
  Close,
  Add
} from "@mui/icons-material";
import styles from './convidadosMoradores.module.css';
import { useParams, useSearchParams } from 'react-router-dom';

const Convidados = () => {
  const [convidados, setConvidados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novoConvidado, setNovoConvidado] = useState("");
  const [search, setSearch] = useState("");
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid');

  const convidadosFiltrados = useMemo(() => {
    return convidados.filter(convidado => 
      convidado.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [convidados, search]);

  useEffect(() => {
    if (!id) return;

    const convidadosRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}/convidados`);

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
  }, [id]);

  const handleAdicionarConvidado = () => {
    if (novoConvidado.trim() === "") return;

    const convidadosRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}/convidados`);
    
    const novoConvidadoRef = push(convidadosRef);
    set(novoConvidadoRef, {
      nome: novoConvidado.trim(),
      presente: false,
    });

    setNovoConvidado("");
    setModalVisible(false);
  };

  const handleTogglePresenca = (convidadoId, presenteAtual) => {
    const novoEstado = !presenteAtual;
    
    const convidadoRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}/convidados/${convidadoId}/presente`);
    set(convidadoRef, novoEstado);
  };

  const handleRemoverConvidado = (convidadoId) => {
    const convidadoRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}/convidados/${convidadoId}`);
    remove(convidadoRef);
  };

  const totalPresentes = convidados.filter(convidado => convidado.presente).length;

  return (
    <div className={styles.gradientBackground}>
      <div className={styles.container}>
        {/* Header Card - Versão Compacta */}
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.headerTitleContainer}>
              <Groups className={styles.headerTitleIcon} />
              <h2 className={styles.headerTitle}>Lista de Convidados</h2>
            </div>
            
            <div className={styles.headerStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Convidados:</span>
                <span className={styles.statValue}>{convidados.length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Presentes:</span>
                <span className={styles.statValue}>{totalPresentes}</span>
              </div>
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
                  <div 
                    className={styles.checkbox}
                    onClick={() => handleTogglePresenca(convidado.id, convidado.presente)}
                  >
                    {convidado.presente ? (
                      <CheckBox className={styles.checkedIcon} />
                    ) : (
                      <CheckBoxOutlineBlank className={styles.uncheckedIcon} />
                    )}
                  </div>
                  
                  <span className={`${styles.itemText} ${convidado.presente ? styles.strikethrough : ''}`}>
                    {convidado.nome}
                  </span>
                  
                  <div className={styles.spacer}></div>
                  
                  <button 
                    className={styles.removeButton}
                    onClick={() => handleRemoverConvidado(convidado.id)}
                  >
                    <Close className={styles.removeIcon} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyCard}>
              <Person className={styles.emptyIcon} />
              <p className={styles.noGuestsText}>
                {search ? "Nenhum convidado encontrado" : "Nenhum convidado adicionado"}
              </p>
              <p className={styles.noGuestsSubtext}>
                {search ? "Tente outra busca" : "Clique no botão + para adicionar"}
              </p>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          className={styles.fab}
          onClick={() => setModalVisible(true)}
        >
          <Add className={styles.fabIcon} />
        </button>

        {/* Modal para adicionar convidado */}
        {modalVisible && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
              <h2 className={styles.modalTitle}>Adicionar Convidado</h2>

              <input
                type="text"
                className={styles.modalInput}
                placeholder="Nome do convidado"
                value={novoConvidado}
                onChange={(e) => setNovoConvidado(e.target.value)}
                autoFocus
              />

              <div className={styles.modalButtons}>
                <button
                  className={styles.modalSubmitButton}
                  onClick={handleAdicionarConvidado}
                >
                  Adicionar
                </button>
                <button
                  className={styles.modalCancelButton}
                  onClick={() => {
                    setModalVisible(false);
                    setNovoConvidado("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Convidados;