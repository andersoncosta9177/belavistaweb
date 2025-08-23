import React, { useState, useEffect, useRef } from "react";
import { ref, set, get } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  CircularProgress,
  Alert,
  Paper,
  Fade,
  Zoom
} from "@mui/material";
import {
  Business,
  Person,
  QrCode,
  Badge,
  Cancel,
  CheckCircle,
  LocalShipping
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "./registroEncomendas.modules.css";

const RegistroEncomendas = () => {
  // Estados
  const [form, setForm] = useState({
    apartamento: "",
    nomeMorador: "",
    numeroRastreamento: "",
  });
  const [nomePorteiro, setNomePorteiro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Referências para os campos
  const moradorRef = useRef(null);
  const rastreamentoRef = useRef(null);

  // Busca o nome do porteiro
  useEffect(() => {
    const buscarPorteiro = async () => {
      try {
        const codigo = localStorage.getItem("codigo");
        if (!codigo) throw new Error("Código não encontrado");

        const snapshot = await get(
          ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}/nome`)
        );
        if (snapshot.exists()) {
          setNomePorteiro(snapshot.val());
        }
      } catch (error) {
        setError(error.message);
      }
    };

    buscarPorteiro();
  }, []);

  // Atualiza o formulário
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpa mensagens de erro/sucesso ao editar
    if (error) setError("");
    if (success) setSuccess("");
  };

  // Submete o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.apartamento.trim()) {
      setError("Informe o apartamento");
      return;
    }
    if (!form.nomeMorador.trim()) {
      setError("Informe o morador");
      return;
    }
    if (!form.numeroRastreamento.trim()) {
      setError("Informe o rastreamento");
      return;
    }
    if (!nomePorteiro.trim()) {
      setError("Porteiro não identificado");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await set(
        ref(
          db,
          `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes/${Date.now()}`
        ),
        {
          ...form,
          numeroRastreamento: form.numeroRastreamento.toUpperCase(),
          dataRegistro: new Date().toISOString(),
          nomePorteiroRecebedor: nomePorteiro,
        }
      );

      setSuccess("Encomenda registrada com sucesso!");
      setForm({ apartamento: "", nomeMorador: "", numeroRastreamento: "" });
      
      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Falha ao registrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Volta para a página anterior no histórico
  };

  return (
    <div className="container-encomendas">
      <Fade in={true} timeout={800}>
        <Paper elevation={10} className="form-container-encomendas">
          {/* Cabeçalho com ícone e título em linha */}
          <Box className="header-encomendas" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalShipping className="main-icon-encomendas" sx={{ fontSize: '26px', marginRight: '12px' }} />
            <Typography variant="h6" className="title-encomendas">
              REGISTRO DE ENCOMENDAS
            </Typography>
          </Box>

          {nomePorteiro && (
            <Zoom in={true} timeout={500}>
              <Box className="porteiro-container-encomendas">
                <Badge className="porteiro-icon-encomendas" />
                <Typography variant="body1" className="porteiro-text-encomendas">
                  Porteiro: {nomePorteiro}
                </Typography>
              </Box>
            </Zoom>
          )}

          {(error || success) && (
            <Zoom in={true} timeout={500}>
              <Alert 
                severity={error ? "error" : "success"} 
                className="alert-encomendas"
                onClose={() => error ? setError("") : setSuccess("")}
              >
                {error || success}
              </Alert>
            </Zoom>
          )}

          <form onSubmit={handleSubmit} className="form-encomendas">
            <Box className="input-container-encomendas">
              <Business className="input-icon-encomendas" />
              <TextField
                fullWidth
                placeholder="Número do apartamento"
                value={form.apartamento}
                onChange={(e) => handleChange("apartamento", e.target.value)}
                type="number"
                className="input-field-encomendas"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    moradorRef.current?.focus();
                  }
                }}
                variant="standard"
                InputProps={{ disableUnderline: true }}
              />
            </Box>

            <Box className="input-container-encomendas">
              <Person className="input-icon-encomendas" />
              <TextField
                fullWidth
                inputRef={moradorRef}
                placeholder="Nome do morador"
                value={form.nomeMorador}
                onChange={(e) => handleChange("nomeMorador", e.target.value)}
                className="input-field-encomendas"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    rastreamentoRef.current?.focus();
                  }
                }}
                variant="standard"
                InputProps={{ disableUnderline: true }}
              />
            </Box>

            <Box className="input-container-encomendas">
              <QrCode className="input-icon-encomendas" />
              <TextField
                fullWidth
                inputRef={rastreamentoRef}
                placeholder="Código de rastreamento"
                value={form.numeroRastreamento}
                onChange={(e) => handleChange("numeroRastreamento", e.target.value.toUpperCase())}
                className="input-field-encomendas"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                variant="standard"
                InputProps={{ disableUnderline: true }}
              />
            </Box>

            <Box className="button-row-encomendas">
              <Button
                variant="outlined"
                onClick={handleCancel}
                className="cancel-button-encomendas"
                disabled={loading}
                startIcon={<Cancel />}
                size="large"
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                className="submit-button-encomendas"
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                size="large"
              >
                {loading ? "Registrando..." : "Registrar"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Fade>
    </div>
  );
};

export default RegistroEncomendas;