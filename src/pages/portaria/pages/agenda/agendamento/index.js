import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Menu,
  MenuItem,
  Paper,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  CalendarToday,
  Home,
  Person,
  CreditCard,
  LocalShipping,
  Celebration,
  ChevronRight,
  CheckCircle,
  Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ref, push } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { formatDateOnly } from "../../../../../../src/Utils/hourBrazil";
import styles from "./agendamento.module.css";

function AgendamentosMoradores() {
  const [tipo, setTipo] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [data, setData] = useState(new Date());
  const [showDatePickerDialog, setShowDatePickerDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTipoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleTipoClose = () => {
    setAnchorEl(null);
  };

  const handleTipoSelect = (selectedTipo) => {
    setTipo(selectedTipo);
    handleTipoClose();
  };

  const handleDateChange = (event) => {
    setData(new Date(event.target.value));
  };

  const openDatePicker = () => {
    setShowDatePickerDialog(true);
  };

  const closeDatePicker = () => {
    setShowDatePickerDialog(false);
  };

  const confirmDate = () => {
    closeDatePicker();
  };

  async function salvarAgendamento() {
    if (!tipo || !nome || !apartamento || !cpf) {
      setError("Preencha todos os campos antes de enviar.");
      return;
    }

    try {
      const reservasRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");
      await push(reservasRef, {
        tipo,
        nome,
        cpf,
        apartamento,
        dataEvento: data.toISOString(),
        dataCriacao: new Date().toISOString(),
        criadoPor: "Portaria",
      });

      alert("Sucesso! Agendamento realizado com sucesso!");
      navigate(-1);
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      setError("Não foi possível salvar o agendamento.");
    }
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.gradientBackground}></Box>

      <Paper elevation={10} className={styles.content}>
        <Typography variant="h5" className={styles.title}>
          Agendar Mudança ou Evento
        </Typography>

        {error && (
          <Box className={styles.errorContainer}>
            <Typography className={styles.errorText}>{error}</Typography>
          </Box>
        )}

        {/* Tipo Selection Button */}
        <Button
          fullWidth
          className={styles.selectionButton}
          onClick={handleTipoClick}
          endIcon={<ChevronRight />}
          startIcon={tipo ? <CheckCircle /> : null}
        >
          {tipo || "Selecione o Tipo"}
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleTipoClose}
          className={styles.menu}
        >
          <MenuItem
            onClick={() => handleTipoSelect("mudança")}
            className={styles.menuItem}
          >
            <LocalShipping className={styles.menuIcon} />
            Mudança
          </MenuItem>
          <MenuItem
            onClick={() => handleTipoSelect("evento")}
            className={styles.menuItem}
          >
            <Celebration className={styles.menuIcon} />
            Evento
          </MenuItem>
        </Menu>

        {/* Input Fields com ícones dentro */}
        <Box className={styles.inputContainer}>
          <Person className={styles.inputIcon} />
          <TextField
            fullWidth
            placeholder="Nome do morador"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={styles.inputField}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                  boxShadow: "none",
                },
              },
            }}
            InputProps={{
              className: styles.inputText,
            }}
            variant="outlined"
          />
        </Box>

        <Box className={styles.inputContainer}>
          <CreditCard className={styles.inputIcon} />
          <TextField
            fullWidth
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className={styles.inputField}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                  boxShadow: "none",
                },
              },
            }}
            InputProps={{
              className: styles.inputText,
            }}
            type="number"
            variant="outlined"
          />
        </Box>

        <Box className={styles.inputContainer}>
          <Home className={styles.inputIcon} />
          <TextField
            fullWidth
            placeholder="N° apartamento"
            value={apartamento}
            onChange={(e) => setApartamento(e.target.value)}
            className={styles.inputField}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                  boxShadow: "none",
                },
              },
            }}
            InputProps={{
              className: styles.inputText,
            }}
            type="number"
            variant="outlined"
          />
        </Box>

        {/* Botão para abrir o date picker */}
        <Button
          fullWidth
          className={styles.selectionButton}
          onClick={openDatePicker}
          startIcon={<CalendarToday />}
        >
          Data: {formatDateOnly(data)}
        </Button>

        {/* Dialog do Date Picker */}
        <Dialog
          open={showDatePickerDialog}
          onClose={closeDatePicker}
          maxWidth="sm"
          fullWidth
          PaperProps={{ className: styles.datePickerDialog }}
        >
          <DialogTitle className={styles.dialogTitle}>
            Selecione a Data
            <Button onClick={closeDatePicker} className={styles.closeButton}>
              <Close />
            </Button>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              type="date"
              value={data.toISOString().split("T")[0]}
              onChange={handleDateChange}
              className={styles.datePickerInput}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().split("T")[0],
                className: styles.dateInput,
              }}
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={closeDatePicker}
              className={styles.dialogCancelButton}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDate}
              className={styles.dialogConfirmButton}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Action Buttons */}
        <Box className={styles.actionButtons}>
          <Button
            variant="outlined"
            className={styles.cancelButton}
            onClick={() => navigate(-1)}
            fullWidth={isSmallScreen}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            className={styles.submitButton}
            onClick={salvarAgendamento}
            fullWidth={isSmallScreen}
          >
            Agendar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default AgendamentosMoradores;
