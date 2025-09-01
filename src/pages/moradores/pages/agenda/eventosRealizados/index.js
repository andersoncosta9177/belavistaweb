import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Card, Text, Divider } from "@rneui/themed";
import formatDate from "../../../../../Utils/formateDate";
import { db } from "../../../../../database/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import GradientLayout from "../../../../../Utils/gradiente";
import { ThemeProvider } from "../../../../../context/ThemeContext";

const EventosRealizados = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apartamentoUsuario, setApartamentoUsuario] = useState(null);
  const [userData, setUserData] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(
          db,
          `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`
        );
        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              setUserData(userData);
              setApartamentoUsuario(userData.apartamento);
              buscarAgendamentos(userData.apartamento);
            } else {
              setLoading(false);
            }
          })
          .catch((error) => {
            console.error("Erro ao buscar dados do usuário:", error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const buscarAgendamentos = (apartamento) => {
    if (!apartamento) {
      setLoading(false);
      return;
    }

    const agendamentosRef = ref(db, "DadosBelaVista/DadosGerais/Reservas");
    setLoading(true);

    get(agendamentosRef)
      .then((snapshot) => {
        const agendamentosData = [];
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Define para início do dia
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const agendamento = childSnapshot.val();
            
            // Verifica se o evento é para o apartamento do usuário
            if (agendamento.apartamento === apartamento) {
              const dataEvento = new Date(agendamento.dataEvento);
              dataEvento.setHours(0, 0, 0, 0); // Define para início do dia
              
              // Verifica se o evento já passou
              if (dataEvento < hoje) {
                agendamentosData.push({
                  id: childSnapshot.key,
                  ...agendamento
                });
              }
            }
          });
          
          // Ordena os eventos por data (mais recentes primeiro)
          agendamentosData.sort((a, b) => {
            return new Date(b.dataEvento) - new Date(a.dataEvento);
          });
        }
        setAgendamentos(agendamentosData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar agendamentos:", error);
        setLoading(false);
      });
  };

  const getEventIcon = (tipo) => {
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

  if (loading || !apartamentoUsuario) {
    return (
     <ThemeProvider>
       <GradientLayout style={styles.container}>
        <ActivityIndicator size="large" color="#EFF3EA" />
        <Text style={styles.loadingText}>Carregando eventos realizados...</Text>
      </GradientLayout>
     </ThemeProvider>
    );
  }

  return (
 <ThemeProvider>
     <GradientLayout style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time" size={24} color="#FFF" />
        <Text style={styles.title}>Eventos Realizados</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {agendamentos.length > 0 ? (
          agendamentos.map((item) => (
            <Card key={item.id} containerStyle={styles.card}>
              <View style={styles.cardHeader}>
                {getEventIcon(item.tipo)}
                <Text style={styles.eventType}>{item.tipo}</Text>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>
                    {formatDate(item.dataEvento)}
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
                    <Text style={styles.infoText}>Nome:</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoText}>
                      {item.nome || "Não informado"}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRowContainer}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="numeric"
                      size={16}
                      color="#EFF3EA"
                    />
                    <Text style={styles.infoText}>CPF</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoText}>{item.cpf}</Text>
                  </View>
                </View>
                <View style={styles.infoRowContainer}>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="home-city"
                      size={16}
                      color="#EFF3EA"
                    />
                    <Text style={styles.infoText}> Apto:</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoText}>{item.apartamento}</Text>
                  </View>
                </View>

                {item.tipo.toLowerCase() !== "mudança" && (
                  <View style={styles.infoRowContainer}>
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons
                        name="account-group"
                        size={16}
                        color="#EFF3EA"
                      />
                      <Text style={styles.infoText}>Total pessoas:</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>
                        {item.totalPessoas > 0
                          ? `${item.totalPessoas} pessoas`
                          : "Não informado"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
               <View style={styles.footerTextContainer}>
                 <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color="#EFF3EA"
                />
                <Text style={styles.footerText}>
                  Criado em: {formatDate(item.dataCriacao)}
                </Text>
               </View>

               <View style={styles.footerTextContainer}>
                 {item.criadoPor === "Portaria" && (
                  <>
                  <MaterialCommunityIcons
                  name="calendar-check"
                  size={14}
                  color="#EFF3EA"
                />
                    <Text style={styles.footerText}>
                      Obs: agendado na portaria
                    </Text>
                  </>
                )}
               </View>
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
            <Text style={styles.emptyText}>Nenhum evento realizado</Text>
            <Text style={styles.emptySubtext}>
              Não há eventos passados registrados para o apartamento {apartamentoUsuario}
            </Text>
          </View>
        )}
      </ScrollView>
    </GradientLayout>
 </ThemeProvider>
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
    fontSize: 20,
    fontWeight: "condensedBold",
    marginLeft: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 0.8,
    borderColor: "rgba(255, 255, 255, 0.6)",
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
    backgroundColor: "rgba(121, 85, 72, 0.3)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#795548",
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
    paddingVertical: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
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
    borderTopColor: "rgba(252, 246, 246, 0.6)",
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    justifyContent: "space-between",
  },
  footerTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 10,
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
});

export default EventosRealizados;