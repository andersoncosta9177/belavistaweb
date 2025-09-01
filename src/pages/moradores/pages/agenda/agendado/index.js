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
import formatDate from "../../../../../Utils/formateDate";
import { db } from "../../../../../database/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { ref, remove, get, onValue } from "firebase/database";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";

const Agendamentos = () => {
  const navigation = useNavigation();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apartamentoUsuario, setApartamentoUsuario] = useState(null);
  const [userData, setUserData] = useState(null);

  const auth = getAuth();

  // Função para calcular o valor baseado no número de convidados
  const calcularValor = (convidadosPresentes) => {
    if (!convidadosPresentes) {
      return "0";
    } else if (convidadosPresentes <= 15) {
      return "30";
    } else if (convidadosPresentes <= 30) {
      return "50";
    } else {
      return "70";
    }
  };

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
        hoje.setHours(0, 0, 0, 0);

        if (snapshot.exists()) {
          const promises = [];

          snapshot.forEach((childSnapshot) => {
            const agendamento = childSnapshot.val();

            if (agendamento.apartamento === apartamento) {
              const dataEvento = new Date(agendamento.dataEvento);
              dataEvento.setHours(0, 0, 0, 0);

              if (dataEvento.getTime() >= hoje.getTime()) {
                // Buscar convidados para contar presenças
                const convidadosRef = ref(
                  db,
                  `DadosBelaVista/DadosGerais/Reservas/${childSnapshot.key}/convidados`
                );
                const promise = get(convidadosRef)
                  .then((convidadosSnapshot) => {
                    let convidadosPresentes = 0;

                    if (convidadosSnapshot.exists()) {
                      // Iterar sobre cada convidado
                      convidadosSnapshot.forEach((convidadoSnapshot) => {
                        const convidado = convidadoSnapshot.val();
                        // Verificar se o convidado tem presente: true
                        if (convidado.presente === true) {
                          convidadosPresentes++;
                        }
                      });
                    }

                    // Calcular o valor aqui
                    const valor = calcularValor(convidadosPresentes);

                    return {
                      id: childSnapshot.key,
                      ...agendamento,
                      convidadosPresentes,
                      valor, // Adicionar o valor calculado ao objeto
                    };
                  })
                  .catch((error) => {
                    console.error("Erro ao buscar convidados:", error);
                    const valor = calcularValor(0);
                    return {
                      id: childSnapshot.key,
                      ...agendamento,
                      convidadosPresentes: 0,
                      valor,
                    };
                  });

                promises.push(promise);
              }
            }
          });

          Promise.all(promises).then((agendamentosComConvidados) => {
            // Ordena os eventos por data
            agendamentosComConvidados.sort((a, b) => {
              return (
                new Date(a.dataEvento).getTime() -
                new Date(b.dataEvento).getTime()
              );
            });

            setAgendamentos(agendamentosComConvidados);
            setLoading(false);
          });
        } else {
          setAgendamentos([]);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar agendamentos:", error);
        setLoading(false);
      });
  };
  // Adicionar listener para atualizar em tempo real quando presenças mudarem
  useEffect(() => {
    if (agendamentos.length > 0) {
      const unsubscribeListeners = [];

      agendamentos.forEach((agendamento) => {
        const convidadosRef = ref(
          db,
          `DadosBelaVista/DadosGerais/Reservas/${agendamento.id}/convidados`
        );

        const unsubscribe = onValue(convidadosRef, (snapshot) => {
          let convidadosPresentes = 0;

          if (snapshot.exists()) {
            snapshot.forEach((convidadoSnapshot) => {
              const convidado = convidadoSnapshot.val();
              if (convidado.presente) {
                convidadosPresentes++;
              }
            });
          }

          // Calcular o novo valor
          const novoValor = calcularValor(convidadosPresentes);

          // Atualiza o estado com o novo valor
          setAgendamentos((prev) =>
            prev.map((item) =>
              item.id === agendamento.id
                ? {
                    ...item,
                    convidadosPresentes,
                    valor: novoValor,
                  }
                : item
            )
          );
        });

        unsubscribeListeners.push(unsubscribe);
      });

      return () => {
        unsubscribeListeners.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, [agendamentos]);

  const deleteEvento = (id) => {
    Alert.alert("Confirmação", "Deseja realmente cancelar este agendamento?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Confirmar",
        onPress: () => {
          setAgendamentos((prev) => prev.filter((item) => item.id !== id));
          remove(ref(db, `DadosBelaVista/DadosGerais/Reservas/${id}`)).catch(
            (error) => {
              console.error("Erro ao deletar:", error);
              Alert.alert("Erro", "Falha ao cancelar agendamento");
              buscarAgendamentos(apartamentoUsuario);
            }
          );
        },
      },
    ]);
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
        <div style={styles.container}>
          <ActivityIndicator size="large" color="#EFF3EA" />
          <Text style={styles.loadingText}>
            Carregando seus agendamentos...
          </Text>
        </div>
    );
  }

  return (
      <div style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="calendar" size={24} color="#FFF" />
          <Text style={styles.title}>Próximos Eventos</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {agendamentos.length > 0 ? (
            agendamentos.map((item) => (
              <Card key={item.id} containerStyle={styles.card}>
                <View style={styles.cardHeader}>
                  {getEventIcon(item.tipo)}
                  <Text style={styles.eventType}>{item.tipo}</Text>
                  <View
                    style={[
                      styles.dateBadge,
                      new Date(item.dataEvento).toDateString() ===
                        new Date().toDateString() && styles.todayBadge,
                    ]}
                  >
                    <Text style={styles.dateBadgeText}>
                      {formatDate(item.dataEvento)}
                      {new Date(item.dataEvento).toDateString() ===
                        new Date().toDateString() && " (Hoje)"}
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

                  {/* NOVA LINHA - CONVIDADOS CONFIRMADOS */}
                  {item.tipo.toLowerCase() !== "mudança" &&
                    item.convidadosPresentes > 0 && (
                      <View style={styles.infoRowContainer}>
                        <View style={styles.infoRow}>
                          <MaterialCommunityIcons
                            name="account-check"
                            size={17}
                            color="#14fa1cff"
                          />
                          <Text style={styles.infoText}>Confirmados:</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoText}>
                            {item.convidadosPresentes} pessoa(s)
                          </Text>
                        </View>
                      </View>
                    )}

                  {item.tipo.toLowerCase() !== "mudança" && (
                    <View style={styles.infoRowContainer}>
                      <View style={styles.infoRow}>
                        <MaterialCommunityIcons
                          name="cash"
                          size={16}
                          color="#EFF3EA"
                        />
                        <Text style={styles.infoText}>Valor:</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={[styles.infoText, { fontWeight: "bold" }]}>
                          R$ {item.valor || "0"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Resto do código permanece igual */}
                {item.tipo.toLowerCase() !== "mudança" && (
                  <View style={styles.actionsContainer}>
                    <Link
                      href={`/src/pages/moradores/pages/agenda/termos/?id=${item.id}`}
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
                      href={`/src/pages/moradores/pages/agenda/convidados/?id=${item.id}`}
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
                      onPress={() => deleteEvento(item.id)}
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
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteEvento(item.id)}
                    >
                      <MaterialIcons name="delete" size={24} color="#FF3A30" />
                      <Text style={[styles.actionText, { color: "#FF3A30" }]}>
                        Excluir
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

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
              <Text style={styles.emptyText}>Nenhum evento agendado</Text>
              <Text style={styles.emptySubtext}>
                Não há eventos futuros agendados para o apartamento{" "}
                {apartamentoUsuario}
              </Text>
            </View>
          )}
        </ScrollView>
      </div>
  );
};

// ... (os styles permanecem os mesmos)

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
    backgroundColor: "rgba(0, 0, 0, 0.3)",

    borderWidth: 0.6,
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
  todayBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderColor: "#4CAF50",
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
  dividerRow: {
    marginBottom: 4,
    backgroundColor: "#8e5e30",
    height: 0.1,
    opacity: 0.3,
  },
  cardContent: {
    padding: 14,
    // paddingBottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    // marginBottom: 10,
  },
  infoRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 12,
    justifyContent: "space-between",
    paddingVertical: 6,
    
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 13,
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
    
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginVertical: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
