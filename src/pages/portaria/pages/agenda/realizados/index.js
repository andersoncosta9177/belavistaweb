import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Search,
  Clear,
  Event,
  Person,
  Home,
  Groups,
  CalendarToday,
  Today
} from "@mui/icons-material";
import { ref, onValue } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { formatDateOnly } from "../../../../../Utils/hourBrazil";

import styles from './realizados.module.css';

const TodosEventosPassados = () => {
  const [loading, setLoading] = useState(true);
  const [todosEventos, setTodosEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");
    
    const unsubscribe = onValue(agendamentosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventosArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        
        const hoje = new Date();
        const eventosPassados = eventosArray.filter(evento => {
          const dataEvento = new Date(evento.dataEvento);
          return dataEvento < hoje;
        });
        
        eventosPassados.sort((a, b) => new Date(b.dataEvento) - new Date(a.dataEvento));
        
        setTodosEventos(eventosPassados);
        setEventosFiltrados(eventosPassados);
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
      const filtrados = todosEventos.filter(evento => 
        evento.apartamento.toLowerCase().includes(termo) ||
        (evento.nome && evento.nome.toLowerCase().includes(termo))
      );
      setEventosFiltrados(filtrados);
    }
  }, [termoBusca, todosEventos]);

  const clearSearch = () => {
    setTermoBusca('');
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
            Carregando histórico de eventos...
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
        <Typography variant="h5" className={styles.title}>
          Histórico de Eventos
        </Typography>
      </Box>

      <Box className={styles.searchContainer}>
   <TextField
  fullWidth
  placeholder="Buscar por apartamento ou nome"
  value={termoBusca}
  onChange={(e) => setTermoBusca(e.target.value)}
  className={styles.searchInput}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <Search sx={{ color: "#EFF3EA" }} />
      </InputAdornment>
    ),
    endAdornment: termoBusca.length > 0 && (
      <InputAdornment position="end">
        <IconButton onClick={clearSearch} size="small">
          <Clear sx={{ color: "#EFF3EA" }} />
        </IconButton>
      </InputAdornment>
    ),
    className: styles.searchInputField
  }}
  // Adicione esta propriedade para a cor do placeholder
  inputProps={{
    style: {
      color: "#EFF3EA", // Cor do texto digitado
    },
    sx: {
      "&::placeholder": {
        color: "#f9f9f9", // Cor do placeholder (ajuste para a cor desejada)
        opacity: 1, // Garante que a cor seja aplicada completamente
      }
    }
  }}
  variant="outlined"
/>
      </Box>
      
      <Box className={styles.resultsContainer}>
        <Typography className={styles.resultsText}>
          {eventosFiltrados.length} {eventosFiltrados.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
        </Typography>
      </Box>

      <Box className={styles.scrollContainer}>
        {eventosFiltrados.length > 0 ? (
          eventosFiltrados.map((item) => (
            <Card key={item.id} className={styles.card}>
              <Box className={styles.cardHeader}>
                {getEventIcon(item.tipo)}
                <Typography className={styles.eventType}>
                  {item.tipo || "Evento"}
                </Typography>
                <Box className={styles.dateBadge}>
                  <Typography className={styles.dateBadgeText}>
                    {formatDateOnly(item.dataEvento)}
                  </Typography>
                </Box>
              </Box>

              <Divider className={styles.divider} />

              <CardContent className={styles.cardContent}>
                <Box className={styles.infoRowContainer}>
                  <Box className={styles.infoRow}>
                    <Person sx={{ color: "#EFF3EA", fontSize: 16 }} />
                    <Typography className={styles.infoText}>Morador:</Typography>
                  </Box>
                  <Typography className={styles.infoValue}>
                    {item.nome || "Não informado"}
                  </Typography>
                </Box>
                
                <Box className={styles.infoRowContainer}>
                  <Box className={styles.infoRow}>
                    <Person sx={{ color: "#EFF3EA", fontSize: 16 }} />
                    <Typography className={styles.infoText}>CPF:</Typography>
                  </Box>
                  <Typography className={styles.infoValue}>
                    {item.cpf || "Não informado"}
                  </Typography>
                </Box>

                <Box className={styles.infoRowContainer}>
                  <Box className={styles.infoRow}>
                    <Home sx={{ color: "#EFF3EA", fontSize: 16 }} />
                    <Typography className={styles.infoText}>Apto:</Typography>
                  </Box>
                  <Typography className={styles.infoValue}>{item.apartamento}</Typography>
                </Box>

                {item.tipo && item.tipo.toLowerCase() !== "mudança" && (
                  <Box className={styles.infoRowContainer}>
                    <Box className={styles.infoRow}>
                      <Groups sx={{ color: "#EFF3EA", fontSize: 16 }} />
                      <Typography className={styles.infoText}>Pessoas:</Typography>
                    </Box>
                    <Typography className={styles.infoValue}>
                      {item.totalPessoas > 0
                        ? `${item.totalPessoas} pessoas`
                        : "Não informado"}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <Box className={styles.cardFooter}>
                <Box className={styles.footerTextContainer}>
                  <Today sx={{ color: "#EFF3EA", fontSize: 14 }} />
                  <Typography className={styles.footerText}>
                    Criado em: {formatDateOnly(item.dataCriacao)}
                  </Typography>
                </Box>

                <Box className={styles.footerTextContainer}>
                  {item.criadoPor === "Portaria" && (
                    <>
                      <CalendarToday sx={{ color: "#EFF3EA", fontSize: 14 }} />
                      <Typography className={styles.footerText}>
                        Obs: agendado na portaria
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Card>
          ))
        ) : (
          <Box className={styles.emptyContainer}>
            <Event sx={{ color: "#EFF3EA", fontSize: 50 }} />
            <Typography className={styles.emptyText}>
              {termoBusca ? 'Nenhum evento encontrado' : 'Nenhum evento passado registrado'}
            </Typography>
            {termoBusca && (
              <Box onClick={clearSearch} className={styles.clearSearchButton}>
                <Clear sx={{ fontSize: 16, marginRight: 1 }} />
                <Typography>Limpar busca</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TodosEventosPassados;