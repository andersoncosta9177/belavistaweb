import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Card, Divider, Icon } from "@rneui/base";
import GradientLayout from "../../../../../../src/Utils/gradiente";
import { db } from "../../../../../database/firebaseConfig";
import { ref, get } from "firebase/database";

const VisualizacaoOcorrenciaPortaria = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const ocorrenciasRef = ref(db, "DadosBelaVista/DadosPortaria/ocorrencias");
      const snapshot = await get(ocorrenciasRef);

      if (snapshot.exists()) {
        const ocorrenciasData = snapshot.val();
        const ocorrenciasArray = await Promise.all(
          Object.keys(ocorrenciasData).map(async (key) => {
            const comentario = await fetchComentarios(key);
            return {
              id: key,
              ...ocorrenciasData[key],
              dataFormatada: formatDate(ocorrenciasData[key].dataRegistro),
              dataLeitura: formatDate(ocorrenciasData[key].dataLeitura),
              comentario // Adiciona o comentário à ocorrência
            };
          })
        );

        ocorrenciasArray.sort((a, b) => b.dataRegistro - a.dataRegistro);
        setOcorrencias(ocorrenciasArray);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar ocorrências");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);


const fetchComentarios = async (ocorrenciaId) => {
  try {
    const comentariosRef = ref(
      db,
      `DadosBelaVista/DadosPortaria/ocorrencias/${ocorrenciaId}/${ocorrenciaId}/comentarios`
    );
    const snapshot = await get(comentariosRef);

    if (snapshot.exists()) {
      // Retorna o objeto de comentário diretamente
      return {
        ...snapshot.val(),
        dataFormatada: formatDate(snapshot.val().data)
      };
    }
    return null;
  } catch (err) {
    console.error("Erro ao buscar comentários:", err);
    return null;
  }
};

  const formatDate = (timestamp) => {
    if (!timestamp) return "Data não disponível";

    try {
      const date = new Date(Number(timestamp));
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return "Data inválida";
    }
  };

  const onRefresh = () => {
    fetchOcorrencias();
  };

  const formatStatus = (status) => {
    switch (status) {
      case "Pendente":
        return " Pendente";
      case "Resolvido":
        return "Resolvido";
      case "Em andamento":
        return "Em andamento";
      case "Lido":
        return "Lido";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <GradientLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F98A1" />
          <Text style={styles.loadingText}>Carregando ocorrências...</Text>
        </View>
      </GradientLayout>
    );
  }

  if (error) {
    return (
      <GradientLayout>
        <View style={styles.emptyContainer}>
          <Icon
            name="alert-circle-outline"
            type="material-community"
            size={48}
            color="rgba(255,255,255,0.5)"
          />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Icon
              name="refresh"
              type="material-community"
              size={24}
              color="#0F98A1"
            />
            <Text style={styles.refreshText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0F98A1"]}
            tintColor="#0F98A1"
          />
        }
      >
        <Text style={styles.sectionTitle}>Ocorrências Registradas</Text>

        {ocorrencias.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="check-circle-outline"
              type="material-community"
              size={48}
              color="rgba(255,255,255,0.5)"
            />
            <Text style={styles.emptyText}>Nenhuma ocorrência registrada</Text>
          </View>
        ) : (
          ocorrencias.map((ocorrencia) => (
            <TouchableOpacity
              key={ocorrencia.id}
              onPress={() =>
                setExpandedCard(
                  expandedCard === ocorrencia.id ? null : ocorrencia.id
                )
              }
              activeOpacity={0.8}
            >
              <Card
                containerStyle={[
                  styles.card,
                  expandedCard === ocorrencia.id && styles.cardExpanded,
                  ocorrencia.status === "Resolvido" && styles.cardResolvido,
                  ocorrencia.status === "Lido" && styles.cardLido,
                ]}
              >
                <View style={styles.header}>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                      {ocorrencia.porteiro || "Sem título"}
                    </Text>
                    <Text style={styles.statusText}>
                      {formatStatus(ocorrencia.status || "Pendente")}
                    </Text>
                  </View>
                  <Icon
                    name={
                      expandedCard === ocorrencia.id
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    type="material-community"
                    size={24}
                    color="#A9C52F"
                  />
                </View>

                {expandedCard === ocorrencia.id && (
                  <>
                    <Card.Divider style={styles.divider} />
                    <View style={styles.content}>
                      <View style={styles.infoRow}>
                        <Icon
                          name="calendar"
                          type="font-awesome"
                          size={16}
                          color="#f1f1f1"
                        />
                        <Text style={styles.infoText}>
                          Registrado em: {ocorrencia.dataFormatada}
                        </Text>
                      </View>
             {ocorrencia.status === "Lido" &&  (
  <View style={styles.infoRow}>
    <Icon
      name="clock-o"
      type="font-awesome"
      size={16}
      color="#f1f1f1"
    />
    <Text style={styles.infoText}>
      Lido em: {ocorrencia.dataLeitura || "Sem data de leitura"}
    </Text>
  </View>
)}

                      <Divider style={styles.divider} />

                      <View style={styles.descContainer}>
                        <Text style={styles.descLabel}>Descrição:</Text>
                        <Text style={styles.descText}>
                          {ocorrencia.descricao || "Sem descrição"}
                        </Text>
                      </View>
{ocorrencia.comentario && (
  <View style={styles.comentariosContainer}>
    <Text style={styles.comentariosTitle}>Resposta do Síndico:</Text>
    <View style={styles.comentarioItem}>
      <Text style={styles.comentarioTexto}>
        {ocorrencia.comentario.texto}
      </Text>
      <Text style={styles.comentarioData}>
        {formatDate(ocorrencia.comentario.data)} • {ocorrencia.comentario.autor}
      </Text>
    </View>
  </View>
)}
                    </View>
                  </>
                )}
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </GradientLayout>
  );
};

// Estilos idênticos à tela de moradores
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {      
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: '96%',
    marginHorizontal: '2%',
    padding: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardExpanded: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardResolvido: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CD964',
  },
  cardLido: {
    borderLeftWidth: 5,
    borderLeftColor: '#0F98A1',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFF',
    flex: 1,
    left: 10,
  },
  statusText: {
    fontSize: 13,
    color: "#B6F500",
    marginTop: 3,
    fontWeight: 'bold',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 1,
  },
  content: {
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 10,
    flex: 1,
  },
  descContainer: {
    marginTop: 10,
  },
  descLabel: {
    fontSize: 14,
    color: '#FFD63A',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    textAlign: 'justify',
  },
  comentariosContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
  },
  comentariosTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD63A',
    marginBottom: 8,
  },
  comentarioItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  comentarioTexto: {
    fontSize: 12,
    color: '#FFF',
    marginBottom: 5,
  },
  comentarioData: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  refreshText: {
    color: '#0F98A1',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default VisualizacaoOcorrenciaPortaria;
