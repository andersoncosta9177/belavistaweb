import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Card, Text, Divider } from "@rneui/themed";
import FormateDate from "../../../../../Utils/formateDate";
import { db } from "../../../../../database/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { ref, query, orderByChild, equalTo, onValue, remove,get } from "firebase/database";

import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import GradientLayout from "../../../../../Utils/gradiente";

const Agendamentos = () => {
  const navigation = useNavigation();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idMorador, setIdMorador] = useState(null);
  const [apartamentoUsuario, setApartamentoUsuario] = useState("");
  const [dadosUsuario, setDadosUsuario] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert("Erro", "Usuário não autenticado");
          setLoading(false);
          return;
        }

        const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setApartamentoUsuario(userData.apartamento || "");
          fetchAgendamentos(userData.apartamento);
        } else {
          Alert.alert("Aviso", "Seus dados não foram encontrados");
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        Alert.alert("Erro", "Falha ao carregar seus dados");
        setLoading(false);
      }
    };

    const fetchAgendamentos = (apartamento) => {
      try {
        const reservasRef = ref(db, 'DadosBelaVista/DadosGerais/Reservas');
        const queryRef = query(
          reservasRef,
          orderByChild('apartamento'),
          equalTo(apartamento)
        );

        const unsubscribe = onValue(queryRef, (snapshot) => {
          const data = snapshot.val();
          const agendamentosArray = [];

          if (data) {
            Object.keys(data).forEach(key => {
              agendamentosArray.push({
                id: key,
                ...data[key]
              });
            });

            // Filtra por datas futuras
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const agendamentosFiltrados = agendamentosArray.filter(item => {
              if (!item.dataEvento) return false;
              
              const [ano, mes, dia] = item.dataEvento.split("-").map(Number);
              const dataEvento = new Date(ano, mes - 1, dia);
              
              return dataEvento >= hoje;
            });

            // Ordena por data
            agendamentosFiltrados.sort((a, b) => 
              new Date(a.dataEvento) - new Date(b.dataEvento));

            setAgendamentos(agendamentosFiltrados);
          } else {
            setAgendamentos([]);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        Alert.alert("Erro", "Falha ao carregar agendamentos");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);


 const deleteEvento = (id) => {
    Alert.alert(
      "Confirmação",
      "Deseja realmente cancelar este agendamento?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: () => {
            // Atualização otimista
            setAgendamentos(prev => prev.filter(item => item.id !== id));
            
            // Exclusão no Firebase
            remove(ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}`))
              .catch(error => {
                console.error("Erro ao deletar:", error);
                Alert.alert("Erro", "Falha ao cancelar agendamento");
                // Recarrega os dados se falhar
                fetchAgendamentos(apartamentoUsuario);
              });
          },
        },
      ]
    );
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
      <GradientLayout style={styles.container}>
        <ActivityIndicator size="large" color="#EFF3EA" />
        <Text style={styles.loadingText}>Carregando seus agendamentos...</Text>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus agendamentos</Text>
        <Ionicons name="calendar" size={24} color="#FFF" />
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

              {item.tipo.toLowerCase() !== "mudança" && (
                <View style={styles.actionsContainer}>
                  <Link
                    href={`/pages/portaria/pages/termos?id=${item.id}`}
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
                    href={`/pages/portaria/pages/convidados?id=${item.id}`}
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

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteEvento(item.id, item.userId)}
                    >
                      <MaterialIcons name="delete" size={24} color="#FF3A30" />
                      <Text style={[styles.actionText, { color: "#FF3A30" }]}>
                        Excluir
                      </Text>
                    </TouchableOpacity>
                  
                </View>
              )}

              {item.tipo.toLowerCase() === "mudança" && (
                <View style={styles.actionsContainer}>
                  {item.userId === idMorador && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteEvento(item.id, item.userId)}
                    >
                      <MaterialIcons name="delete" size={24} color="#FF3A30" />
                      <Text style={[styles.actionText, { color: "#FF3A30" }]}>
                        Excluir
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

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
              Não há eventos agendados para o apartamento {apartamentoUsuario}
            </Text>
          </View>
        )}
      </ScrollView>
    </GradientLayout>
  );
};

// ... (os estilos permanecem os mesmos)


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
    alignItems: "center",
    width: "100%",
    marginVertical: 1,
  },
  actionButton: {
    alignItems: "center",
    padding: 4,
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    color: "#EFF3EA",
    marginTop: 4,
  },
});

export default Agendamentos;