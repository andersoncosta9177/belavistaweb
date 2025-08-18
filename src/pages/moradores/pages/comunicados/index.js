import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Easing
} from "react-native";
import { db } from "../../../../database/firebaseConfig";
import { remove, ref, onValue } from "firebase/database";
import formatDate from "../../../../../src/Utils/formateDate";
import { useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import GradientLayout from "../../../../../src/Utils/gradiente";

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

 

  return (
    <GradientLayout>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comunicados Publicados</Text>
          <Text style={styles.headerSubtitle}>Toque em um comunicado para expandir</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        ) : comunicados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="email-newsletter" size={60} color="rgba(255,255,255,0.5)" />
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
                  <Text style={styles.cardContent}>{item.comunicado}</Text>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardAuthor}>{item.nomeSindico}</Text>
                    <Text style={styles.cardRole}>Síndico(a)</Text>
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
    marginBottom: 20,
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
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
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
  cardHeaderContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
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
  cardContent: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginRight: 5,
  },
  cardRole: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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

export default ComunicadoPublicado;