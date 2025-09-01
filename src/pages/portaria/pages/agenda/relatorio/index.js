import React, { useState, useEffect } from "react";
import { ref, onValue, get } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import FormateDate from "../../../../../../src/Utils/formateDate";
import styles from "./relatorio.module.css";

const RelatorioEventos = () => {
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [mesRelatorio, setMesRelatorio] = useState(new Date());
  const [gerandoPDF, setGerandoPDF] = useState(false);

  useEffect(() => {
    const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");
    
    const unsubscribe = onValue(agendamentosRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const todosEventos = await Promise.all(
          Object.keys(data).map(async (key) => {
            const evento = data[key];
            
            // Buscar número de convidados PRESENTES (apenas com presente: true)
            let numeroConvidadosPresentes = 0;
            try {
              const convidadosRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${key}/convidados`);
              const convidadosSnapshot = await get(convidadosRef);
              if (convidadosSnapshot.exists()) {
                const convidadosData = convidadosSnapshot.val();
                // Contar apenas convidados com presente: true
                Object.values(convidadosData).forEach(convidado => {
                  if (convidado.presente === true) {
                    numeroConvidadosPresentes++;
                  }
                });
              }
            } catch (error) {
              console.error("Erro ao buscar convidados:", error);
            }
            
            // Calcular total de pessoas (morador + convidados presentes)
            const totalPessoasPresentes = numeroConvidadosPresentes + 1; // +1 para o morador
            
            return {
              id: key,
              ...evento,
              numeroConvidadosPresentes, // Apenas convidados presentes
              totalPessoasPresentes      // Total de pessoas presentes
            };
          })
        );
        setEventos(todosEventos);
      } else {
        setEventos([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Função para calcular o valor do evento baseado no número de pessoas PRESENTES
  const calcularValorEvento = (totalPessoasPresentes) => {
    const pessoas = parseInt(totalPessoasPresentes) || 0;
    
    if (pessoas <= 15) {
      return 30;
    } else if (pessoas >= 16 && pessoas <= 30) {
      return 50;
    } else if (pessoas >= 31) {
      return 70;
    }
    return 0;
  };

  // Função para os últimos 30 dias (usada no PDF)
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

  // Função para filtrar por mês (usada na prévia)
  const filtrarEventosPorMes = () => {
    const primeiroDia = new Date(mesRelatorio.getFullYear(), mesRelatorio.getMonth(), 1);
    
    // CORREÇÃO: Se for o mês atual, vai até hoje. Senão, vai até o último dia do mês
    const hoje = new Date();
    let ultimoDia;
    
    if (mesRelatorio.getMonth() === hoje.getMonth() && 
        mesRelatorio.getFullYear() === hoje.getFullYear()) {
      // É o mês atual - vai até hoje
      ultimoDia = hoje;
    } else {
      // É um mês passado ou futuro - vai até o último dia do mês
      ultimoDia = new Date(mesRelatorio.getFullYear(), mesRelatorio.getMonth() + 1, 0);
    }
    
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
      alert("Aviso: Nenhum evento nos últimos 30 dias.");
      return;
    }
    
    const { inicio, fim } = getUltimos30Dias();
    const dataInicio = inicio.toLocaleDateString('pt-BR');
    const dataFim = fim.toLocaleDateString('pt-BR');
    
    // Calcular totais baseados em pessoas PRESENTES
    let totalEventos = eventosFiltrados.length;
    let totalValor = 0;
    let totalConvidadosPresentes = 0;
    let totalPessoasPresentes = 0;
    
    eventosFiltrados.forEach(evento => {
      const valorEvento = calcularValorEvento(evento.totalPessoasPresentes);
      totalValor += valorEvento;
      totalConvidadosPresentes += evento.numeroConvidadosPresentes || 0;
      totalPessoasPresentes += evento.totalPessoasPresentes || 0;
    });

    let html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Eventos - Condomínio Bela Vista</title>
          <style>
              @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              th {
                background-color: #2B1807 !important;
                color: white !important;
              }
              
              .header {
                background-color: #996c41 !important;
                color: white !important;
              }
              
              .periodo {
                background-color: rgba(255, 255, 255, 0.2) !important;
              }
              
              .totais-container {
                background-color: #f8f9fa !important;
                border-left: 4px solid #2B1807 !important;
              }
              
              tr:nth-child(even) {
                background-color: #f8f9fa !important;
              }
            }
            
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 0;
              margin: 0;
              color: #333;
            }
            .page {
              padding: 1.5cm;
            }
            .header {
              text-align: center;
              margin-bottom: 25px;
              padding-bottom: 20px;
              background-color: #996c41  important;
              color: white;
              padding: 20px;
              border-radius: 8px;
            }
            h1 {
              color: #f9f9f9;
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            h2 {
              color: #f9f9f9;
              margin: 5px 0 0 0;
              font-size: 18px;
              font-weight: 500;
            }
            .periodo {
              background-color: rgba(255, 255, 255, 0.2);
              padding: 8px 15px;
              border-radius: 5px;
              display: inline-block;
              margin-top: 15px;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th {
              background-color: #2B1807;
              color: white;
              text-align: center;
              padding: 10px 8px;
              font-weight: 500;
              text-transform: uppercase;
              font-size: 11px;
            }
            td {
              padding: 10px 8px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 12px;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .totais-container {
              margin-top: 25px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #2B1807;
            }
            .total-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .total-final {
              font-weight: bold;
              font-size: 15px;
              color: #2c3e50;
              border-top: 2px solid #3498db;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              margin-top: 30px;
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
            .valor {
              text-align: right;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
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
                  <th>Convidados</th>
                  <th>Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
    `;
    
    eventosFiltrados.forEach(evento => {
      const valorEvento = calcularValorEvento(evento.totalPessoasPresentes);
      html += `
        <tr>
          <td>${FormateDate(evento.dataEvento)}</td>
          <td>${evento.tipo || 'Evento'}</td>
          <td>${getPrimeiroNome(evento.nome)}</td>
          <td>${evento.apartamento}</td>
          <td>${evento.numeroConvidadosPresentes || '0'}</td>
          <td class="valor">R$ ${valorEvento.toFixed(2)}</td>
        </tr>
      `;
    });
    
    html += `
              </tbody>
            </table>
            
         
            
            <div class="footer">
              <p>Relatório gerado automaticamente pelo sistema do condomínio</p>
              <p class="data-hora">Em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Para web, abrir em nova janela
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
      
      // Esperar o conteúdo carregar para imprimir
      newWindow.onload = function() {
        newWindow.print();
      };
    }
    
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    alert("Erro: Ocorreu um erro ao gerar o relatório.");
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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon}>📄</span>
        <h1 className={styles.title}>Relatório Mensal</h1>
      </div>

      <div className={styles.scrollContainer}>
        <div className={styles.controlCard}>
          <div className={styles.monthSelector}>
            <button 
              onClick={() => mudarMesRelatorio(-1)}
              className={styles.monthButton}
            >
              ◀
            </button>
            
            <span className={styles.monthText}>
              {mesRelatorio.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            
            <button 
              onClick={() => mudarMesRelatorio(1)}
              className={styles.monthButton}
              disabled={new Date(mesRelatorio) >= new Date()}
            >
              ▶
            </button>
          </div>
          
          <p className={styles.infoText}>
            O relatório PDF será gerado com os eventos dos últimos 30 dias
          </p>
          
          <button
            onClick={gerarRelatorioPDF}
            disabled={gerandoPDF}
            className={styles.generateButton}
          >
            {gerandoPDF ? "Gerando PDF..." : "Gerar Relatório PDF"}
          </button>
        </div>

        <div className={styles.previewCard}>
          <h2 className={styles.previewTitle}>
            Prévia: {mesRelatorio.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className={styles.divider}></div>
          
          {filtrarEventosPorMes().length > 0 ? (
            <>
              <div className={styles.previewHeader}>
                <span className={styles.previewHeaderText}>Data</span>
                <span className={styles.previewHeaderText}>Tipo</span>
                <span className={styles.previewHeaderText}>Morador</span>
                <span className={styles.previewHeaderText}>Apto</span>
                <span className={styles.previewHeaderText}>Presentes</span>
              </div>
              
              {filtrarEventosPorMes().map((evento, index) => (
                <div key={evento.id} className={`
                  ${styles.previewRow} 
                  ${index % 2 === 0 ? styles.previewRowEven : ''}
                `}>
                  <span className={styles.previewText}>
                    {FormateDate(evento.dataEvento)}
                  </span>
                  <span className={styles.previewText}>
                    {evento.tipo || 'Evento'}
                  </span>
                  <span className={styles.previewText}>
                    {getPrimeiroNome(evento.nome)} 
                  </span>
                  <span className={styles.previewText}>
                    {evento.apartamento}
                  </span>
                  <span className={styles.previewText}>
                    {evento.numeroConvidadosPresentes || '0'}
                  </span>
                </div>
              ))}
              
              <div className={styles.totalContainer}>
                <span className={styles.totalText}>
                  Total: {filtrarEventosPorMes().length} eventos
                </span>
              </div>
            </>
          ) : (
            <div className={styles.emptyPreview}>
              <span className={styles.emptyIcon}>📅</span>
              <p className={styles.emptyPreviewText}>
                Nenhum evento em {mesRelatorio.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatorioEventos;