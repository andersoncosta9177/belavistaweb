import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
  Grid,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Search,
  Person,
  Apartment,
  QrCode,
  CalendarToday,
  Badge,
  Edit,
  LocalShipping
} from "@mui/icons-material";
import { getDatabase, ref, get, remove, set, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "../../../../../database/firebaseConfig";
import { formatDateWithTime } from "../../../../../Utils/hourBrazil";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './EncomendasPendentes.module.css';

function EncomendasPendentes() {
  const [encomendas, setEncomendas] = useState([]);
  const [filteredEncomendas, setFilteredEncomendas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [recebedor, setRecebedor] = useState("");
  const [selectedEncomendaId, setSelectedEncomendaId] = useState("");
  const [nomePorteiroEntregador, setNomePorteiroEntregador] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estados para edição
  const [editData, setEditData] = useState({
    nomeMorador: "",
    apartamento: "",
    numeroRastreamento: ""
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Buscar o nome do porteiro
  useEffect(() => {
    const fetchNome = async () => {
      try {
        const auth = getAuth();
        const usuarioId = auth.currentUser?.uid;

        if (!usuarioId) {
          console.log("Usuário não autenticado");
          setNomePorteiroEntregador("Usuário não autenticado");
          return;
        }

        const nomeRef = ref(
          db,
          `dadosBelaVista/usuarios/usuarioPortaria/${usuarioId}/nome`
        );
        const snapshot = await get(nomeRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setNomePorteiroEntregador(data);
        } else {
          console.log("Dados não encontrados");
          setNomePorteiroEntregador("Dados não encontrados");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firebase:", error);
        setNomePorteiroEntregador("Erro ao carregar nome");
      }
    };

    fetchNome();
  }, []);

  // Buscar todas as encomendas
  useEffect(() => {
    const fetchEncomendas = async () => {
      setLoading(true);
      const db = getDatabase();
      const encomendasRef = ref(db, "DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes");

      try {
        const snapshot = await get(encomendasRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const encomendasList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            nomePorteiroRecebedor: data[key].nomePorteiroRecebedor || "",
          }));
          
          // Ordenar as encomendas por dataRegistro (mais recente primeiro)
          encomendasList.sort((a, b) => {
            const dateA = new Date(a.dataRegistro);
            const dateB = new Date(b.dataRegistro);
            return dateB - dateA;
          });
          
          setEncomendas(encomendasList);
          setFilteredEncomendas(encomendasList);
        } else {
          console.log("Nenhuma encomenda encontrada.");
        }
      } catch (error) {
        console.error("Erro ao buscar encomendas: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEncomendas();
  }, []);

  // Função para filtrar encomendas
  useEffect(() => {
    if (search) {
      const filtered = encomendas.filter(
        (item) =>
          item.apartamento.toLowerCase().includes(search.toLowerCase()) ||
          item.nomeMorador.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredEncomendas(filtered);
    } else {
      setFilteredEncomendas(encomendas);
    }
  }, [search, encomendas]);

  const handleEntregar = (id) => {
    setSelectedEncomendaId(id);
    setModalVisible(true);
  };

  const handleEditar = (encomenda) => {
    setSelectedEncomendaId(encomenda.id);
    setEditData({
      nomeMorador: encomenda.nomeMorador,
      apartamento: encomenda.apartamento,
      numeroRastreamento: encomenda.numeroRastreamento
    });
    setEditModalVisible(true);
  };

  const handleConfirmarEdicao = async () => {
    if (!editData.nomeMorador.trim() || !editData.apartamento.trim() || !editData.numeroRastreamento.trim()) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

    try {
      const encomendaRef = ref(
        db,
        `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes/${selectedEncomendaId}`
      );

      await update(encomendaRef, {
        nomeMorador: editData.nomeMorador,
        apartamento: editData.apartamento,
        numeroRastreamento: editData.numeroRastreamento
      });

      setEncomendas(prev => prev.map(item => 
        item.id === selectedEncomendaId ? {
          ...item,
          nomeMorador: editData.nomeMorador,
          apartamento: editData.apartamento,
          numeroRastreamento: editData.numeroRastreamento
        } : item
      ));

      setEditModalVisible(false);
      alert("Encomenda atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao editar encomenda:", error);
      alert("Erro ao editar encomenda.");
    }
  };

  const handleConfirmarEntrega = async () => {
    const db = getDatabase();
    const encomendaRef = ref(
      db,
      `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes/${selectedEncomendaId}`
    );
    const encomendaEntregueRef = ref(
      db,
      `DadosBelaVista/DadosMoradores/encomendas/EncomendasEntregues/${selectedEncomendaId}`
    );
  
    try {
      const codigoPorteiro = await AsyncStorage.getItem('codigo');
  
      if (!codigoPorteiro) {
        alert("Código do porteiro não encontrado. Faça login novamente.");
        return;
      }
  
      const nomeRef = ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigoPorteiro}/nome`);
      const snapshotNome = await get(nomeRef);
  
      if (!snapshotNome.exists()) {
        alert("Nome do porteiro não encontrado no banco de dados.");
        return;
      }
  
      const nomePorteiroEntregador = snapshotNome.val();
  
      const snapshotEncomenda = await get(encomendaRef);
      if (snapshotEncomenda.exists()) {
        const encomendaData = snapshotEncomenda.val();
  
        if (recebedor.trim() !== "") {
          encomendaData.recebedor = recebedor;
        } else {
          alert("O nome do recebedor não foi fornecido.");
          return;
        }
  
        encomendaData.horarioEntrega = new Date().toISOString();
        encomendaData.nomePorteiroEntregador = nomePorteiroEntregador;
  
        await set(encomendaEntregueRef, encomendaData);
        await remove(encomendaRef);
  
        setEncomendas((prevEncomendas) =>
          prevEncomendas.filter((item) => item.id !== selectedEncomendaId)
        );
  
        setModalVisible(false);
        setRecebedor("");
        alert("Encomenda entregue com sucesso!");
      } else {
        alert("Encomenda não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error);
      alert("Erro ao confirmar entrega.");
    }
  };

  const renderItem = (item) => (
    <Grid item xs={12} sm={6} md={4} className={styles.gridItem}>
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <Person fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Morador:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue} title={item.nomeMorador}>
              {item.nomeMorador}
            </Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <Apartment fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Apto:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>{item.apartamento}</Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <QrCode fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Código:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue} title={item.numeroRastreamento}>
              {item.numeroRastreamento}
            </Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <CalendarToday fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Registro:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>
              {formatDateWithTime(item.dataRegistro)}
            </Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <Badge fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Recebido por:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue} title={item.nomePorteiroRecebedor}>
              {item.nomePorteiroRecebedor}
            </Typography>
          </Box>
        </CardContent>
        
        <CardActions className={styles.buttonRow}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => handleEditar(item)}
            className={styles.editButton}
            fullWidth
            size={isSmallScreen ? "small" : "medium"}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            startIcon={<LocalShipping />}
            onClick={() => handleEntregar(item.id)}
            className={styles.deliverButton}
            fullWidth
            size={isSmallScreen ? "small" : "medium"}
          >
            Entregar
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box className={styles.container}>
      <Box className={styles.gradientBackground}></Box>
      
      <Box className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          Encomendas Pendentes
        </Typography>
        
        <TextField
          placeholder="Pesquisar por apartamento ou nome"
          InputProps={{
            startAdornment: <Search sx={{ color: '#86939e', mr: 1 }} />
          }}
          className={styles.searchInput}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          fullWidth
          variant="outlined"
          size="small"
        />
        
        <Typography variant="body1" className={styles.subtitle}>
          {`Há ${encomendas.length} encomendas pendentes`}
        </Typography>
      </Box>

      {loading ? (
        <Box className={styles.loadingContainer}>
          <CircularProgress sx={{ color: '#f5f5f5' }} />
        </Box>
      ) : filteredEncomendas.length === 0 ? (
        <Typography variant="body1" className={styles.noEncomendasText}>
          Não há encomendas pendentes
        </Typography>
      ) : (
        <Grid container spacing={2} className={styles.gridContainer}>
          {filteredEncomendas.map(item => renderItem(item))}
        </Grid>
      )}

      {/* Modal de Entrega */}
      <Dialog 
        open={modalVisible} 
        onClose={() => setModalVisible(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ className: styles.modalPaper }}
      >
        <DialogTitle className={styles.modalTitle}>Confirmar Entrega</DialogTitle>
        <DialogContent>
          <Typography className={styles.modalText}>Quem está recebendo?</Typography>
          
          <TextField
            placeholder="Nome do recebedor"
            InputProps={{
              startAdornment: <Person sx={{ color: '#86939e', mr: 1 }} />
            }}
            className={styles.modalInput}
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
            value={recebedor}
            onChange={(e) => setRecebedor(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions className={styles.modalActions}>
          <Button
            onClick={() => setModalVisible(false)}
            className={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEntrega}
            className={styles.confirmButton}
            disabled={!recebedor.trim()}
          >
            Entregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog 
        open={editModalVisible} 
        onClose={() => setEditModalVisible(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ className: styles.modalPaper }}
      >
        <DialogTitle className={styles.modalTitle}>Editar Encomenda</DialogTitle>
        <DialogContent>
          <TextField
            placeholder="Nome do Morador"
            InputProps={{
              startAdornment: <Person sx={{ color: '#86939e', mr: 1 }} />
            }}
            className={styles.modalInput}
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
            value={editData.nomeMorador}
            onChange={(e) => setEditData({...editData, nomeMorador: e.target.value})}
            fullWidth
            variant="outlined"
            margin="normal"
          />

          <TextField
            placeholder="Apartamento"
            InputProps={{
              startAdornment: <Apartment sx={{ color: '#86939e', mr: 1 }} />
            }}
            className={styles.modalInput}
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
            value={editData.apartamento}
            onChange={(e) => setEditData({...editData, apartamento: e.target.value})}
            fullWidth
            variant="outlined"
            margin="normal"
          />

          <TextField
            placeholder="Código de Rastreamento"
            InputProps={{
              startAdornment: <QrCode sx={{ color: '#86939e', mr: 1 }} />
            }}
            className={styles.modalInput}
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
            value={editData.numeroRastreamento}
            onChange={(e) => setEditData({...editData, numeroRastreamento: e.target.value})}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions className={styles.modalActions}>
          <Button
            onClick={() => setEditModalVisible(false)}
            className={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEdicao}
            className={styles.confirmButton}
            disabled={!editData.nomeMorador.trim() || !editData.apartamento.trim() || !editData.numeroRastreamento.trim()}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EncomendasPendentes;