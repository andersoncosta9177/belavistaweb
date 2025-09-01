import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from "@mui/material";
import {
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  QrCode as QrCodeIcon,
  Badge as BadgeIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { ref, set, get, update } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../../../../database/firebaseConfig";
import { useNavigate } from "react-router-dom";

const RegistroEncomendas = () => {
  const navigate = useNavigate();
  // Estados
  const [form, setForm] = useState({
    apartamento: "",
    nomeMorador: "",
    numeroRastreamento: "",
  });
  const [nomePorteiro, setNomePorteiro] = useState("");
  const [codigoPorteiroRecebedor, setCodigoPorteiroRecebedor] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // Referências para os campos
  const moradorRef = useRef(null);
  const rastreamentoRef = useRef(null);
  const apartamentoRef = useRef(null);

  // Busca o nome do porteiro
  useEffect(() => {
    const buscarPorteiro = async () => {
      try {
        const codigo = await AsyncStorage.getItem("codigo");
        if (!codigo) throw new Error("Código não encontrado");

        const snapshot = await get(
          ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}/nome`)
        );
        if (snapshot.exists()) {
          setNomePorteiro(snapshot.val());
          setCodigoPorteiroRecebedor(codigo);
        }
      } catch (error) {
        setAlert({ open: true, message: error.message, severity: "error" });
      }
    };

    buscarPorteiro();
  }, []);

  // Atualiza o formulário
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submete o formulário
  const handleSubmit = async () => {
    if (!form.apartamento.trim()) {
      setAlert({ open: true, message: "Informe o apartamento", severity: "warning" });
      return;
    }
    if (!form.nomeMorador.trim()) {
      setAlert({ open: true, message: "Informe o morador", severity: "warning" });
      return;
    }
    if (!form.numeroRastreamento.trim()) {
      setAlert({ open: true, message: "Informe o rastreamento", severity: "warning" });
      return;
    }
    if (!nomePorteiro.trim()) {
      setAlert({ open: true, message: "Porteiro não identificado", severity: "warning" });
      return;
    }

    try {
      setLoading(true);

      const timestamp = Date.now();
      const encomendaData = {
        codigo: form.numeroRastreamento.toUpperCase(),
        data: new Date().toISOString(),
        timestamp: timestamp
      };

      // Verificar se já existe uma encomenda para este morador
      const encomendasRef = ref(db, `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes`);
      const snapshot = await get(encomendasRef);
      
      let encomendaExistente = null;
      if (snapshot.exists()) {
        const encomendas = snapshot.val();
        // Procurar por encomenda do mesmo morador registrada pelo mesmo porteiro
        Object.keys(encomendas).forEach(key => {
          const encomenda = encomendas[key];
          if (encomenda.apartamento === form.apartamento && 
              encomenda.nomeMorador === form.nomeMorador &&
              encomenda.codigoPorteiroRecebedor === codigoPorteiroRecebedor) {
            encomendaExistente = { id: key, ...encomenda };
          }
        });
      }

      if (encomendaExistente) {
        // Adicionar à encomenda existente
        const novasEncomendas = [
          ...encomendaExistente.encomendas || [],
          encomendaData
        ];
        
        await update(ref(db, `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes/${encomendaExistente.id}`), {
          encomendas: novasEncomendas,
          dataUltimaAtualizacao: new Date().toISOString()
        });
      } else {
        // Criar nova encomenda
        await set(
          ref(db, `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes/${timestamp}`),
          {
            apartamento: form.apartamento,
            nomeMorador: form.nomeMorador,
            encomendas: [encomendaData],
            dataRegistro: new Date().toISOString(),
            dataUltimaAtualizacao: new Date().toISOString(),
            nomePorteiroRecebedor: nomePorteiro,
            codigoPorteiroRecebedor: codigoPorteiroRecebedor,
          }
        );
      }

      setAlert({ 
        open: true, 
        message: encomendaExistente 
          ? "Encomenda adicionada à entrega existente!" 
          : "Encomenda registrada!", 
        severity: "success" 
      });
      
      setForm({ apartamento: "", nomeMorador: "", numeroRastreamento: "" });
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate("/src/pages/portaria/pages/encomendas/pendentes");
      }, 2000);
    } catch (error) {
      setAlert({ open: true, message: "Falha ao registrar: " + error.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box
      sx={{
      background: 'linear-gradient(135deg, #8e5e30, #44280f, #a96628)',

        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '500px', mx: 'auto', px: 2 }}>
        <Paper
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '0.8px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '12px',
            position: 'relative',
            padding: { xs: '20px 15px', sm: '24px 20px' }
          }}
        >
       
          
          <Typography 
            variant="h5" 
            component="h1"
            sx={{
              color: '#EDE9D5',
              textAlign: 'center',
              mb: 3,
              fontWeight: 'bold',
              fontSize: { xs: '18px', sm: '20px' }
            }}
          >
            📦 Registro de Encomendas
          </Typography>

          {nomePorteiro && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                mb: 3,
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <BadgeIcon sx={{ color: '#EDE9D5', mr: '10px', fontSize: '16px' }} />
              <Typography variant="body2" sx={{ color: '#EDE9D5', fontSize: '14px' }}>
                Porteiro: {nomePorteiro}
              </Typography>
            </Box>
          )}

          <Box sx={{ width: '100%', mb: 2 }}>
            <TextField
              inputRef={apartamentoRef}
              placeholder="Número do apartamento"
              value={form.apartamento}
              onChange={(e) => handleChange("apartamento", e.target.value)}
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ApartmentIcon sx={{ color: '#f9f9f9', fontSize: '18px' }} />
                  </InputAdornment>
                ),
                sx: {
                  color: '#f9f9f9',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '5px',
                  padding: '0 15px',
                  height: '48px',
                  '& fieldset': { border: 'none' },
                  '& input': { 
                    color: '#f9f9f9', 
                    padding: '12px 0', 
                    fontSize: '14px' 
                  },
                  '& input::placeholder': { 
                    color: '#f9f9f9', 
                    fontSize: '14px',
                    opacity: 0.8
                  }
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  moradorRef.current?.focus();
                }
              }}
              fullWidth
            />
          </Box>

          <Box sx={{ width: '100%', mb: 2 }}>
            <TextField
              inputRef={moradorRef}
              placeholder="Nome do morador"
              value={form.nomeMorador}
              onChange={(e) => handleChange("nomeMorador", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#f9f9f9', fontSize: '18px' }} />
                  </InputAdornment>
                ),
                sx: {
                  color: '#f9f9f9',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '5px',
                  padding: '0 15px',
                  height: '48px',
                  '& fieldset': { border: 'none' },
                  '& input': { 
                    color: '#f9f9f9', 
                    padding: '12px 0', 
                    fontSize: '14px' 
                  },
                  '& input::placeholder': { 
                    color: '#f9f9f9', 
                    fontSize: '14px',
                    opacity: 0.8
                  }
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  rastreamentoRef.current?.focus();
                }
              }}
              fullWidth
            />
          </Box>
          
          <Box sx={{ width: '100%', mb: 2 }}>
            <TextField
              inputRef={rastreamentoRef}
              placeholder="Código de rastreamento"
              value={form.numeroRastreamento}
              onChange={(e) => handleChange("numeroRastreamento", e.target.value.toUpperCase())}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeIcon sx={{ color: '#f9f9f9', fontSize: '18px' }} />
                  </InputAdornment>
                ),
                sx: {
                  color: '#f9f9f9',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '5px',
                  padding: '0 15px',
                  height: '48px',
                  '& fieldset': { border: 'none' },
                  '& input': { 
                    color: '#f9f9f9', 
                    padding: '12px 0', 
                    fontSize: '14px',
                    textTransform: 'uppercase'
                  },
                  '& input::placeholder': { 
                    color: '#f9f9f9', 
                    fontSize: '14px',
                    opacity: 0.8
                  }
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              fullWidth
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            width: '100%', 
            mt: 3,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
          

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                backgroundColor: '#0F98A1',
                padding: '15px',
                fontWeight: 'bold',
                borderRadius: '8px',
                flex: 1,
                '&:hover': {
                  backgroundColor: '#0A7A82'
                },
                '&:disabled': {
                  opacity: 0.6
                }
              }}
              fullWidth
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Registrar"}
            </Button>
              <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                color: '#f9f9f9',
                borderColor: '#f9f9f9',
                padding: '15px',
                fontWeight: 'bold',
                borderRadius: '8px',
                flex: 1,
                backgroundColor: '#F39C12',
                '&:hover': {
                  borderColor: '#f9f9f9',
                  backgroundColor: '#fdae30ff'
                }
              }}
              fullWidth
            >
              Cancelar
            </Button>
          </Box>
        </Paper>
      </Box>

      {alert.open && (
        <Alert 
          severity={alert.severity} 
          onClose={handleCloseAlert}
          sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            minWidth: '300px',
            zIndex: 1000
          }}
        >
          {alert.message}
        </Alert>
      )}
    </Box>
  );
};

export default RegistroEncomendas;