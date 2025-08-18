import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Pressable,
} from "react-native";
import { Card, Text, Icon, Button, Divider } from "@rneui/themed";
import GradientLayout from "../../../../../src/Utils/gradiente";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ref,
  push,
  set,
  get,
  update,
  remove,
  query as dbQuery,
  orderByChild,
} from "firebase/database";
import { db } from "../../../../database/firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";

const { width } = Dimensions.get("window");

function Transparencia() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentGasto, setCurrentGasto] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    servico: "",
    valor: "",
    empresa: "",
    data: new Date().toLocaleDateString("pt-BR"),
  });

  const TRANSPARENCIA_COLLECTION = "DadosBelaVista/administracao/transparencia";

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        setLoading(true);
        const gastosRef = ref(db, TRANSPARENCIA_COLLECTION);
        const q = dbQuery(gastosRef, orderByChild("data"));

        const snapshot = await get(q);

        if (snapshot.exists()) {
          const gastosData = [];
          snapshot.forEach((childSnapshot) => {
            gastosData.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            });
          });

          // Ordenar por data de forma segura
          gastosData.sort((a, b) => {
            try {
              const dateA = new Date(a.data.split("/").reverse().join("-"));
              const dateB = new Date(b.data.split("/").reverse().join("-"));
              return dateB - dateA;
            } catch (e) {
              return 0;
            }
          });

          setGastos(gastosData);
        } else {
          setGastos([]);
        }
      } catch (error) {
        console.error("Erro ao buscar gastos:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados");
        setGastos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGastos();
  }, []);

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num)
      ? "R$ 0,00"
      : num.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
  };

  const calcularTotal = () => {
    return gastos.reduce((total, gasto) => {
      const valor = parseFloat(gasto.valor) || 0;
      return total + valor;
    }, 0);
  };



  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setFormData({
        ...formData,
        data: selectedDate.toLocaleDateString("pt-BR"),
      });
    }
  };




  if (loading && gastos.length === 0) {
    return (
      <GradientLayout style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout style={styles.container}>
      <View style={styles.header}>
        <Text h4 style={styles.title}>
          Transparência
        </Text>
        <Text style={styles.subtitle}>Gestão Financeira</Text>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Icon
              name="receipt"
              type="material-community"
              size={24}
              color="#FFF"
            />
            <Text style={styles.summaryValue}>{gastos.length}</Text>
            <Text style={styles.summaryLabel}>Gastos</Text>
          </View>

          <View style={styles.summaryCard}>
            <Icon
              name="cash"
              type="material-community"
              size={24}
              color="#FFF"
            />
            <Text style={styles.summaryValue}>
              {formatCurrency(calcularTotal())}
            </Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {gastos.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="folder-open"
              type="font-awesome"
              size={48}
              color="#FFF"
            />
            <Text style={styles.emptyText}>Nenhum gasto registrado</Text>
          </View>
        ) : (
          gastos.map((gasto) => (
            <Card key={gasto.id} containerStyle={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.serviceText}>{gasto.servico}</Text>
                <Text style={styles.valueText}>
                  {formatCurrency(gasto.valor)}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Icon
                    name="business"
                    type="material"
                    size={16}
                    color="#f9f9f9"
                  />
                  <Text style={styles.infoText}>{gasto.empresa}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon
                    name="event"
                    type="material"
                    size={16}
                    color="#f9f9f9"
                  />
                  <Text style={styles.infoText}>{gasto.data}</Text>
                </View>
              </View>

          
            </Card>
          ))
        )}
      </ScrollView>

    
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    color: "#f9f9f9",
    fontWeight: "bold",
    fontSize: 23,
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    width: "100%",
  },
  summaryCard: {
    alignItems: "center",
     backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fundo semi-transparente
    borderRadius: 12,
    padding: 15,
    width: "45%",
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
       borderRadius: 12,
    padding: 15,
    margin: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fundo semi-transparente
    elevation: 0, // Remove sombra no Android
    shadowColor: 'transparent', // Remove sombra no iOS
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
        width: 0,
        height: 0,
    },
    borderColor: 'transparent', // Garante que não há borda
    overflow: 'hidden',
    width: '96%',
    marginHorizontal: '2%',
    marginBottom: 15
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    flex: 1,
  },
  valueText: {
    fontWeight: "bold",
    color: "#A4DD00",
    fontSize: 16,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    height: 1,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#f7f7f7",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  floatingButton: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0F98A1",
    justifyContent: "center",
    alignItems: "center",
    bottom: 20,
    right: 20,
    elevation: 5,
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
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: "#FFF",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: "rgba(236, 10, 10, 0.2)",
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
    marginRight: 10,
    width: "45%",
  },
  saveButton: {
    backgroundColor: "#0F98A1",
    borderRadius: 8,
    paddingVertical: 12,
    flex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 15,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#F39C12",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#F39C12",
    fontWeight: "bold",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#0F98A1",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    color: "#FFF",
    fontSize: 18,
    marginTop: 15,
  },
});

export default Transparencia;
