import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Modal,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  LocalShipping as TruckIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { ref, get, remove, set, update } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { formatDateWithTime } from "../../../../../Utils/hourBrazil";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigate } from "react-router-dom";
import styles from "./EncomendasPendentes.module.css";

function EncomendasPendentes() {
  const navigate = useNavigate();
  const [encomendas, setEncomendas] = useState([]);
  const [filteredEncomendas, setFilteredEncomendas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [recebedor, setRecebedor] = useState("");
  const [selectedEncomendaId, setSelectedEncomendaId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [codigoPorteiro, setCodigoPorteiro] = useState(null);
  const [addEncomendaModalVisible, setAddEncomendaModalVisible] = useState(false);
  const [selectedEncomendaForAdd, setSelectedEncomendaForAdd] = useState(null);
  const [novaEncomendaCodigo, setNovaEncomendaCodigo] = useState("");
  const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });

  // Estados para edição
  const [editData, setEditData] = useState({
    nomeMorador: "",
    apartamento: "",
  });

  useEffect(() => {
    const buscarPorteiro = async () => {
      try {
        const codigo = await AsyncStorage.getItem("codigo");
        setCodigoPorteiro(codigo);
      } catch (error) {
        setAlert({ open: true, message: error.message, severity: "error" });
      }
    };

    buscarPorteiro();
  }, []);

  // Buscar todas as encomendas
  useEffect(() => {
    const fetchEncomendas = async () => {
      setLoading(true);
      const encomendasRef = ref(
        db,
        "DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes"
      );

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
        setAlert({ open: true, message: "Erro ao buscar encomendas", severity: "error" });
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

  const handleConfirmarNovaEncomenda = async () => {
    if (!novaEncomendaCodigo.trim()) {
      setAlert({ open: true, message: "Por favor, informe o código da nova encomenda", severity: "warning" });
      return;
    }

    try {
      const encomendaRef = ref(
        db,
        `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes/${selectedEncomendaForAdd.id}`
      );

      const snapshot = await get(encomendaRef);
      if (snapshot.exists()) {
        const encomendaData = snapshot.val();

        const novaEncomenda = {
          codigo: novaEncomendaCodigo.toUpperCase(),
          data: new Date().toISOString(),
          timestamp: Date.now()
        };

        const encomendasAtuais = encomendaData.encomendas || [];
        const novasEncomendas = [
          ...encomendasAtuais,
          novaEncomenda
        ];

        await update(encomendaRef, {
          encomendas: novasEncomendas,
          dataUltimaAtualizacao: new Date().toISOString(),
        });

        setEncomendas((prev) =>
          prev.map((item) =>
            item.id === selectedEncomendaForAdd.id
              ? {
                  ...item,
                  encomendas: novasEncomendas,
                  dataUltimaAtualizacao: new Date().toISOString(),
                }
              : item
          )
        );

        setAlert({ open: true, message: "Nova encomenda adicionada com sucesso!", severity: "success" });
        setAddEncomendaModalVisible(false);
        setNovaEncomendaCodigo("");
      }
    } catch (error) {
      console.error("Erro ao adicionar encomenda:", error);
      setAlert({ open: true, message: "Erro ao adicionar encomenda", severity: "error" });
    }
  };

  const handleEditar = (encomenda) => {
    setSelectedEncomendaId(encomenda.id);
    setEditData({
      nomeMorador: encomenda.nomeMorador,
      apartamento: encomenda.apartamento,
    });
    setEditModalVisible(true);
  };

  const handleConfirmarEdicao = async () => {
    if (!editData.nomeMorador.trim() || !editData.apartamento.trim()) {
      setAlert({ open: true, message: "Nome do morador e apartamento são obrigatórios!", severity: "warning" });
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
      });

      setEncomendas((prev) =>
        prev.map((item) =>
          item.id === selectedEncomendaId
            ? {
                ...item,
                nomeMorador: editData.nomeMorador,
                apartamento: editData.apartamento,
              }
            : item
        )
      );

      setEditModalVisible(false);
      setAlert({ open: true, message: "Encomenda atualizada com sucesso!", severity: "success" });
    } catch (error) {
      console.error("Erro ao editar encomenda:", error);
      setAlert({ open: true, message: "Erro ao editar encomenda", severity: "error" });
    }
  };

  const handleConfirmarEntrega = async () => {
    const encomendaRef = ref(
      db,
      `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes/${selectedEncomendaId}`
    );
    const encomendaEntregueRef = ref(
      db,
      `DadosBelaVista/DadosMoradores/encomendas/EncomendasEntregues/${selectedEncomendaId}`
    );

    try {
      const codigoPorteiro = await AsyncStorage.getItem("codigo");

      if (!codigoPorteiro) {
        setAlert({ open: true, message: "Código do porteiro não encontrado. Faça login novamente.", severity: "error" });
        return;
      }

      const nomeRef = ref(
        db,
        `DadosBelaVista/RegistroFuncionario/Tokens/${codigoPorteiro}/nome`
      );
      const snapshotNome = await get(nomeRef);

      if (!snapshotNome.exists()) {
        setAlert({ open: true, message: "Nome do porteiro não encontrado no banco de dados.", severity: "error" });
        return;
      }

      const nomePorteiroEntregador = snapshotNome.val();

      const snapshotEncomenda = await get(encomendaRef);
      if (snapshotEncomenda.exists()) {
        let encomendaData = snapshotEncomenda.val();

        if (Array.isArray(encomendaData.encomendas)) {
          encomendaData.encomendas = encomendaData.encomendas.map(encomenda => {
            if (typeof encomenda === 'string') {
              return {
                codigo: encomenda,
                data: encomendaData.dataRegistro 
                  ? new Date(encomendaData.dataRegistro).toLocaleDateString('pt-BR')
                  : new Date().toLocaleDateString('pt-BR'),
                timestamp: new Date(encomendaData.dataRegistro).getTime() || Date.now()
              };
            }
            return encomenda;
          });
        }

        if (recebedor.trim() !== "") {
          encomendaData.recebedor = recebedor;
        } else {
          setAlert({ open: true, message: "O nome do recebedor não foi fornecido.", severity: "warning" });
          return;
        }

        encomendaData.horarioEntrega = new Date().toISOString();
        encomendaData.nomePorteiroEntregador = nomePorteiroEntregador;
        encomendaData.dataEntrega = new Date().toLocaleDateString('pt-BR');
        encomendaData.horaEntrega = new Date().toLocaleTimeString('pt-BR');

        await set(encomendaEntregueRef, encomendaData);
        await remove(encomendaRef);

        setEncomendas((prevEncomendas) =>
          prevEncomendas.filter((item) => item.id !== selectedEncomendaId)
        );

        setModalVisible(false);
        setRecebedor("");
        setAlert({ open: true, message: "Encomenda entregue com sucesso!", severity: "success" });
      } else {
        setAlert({ open: true, message: "Encomenda não encontrada.", severity: "error" });
      }
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error);
      setAlert({ open: true, message: "Erro ao confirmar entrega.", severity: "error" });
    }
  };

  const handleAdicionarEncomenda = (encomenda) => {
    setSelectedEncomendaForAdd(encomenda);
    setNovaEncomendaCodigo("");
    setAddEncomendaModalVisible(true);
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const renderItem = (item) => (
    <Card className={styles.card} key={item.id}>
      <Box className={styles.cardItem}>
        <Box className={styles.labelContainer}>
          <PersonIcon className={styles.cardIcon} />
          <Typography className={styles.cardLabel}>Morador:</Typography>
        </Box>
        <Typography className={styles.cardValue}>{item.nomeMorador}</Typography>
      </Box>

      <Box className={styles.cardItem}>
        <Box className={styles.labelContainer}>
          <ApartmentIcon className={styles.cardIcon} />
          <Typography className={styles.cardLabel}>Apartamento:</Typography>
        </Box>
        <Typography className={styles.cardValue}>{item.apartamento}</Typography>
      </Box>

      <Box className={styles.cardItem}>
        <Box className={styles.labelContainer}>
          <BadgeIcon className={styles.cardIcon} />
          <Typography className={styles.cardLabel}>Recebido por:</Typography>
        </Box>
        <Typography className={styles.cardValue}>{item.nomePorteiroRecebedor}</Typography>
      </Box>

      <Box className={styles.cardItemEncomendas}>
        <Box className={styles.labelContainerEncomendas}>
          <Typography className={styles.cardLabelEncomendas}>Encomenda(s)</Typography>
        </Box>
        
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell className={styles.tableHeaderCell}>N° rastreamento</TableCell>
                <TableCell className={styles.tableHeaderCell} align="right">Registrado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {item.encomendas && item.encomendas.length > 0 ? (
                item.encomendas.map((encomenda, index) => (
                  <TableRow key={index}>
                    <TableCell className={styles.tableCell}>{encomenda.codigo}</TableCell>
                    <TableCell className={styles.tableCell} align="right">
                      {formatDateWithTime(encomenda.data)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className={styles.noEncomendasText} align="center">
                    Nenhuma encomenda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box className={styles.buttonRow}>
        <Button
          variant="contained"
          onClick={() => handleEditar(item)}
          className={styles.editButton}
          startIcon={<EditIcon />}
        >
          Editar
        </Button>
        <Button
          variant="contained"
          onClick={() => handleEntregar(item.id)}
          className={styles.deliverButton}
          startIcon={<TruckIcon />}
        >
          Entregar
        </Button>

        {item.codigoPorteiroRecebedor === codigoPorteiro && (
          <Button
            variant="contained"
            onClick={() => handleAdicionarEncomenda(item)}
            className={styles.addButton}
            startIcon={<AddIcon />}
          >
            Adicionar
          </Button>
        )}
      </Box>
    </Card>
  );

  return (
    <Box className={styles.container}>
      <Box className={styles.gradientBackground} />
      
      <Box className={styles.contentContainer}>
       

        <Typography variant="h5" className={styles.title}>
          Encomendas Pendentes
        </Typography>

        <TextField
          placeholder="Pesquisar por apartamento ou nome"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Typography className={styles.subtitle}>
          Há {encomendas.length} encomendas pendentes
        </Typography>

        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : filteredEncomendas.length === 0 ? (
          <Typography className={styles.noEncomendasText}>
            Não há encomendas pendentes
          </Typography>
        ) : (
          <Box className={styles.listContainer}>
            {filteredEncomendas.map((item) => renderItem(item))}
          </Box>
        )}

        {/* Modal de Entrega */}
        <Modal open={modalVisible} onClose={() => setModalVisible(false)}>
          <Box className={styles.modalOverlay}>
            <Box className={styles.modalContent}>
              <Typography variant="h6" className={styles.modalTitle}>
                Confirmar Entrega
              </Typography>
              <Typography className={styles.modalText}>Quem está recebendo?</Typography>

              <TextField
                placeholder="Nome do recebedor"
                value={recebedor}
                onChange={(e) => setRecebedor(e.target.value)}
                className={styles.modalInput}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />

              <Button
                variant="contained"
                onClick={handleConfirmarEntrega}
                className={styles.confirmButton}
                disabled={!recebedor.trim()}
                fullWidth
              >
                Confirmar Entrega
              </Button>

              <Button
                variant="outlined"
                onClick={() => setModalVisible(false)}
                className={styles.cancelButton}
                fullWidth
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal de Edição */}
        <Modal open={editModalVisible} onClose={() => setEditModalVisible(false)}>
          <Box className={styles.modalOverlay}>
            <Box className={styles.modalContent}>
              <Typography variant="h6" className={styles.modalTitle}>
                Editar Encomenda
              </Typography>

              <TextField
                placeholder="Nome do Morador"
                value={editData.nomeMorador}
                onChange={(e) => setEditData({ ...editData, nomeMorador: e.target.value })}
                className={styles.modalInput}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />

              <TextField
                placeholder="Apartamento"
                value={editData.apartamento}
                onChange={(e) => setEditData({ ...editData, apartamento: e.target.value })}
                className={styles.modalInput}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ApartmentIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />

              <Button
                variant="contained"
                onClick={handleConfirmarEdicao}
                className={styles.confirmButton}
                disabled={!editData.nomeMorador.trim() || !editData.apartamento.trim()}
                fullWidth
              >
                Salvar Alterações
              </Button>

              <Button
                variant="outlined"
                onClick={() => setEditModalVisible(false)}
                className={styles.cancelButton}
                fullWidth
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal para Adicionar Encomenda */}
        <Modal open={addEncomendaModalVisible} onClose={() => setAddEncomendaModalVisible(false)}>
          <Box className={styles.modalOverlay}>
            <Box className={styles.modalContent}>
              <Typography variant="h6" className={styles.modalTitle}>
                Adicionar Encomenda
              </Typography>
             
               <Typography className={styles.modalText}>
                {selectedEncomendaForAdd?.nomeMorador} - Apt{" "}
                {selectedEncomendaForAdd?.apartamento}
              </Typography>

              <TextField
                placeholder="Código da nova encomenda"
                value={novaEncomendaCodigo}
                onChange={(e) => setNovaEncomendaCodigo(e.target.value)}
                className={styles.modalInput}
                fullWidth
                inputProps={{
                  style: { textTransform: 'uppercase' }
                }}
              />

              <Button
                variant="contained"
                onClick={handleConfirmarNovaEncomenda}
                className={styles.confirmButton}
                disabled={!novaEncomendaCodigo.trim()}
                fullWidth
              >
                Adicionar Encomenda
              </Button>

              <Button
                variant="outlined"
                onClick={() => setAddEncomendaModalVisible(false)}
                className={styles.cancelButton}
                fullWidth
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Alertas */}
        {alert.open && (
          <Alert 
            severity={alert.severity} 
            onClose={handleCloseAlert}
            className={styles.alert}
          >
            {alert.message}
          </Alert>
        )}
      </Box>
    </Box>
  );
}

export default EncomendasPendentes;