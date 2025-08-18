import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  loading,
  Animated
} from "react-native";
import { db } from "../../../../../database/firebaseConfig";
import { remove, ref, onValue } from "firebase/database";
import formatDate from "../../../../../Utils/formateDate";
import { useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import GradientLayout from "../../../../../Utils/gradiente";

const ComunicadoPublicado = () => {
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const comunicadosRef = ref(db, "DadosBelaVista/administracao/comunicados");

    const unsubscribe = onValue(comunicadosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const comunicadosArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          expanded: false,
          animation: new Animated.Value(0)
        }));
        comunicadosArray.sort((a, b) => new Date(b.data) - new Date(a.data));
        setComunicados(comunicadosArray);
      } else {
        setComunicados([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  function editarComunicado(item, e) {
    e.stopPropagation();
    router.push({
      pathname: "/src/pages/sindico/pages/comunicados/editarComunicado",
      params: {
        id: item.id,
        titulo: item.titulo,
        comunicado: item.comunicado,
        nomeSindico: item.nomeSindico,
      },
    });
  }

  function deletarComunicado(id, e) {
    e.stopPropagation();
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este comunicado?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const comunicadoRef = ref(db, `DadosBelaVista/administracao/comunicados/${id}`);
              await remove(comunicadoRef);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o comunicado.");
              console.error("Erro ao excluir comunicado:", error);
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
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="bullhorn" size={28} color="#FFF" />
          </View>
          <Text style={styles.headerTitle}>Comunicados Publicados</Text>
          <Text style={styles.headerSubtitle}>Toque em um comunicado para expandir</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        ) : comunicados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="newspaper-o" size={60} color="rgba(255,255,255,0.7)" />
            <Text style={styles.emptyText}>Nenhum comunicado encontrado</Text>
          </View>
        ) : (
          comunicados.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => toggleExpand(item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons
                    name={expandedId === item.id ? "email-open" : "email"}
                    size={20}
                    color="#2c3e50"
                  />
                </View>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
                  <Text style={styles.cardDate}>{formatDate(item.data)}</Text>
                </View>
                <MaterialCommunityIcons
                  name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#2c3e50"
                />
              </View>
              
              {expandedId === item.id && (
                <View style={styles.expandedContent}>
                  <View style={styles.cardContentContainer}>
                    <Text style={styles.cardContent}>{item.comunicado}</Text>
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
                        <Text style={styles.cardAuthor}>{item.nomeSindico}</Text>
                        <Text style={styles.cardRole}>Síndico(a)</Text>
                      </View>
                    </View>
                    
                    <View style={styles.actions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.editButton]} 
                        onPress={(e) => editarComunicado(item, e)}
                      >
                        <MaterialCommunityIcons
                          name="pencil-outline"
                          size={16}
                          color="#FFF"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]} 
                        onPress={(e) => deletarComunicado(item.id, e)}
                      >
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={16}
                          color="#FFF"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 15,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    backgroundColor: 'rgba(44, 62, 80, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cardContentContainer: {
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  cardContent: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorIcon: {
    marginRight: 8,
    backgroundColor: 'rgba(44, 62, 80, 0.1)',
    padding: 5,
    borderRadius: 15,
  },
  cardAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  cardRole: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2ecc71',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
});

export default ComunicadoPublicado;