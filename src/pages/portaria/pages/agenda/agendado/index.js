import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  CalendarToday,
  Person,
  Home,
  Groups,
  Delete,
  Description,
  Event,
  Today
} from "@mui/icons-material";
import { ref, onValue, remove } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { formatDateOnly } from "../../../../../Utils/hourBrazil";
import styles from './EventosAgendados.module.css';
import { useNavigate } from "react-router-dom";

const EventosAgendados = () => {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Buscar todos os agendamentos da portaria
    const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");

    const unsubscribe = onValue(agendamentosRef, (snapshot) => {
      const data = snapshot.val();
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Define para início do dia

      if (data) {
        // Processar todos os agendamentos
        const eventosFuturos = [];

        // Iterar sobre cada agendamento
        Object.keys(data).forEach((agendamentoId) => {
          const eventoData = new Date(data[agendamentoId].dataEvento);
          eventoData.setHours(0, 0, 0, 0); // Define para início do dia
          
          // Verificar se o evento é hoje ou no futuro
          if (eventoData >= hoje) {
            eventosFuturos.push({
              id: agendamentoId,
              ...data[agendamentoId],
            });
          }
        });

        // Ordenar por data (mais próximos primeiro)
        eventosFuturos.sort(
          (a, b) => new Date(a.dataEvento) - new Date(b.dataEvento)
        );
        setAgendamentos(eventosFuturos);
      } else {
        setAgendamentos([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openDeleteDialog = (evento) => {
    setSelectedEvento(evento);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedEvento(null);
  };

  const confirmDelete = () => {
    if (!selectedEvento) return;

    const eventoRef = ref(
      db,
      `DadosBelaVista/DadosGerais/Reservas/${selectedEvento.id}`
    );

    remove(eventoRef)
      .then(() => {
        setAgendamentos((prev) =>
          prev.filter((e) => e.id !== selectedEvento.id)
        );
        closeDeleteDialog();
      })
      .catch((error) => {
        setError("Ocorreu um erro ao excluir o evento.");
        console.error(error);
        closeDeleteDialog();
      });
  };

  const getEventIcon = (tipo) => {
    if (!tipo) {
      return <Event sx={{ color: "#FF5252", fontSize: 20 }} />;
    }

    switch (tipo.toLowerCase()) {
      case "mudança":
        return <Event sx={{ color: "#FFD700", fontSize: 20 }} />;
      case "evento":
        return <Event sx={{ color: "#4FC3F7", fontSize: 20 }} />;
      default:
        return <Event sx={{ color: "#BA68C8", fontSize: 20 }} />;
    }
  };

  if (loading) {
    return (
      <Box className={styles.container}>
        <Box className={styles.loadingContainer}>
          <CircularProgress sx={{ color: "#fff" }} />
          <Typography className={styles.loadingText}>
            Carregando agenda da portaria...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.gradientBackground}></Box>
      
      <Box className={styles.header}>
        <CalendarToday sx={{ color: "#FFF", fontSize: 24 }} />
        <Typography variant="h6" className={styles.title}>
          Próximos Agendamentos
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      <Box className={styles.scrollContainer}>
        {agendamentos.length > 0 ? (
          agendamentos.map((item) => {
            const isHoje = new Date(item.dataEvento).toDateString() === new Date().toDateString();
            
            return (
              <Card key={`${item.uid}-${item.id}`} className={styles.card}>
                <Box className={styles.cardHeader}>
                  {getEventIcon(item.tipo)}
                  <Typography className={styles.eventType}>
                    {item.tipo || "Evento"}
                  </Typography>
                  <Box className={`${styles.dateBadge} ${isHoje ? styles.todayBadge : ''}`}>
                    <Typography className={styles.dateBadgeText}>
                      {formatDateOnly(item.dataEvento)}
                      {isHoje && " (Hoje)"}
                    </Typography>
                  </Box>
                </Box>

                <Divider className={styles.divider} />

                <CardContent className={styles.cardContent}>
                  <Box className={styles.infoRowContainer}>
                    <Box className={styles.infoRow}>
                      <Person sx={{ color: "#EFF3EA", fontSize: 18, mr: 1 }} />
                      <Typography className={styles.infoText}>Morador:</Typography>
                    </Box>
                    <Typography className={styles.infoText}>
                      {item.nome || "Não informado"}
                    </Typography>
                  </Box>
                  
                  <Box className={styles.infoRowContainer}>
                    <Box className={styles.infoRow}>
                      <Person sx={{ color: "#EFF3EA", fontSize: 18, mr: 1 }} />
                      <Typography className={styles.infoText}>CPF:</Typography>
                    </Box>
                    <Typography className={styles.infoText}>
                      {item.cpf || "Não informado"}
                    </Typography>
                  </Box>

                  <Box className={styles.infoRowContainer}>
                    <Box className={styles.infoRow}>
                      <Home sx={{ color: "#EFF3EA", fontSize: 18 , mr: 1}} />
                      <Typography className={styles.infoText}>Apto:</Typography>
                    </Box>
                    <Typography className={styles.infoText}>{item.apartamento}</Typography>
                  </Box>

                  {item.tipo && item.tipo.toLowerCase() !== "mudança" && (
                    <Box className={styles.infoRowContainer}>
                      <Box className={styles.infoRow}>
                        <Groups sx={{ color: "#EFF3EA", fontSize: 18 , mr: 1 }} />
                        <Typography className={styles.infoText}>Pessoas:</Typography>
                      </Box>
                      <Typography className={styles.infoText}>
                        {item.totalPessoas > 0
                          ? `${item.totalPessoas} pessoas`
                          : "Não informado"}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions className={styles.actionsContainer}>
                  {item.tipo && item.tipo.toLowerCase() !== "mudança" && (
                    <>
                  <Button
  onClick={() => navigate(`/portaria/agenda/termos/${item.id}`)}
  className={styles.actionButton}
  startIcon={<Description />}
>
  Termo
</Button>

                      <Button
                        className={styles.actionButton}
                        startIcon={<Groups />}
                      >
                        Convidados
                      </Button>
                    </>
                  )}

                  <Button
                    className={styles.deleteButton}
                    startIcon={<Delete />}
                    onClick={() => openDeleteDialog(item)}
                  >
                    Excluir
                  </Button>
                </CardActions>

                <Box className={styles.cardFooter}>
                  <Box className={styles.footerTextContainer}>
                    <Today sx={{ color: "#EFF3EA", fontSize: 14, mr: 1 }} />
                    <Typography className={styles.footerText}>
                      Criado em: {formatDateOnly(item.dataCriacao)}
                    </Typography>
                  </Box>

                  <Box className={styles.footerTextContainer}>
                    {item.criadoPor === "Portaria" && (
                      <>
                        <CalendarToday sx={{ color: "#EFF3EA", fontSize: 14, mr: 1 }} />
                        <Typography className={styles.footerText}>
                          Obs: agendado na portaria
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Card>
            );
          })
        ) : (
          <Box className={styles.emptyContainer}>
            <Event sx={{ color: "#EFF3EA", fontSize: 50 }} />
            <Typography className={styles.emptyText}>
              Nenhum evento agendado
            </Typography>
            <Typography className={styles.emptySubtext}>
              Não há eventos futuros agendados
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        className={styles.dialog}
      >
        <DialogTitle className={styles.dialogTitle}>
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este evento?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} className={styles.dialogCancel}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} className={styles.dialogConfirm}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventosAgendados;