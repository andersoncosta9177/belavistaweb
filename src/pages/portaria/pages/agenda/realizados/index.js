import React, { useState, useEffect } from "react";
import { ref, onValue, get } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import FormateDate from "../../../../../../src/Utils/formateDate";
import styles from "./realizados.module.css";

// Importando ícones do Material-UI
import {
  Search as SearchIcon,
  Close as CloseIcon,
  EventBusy as CalendarRemoveIcon,
  Celebration as PartyPopperIcon,
  Groups as AccountGroupIcon,
  LocalShipping as TruckDeliveryIcon,
  Star as CalendarStarIcon,
  Person as AccountIcon,
  Home as HomeOutlineIcon,
  CheckCircle as AccountCheckIcon,
} from "@mui/icons-material";

const TodosEventosPassados = () => {
  const [loading, setLoading] = useState(true);
  const [todosEventos, setTodosEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");

    const unsubscribe = onValue(agendamentosRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventosArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        const hoje = new Date();
        
        // FILTRO CORRIGIDO: Apenas eventos PASSADOS (exclui hoje)
        const eventosPassados = eventosArray.filter((evento) => {
          const dataEvento = new Date(evento.dataEvento);
          // Remove a parte da hora para comparar apenas as datas
          const dataEventoSemHora = new Date(
            dataEvento.getFullYear(), 
            dataEvento.getMonth(), 
            dataEvento.getDate()
          );
          const hojeSemHora = new Date(
            hoje.getFullYear(), 
            hoje.getMonth(), 
            hoje.getDate()
          );
          
          return dataEventoSemHora < hojeSemHora; // Apenas eventos anteriores a hoje
        });

        // Buscar número de convidados PRESENTES para cada evento
        const eventosComConvidados = await Promise.all(
          eventosPassados.map(async (evento) => {
            try {
              const convidadosRef = ref(
                db,
                `DadosBelaVista/DadosGerais/Reservas/${evento.id}/convidados`
              );
              const convidadosSnapshot = await get(convidadosRef);

              let numeroConvidadosPresentes = 0;
              if (convidadosSnapshot.exists()) {
                const convidadosData = convidadosSnapshot.val();
                Object.values(convidadosData).forEach(convidado => {
                  if (convidado.presente === true) {
                    numeroConvidadosPresentes++;
                  }
                });
              }

              return {
                ...evento,
                numeroConvidadosPresentes,
              };
            } catch (error) {
              console.error("Erro ao buscar convidados:", error);
              return {
                ...evento,
                numeroConvidadosPresentes: 0,
              };
            }
          })
        );

        eventosComConvidados.sort(
          (a, b) => new Date(b.dataEvento) - new Date(a.dataEvento)
        );

        setTodosEventos(eventosComConvidados);
        setEventosFiltrados(eventosComConvidados);
      } else {
        setTodosEventos([]);
        setEventosFiltrados([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (termoBusca.trim() === "") {
      setEventosFiltrados(todosEventos);
    } else {
      const termo = termoBusca.toLowerCase();
      const filtrados = todosEventos.filter(
        (evento) =>
          evento.apartamento.toLowerCase().includes(termo) ||
          (evento.nome && evento.nome.toLowerCase().includes(termo))
      );
      setEventosFiltrados(filtrados);
    }
  }, [termoBusca, todosEventos]);

  const getPrimeiroNome = (nomeCompleto) => {
    if (!nomeCompleto) return "Não informado";
    return nomeCompleto.split(" ")[0];
  };

  const getEventIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case "festa":
        return (
          <PartyPopperIcon 
            className={styles.eventIcon}
            style={{ color: "#FF6B6B", fontSize: 22 }}
          />
        );
      case "reunião":
        return (
          <AccountGroupIcon 
            className={styles.eventIcon}
            style={{ color: "#4ECDC4", fontSize: 22 }}
          />
        );
      case "mudança":
        return (
          <TruckDeliveryIcon 
            className={styles.eventIcon}
            style={{ color: "#FFD166", fontSize: 22 }}
          />
        );
      default:
        return (
          <CalendarStarIcon 
            className={styles.eventIcon}
            style={{ color: "#BA68C8", fontSize: 22 }}
          />
        );
    }
  };

  const renderEvento = (evento, index) => (
    <div key={evento.id} className={styles.eventCardContainer}>
      <div className={styles.eventCard}>
        <div className={styles.cardHeader}>
          <div className={styles.eventTypeBadge}>
            {getEventIcon(evento.tipo)}
            <span className={styles.eventTypeText} title={evento.tipo || "Evento"}>
              {evento.tipo || "Evento"}
            </span>
          </div>
          <span className={styles.eventDate} title={FormateDate(evento.dataEvento)}>
            {FormateDate(evento.dataEvento)}
          </span>
        </div>

        <hr className={styles.divider} />

        <div className={styles.eventDetails}>
          <div className={styles.infoRow}>
            <AccountIcon className={styles.infoIcon} />
            <span className={styles.detailLabel}>Nome:</span>
            <span className={styles.detailValue} title={getPrimeiroNome(evento.nome)}>
              {getPrimeiroNome(evento.nome)}
            </span>
          </div>
          
          <div className={styles.infoRow}>
            <HomeOutlineIcon className={styles.infoIcon} />
            <span className={styles.detailLabel}>Apto:</span>
            <span className={styles.detailValue}>{evento.apartamento}</span>
          </div>

          {/* Nova linha para mostrar número de convidados PRESENTES */}
          {evento.tipo?.toLowerCase() !== "mudança" && (
            <div className={styles.infoRow}>
              <AccountCheckIcon className={styles.infoIconPresentes} />
              <span className={`${styles.detailLabel} ${styles.presentesLabel}`}>Presentes:</span>
              <span className={`${styles.detailValue} ${styles.presentesValue}`}>
                {evento.numeroConvidadosPresentes}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.activityIndicator}></div>
        <p className={styles.loadingText}>Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Histórico de Eventos</h1>
        <p className={styles.subtitle}>Todos os eventos passados</p>
      </div>

      <div className={styles.searchContainer}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por apartamento ou nome"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
        />
        {termoBusca.length > 0 && (
          <button
            onClick={() => setTermoBusca("")}
            className={styles.clearButton}
          >
            <CloseIcon className={styles.clearIcon} />
          </button>
        )}
      </div>

      <div className={styles.resultsContainer}>
        <p className={styles.resultsText}>
          {eventosFiltrados.length}{" "}
          {eventosFiltrados.length === 1
            ? "evento encontrado"
            : "eventos encontrados"}
        </p>
      </div>

      {eventosFiltrados.length > 0 ? (
        <div className={styles.eventsGrid}>
          {eventosFiltrados.map((evento, index) => renderEvento(evento, index))}
        </div>
      ) : (
        <div className={styles.emptyContainer}>
          <CalendarRemoveIcon className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            {termoBusca
              ? "Nenhum evento encontrado"
              : "Nenhum evento passado registrado"}
          </p>
          {termoBusca && (
            <button onClick={() => setTermoBusca("")} className={styles.clearSearchButton}>
              <span className={styles.clearSearchText}>Limpar busca</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TodosEventosPassados;