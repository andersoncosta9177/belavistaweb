import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import { Card, Divider, Icon } from "@rneui/base";
import GradientLayout from "../../../../../../src/Utils/gradiente";
import { db } from "../../../../../database/firebaseConfig";
import { ref, get, update } from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";
import { formatDateWithTime } from "../../../../../Utils/hourBrazil";







const VisualizacaoOcorrenciaSindico = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [comentario, setComentario] = useState("");
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState(null);

  const fetchOcorrencias = async () => {
    try {
      setLoading(true);
      setError(null);

      const ocorrenciasRef = ref(
        db,
        "DadosBelaVista/DadosPortaria/ocorrencias"
      );
      const snapshot = await get(ocorrenciasRef);

      if (snapshot.exists()) {
        const ocorrenciasData = snapshot.val();
        let todasOcorrencias = [];

        // Busca todas as ocorrências e seus comentários
        const ocorrenciasPromises = Object.keys(ocorrenciasData).map(
          async (uid) => {
            const ocorrenciaData = ocorrenciasData[uid];

            if (ocorrenciaData && ocorrenciaData.dataRegistro) {
              // Busca os comentários para esta ocorrência
              const comentariosRef = ref(
                db,
                `DadosBelaVista/DadosPortaria/ocorrencias/${uid}/${uid}/comentarios`
              );
              const comentariosSnapshot = await get(comentariosRef);
              let comentarios = [];

              if (comentariosSnapshot.exists()) {
                comentarios = Object.entries(comentariosSnapshot.val()).map(
                  ([key, value]) => ({
                    id: key,
                    ...value,
                  })
                );
              }

              return {
                id: uid,
                uidMorador: uid,
                // apartamento: ocorrenciaData.apartamento || "N/I",
                descricao: ocorrenciaData.descricao || "Sem descrição",
                dataRegistro: ocorrenciaData.dataRegistro,
                dataFormatada: formatDateWithTime(ocorrenciaData.dataRegistro),
                titulo: ocorrenciaData.titulo || "Ocorrência sem título",
                status: ocorrenciaData.status || "Pendente",
                comentarios: comentarios,
                nomePorteiro: ocorrenciaData.porteiro
              };
            }
            return null;
          }
        );

        // Resolve todas as promises
        const resultados = await Promise.all(ocorrenciasPromises);
        todasOcorrencias = resultados.filter((oc) => oc !== null);

        // Ordena por data (mais recente primeiro)
        todasOcorrencias.sort((a, b) => b.dataRegistro - a.dataRegistro);

        setOcorrencias(todasOcorrencias);
      } else {
        setError("Nenhuma ocorrência encontrada");
        setOcorrencias([]);
      }
    } catch (err) {
      console.error("Erro ao buscar ocorrências:", err);
      setError("Erro ao carregar ocorrências");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOcorrencias();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOcorrencias();
  };



  // Modifique a função enviarComentario para usar timestamp numérico
  const enviarComentario = async () => {
    if (!comentario.trim()) {
      Alert.alert("Atenção", "Por favor, digite um comentário");
      return;
    }

    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const comentarioRef = ref(
        db,
        `DadosBelaVista/DadosPortaria/ocorrencias/${ocorrenciaSelecionada.id}/${ocorrenciaSelecionada.id}/comentarios/${timestamp}`
      );

      const novoComentario = {
        texto: comentario,
        data: timestamp,
        autor: "Síndico",
      };

      // Salva o novo comentário
      await update(comentarioRef, novoComentario);

      // Atualiza o estado local
      setOcorrencias(
        ocorrencias.map((oc) => {
          if (oc.id === ocorrenciaSelecionada.id) {
            return {
              ...oc,
              comentarios: [...(oc.comentarios || []), novoComentario],
            };
          }
          return oc;
        })
      );

      Alert.alert("Sucesso", "Comentário adicionado com sucesso!");
      setModalVisible(false);
      setComentario("");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      Alert.alert("Erro", "Não foi possível adicionar o comentário");
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoLido = async (ocorrenciaId, uidMorador) => {
    try {
      setLoading(true);

      // Correção importante: Ajuste o caminho da referência conforme sua estrutura
      const ocorrenciaRef = ref(
        db,
        `DadosBelaVista/DadosPortaria/ocorrencias/${ocorrenciaId}`
      );

      await update(ocorrenciaRef, {
        status: "Lido",
        dataLeitura: new Date().getTime(), // Usando timestamp numérico como dataRegistro
      });

      // Atualiza o estado local
      setOcorrencias(
        ocorrencias.map((oc) =>
          oc.id === ocorrenciaId
            ? {
                ...oc,
                status: "Lido",
                dataLeitura: new Date().getTime(),
                dataFormatada: formatDateWithTime(new Date().getTime()),
              }
            : oc
        )
      );

      Alert.alert("Sucesso", "Ocorrência marcada como lida!");
    } catch (error) {
      console.error("Erro ao atualizar ocorrência:", error);
      Alert.alert("Erro", "Não foi possível marcar como lido");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalComentario = (ocorrencia) => {
    setOcorrenciaSelecionada(ocorrencia);
    setModalVisible(true);
  };

  if (loading && !refreshing) {
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
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchOcorrencias}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
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
        {ocorrencias.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="alert-circle-outline"
              type="material-community"
              size={48}
              color="rgba(255,255,255,0.5)"
            />
            <Text style={styles.emptyText}>Nenhuma ocorrência registrada</Text>
          </View>
        ) : (
          ocorrencias.map((ocorrencia) => (
            <TouchableOpacity
              key={`${ocorrencia.uidMorador}-${ocorrencia.id}`}
              onPress={() =>
                setExpandedCard(
                  expandedCard === ocorrencia.id ? null : ocorrencia.id
                )
              }
            >
              <Text h6 style={styles.mainTitle}>
                Ocorrençias de Portaria
              </Text>
              <Card
                containerStyle={[
                  styles.card,
                  ocorrencia.status === "Resolvido" && styles.cardResolvido,
                  ocorrencia.status === "Lido" && styles.cardLido,
                ]}
              >
                <View style={styles.header}>
                  <Icon
                    name={
                      expandedCard === ocorrencia.id
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    type="material-community"
                    size={24}
                    color="#FFF"
                  />
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                      {ocorrencia.nomePorteiro}
                    </Text>
                    <View style={styles.statusContainer}>
                      <Text
                        style={[
                          styles.statusText,
                          ocorrencia.status === "Pendente" &&
                            styles.statusPendente,
                          ocorrencia.status === "Lido" && styles.statusLido,
                          ocorrencia.status === "Resolvido" &&
                            styles.statusResolvido,
                        ]}
                      >
                        {ocorrencia.status || "Pendente"}
                      </Text>
                    </View>
                  </View>
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
                          color="#FFD63A"
                        />
                        <Text style={styles.infoText}>
                          Registrado em: {ocorrencia.dataFormatada}
                        </Text>
                      </View>

                  
                      <Divider style={styles.divider} />
                      <View style={styles.titleContainer} >
                            <Text style={styles.titleLabel}>Titulo:</Text>
                                              <Text style={styles.TitleText}>{ocorrencia.titulo || 'Sem descrição'}</Text>

                    
                      </View>

                      <View style={styles.descContainer}>

                        <Text style={styles.descLabel}>Descrição:</Text>
                        <Text style={styles.descText}>
                          {ocorrencia.descricao || "Sem descrição"}
                        </Text>
                      </View>
                      {ocorrencia.comentarios?.length > 0 && (
                        <View style={styles.comentariosContainer}>
                          <Text style={styles.comentariosTitle}>
                            Respostas do Síndico:
                          </Text>
                          {ocorrencia.comentarios
                            .sort((a, b) => b.data - a.data) // Ordena do mais recente para o mais antigo
                            .map((comentario, index) => (
                              <View key={index} style={styles.comentarioItem}>
                                <Text style={styles.comentarioTexto}>
                                  {comentario.texto}
                                </Text>
                                <Text style={styles.comentarioData}>
                                  {formatDateWithTime(comentario.data)} •{" "}
                                  {comentario.autor}
                                </Text>
                              </View>
                            ))}
                        </View>
                      )}
                      {/* <Card.Divider style={styles.divider} /> */}

                      <View style={styles.actionsContainer}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() =>
                            handleMarcarComoLido(
                              ocorrencia.id,
                              ocorrencia.uidMorador
                            )
                          }
                          disabled={
                            ocorrencia.status === "Lido" ||
                            ocorrencia.status === "Resolvido"
                          }
                        >
                          <Icon
                            name={
                              ocorrencia.status === "Lido"
                                ? "check-circle"
                                : "check-circle-outline"
                            }
                            type="material-community"
                            size={30}
                            color={
                              ocorrencia.status === "Lido"
                                ? "#0F98A1"
                                : ocorrencia.status === "Resolvido"
                                ? "#4CD964"
                                : "rgba(255,255,255,0.7)"
                            }
                          />
                          <Text style={styles.actionButtonText}>
                            Marcar como lido
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => abrirModalComentario(ocorrencia)}
                        >
                          <Icon
                            name="comment-text-outline"
                            type="material-community"
                            size={30}
                            color="#0F98A1"
                          />
                          <Text style={styles.actionButtonText}>Comentar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Adicionar Comentário</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Digite seu comentário..."
              placeholderTextColor="#f9f9f9"
              multiline
              numberOfLines={4}
              value={comentario}
              onChangeText={setComentario}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setComentario("");
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={enviarComentario}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // padding: 20,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f9f9f9",
    textAlign: "center",
    marginBottom: 5,
    marginTop: 10,
  },
  loadingText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#0F98A1",
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },

  card: {
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: "96%",
    marginHorizontal: "2%",
    overflow: "hidden",
    marginBottom: 10,
  },
  cardLido: {
    borderLeftWidth: 5,
    borderLeftColor: "#0F98A1",
  },
  cardResolvido: {
    borderLeftWidth: 5,
    borderLeftColor: "#4CD964",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FFF",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPendente: {
    backgroundColor: "rgba(255, 59, 48, 0.2)",
    color: "#FF3B30",
  },
  statusLido: {
    backgroundColor: "rgba(15, 152, 161, 0.2)",
    color: "#4CD964",
    paddingHorizontal: 15,
  },
  statusResolvido: {
    backgroundColor: "rgba(76, 217, 100, 0.2)",
    color: "#4CD964",
  },
  apartamentoText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  divider: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  content: {
    padding: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: "#f9f9f9",
    marginLeft: 10,
    // flex: 1,
  },
  descContainer: {
    marginTop: 12,
  },
  titleContainer: {
    flexDirection: "row",
    marginBottom: 5,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "flex-start",

    
  },
    titleLabel:{
    fontSize: 14,
       color: "#FFD63A",
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 5,
  },
    TitleText: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 5,
    color: "#f9f9f9",
    left: 8
  },
  descLabel: {
    fontSize: 13,
    color: "#FFD63A",
    fontWeight: "bold",
    marginBottom: 5,

  },


  descText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
    textAlign: "justify",
  },

  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 10,
    borderRadius: 10,
    width: "100%",
  },
  actionButton: {
    alignItems: "center",
    width: "45%",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 15,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    padding: 12,
    borderRadius: 6,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  submitButton: {
    backgroundColor: "#0F98A1",
  },
  modalButtonText: {
    fontWeight: "bold",
  },
  comentariosContainer: {
    marginTop: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    width: "100%",
    padding: 10,
  },
  comentariosTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFD63A",
    marginBottom: 8,
  },
  comentarioItem: {
    marginBottom: 10,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  comentarioTexto: {
    fontSize: 14,
    color: "#FFF",
    marginBottom: 5,
  },
  comentarioData: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "right",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: "#FFF",
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#F39C12",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#F39C12",
    fontWeight: "bold",
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: "#0F98A1",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  modalSubmitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default VisualizacaoOcorrenciaSindico;
