import React, { useState, useEffect, useMemo } from "react";
import { ref, onValue, push, remove, set } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import styles from "./convidadosMoradores.module.css";

// Importando ícones do Material-UI
import {
  Groups as AccountGroupIcon,
  Search as MagnifyIcon,
  CheckBox as CheckboxMarkedIcon,
  CheckBoxOutlineBlank as CheckboxBlankIcon,
  Close as CloseIcon,
  PersonSearch as AccountQuestionIcon,
  Add as PlusIcon,
} from "@mui/icons-material";

const Convidados = () => {
  const [convidados, setConvidados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [novoConvidado, setNovoConvidado] = useState("");
  const [search, setSearch] = useState("");
  
  // Obter ID da URL - usando window.location para web
  const getEventIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  };
  
  const id = getEventIdFromUrl();

  const convidadosFiltrados = useMemo(() => {
    return convidados.filter(convidado => 
      convidado.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [convidados, search]);

  // Carrega os convidados do Firebase
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
      presente: false, // Inicialmente marcado como não presente
    });

    setNovoConvidado("");
    setModalVisible(false);
  };

  const handleTogglePresenca = (convidadoId, presenteAtual) => {
    const novoEstado = !presenteAtual;
    
    // Atualiza apenas o campo 'presente' no Firebase
    const convidadoRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}/convidados/${convidadoId}/presente`);
    set(convidadoRef, novoEstado);
  };

  const handleRemoverConvidado = (convidadoId) => {
    const convidadoRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}/convidados/${convidadoId}`);
    remove(convidadoRef);
  };

  const totalPresentes = convidados.filter(convidado => convidado.presente).length;

  return (
    <div className={styles.container}>
      {/* Header compacto e elegante */}
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <div className={styles.headerTitleSection}>
              <AccountGroupIcon className={styles.headerIcon} />
              <h2 className={styles.headerTitle}>Convidados</h2>
            </div>
              {/* <div className={styles.headerStats}> */}
              <span className={styles.headerStat}>
                {totalPresentes} / {convidados.length} presentes
              </span>
            {/* </div> */}
          
          </div>
          
        </div>
        
        {/* Input de pesquisa colado ao header */}
       
      </div>
       <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <MagnifyIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Pesquisar convidado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

      <div className={styles.scrollContent}>
        {convidadosFiltrados.length > 0 ? (
          convidadosFiltrados.map((convidado) => (
            <div className={styles.cardItem} key={convidado.id}>
              <div className={styles.itemContainer}>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={convidado.presente}
                    onChange={() => handleTogglePresenca(convidado.id, convidado.presente)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxCustom}>
                    {convidado.presente ? (
                      <CheckboxMarkedIcon className={styles.checkedIcon} />
                    ) : (
                      <CheckboxBlankIcon className={styles.uncheckedIcon} />
                    )}
                  </span>
                </label>
                <div className={styles.itemTextContainer}>
                  <span
                    className={`${styles.itemText} ${convidado.presente ? styles.strikethrough : ''}`}
                  >
                    {convidado.nome}
                  </span>
                  <button 
                    onClick={() => handleRemoverConvidado(convidado.id)}
                    className={styles.removeButton}
                  >
                    <CloseIcon className={styles.removeIcon} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyCard}>
            <AccountQuestionIcon className={styles.emptyIcon} />
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
        <PlusIcon className={styles.fabIcon} />
      </button>

      {/* Modal para adicionar convidado */}
      {modalVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <h3 className={styles.modalTitle}>Adicionar Convidado</h3>

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
                className={styles.modalCancelButton}
                onClick={() => {
                  setModalVisible(false);
                  setNovoConvidado("");
                }}
              >
                Cancelar
              </button>

              <button
                className={styles.modalSubmitButton}
                onClick={handleAdicionarConvidado}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Convidados;