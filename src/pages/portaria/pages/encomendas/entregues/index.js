import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  InputAdornment,
  Divider,
  CircularProgress
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  HowToReg as UserCheckIcon,
  Engineering as EngineerIcon
} from "@mui/icons-material";
import { ref, get } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import { formatDateWithTime } from "../../../../../Utils/hourBrazil";
import { useNavigate } from "react-router-dom";
import styles from "./EncomendasEntregues.module.css";

function EncomendasEntregues() {
  const navigate = useNavigate();
  const [encomendas, setEncomendas] = useState([]);
  const [filteredEncomendas, setFilteredEncomendas] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEncomendas = async () => {
      const encomendasRef = ref(
        db,
        "DadosBelaVista/DadosMoradores/encomendas/EncomendasEntregues"
      );

      try {
        const snapshot = await get(encomendasRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const encomendasList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            encomendas: Array.isArray(data[key].encomendas) 
              ? data[key].encomendas.map(encomenda => {
                  if (typeof encomenda === 'string') {
                    return {
                      codigo: encomenda,
                      data: data[key].dataRegistro 
                        ? new Date(data[key].dataRegistro).toLocaleDateString('pt-BR')
                        : 'Data não disponível',
                      timestamp: new Date(data[key].dataRegistro).getTime() || Date.now()
                    };
                  }
                  return encomenda;
                })
              : []
          }));

          const sortedEncomendas = encomendasList.sort(
            (a, b) => new Date(b.horarioEntrega) - new Date(a.horarioEntrega)
          );
          setEncomendas(sortedEncomendas);
          setFilteredEncomendas(sortedEncomendas);
        } else {
          console.log("Nenhuma encomenda entregue encontrada.");
        }
      } catch (error) {
        console.error("Erro ao buscar encomendas entregues: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEncomendas();
  }, []);

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

  const renderItem = (item) => (
    <Card key={item.id} className={styles.card}>
      <Box className={styles.cardItem}>
        <Box className={styles.labelContainer}>
          <PersonIcon className={styles.cardIcon} />
          <Typography className={styles.cardLabel}>Morador:</Typography>
        </Box>
        <Typography className={styles.cardValue}>{item.nomeMorador}</Typography>
      </Box>
      <Divider className={styles.divider} />

      <Box className={styles.cardItem}>
        <Box className={styles.labelContainer}>
          <ApartmentIcon className={styles.cardIcon} />
          <Typography className={styles.cardLabel}>Apartamento:</Typography>
        </Box>
        <Typography className={styles.cardValue}>{item.apartamento}</Typography>
      </Box>
      <Divider className={styles.divider} />

      <Box className={styles.cardItem}>
        <Box className={styles.labelContainer}>
          <UserCheckIcon className={styles.cardIcon} />
          <Typography className={styles.cardLabel}>Recebido por:</Typography>
        </Box>
        <Typography className={styles.cardValue}>{item.recebedor || 'Não informado'}</Typography>
      </Box>
      <Divider className={styles.divider} />
      
      <Box className={styles.cardItem}>
        <Box className={styles.labelContainer}>
          <EngineerIcon className={styles.cardIcon} />
          <Typography className={styles.cardLabel}>Porteiro recebedor:</Typography>
        </Box>
        <Typography className={styles.cardValue}>{item.nomePorteiroRecebedor}</Typography>
      </Box>
      <Divider className={styles.divider} />

      <Box className={styles.cardItem}>
        <Box className={styles.labelContainer}>
          <CalendarIcon className={styles.cardIcon} />
          <Typography className={styles.cardLabel}>Entregue em:</Typography>
        </Box>
        <Typography className={styles.cardValue}>
          {formatDateWithTime(item.horarioEntrega)}
        </Typography>
      </Box>
      <Divider className={styles.divider} />

      <Box className={styles.cardItem}>
        <Box className={styles.labelContainer}>
          <EngineerIcon className={styles.cardIcon} />
          <Typography className={styles.cardLabel}>Porteiro entregador:</Typography>
        </Box>
        <Typography className={styles.cardValue}>{item.nomePorteiroEntregador}</Typography>
      </Box>
      <Divider className={styles.divider} />

      {/* SEÇÃO DE ENCOMENDAS */}
      <Box className={styles.encomendasSection}>
        <Box className={styles.labelContainerEncomendas}>
          <Typography className={styles.cardLabelEncomendas}>Encomenda(s)</Typography>
        </Box>
        
        {/* Tabela de encomendas */}
        <Box className={styles.tableContainer}>
          <Box className={styles.tableHeader}>
            <Typography className={styles.tableHeaderText}>N° rastreamento</Typography>
            <Typography className={styles.tableHeaderText}>Registrado em</Typography>
          </Box>
          
          {item.encomendas && item.encomendas.length > 0 ? (
            item.encomendas.map((encomenda, index) => (
              <Box key={index} className={styles.tableRow}>
                <Typography className={styles.tableCell}>
                  {encomenda.codigo}
                </Typography>
                <Typography className={styles.tableCell}>
                  {formatDateWithTime(encomenda.data)}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography className={styles.noEncomendasText}>Nenhuma encomenda</Typography>
          )}
        </Box>
      </Box>
    </Card>
  );

  return (
    <Box className={styles.container}>
      <Box className={styles.gradientBackground} />
      
      <Box className={styles.contentContainer}>
        <Typography variant="h5" className={styles.title}>
          Encomendas entregues: {filteredEncomendas.length}
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

        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : filteredEncomendas.length === 0 ? (
          <Typography className={styles.emptyText}>
            Não há encomendas entregues
          </Typography>
        ) : (
          <Box className={styles.listContainer}>
            {filteredEncomendas.map((item) => renderItem(item))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default EncomendasEntregues;