import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { ref, onValue} from "firebase/database";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";
import { Card, Text, Divider } from "@rneui/themed";
import { db } from "../../../../database/firebaseConfig";
import GradientLayout from "../../../../../src/Utils/gradiente";
import { formatDateOnly } from "../../../../../src/Utils/hourBrazil";

const EventosAgendados = () => {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);
useEffect(() => {
  const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");
  
  const unsubscribe = onValue(agendamentosRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Nova forma de processar os dados
      const todosAgendamentos = [];
      
      // Iterar sobre cada agendamento diretamente
      Object.keys(data).forEach(agendamentoId => {
        todosAgendamentos.push({
          id: agendamentoId,
          ...data[agendamentoId]
        });
      });

      // Ordenar por data
      todosAgendamentos.sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento));
      setAgendamentos(todosAgendamentos);
    } else {
      setAgendamentos([]);
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);



  if (loading) {
    return (
      <View style={[styles.loadingContainer, styles.container]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando agenda da portaria...</Text>
      </View>
    );
  }

  const getEventIcon = (tipo) => {
    if (!tipo) {
      return (
        <MaterialCommunityIcons
          name="calendar-alert"
          size={20}
          color="#FF5252"
        />
      );
    }

    switch (tipo.toLowerCase()) {
      case "mudança":
        return <FontAwesome name="truck" size={20} color="#FFD700" />;
      case "evento":
        return <MaterialIcons name="wine-bar" size={20} color="#4FC3F7" />;
      default:
        return (
          <MaterialCommunityIcons
            name="calendar-star"
            size={20}
            color="#BA68C8"
          />
        );
    }
  };

  return (
    <GradientLayout style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agendamentos</Text>
        <Ionicons name="calendar" size={24} color="#FFF" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {agendamentos.length > 0 ? (
          agendamentos.map((item) => (
            <Card key={`${item.uid}-${item.id}`} containerStyle={styles.card}>
              <View style={styles.cardHeader}>
                {getEventIcon(item.tipo)}
                <Text style={styles.eventType}>{item.tipo || "Evento"}</Text>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>
                    {formatDateOnly(item.dataEvento)}
                  </Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.cardContent}>
                <View style={styles.infoRowContainer}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="account"
                      size={16}
                      color="#EFF3EA"
                    />
                    <Text style={styles.infoText}>Morador:</Text>
                  </View>
                  <Text style={styles.infoText}>
                    {item.nome || "Não informado"}
                  </Text>
                </View>

                <View style={styles.infoRowContainer}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="home-city"
                      size={16}
                      color="#EFF3EA"
                    />
                    <Text style={styles.infoText}>Apto:</Text>
                  </View>
                  <Text style={styles.infoText}>{item.apartamento}</Text>
                </View>

           

                {item.tipo && item.tipo.toLowerCase() !== "mudança" && (
                  <View style={styles.infoRowContainer}>
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons
                        name="account-group"
                        size={16}
                        color="#EFF3EA"
                      />
                      <Text style={styles.infoText}>Pessoas:</Text>
                    </View>
                    <Text style={styles.infoText}>
                      {item.totalPessoas > 0
                        ? `${item.totalPessoas} pessoas`
                        : "Não informado"}
                    </Text>
                  </View>
                )}
              </View>

         

              <View style={styles.cardFooter}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color="#EFF3EA"
                />
                <Text style={styles.footerText}>
                  Criado em: {formatDateOnly(item.dataCriacao)}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-remove"
              size={50}
              color="#EFF3EA"
            />
            <Text style={styles.emptyText}>Nenhum evento agendado</Text>
            <Text style={styles.emptySubtext}>
              Quando houver eventos, eles aparecerão aqui
            </Text>
          </View>
        )}
      </ScrollView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    marginTop: 15,
    paddingHorizontal: 20,
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    margin: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    width: "94%",
    marginHorizontal: "3%",
    padding: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  eventType: {
    fontSize: 16,
    color: "#EFF3EA",
    fontWeight: "bold",
    marginLeft: 10,
    flex: 1,
  },
  dateBadge: {
    backgroundColor: "rgba(74, 144, 226, 0.2)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  dateBadgeText: {
    fontSize: 12,
    color: "#EFF3EA",
    fontWeight: "500",
  },
  divider: {
    marginVertical: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: 1,
  },
  cardContent: {
    padding: 15,
    paddingBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    // marginBottom: 10,
  },
  infoRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#EFF3EA",
    marginLeft: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderTopWidth: 0.7,
    borderTopColor: "rgba(252, 246, 246, 0.99)",
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(239, 243, 234, 0.7)",
    marginLeft: 5,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "#EFF3EA",
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  emptySubtext: {
    color: "rgba(239, 243, 234, 0.7)",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
  loadingText: {
    color: "#EFF3EA",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  actionButton: {
    alignItems: "center",
    padding: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#EFF3EA",
    marginTop: 4,
  },
});

export default EventosAgendados;
