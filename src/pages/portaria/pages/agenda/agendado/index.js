import React, { useState, useEffect } from "react";
import { ref, onValue, remove, get } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { Link } from "react-router-dom";
import FormateDate from "../../../../../../src/Utils/formateDate";
import styles from "./agendado.module.css";

// Importando ícones do Material-UI
import {
  CalendarToday as CalendarIcon,
  EventBusy as CalendarRemoveIcon,
  Warning as CalendarAlertIcon,
  LocalShipping as TruckIcon,
  LocalBar as WineBarIcon,
  Star as CalendarStarIcon,
  Person as AccountIcon,
  Home as HomeCityIcon,
  CheckCircle as AccountCheckIcon,
  Description as FileDocumentIcon,
  Group as AccountGroupIcon,
  Delete as DeleteIcon,
  Schedule as ClockOutlineIcon,
  EventAvailable as CalendarCheckIcon,
} from "@mui/icons-material";

const EventosAgendados = () => {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [convidadosPresentes, setConvidadosPresentes] = useState({});

  useEffect(() => {
    const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");

    const unsubscribe = onValue(agendamentosRef, async (snapshot) => {
      const data = snapshot.val();
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (data) {
        const eventosFuturos = [];
        const presentesData = {};

        // Processar cada agendamento
        for (const agendamentoId of Object.keys(data)) {
          const agendamento = data[agendamentoId];
          const eventoData = new Date(agendamento.dataEvento);
          eventoData.setHours(0, 0, 0, 0);

          // Verificar se o evento é hoje ou no futuro
          if (eventoData >= hoje) {
            eventosFuturos.push({
              id: agendamentoId,
              ...agendamento,
            });

            // Buscar convidados presentes apenas para eventos que não são mudança
            if (
              agendamento.tipo &&
              agendamento.tipo.toLowerCase() !== "mudança"
            ) {
              try {
                const convidadosRef = ref(
                  db,
                  `DadosBelaVista/DadosGerais/Reservas/${agendamentoId}/convidados`
                );
                const convidadosSnapshot = await get(convidadosRef);

                if (convidadosSnapshot.exists()) {
                  const convidadosData = convidadosSnapshot.val();
                  let presentesCount = 0;

                  // Contar convidados com presente: true
                  Object.values(convidadosData).forEach((convidado) => {
                    if (convidado.presente === true) {
                      presentesCount++;
                    }
                  });

                  presentesData[agendamentoId] = presentesCount;
                } else {
                  presentesData[agendamentoId] = 0;
                }
              } catch (error) {
                console.error("Erro ao buscar convidados:", error);
                presentesData[agendamentoId] = 0;
              }
            }
          }
        }

        // Ordenar por data (mais próximos primeiro)
        eventosFuturos.sort(
          (a, b) => new Date(a.dataEvento) - new Date(b.dataEvento)
        );

        setAgendamentos(eventosFuturos);
        setConvidadosPresentes(presentesData);
      } else {
        setAgendamentos([]);
        setConvidadosPresentes({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deleteEvento = (eventoId) => {
    if (window.confirm("Tem certeza que deseja excluir este evento?")) {
      const eventoRef = ref(
        db,
        `DadosBelaVista/DadosGerais/Reservas/${eventoId}`
      );

      remove(eventoRef)
        .then(() => {
          setAgendamentos((prev) => prev.filter((e) => e.id !== eventoId));
          // Remover também da contagem de presentes
          setConvidadosPresentes((prev) => {
            const newData = { ...prev };
            delete newData[eventoId];
            return newData;
          });
        })
        .catch((error) => {
          alert("Erro: Ocorreu um erro ao excluir o evento.");
          console.error(error);
        });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.activityIndicator}></div>
        <p className={styles.loadingText}>Carregando agenda da portaria...</p>
      </div>
    );
  }

  const getEventIcon = (tipo) => {
    if (!tipo) {
      return (
        <CalendarAlertIcon
          className={styles.eventIcon}
          style={{ color: "#FF5252" }}
        />
      );
    }

    switch (tipo.toLowerCase()) {
      case "mudança":
        return (
          <TruckIcon
            className={styles.eventIcon}
            style={{ color: "#FFD700" }}
          />
        );
      case "evento":
        return (
          <WineBarIcon
            className={styles.eventIcon}
            style={{ color: "#4FC3F7" }}
          />
        );
      default:
        return (
          <CalendarStarIcon
            className={styles.eventIcon}
            style={{ color: "#BA68C8" }}
          />
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <CalendarIcon className={styles.headerIcon} />
        <h1 className={styles.title}>Próximos Agendamentos</h1>
      </div>

      <div className={styles.scrollContainer}>
        {agendamentos.length > 0 ? (
          agendamentos.map((item) => {
            const isHoje =
              new Date(item.dataEvento).toDateString() ===
              new Date().toDateString();
            const totalPresentes = convidadosPresentes[item.id] || 0;

            return (
              <div key={`${item.uid}-${item.id}`} className={styles.card}>
                <div className={styles.cardHeader}>
                  {getEventIcon(item.tipo)}
                  <span className={styles.eventType}>
                    {item.tipo || "Evento"}
                  </span>
                  <div
                    className={`${styles.dateBadge} ${
                      isHoje ? styles.todayBadge : ""
                    }`}
                  >
                    <span className={styles.dateBadgeText}>
                      {FormateDate(item.dataEvento)}
                      {isHoje && " (Hoje)"}
                    </span>
                  </div>
                </div>

                <hr className={styles.divider} />

                <div className={styles.cardContent}>
                  <div className={styles.infoRowContainer}>
                    <div className={styles.infoRow}>
                      <AccountIcon className={styles.infoIcon} />
                      <span className={styles.infoText}>Morador:</span>
                    </div>
                    <span className={styles.infoText}>
                      {item.nome || "Não informado"}
                    </span>
                  </div>
                  <div className={styles.infoRowContainer}>
                    <div className={styles.infoRow}>
                      <AccountIcon className={styles.infoIcon} />
                      <span className={styles.infoText}>Cpf:</span>
                    </div>
                    <span className={styles.infoText}>
                      {item.cpf || "Não informado"}
                    </span>
                  </div>

                  <div className={styles.infoRowContainer}>
                    <div className={styles.infoRow}>
                      <HomeCityIcon className={styles.infoIcon} />
                      <span className={styles.infoText}>Apto:</span>
                    </div>
                    <span className={styles.infoText}>{item.apartamento}</span>
                  </div>

                  {item.tipo && item.tipo.toLowerCase() !== "mudança" && (
                    <>
                      <div className={styles.infoRowContainer}>
                        <div className={styles.infoRow}>
                          <AccountCheckIcon
                            className={styles.infoIconConfirmed}
                          />
                          <span
                            className={`${styles.infoText} ${styles.confirmedText}`}
                          >
                            Confirmados:
                          </span>
                        </div>
                        <span
                          className={`${styles.infoText} ${styles.confirmedText}`}
                        >
                          {totalPresentes > 0
                            ? `${totalPresentes} pessoas`
                            : "Nenhum presente"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.actionsContainer}>
                  {item.tipo && item.tipo.toLowerCase() !== "mudança" && (
                    <>
                      <Link
                        to={{
                          pathname: "/portaria/agenda/termos",
                          search: `?id=${item.id}`,
                        }}
                        className={styles.actionLink}
                      >
                        <div className={styles.actionButton}>
                          <FileDocumentIcon className={styles.actionIcon} />
                          <span className={styles.actionText}>Termo</span>
                        </div>
                      </Link>
                      <Link
                        to={{
                          pathname:
                            "/moradores/agenda/convidados",
                          search: `?id=${item.id}&uid=${item.uid}`,
                        }}
                        className={styles.actionLink}
                      >
                        <div className={styles.actionButton}>
                          <AccountGroupIcon className={styles.actionIcon} />
                          <span className={styles.actionText}>Convidados</span>
                        </div>
                      </Link>
                    </>
                  )}

                  <div
                    className={styles.actionButton}
                    onClick={() => deleteEvento(item.id, item.uid)}
                  >
                    <DeleteIcon className={styles.deleteIcon} />
                    <span
                      className={`${styles.actionText} ${styles.deleteText}`}
                    >
                      Excluir
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.footerTextContainer}>
                    <ClockOutlineIcon className={styles.footerIcon} />
                    <span className={styles.footerText}>
                      Criado em: {FormateDate(item.dataCriacao)}
                    </span>
                  </div>

                  <div className={styles.footerTextContainer}>
                    {item.criadoPor === "Portaria" && (
                      <>
                        <CalendarCheckIcon className={styles.footerIcon} />
                        <span className={styles.footerText}>
                          Obs: agendado na portaria
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyContainer}>
            <CalendarRemoveIcon className={styles.emptyIcon} />
            <p className={styles.emptyText}>Nenhum evento agendado</p>
            <p className={styles.emptySubtext}>
              Não há eventos futuros agendados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventosAgendados;
