import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push, get } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { formatDateOnly } from "../../../../../../src/Utils/hourBrazil";
import styles from "./agendamentoPortaria.module.css";

// Importando ícones do Material-UI
import {
  CheckCircle as CheckCircleIcon,
  ExpandMore as ChevronDownIcon,
  Person as AccountIcon,
  CreditCard as CardAccountDetailsIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  LocalShipping as TruckDeliveryIcon,
  Celebration as PartyPopperIcon,
} from "@mui/icons-material";

function AgendamentosMoradores() {
  const [tipo, setTipo] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [data, setData] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const navigate = useNavigate();

  const showDatePicker = () => setShowPicker(true);

  // CORREÇÃO: Função para ajustar a data considerando o fuso horário
  const adjustForTimezone = (date) => {
    const adjustedDate = new Date(date);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset());
    return adjustedDate;
  };

  const onChange = (event) => {
    const selectedDate = new Date(event.target.value);
    // CORREÇÃO: Ajustar para o fuso horário local
    setData(adjustForTimezone(selectedDate));
  };

  // CORREÇÃO: Formatar data para exibição correta
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };

  async function verificarAgendamentoExistente(dataISO, tipoAgendamento) {
    try {
      const reservasRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");
      const snapshot = await get(reservasRef);
      
      if (!snapshot.exists()) return false;

      const todosAgendamentos = snapshot.val();
      // CORREÇÃO: Usar a data formatada corretamente para comparação
      const dataParaVerificar = new Date(dataISO).toISOString().split('T')[0];

      for (const agendamentoId in todosAgendamentos) {
        const agendamento = todosAgendamentos[agendamentoId];
        
        if (agendamento.dataEvento && agendamento.tipo === tipoAgendamento) {
          const dataExistente = new Date(agendamento.dataEvento).toISOString().split('T')[0];
          
          if (dataExistente === dataParaVerificar) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao verificar agendamentos:", error);
      return false;
    }
  }

  async function salvarAgendamento() {
    if (!tipo || !nome || !apartamento || !cpf) {
      alert("Erro: Preencha todos os campos antes de enviar.");
      return;
    }

    setVerificando(true);

    try {
      // CORREÇÃO: Usar a data ajustada para o fuso horário
      const dataISO = data.toISOString();
      
      const existeAgendamento = await verificarAgendamentoExistente(dataISO, tipo);
      
      if (existeAgendamento) {
        alert(`Conflito de Agendamento: Já existe um agendamento de ${tipo} para a data ${formatDisplayDate(data)}.`);
        setVerificando(false);
        return;
      }

      const reservasRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");
      await push(reservasRef, {
        tipo,
        nome,
        cpf,
        apartamento,
        dataEvento: dataISO,
        dataCriacao: new Date().toISOString(),
        criadoPor: "Portaria",  
      });

      alert("Sucesso: Agendamento realizado com sucesso!");
      navigate(-1); // Voltar para a página anterior
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert("Erro: Não foi possível salvar o agendamento.");
    } finally {
      setVerificando(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.keyboardAvoidingView}>
        <div className={styles.scrollContainer}>
          <div className={styles.content}>
            <h1 className={styles.title}>Agendar Mudança ou Evento</h1>

            {/* Tipo Selection Button */}
            <button
              className={`${styles.selectionButton} ${verificando ? styles.disabled : ''}`}
              onClick={() => setShowModal(true)}
              disabled={verificando}
            >
              <span className={styles.buttonTitle}>{tipo || "Selecione o Tipo"}</span>
              {tipo ? (
                <CheckCircleIcon className={styles.buttonIcon} />
              ) : (
                <ChevronDownIcon className={styles.buttonIcon} />
              )}
            </button>

            {/* Input Fields */}
            <div className={styles.inputContainer}>
              <AccountIcon className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Nome do morador"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={styles.inputField}
                disabled={verificando}
                maxLength={18}
              />
            </div>

            <div className={styles.inputContainer}>
              <CardAccountDetailsIcon className={styles.inputIcon} />
              <input
                type="number"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className={styles.inputField}
                disabled={verificando}
              />
            </div>

            <div className={styles.inputContainer}>
              <HomeIcon className={styles.inputIcon} />
              <input
                type="number"
                placeholder="N° apartamento"
                value={apartamento}
                onChange={(e) => setApartamento(e.target.value)}
                className={styles.inputField}
                disabled={verificando}
              />
            </div>

            {/* Date Picker Button */}
            <button
              className={`${styles.selectionButton} ${verificando ? styles.disabled : ''}`}
              onClick={showDatePicker}
              disabled={verificando}
            >
              <CalendarIcon className={styles.buttonIcon} />
              {/* CORREÇÃO: Usar a função de formatação corrigida */}
              <span className={styles.buttonTitle}>Data: {formatDisplayDate(data)}</span>
            </button>

            {showPicker && (
              <input
                type="date"
                // CORREÇÃO: Formatar a data corretamente para o input
                value={data.toISOString().split('T')[0]}
                onChange={onChange}
                min={new Date().toISOString().split('T')[0]}
                className={styles.datePicker}
              />
            )}

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => navigate(-1)}
                disabled={verificando}
              >
                Cancelar
              </button>
              <button
                className={styles.submitButton}
                onClick={salvarAgendamento}
                disabled={verificando}
              >
                {verificando ? "Verificando..." : "Agendar"}
                {verificando && <div className={styles.loadingSpinner}></div>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Type Selection Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Selecione o Tipo</h2>

            <button
              className={styles.modalOptionButton}
              onClick={() => {
                setTipo("mudança");
                setShowModal(false);
              }}
              disabled={verificando}
            >
              <TruckDeliveryIcon className={styles.modalIcon} />
              Mudança
            </button>

            <button
              className={styles.modalOptionButton}
              onClick={() => {
                setTipo("evento");
                setShowModal(false);
              }}
              disabled={verificando}
            >
              <PartyPopperIcon className={styles.modalIcon} />
              Evento
            </button>

            <button
              className={styles.modalCancelButton}
              onClick={() => setShowModal(false)}
              disabled={verificando}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendamentosMoradores;