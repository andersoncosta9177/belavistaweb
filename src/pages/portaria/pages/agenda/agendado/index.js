import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { ref, onValue, remove } from "firebase/database";
import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";
import { Card, Text, Divider } from "@rneui/themed";
import { db } from "../../../../../database/firebaseConfig";
import GradientLayout from "../../../../../../src/Utils/gradiente";
import { Link } from "expo-router";
import FormateDate from "../../../../../../src/Utils/formateDate";

const EventosAgendados = () => {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    // Buscar todos os agendamentos da portaria
    const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");
    
    const unsubscribe = onValue(agendamentosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Processar todos os agendamentos
        const todosAgendamentos = [];
        
        // Iterar sobre cada agendamento
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

  const deleteEvento = (eventoId) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este evento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: () => {
            const eventoRef = ref(db, `DadosBelaVista/DadosGerais/Reservas/${eventoId}`);
            
            remove(eventoRef)
              .then(() => {
                setAgendamentos(prev => prev.filter(e => e.id !== eventoId));
              })
              .catch((error) => {
                Alert.alert("Erro", "Ocorreu um erro ao excluir o evento.");
                console.error(error);
              });
          },
        },
      ]
    );
  };


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
                    {FormateDate(item.dataEvento)}
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

              <View style={styles.actionsContainer}>
                {item.tipo && item.tipo.toLowerCase() !== "mudança" && (
                  <>
                    <Link
                      href={`/pages/portaria/pages/termos?id=${item.id}&uid=${item.uid}`}
                      asChild
                    >
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialCommunityIcons
                          name="file-document"
                          size={24}
                          color="#EFF3EA"
                        />
                        <Text style={styles.actionText}>Termo</Text>
                      </TouchableOpacity>
                    </Link>

                    <Link
                      href={`/pages/portaria/pages/convidados?id=${item.id}&uid=${item.uid}`}
                      asChild
                    >
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialCommunityIcons
                          name="account-group"
                          size={24}
                          color="#EFF3EA"
                        />
                        <Text style={styles.actionText}>Convidados</Text>
                      </TouchableOpacity>
                    </Link>
                  </>
                )}

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteEvento(item.id, item.uid)}
                >
                  <MaterialIcons name="delete" size={24} color="#FF3A30" />
                  <Text style={[styles.actionText, { color: "#FF3A30" }]}>
                    Excluir
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardFooter}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color="#EFF3EA"
                />
                <Text style={styles.footerText}>
                  Criado em: {FormateDate(item.dataCriacao)}
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
    marginBottom: 10,
  },
  infoRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
    paddingVertical: 7,
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
