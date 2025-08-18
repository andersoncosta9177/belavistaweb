import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { db } from "../../../../../database/firebaseConfig";
import { ref, onValue, remove } from "firebase/database";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import GradientLayout from "../../../../../../src/Utils/gradiente";
import { formatDateOnly } from "../../../../../Utils/hourBrazil";

const NormasPublicadas = () => {
  const [normas, setNormas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter();

  // Animação
  const spinValue = new Animated.Value(0);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });



  useEffect(() => {
    const normasRef = ref(db, "DadosBelaVista/administracao/normas");

    const unsubscribe = onValue(normasRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const normasArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        normasArray.sort(
          (a, b) => (b.dataPublicacao || 0) - (a.dataPublicacao || 0)
        );
        setNormas(normasArray);
      } else {
        setNormas([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
      setExpandedId(null);
    } else {
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
      setExpandedId(id);
    }
  };

  function editarNorma(item, e) {
    e.stopPropagation();
    router.push({
      pathname: "/src/pages/sindico/pages/normas/editarNormas",
      params: {
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao,
        sindico: item.sindico,
        dataPublicacao: item.dataPublicacao,
      },
    });
  }

  function deletarNorma(id, e) {
    e.stopPropagation();
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta norma?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const normaRef = ref(
                db,
                `DadosBelaVista/administracao/normas/${id}`
              );
              await remove(normaRef);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir a norma.");
              console.error("Erro ao excluir norma:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  }

  return (
    <GradientLayout>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="gavel" size={28} color="#FFF" />
          </View>
          <Text style={styles.headerTitle}>Normas do Condomínio</Text>
          <Text style={styles.headerSubtitle}>
            Toque em uma norma para ver detalhes
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        ) : normas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="gavel"
              size={60}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.emptyTitle}>Nenhuma norma cadastrada</Text>
            <Text style={styles.emptySubtitle}>
              Clique no botão "+" para adicionar uma nova norma
            </Text>
          </View>
        ) : (
          normas.map((item) => (
            <View key={item.id} style={styles.cardContainer}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => toggleExpand(item.id)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={24}
                      color="#2c3e50"
                    />
                  </View>
                  <View style={styles.cardHeaderContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.titulo}
                    </Text>
                    <Text style={styles.cardDate}>
                      <MaterialIcons
                        name="access-time"
                        size={12}
                        color="#7f8c8d"
                      />{" "}
                      {formatDateOnly(item.dataPublicacao)}
                    </Text>
                  </View>
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={24}
                      color="#2c3e50"
                    />
                  </Animated.View>
                </View>

                {expandedId === item.id && (
                  <View style={styles.expandedContent}>
                    <View style={styles.cardContentContainer}>
                      <Text style={styles.cardContent}>{item.descricao}</Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.authorContainer}>
                        <MaterialIcons
                          name="person"
                          size={16}
                          color="#2c3e50"
                          style={styles.authorIcon}
                        />
                        <View>
                          <Text style={styles.cardAuthor}>{item.sindico}</Text>
                        </View>
                      </View>
                      <Text style={styles.cardRole}>Síndico(a)</Text>

                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton]}
                          onPress={(e) => editarNorma(item, e)}
                        >
                          <MaterialCommunityIcons
                            name="pencil-outline"
                            size={16}
                            color="#FFF"
                          />
                          <Text style={styles.actionText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={(e) => deletarNorma(item.id, e)}
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={16}
                            color="#FFF"
                          />
                          <Text style={styles.actionText}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  header: {
    marginBottom: 25,
    alignItems: "center",
  },
  headerIconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#FFF",
    marginTop: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginTop: 5,
  },
  cardContainer: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardIcon: {
    backgroundColor: "rgba(44, 62, 80, 0.1)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  cardContentContainer: {
    backgroundColor: "rgba(44, 62, 80, 0.05)",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  cardContent: {
    fontSize: 14,
    color: "#34495e",
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,  
  },
  authorIcon: {
    marginRight: 5,
    backgroundColor: "rgba(44, 62, 80, 0.1)",
    padding: 5,
    borderRadius: 15,
  },
  cardAuthor: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    padding: 5,
    textAlign: "center",
  },
  cardRole: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 3,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,

  },
  actionButton: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  editButton: {
    backgroundColor: "#2ecc71",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  actionText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "500",
  },
});

export default NormasPublicadas;
