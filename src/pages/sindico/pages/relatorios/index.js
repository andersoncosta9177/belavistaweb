import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from "react-native";
import { Button, Icon, Card, Badge } from "@rneui/themed";
import GradientLayout from "../../../../Utils/gradiente";
import { db } from "../../../../../src/database/firebaseConfig";
import { ref, onValue, push, remove, update } from "firebase/database";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { Divider } from "@rneui/base";

const { width } = Dimensions.get("window");

const Relatorios = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [relatorioEditando, setRelatorioEditando] = useState(null);
  const [novoRelatorio, setNovoRelatorio] = useState({
    nome: "",
    data: new Date(),
    frequencia: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const RELATORIOS_COLLECTION = "DadosBelaVista/administracao/relatorios";

  // Configurar notificações
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Não podemos enviar notificações sem permissão"
        );
      }
    };
    setupNotifications();
  }, []);

  // Carregar relatórios do Firebase
  useEffect(() => {
    const relatoriosRef = ref(db, RELATORIOS_COLLECTION);

    const unsubscribe = onValue(relatoriosRef, (snapshot) => {
      const data = snapshot.val();
      const relatoriosArray = [];

      if (data) {
        Object.keys(data).forEach((key) => {
          relatoriosArray.push({
            id: key,
            ...data[key],
            data: new Date(data[key].data),
          });
        });

        relatoriosArray.sort((a, b) => b.data - a.data);
      }

      setRelatorios(relatoriosArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Agendar notificações para próximas manutenções
  const agendarNotificacao = async (relatorio) => {
    if (!relatorio.frequencia || isNaN(relatorio.frequencia)) return;

    const proximaData = new Date(relatorio.data);
    proximaData.setMonth(
      proximaData.getMonth() + parseInt(relatorio.frequencia)
    );

    // Cancelar notificação existente se houver
    if (relatorio.id) {
      await Notifications.cancelScheduledNotificationAsync(relatorio.id);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Manutenção Pendente",
        body: `Está na hora de realizar a manutenção: ${relatorio.nome}`,
        data: { relatorioId: relatorio.id },
      },
      trigger: { date: proximaData },
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setNovoRelatorio({ ...novoRelatorio, data: selectedDate });
    }
  };

  const abrirModalEditar = (relatorio) => {
    setRelatorioEditando(relatorio);
    setNovoRelatorio({
      nome: relatorio.nome,
      data: new Date(relatorio.data),
      frequencia: relatorio.frequencia,
    });
    setModalEditarVisible(true);
  };

  const adicionarRelatorio = async () => {
    if (!novoRelatorio.nome || !novoRelatorio.frequencia) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      const relatoriosRef = ref(db, RELATORIOS_COLLECTION);
      const novoRelatorioRef = push(relatoriosRef, {
        nome: novoRelatorio.nome,
        data: novoRelatorio.data.toISOString(),
        frequencia: novoRelatorio.frequencia,
      });

      // Agendar notificação
      await agendarNotificacao({
        id: novoRelatorioRef.key,
        ...novoRelatorio,
      });

      setModalVisible(false);
      setNovoRelatorio({
        nome: "",
        data: new Date(),
        frequencia: "",
      });
    } catch (error) {
      console.error("Erro ao adicionar relatório:", error);
      Alert.alert("Erro", "Não foi possível adicionar o relatório");
    } finally {
      setLoading(false);
    }
  };

  const editarRelatorio = async () => {
    if (!novoRelatorio.nome || !novoRelatorio.frequencia) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      await update(
        ref(db, `${RELATORIOS_COLLECTION}/${relatorioEditando.id}`),
        {
          nome: novoRelatorio.nome,
          data: novoRelatorio.data.toISOString(),
          frequencia: novoRelatorio.frequencia,
        }
      );

      // Agendar nova notificação
      await agendarNotificacao({
        id: relatorioEditando.id,
        ...novoRelatorio,
      });

      setModalEditarVisible(false);
      setNovoRelatorio({
        nome: "",
        data: new Date(),
        frequencia: "",
      });
    } catch (error) {
      console.error("Erro ao editar relatório:", error);
      Alert.alert("Erro", "Não foi possível editar o relatório");
    } finally {
      setLoading(false);
    }
  };

  const marcarComoConcluido = async (relatorio) => {
    Alert.alert(
      "Confirmar Conclusão",
      `Deseja marcar "${relatorio.nome}" como concluído hoje?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setLoading(true);
              const novaData = new Date();
              await update(
                ref(db, `${RELATORIOS_COLLECTION}/${relatorio.id}`),
                {
                  ...relatorio,
                  data: novaData.toISOString(),
                }
              );

              // Agendar nova notificação com a nova data
              await agendarNotificacao({
                id: relatorio.id,
                nome: relatorio.nome,
                data: novaData,
                frequencia: relatorio.frequencia,
              });

              Alert.alert("Sucesso", "Manutenção marcada como concluída!");
            } catch (error) {
              console.error("Erro ao marcar como concluído:", error);
              Alert.alert("Erro", "Não foi possível marcar como concluído");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const removerRelatorio = (id) => {
    Alert.alert("Confirmar", "Deseja realmente remover este relatório?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        onPress: async () => {
          try {
            setLoading(true);
            await remove(ref(db, `${RELATORIOS_COLLECTION}/${id}`));
            // Cancelar notificação agendada
            await Notifications.cancelScheduledNotificationAsync(id);
          } catch (error) {
            console.error("Erro ao remover relatório:", error);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const formatarData = (date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calcularStatusProximaManutencao = (data, frequencia) => {
    if (!frequencia || isNaN(frequencia)) return { status: "N/A", dias: 0 };

    const hoje = new Date();
    const proximaData = new Date(data);
    proximaData.setMonth(proximaData.getMonth() + parseInt(frequencia));

    const diffTime = proximaData - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return { status: "pendente", dias: diffDays };
    } else {
      return { status: "atrasado", dias: Math.abs(diffDays) };
    }
  };

  const formatarProximaManutencao = (data, frequencia) => {
    const status = calcularStatusProximaManutencao(data, frequencia);

    if (status.status === "N/A") return "N/A";

    const proximaData = new Date(data);
    proximaData.setMonth(proximaData.getMonth() + parseInt(frequencia));

    if (status.status === "pendente") {
      return `${formatarData(proximaData)}  (Faltam ${status.dias} dias)`;
    } else {
      return `${formatarData(proximaData)}  (Atrasado ${status.dias} dias)`;
    }
  };

  if (loading && relatorios.length === 0) {
    return (
      <GradientLayout style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F98A1" />
          <Text style={styles.loadingText}>Carregando relatórios...</Text>
        </View>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios de Manutenção</Text>
        <Badge
          value={relatorios.length}
          status="primary"
          badgeStyle={styles.badge}
          textStyle={styles.badgeText}
        />
      </View>

      {/* Lista de Relatórios */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {relatorios.length === 0 ? (
          <Card containerStyle={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Icon
                name="clipboard-text-outline"
                type="material-community"
                size={40}
                color="#0F98A1"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>Nenhum relatório cadastrado</Text>
              <Button
                title="Adicionar Primeiro Relatório"
                buttonStyle={styles.addFirstButton}
                titleStyle={styles.addFirstButtonText}
                onPress={() => setModalVisible(true)}
                icon={
                  <Icon
                    name="plus"
                    type="font-awesome"
                    size={16}
                    color="white"
                    style={{ marginRight: 8 }}
                  />
                }
              />
            </View>
          </Card>
        ) : (
          relatorios.map((relatorio) => (
            <Card key={relatorio.id} containerStyle={styles.relatorioCard}>
              <View style={styles.relatorioHeader}>
                <Icon
                  name="clipboard-list"
                  type="material-community"
                  size={24}
                  color="#43e6f1ff"
                />
                <Text style={styles.relatorioNome}>{relatorio.nome}</Text>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => abrirModalEditar(relatorio)}
                  >
                    <Icon
                      name="pencil-outline"
                      type="material-community"
                      size={20}
                      color="#0F98A1"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removerRelatorio(relatorio.id)}
                  >
                    <Icon
                      name="trash-can-outline"
                      type="material-community"
                      size={20}
                      color="#FF5252"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Divider style={styles.divider} />

              <View style={styles.relatorioInfo}>
                <View style={styles.infoItem}>
                  <Icon
                    name="calendar"
                    type="material-community"
                    size={16}
                    color="#43e6f1ff"
                  />
                  <Text style={styles.infoText}>
                    Realizado em:
                  </Text>
                   <Text style={styles.infoText}>
                     {formatarData(relatorio.data)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Icon
                    name="calendar-clock"
                    type="material-community"
                    size={16}
                    color="#43e6f1ff"
                  />
                  <Text style={styles.infoText}>
                    Frequência:
                  </Text>
                     <Text style={styles.infoText}>
                     {relatorio.frequencia} meses
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Icon
                    name="bell-outline"
                    type="material-community"
                    size={16}
                    color="#43e6f1ff"
                  />
                    
                  <Text style={styles.infoText}>Próxima:</Text>
                    <Text
                      style={[
                        calcularStatusProximaManutencao(
                          relatorio.data,
                          relatorio.frequencia
                        ).status === "atrasado"
                          ? styles.statusAtrasado
                          : styles.statusPendente,
                      ]}
                    >
                      {formatarProximaManutencao(
                        relatorio.data,
                        relatorio.frequencia
                      )}
                    </Text>
                </View>
              </View>

              {calcularStatusProximaManutencao(
                relatorio.data,
                relatorio.frequencia
              ).status === "atrasado" && (
                <Button
                  title="Marcar como Concluído"
                  buttonStyle={styles.concluidoButton}
                  titleStyle={styles.concluidoButtonText}
                  onPress={() => marcarComoConcluido(relatorio)}
                  icon={
                    <Icon
                      name="check-circle-outline"
                      type="material-community"
                      size={20}
                      color="#FFF"
                      style={{ marginRight: 8 }}
                    />
                  }
                />
              )}
            </Card>
          ))
        )}
      </ScrollView>

      {/* Botão Flutuante para Adicionar */}
      {relatorios.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setModalVisible(true)}
          disabled={loading}
        >
          <LinearGradient
            colors={["#0F98A1", "#0FBBA6"]}
            style={styles.floatingButtonGradient}
          >
            <Icon name="plus" type="font-awesome" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Modal de Adição */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !loading && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Icon
                name="clipboard-plus"
                type="material-community"
                size={24}
                color="#FFF"
              />
              <Text style={styles.modalTitle}>Novo Relatório</Text>
            </View>

            <View style={styles.inputContainer}>
              <Icon
                name="clipboard-text-outline"
                type="material-community"
                size={20}
                color="#FFF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nome do serviço"
                placeholderTextColor="#DDD"
                value={novoRelatorio.nome}
                onChangeText={(text) =>
                  setNovoRelatorio({ ...novoRelatorio, nome: text })
                }
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon
                name="calendar"
                type="material-community"
                size={20}
                color="#FFF"
                style={styles.inputIcon}
              />
              <Text style={[styles.input, { color: "#FFF" }]}>
                {formatarData(novoRelatorio.data)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={novoRelatorio.data}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.inputContainer}>
              <Icon
                name="calendar-refresh"
                type="material-community"
                size={20}
                color="#FFF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Frequência (meses)"
                placeholderTextColor="#DDD"
                value={novoRelatorio.frequencia}
                onChangeText={(text) =>
                  setNovoRelatorio({
                    ...novoRelatorio,
                    frequencia: text.replace(/[^0-9]/g, ""),
                  })
                }
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => !loading && setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={adicionarRelatorio}
                disabled={
                  loading || !novoRelatorio.nome || !novoRelatorio.frequencia
                }
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Adicionar</Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalEditarVisible}
        onRequestClose={() => !loading && setModalEditarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["#4568DC", "#B06AB3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Icon
                name="clipboard-edit-outline"
                type="material-community"
                size={24}
                color="#FFF"
              />
              <Text style={styles.modalTitle}>Editar Relatório</Text>
            </View>

            <View style={styles.inputContainer}>
              <Icon
                name="clipboard-text-outline"
                type="material-community"
                size={20}
                color="#FFF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nome do serviço"
                placeholderTextColor="#DDD"
                value={novoRelatorio.nome}
                onChangeText={(text) =>
                  setNovoRelatorio({ ...novoRelatorio, nome: text })
                }
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon
                name="calendar"
                type="material-community"
                size={20}
                color="#FFF"
                style={styles.inputIcon}
              />
              <Text style={[styles.input, { color: "#FFF" }]}>
                {formatarData(novoRelatorio.data)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={novoRelatorio.data}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.inputContainer}>
              <Icon
                name="calendar-refresh"
                type="material-community"
                size={20}
                color="#FFF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Frequência (meses)"
                placeholderTextColor="#DDD"
                value={novoRelatorio.frequencia}
                onChangeText={(text) =>
                  setNovoRelatorio({
                    ...novoRelatorio,
                    frequencia: text.replace(/[^0-9]/g, ""),
                  })
                }
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => !loading && setModalEditarVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editarRelatorio}
                disabled={
                  loading || !novoRelatorio.nome || !novoRelatorio.frequencia
                }
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
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
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 10,
    backgroundColor: "rgba(15, 152, 161, 0.2)",
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#FFF",
    fontWeight: "500",
    fontSize: 18,
    marginBottom: 5,
    textAlign: "center",
  },
  badge: {
    backgroundColor: "#0B1D51",
    height: 28,
    minWidth: 28,
    borderRadius: 14,
    borderWidth: 0,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  relatorioCard: {
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    paddingVertical: 15,
    overflow: "hidden",
    width: "96%",
    marginHorizontal: "2%",
    marginBottom: 15,
  },
  relatorioHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  relatorioNome: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginLeft: 10,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 5,
    marginRight: 5,
  },
  deleteButton: {
    padding: 5,
  },
  relatorioInfo: {
    marginTop: 10,
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#f5f5f5",
    marginLeft: 8,
  },
  concluidoButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginTop: 10,
  },
  concluidoButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyCard: {
    borderRadius: 10,
    marginHorizontal: "2%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: "96%",
    paddingVertical: 18,
    overflow: "hidden",
  },
  emptyContent: {
    alignItems: "center",
    marginVertical: 10,
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyText: {
    color: "#f5f5f5",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  addFirstButton: {
    backgroundColor: "#0F98A1",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addFirstButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  floatingButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContainer: {
    width: "94%",
    marginHorizontal: "3%",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFF",
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    height: "100%",
    textAlignVertical: "center",
    includeFontPadding: false,
    paddingVertical: 0,
  },
  inputIcon: {
    marginRight: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "#FFF",
  },
  saveButton: {
    backgroundColor: "#0F98A1",
    borderWidth: 0.4,
    borderColor: "#FFF",
  },
  cancelButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    color: "#f5f5f5",
    fontSize: 16,
  },
  statusAtrasado: {
    color: "orange", 
    marginLeft: 20,
    fontSize: 11,
    fontStyle: "italic"
  },
  statusPendente: {
    color: "#52f321ff", // Azul
    left: 20,
    fontSize: 11,
    fontStyle: "italic"
  },
});

export default Relatorios;
