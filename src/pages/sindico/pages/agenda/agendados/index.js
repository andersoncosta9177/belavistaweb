import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import {
  CalendarToday,
  Person,
  Home,
  Groups,
  AccessTime,
  EventAvailable,
  CalendarMonth,
  Warning,
  LocalShipping,
  Celebration
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  Box,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import "./EventosAgendados.css";

const EventosAgendados = () => {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");

    const unsubscribe = onValue(
      agendamentosRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          if (data) {
            const eventosFuturos = [];

            Object.keys(data).forEach((agendamentoId) => {
              const eventoData = new Date(data[agendamentoId].dataEvento);
              eventoData.setHours(0, 0, 0, 0);
              
              if (eventoData >= hoje) {
                eventosFuturos.push({
                  id: agendamentoId,
                  ...data[agendamentoId],
                });
              }
            });

            eventosFuturos.sort(
              (a, b) => new Date(a.dataEvento) - new Date(b.dataEvento)
            );
            setAgendamentos(eventosFuturos);
          } else {
            setAgendamentos([]);
          }
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error("Erro ao processar dados:", err);
          setError("Erro ao carregar agendamentos");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Erro ao buscar dados:", error);
        setError("Falha ao conectar com o banco de dados");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getEventIcon = (tipo) => {
    if (!tipo) {
      return <Warning sx={{ color: "#FF5252", fontSize: 20 }} />;
    }

    switch (tipo.toLowerCase()) {
      case "mudança":
        return <LocalShipping sx={{ color: "#FFD700", fontSize: 20 }} />;
      case "evento":
        return <Celebration sx={{ color: "#4FC3F7", fontSize: 20 }} />;
      default:
        return <CalendarMonth sx={{ color: "#BA68C8", fontSize: 20 }} />;
    }
  };

const FormateDate = (dateInput) => {
  // Caso o input seja null/undefined
  if (!dateInput) return "Data não informada";
  
  // Se já for um objeto Date
  if (dateInput instanceof Date) {
    return dateInput.toLocaleDateString('pt-BR');
  }
  
  // Se for um timestamp numérico
  if (typeof dateInput === 'number') {
    return new Date(dateInput).toLocaleDateString('pt-BR');
  }
  
  // Se for uma string no formato "YYYY-MM-DD"
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateInput.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Para strings ISO (como "2023-07-20T12:00:00Z") ou outros formatos
  try {
    const date = new Date(dateInput);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    console.error("Erro ao formatar data:", e);
    return "Formato desconhecido";
  }
};


  if (loading) {
    return (
      <div className="eventos-loading-container">
        <CircularProgress sx={{ color: "white", mb: 2 }} />
        <Typography variant="h6" className="eventos-loading-text">
          Carregando agenda da portaria...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eventos-container">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="eventos-container eventos-gradient-background">
      <div className="eventos-header">
        <CalendarToday className="eventos-header-icon" />
        <h1 className="eventos-title">Próximos Agendamentos</h1>
      </div>

      <div className="eventos-content">
        {agendamentos.length > 0 ? (
          agendamentos.map((item) => {
            const isHoje = isToday(parseISO(item.dataEvento));
            
            return (
              <Card key={item.id} className="eventos-card">
                <CardHeader
                  avatar={getEventIcon(item.tipo)}
                  title={
                    <Box className="eventos-card-header">
                      <Typography variant="h6" className="eventos-event-type">
                        {item.tipo || "Evento"}
                      </Typography>
                      <Chip
                        label={
                          <Typography variant="body2">
                            {FormateDate(item.dataEvento)}
                            {isHoje && " (Hoje)"}
                          </Typography>
                        }
                        className={`eventos-date-chip ${isHoje ? 'eventos-today-chip' : ''}`}
                        size="small"
                      />
                    </Box>
                  }
                  className="eventos-card-header-container"
                />
                
                <CardContent className="eventos-card-content">
                  <Box className="eventos-info-container">
                    <Box className="eventos-info-row">
                      <Person className="eventos-info-icon" />
                      <Typography variant="body2" className="eventos-info-label">
                        Morador:
                      </Typography>
                      <Typography variant="body2" className="eventos-info-value">
                        {item.nome || "Não informado"}
                      </Typography>
                    </Box>
                    
                    <Box className="eventos-info-row">
                      <Person className="eventos-info-icon" />
                      <Typography variant="body2" className="eventos-info-label">
                        CPF:
                      </Typography>
                      <Typography variant="body2" className="eventos-info-value">
                        {item.cpf || "Não informado"}
                      </Typography>
                    </Box>
                    
                    <Box className="eventos-info-row">
                      <Home className="eventos-info-icon" />
                      <Typography variant="body2" className="eventos-info-label">
                        Apartamento:
                      </Typography>
                      <Typography variant="body2" className="eventos-info-value">
                        {item.apartamento}
                      </Typography>
                    </Box>
                    
                    {item.tipo && item.tipo.toLowerCase() !== "mudança" && item.totalPessoas > 0 && (
                      <Box className="eventos-info-row">
                        <Groups className="eventos-info-icon" />
                        <Typography variant="body2" className="eventos-info-label">
                          Pessoas:
                        </Typography>
                        <Typography variant="body2" className="eventos-info-value">
                          {item.totalPessoas} {item.totalPessoas === 1 ? "pessoa" : "pessoas"}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
                
                <Divider className="eventos-divider" />
                
                <Box className="eventos-card-footer">
                  <Box className="eventos-footer-item">
                    <AccessTime className="eventos-footer-icon" />
                    <Typography variant="caption" className="eventos-footer-text">
                      Criado em: {FormateDate(item.dataCriacao)}
                    </Typography>
                  </Box>
                  
                  {item.criadoPor === "Portaria" && (
                    <Box className="eventos-footer-item">
                      <EventAvailable className="eventos-footer-icon" />
                      <Typography variant="caption" className="eventos-footer-text">
                        Agendado na portaria
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            );
          })
        ) : (
          <Box className="eventos-empty-container">
            <CalendarToday className="eventos-empty-icon" />
            <Typography variant="h6" className="eventos-empty-text">
              Nenhum evento agendado
            </Typography>
            <Typography variant="body2" className="eventos-empty-subtext">
              Não há eventos futuros agendados
            </Typography>
          </Box>
        )}
      </div>
    </div>
  );
};

export default EventosAgendados;