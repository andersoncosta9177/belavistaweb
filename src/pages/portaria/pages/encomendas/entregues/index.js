import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
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
  PersonOutline,
  CalendarMonth,
  CheckCircle
} from "@mui/icons-material";
import { getDatabase, ref, get } from "firebase/database";
import { formatDateWithTime } from "../../../../../Utils/hourBrazil";
import styles from './EncomendasEntregues.module.css';

function EncomendasEntregues() {
  const [encomendas, setEncomendas] = useState([]);
  const [filteredEncomendas, setFilteredEncomendas] = useState([]);
  const [search, setSearch] = useState("");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchEncomendas = async () => {
      const db = getDatabase();
      const encomendasRef = ref(db, "DadosBelaVista/DadosMoradores/encomendas/EncomendasEntregues");

      try {
        const snapshot = await get(encomendasRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const encomendasList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          // Ordenar por data de entrega (mais recente primeiro)
          const sortedEncomendas = encomendasList.sort((a, b) => 
            new Date(b.horarioEntrega) - new Date(a.horarioEntrega)
          );
          setEncomendas(sortedEncomendas);
          setFilteredEncomendas(sortedEncomendas);
        } else {
          console.log("Nenhuma encomenda entregue encontrada.");
        }
      } catch (error) {
        console.error("Erro ao buscar encomendas entregues: ", error);
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
    <Grid item xs={12} sm={6} md={4} className={styles.gridItem}>
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
        

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <Person fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Morador:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>{item.nomeMorador}</Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <PersonOutline fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Recebido por:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>{item.recebedor}</Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <Apartment fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Apartamento:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>{item.apartamento}</Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <QrCode fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Código:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>{item.numeroRastreamento}</Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <CalendarToday fontSize="small" sx={{ color: '#f9f9f9',   mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Recebido em:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>
              {formatDateWithTime(item.dataRegistro)}
            </Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <Badge fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Porteiro recebedor:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>{item.nomePorteiroRecebedor}</Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <CalendarMonth fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Entrega em:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>
              {formatDateWithTime(item.horarioEntrega)}
            </Typography>
          </Box>

          <Box className={styles.cardItem}>
            <Box className={styles.labelContainer}>
              <Badge fontSize="small" sx={{ color: '#f9f9f9', mr: 1 }} />
              <Typography variant="body2" className={styles.cardLabel}>Porteiro entregador:</Typography>
            </Box>
            <Typography variant="body2" className={styles.cardValue}>{item.nomePorteiroEntregador}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box className={styles.container}>
      <Box className={styles.gradientBackground}></Box>
      
      <Box className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          Encomendas Entregues
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
          {`Total de ${encomendas.length} encomendas entregues`}
        </Typography>
      </Box>

      {filteredEncomendas.length === 0 ? (
        <Typography variant="body1" className={styles.noEncomendasText}>
          Não há encomendas entregues
        </Typography>
      ) : (
        <Grid container spacing={2} className={styles.gridContainer}>
          {filteredEncomendas.map(item => renderItem(item))}
        </Grid>
      )}
    </Box>
  );
}

export default EncomendasEntregues;