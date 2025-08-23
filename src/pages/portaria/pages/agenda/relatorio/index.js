import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Description,
  ChevronLeft,
  ChevronRight,
  PictureAsPdf,
  Event
} from "@mui/icons-material";
import { ref, onValue } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { formatDateOnly } from "../../../../../Utils/hourBrazil";
import styles from './relatorio.module.css';

const RelatorioEventos = () => {
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [mesRelatorio, setMesRelatorio] = useState(new Date());
  const [gerandoPDF, setGerandoPDF] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");
    
    const unsubscribe = onValue(agendamentosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const todosEventos = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setEventos(todosEventos);
      } else {
        setEventos([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUltimos30Dias = () => {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    return { inicio: trintaDiasAtras, fim: hoje };
  };

  const filtrarEventosUltimos30Dias = () => {
    const { inicio, fim } = getUltimos30Dias();
    return eventos.filter(evento => {
      const dataEvento = new Date(evento.dataEvento);
      return dataEvento >= inicio && dataEvento <= fim;
    });
  };

  const getPrimeiroNome = (nomeCompleto) => {
    if (!nomeCompleto) return 'Não informado';
    return nomeCompleto.split(' ')[0];
  };

  const filtrarEventosPorMes = () => {
    const primeiroDia = new Date(mesRelatorio.getFullYear(), mesRelatorio.getMonth(), 1);
    const ultimoDia = new Date(mesRelatorio.getFullYear(), mesRelatorio.getMonth() + 1, 0);
    return eventos.filter(evento => {
      const dataEvento = new Date(evento.dataEvento);
      return dataEvento >= primeiroDia && dataEvento <= ultimoDia;
    });
  };

  const gerarRelatorioPDF = async () => {
    setGerandoPDF(true);
    try {
      const eventosFiltrados = filtrarEventosUltimos30Dias();
      
      if (eventosFiltrados.length === 0) {
        alert("Nenhum evento nos últimos 30 dias.");
        return;
      }
      
      const { inicio, fim } = getUltimos30Dias();
      const dataInicio = inicio.toLocaleDateString('pt-BR');
      const dataFim = fim.toLocaleDateString('pt-BR');
      
      let html = `
        <html>
          <head>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 0;
                margin: 0;
                color: #333;
              }
              .page {
                padding: 2cm;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #2c3e50;
                padding-bottom: 20px;
              }
              .logo {
                width: 120px;
                margin-bottom: 15px;
              }
              h1 {
                color: #2c3e50;
                margin: 0;
                font-size: 24px;
                font-weight: 600;
              }
              h2 {
                color: #3498db;
                margin: 5px 0 0 0;
                font-size: 18px;
                font-weight: 500;
              }
              .periodo {
                background-color: #f8f9fa;
                padding: 8px 15px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 15px;
                font-size: 14px;
                color: #555;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              th {
                background-color: #3498db;
                color: white;
                text-align: left;
                padding: 12px 15px;
                font-weight: 500;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 0.5px;
              }
              td {
                padding: 12px 15px;
                border-bottom: 1px solid #e0e0e0;
                font-size: 13px;
              }
              tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              tr:hover {
                background-color: #f1f7fd;
              }
              .total {
                font-weight: bold;
                margin-top: 20px;
                text-align: right;
                font-size: 14px;
                color: #2c3e50;
              }
              .footer {
                margin-top: 40px;
                font-size: 11px;
                text-align: center;
                color: #7f8c8d;
                border-top: 1px solid #eee;
                padding-top: 15px;
              }
              .data-hora {
                font-style: italic;
                color: #95a5a6;
              }
            </style>
          </head>
          <body>
            <div class="page">
              <div class="header">
                <div style="font-size: 32px; color: #3498db; margin-bottom: 10px;">🏢</div>
                <h1>Relatório de Eventos</h1>
                <h2>Condomínio Bela Vista</h2>
                <div class="periodo">
                  Período: ${dataInicio} a ${dataFim}
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Morador</th>
                    <th>Apto</th>
                    <th>Pessoas</th>
                  </tr>
                </thead>
                <tbody>
      `;
      
      eventosFiltrados.forEach(evento => {
        html += `
          <tr>
            <td>${formatDateOnly(evento.dataEvento)}</td>
            <td>${evento.tipo || 'Evento'}</td>
            <td>${evento.nome || 'Não informado'}</td>
            <td>${evento.apartamento}</td>
            <td>${evento.totalPessoas || '0'}</td>
          </tr>
        `;
      });
      
      html += `
                </tbody>
              </table>
              
              <div class="total">
                Total de eventos: ${eventosFiltrados.length}
              </div>
              
              <div class="footer">
                <p>Relatório gerado automaticamente pelo sistema do condomínio</p>
                <p class="data-hora">Em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
          </body>
        </html>
      `;
      
      // Criar e baixar o PDF
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio_Eventos_${dataInicio.replace(/\//g, '-')}_a_${dataFim.replace(/\//g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Ocorreu um erro ao gerar o relatório.");
    } finally {
      setGerandoPDF(false);
    }
  };

  const mudarMesRelatorio = (incremento) => {
    const novoMes = new Date(mesRelatorio);
    novoMes.setMonth(novoMes.getMonth() + incremento);
    setMesRelatorio(novoMes);
  };

  if (loading) {
    return (
      <Box className={styles.container}>
        <Box className={styles.loadingContainer}>
          <CircularProgress sx={{ color: "#fff" }} />
          <Typography className={styles.loadingText}>
            Carregando eventos...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.gradientBackground}></Box>
      
      <Box className={styles.header}>
        <Description sx={{ color: "#FFF", fontSize: 24 }} />
        <Typography variant="h5" className={styles.title}>
          Relatório Mensal
        </Typography>
      </Box>

      <Box className={styles.scrollContainer}>
        <Card className={styles.controlCard}>
          <CardContent>
            <Box className={styles.monthSelector}>
              <Button 
                onClick={() => mudarMesRelatorio(-1)}
                className={styles.monthButton}
                startIcon={<ChevronLeft />}
              >
                Anterior
              </Button>
              
              <Typography className={styles.monthText}>
                {mesRelatorio.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </Typography>
              
              <Button 
                onClick={() => mudarMesRelatorio(1)}
                className={styles.monthButton}
                disabled={new Date(mesRelatorio) >= new Date()}
                endIcon={<ChevronRight />}
              >
                Próximo
              </Button>
            </Box>
            
            <Typography className={styles.infoText}>
              O relatório PDF será gerado com os eventos dos últimos 30 dias
            </Typography>
            
            <Button
              variant="contained"
              onClick={gerarRelatorioPDF}
              disabled={gerandoPDF}
              className={styles.generateButton}
              startIcon={gerandoPDF ? <CircularProgress size={20} /> : <PictureAsPdf />}
              fullWidth
            >
              {gerandoPDF ? "Gerando PDF..." : "Gerar Relatório PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card className={styles.previewCard}>
          <CardContent>
            <Typography className={styles.previewTitle}>
              Prévia: {mesRelatorio.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </Typography>
            <Divider className={styles.divider} />
            
            {filtrarEventosPorMes().length > 0 ? (
              <>
                <Box className={styles.previewHeader}>
                  <Typography className={styles.previewHeaderText} sx={{ flex: 2 }}>
                    Data
                  </Typography>
                  <Typography className={styles.previewHeaderText} sx={{ flex: 1.5 }}>
                    Tipo
                  </Typography>
                  <Typography className={styles.previewHeaderText} sx={{ flex: 2 }}>
                    Morador
                  </Typography>
                  <Typography className={styles.previewHeaderText} sx={{ flex: 1 }}>
                    Apto
                  </Typography>
                </Box>
                
                {filtrarEventosPorMes().map((evento, index) => (
                  <Box key={evento.id} className={`
                    ${styles.previewRow} 
                    ${index % 2 === 0 ? styles.previewRowEven : ''}
                  `}>
                    <Typography className={styles.previewText} sx={{ flex: 2 }}>
                      {formatDateOnly(evento.dataEvento)}
                    </Typography>
                    <Typography className={styles.previewText} sx={{ flex: 1.5 }}>
                      {evento.tipo || 'Evento'}
                    </Typography>
                    <Typography className={styles.previewText} sx={{ flex: 2 }}>
                      {getPrimeiroNome(evento.nome)}
                    </Typography>
                    <Typography className={styles.previewText} sx={{ flex: 1 }}>
                      {evento.apartamento}
                    </Typography>
                    
                  </Box>
                ))}
                
                <Box className={styles.totalContainer}>
                  <Typography className={styles.totalText}>
                    Total: {filtrarEventosPorMes().length} eventos
                  </Typography>
                </Box>
              </>
            ) : (
              <Box className={styles.emptyPreview}>
                <Event sx={{ color: "#EFF3EA", fontSize: 40 }} />
                <Typography className={styles.emptyPreviewText}>
                  Nenhum evento em {mesRelatorio.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default RelatorioEventos;