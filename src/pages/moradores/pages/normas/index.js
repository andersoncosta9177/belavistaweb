import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet
} from "react-native";
import { db } from "../../../../database/firebaseConfig";
import { ref, onValue, remove } from "firebase/database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import GradientLayout from "../../../../../src/Utils/gradiente";

const NormasPublicadas = () => {
  const [normas, setNormas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter();

  // Função para formatar a data
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const normasRef = ref(db, "DadosBelaVista/administracao/normas");

    const unsubscribe = onValue(normasRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const normasArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        normasArray.sort((a, b) => (b.dataPublicacao || 0) - (a.dataPublicacao || 0));
        setNormas(normasArray);
      } else {
        setNormas([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
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
        dataPublicacao: item.dataPublicacao
      },
    });
  }


  return (
    <GradientLayout>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Normas Publicadas</Text>
          <Text style={styles.headerSubtitle}>Toque em uma norma para expandir</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        ) : normas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="gavel" size={60} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyText}>Nenhuma norma encontrada</Text>
          </View>
        ) : (
          normas.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => toggleExpand(item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
                </View>
                <MaterialCommunityIcons
                  name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#2c3e50"
                />
              </View>
              
              {expandedId === item.id && (
                <View style={styles.expandedContent}>
                  <Text style={styles.cardContent}>{item.descricao}</Text>
                  
                  <View style={styles.cardFooter}>
                    <View style={styles.authorContainer}>
                      <Text style={styles.cardAuthor}>{item.sindico}</Text>
                      <Text style={styles.cardRole}>Síndico(a)</Text>
                      <Text style={styles.cardDate}>{formatDate(item.dataPublicacao)}</Text>
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
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
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
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '94%',
    marginHorizontal: '3%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cardContent: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
    marginBottom: 15,
    textAlign: 'left',
  },
  cardFooter: {
    marginBottom: 15,
    alignItems: 'center',
  },
  authorContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  cardAuthor: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
    borderBottomWidth: 0.6,
    borderBottomColor: '#2c3e50',
  },

  cardRole: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#2c3e50',
  },
});

export default NormasPublicadas;