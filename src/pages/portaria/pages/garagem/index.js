import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView,Alert, Text,Linking, TouchableOpacity, RefreshControl } from 'react-native';
import { Icon, Card } from '@rneui/themed';
import GradientLayout from '../../../../../src/Utils/gradiente';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../database/firebaseConfig";
function VagasDisponiveis({ navigation }) {
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
const [userData, setUserData] = useState(null);
const [telefone, setTelefone] = useState('');
  const db = getDatabase();

  //   useEffect(() => {
  //   const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       const userRef = ref(
  //         db,
  //         `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`
  //       );
  //       get(userRef)
  //         .then((snapshot) => {
  //           if (snapshot.exists()) {
  //             const userData = snapshot.val();
  //             setUserData(userData);
  //             setTelefone(userData.telefone);
  //             console.log("Dados do usuário logado:", userData);
  //           } else {
  //             setLoading(false);
  //           }
  //         })
  //         .catch((error) => {
  //           console.error("Erro ao buscar dados do usuário:", error);
  //           setLoading(false);
  //         });
  //     } else {
  //       setLoading(false);
  //     }
  //   });

  //   return () => unsubscribeAuth();
  // }, []);


const openWhatsApp = (phoneNumber) => {
  if (!phoneNumber) {
    Alert.alert("Erro", "Número de telefone não disponível");
    return;
  }

  const cleaned = phoneNumber.replace(/\D/g, '');
  const phone = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  const url = `https://wa.me/${phone}`;
  
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log("Não é possível abrir o WhatsApp");
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp");
    }
  }).catch(err => {
    console.error("Erro ao abrir WhatsApp:", err);
    Alert.alert("Erro", "Ocorreu um erro ao tentar abrir o WhatsApp");
  });
};
  

  useEffect(() => {
    carregarVagas();
    return () => {
      const vagasRef = ref(db, 'DadosBelaVista/administracao/vagasGaragem');
      off(vagasRef);
    };
  }, []);

  const carregarVagas = () => {
    setLoading(true);
    const vagasRef = ref(db, 'DadosBelaVista/administracao/vagasGaragem');
    
    onValue(vagasRef, (snapshot) => {
      const data = snapshot.val();
      const vagasArray = [];
      
      if (data) {
        Object.keys(data).forEach((key) => {
          if (data[key].status === 'disponível') {
            vagasArray.push({
              id: key,
              ...data[key]
            });
          }
        });
      }
      
      setVagas(vagasArray);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      setRefreshing(false);
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarVagas();
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR').slice(0, 5);
  };

  return (
    <GradientLayout style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F98A1']}
            tintColor="#0F98A1"
          />
        }
      >
        <View style={styles.header}>
          <Icon 
            name="parking" 
            type="font-awesome-5" 
            size={40} 
            color="#0F98A1"
            containerStyle={styles.icon}
          />
          <Text style={styles.title}>Vagas Disponíveis</Text>
          <Text style={styles.subtitle}>Confira as vagas de garagem disponíveis no condomínio</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Icon name="circle-notch" type="font-awesome-5" size={30} color="#FFF" />
            <Text style={styles.loadingText}>Carregando vagas...</Text>
          </View>
        ) : vagas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="car-off" type="material-community" size={50} color="#0F98A1" />
            <Text style={styles.emptyText}>Nenhuma vaga disponível no momento</Text>
            <Text style={styles.emptySubtext}>Quando alguém anunciar uma vaga, ela aparecerá aqui</Text>
          </View>
        ) : (
          vagas.map((vaga) => (
            <Card key={vaga.id} containerStyle={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Vaga de Garagem</Text>
                <View style={styles.valorContainer}>
                  <Text style={styles.valorText}>{vaga.valor}</Text>
                </View>
              </View>
              
              {vaga.observacoes && (
                <View style={styles.observacoesContainer}>
                  <Icon name="info-circle" type="font-awesome" size={16} color="#6c757d" />
                  <Text style={styles.observacoesText}>{vaga.observacoes}</Text>
                </View>
              )}
              
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Icon name="user" type="font-awesome" size={14} color="#6c757d" />
                  <Text style={styles.infoText}>Anunciante: {vaga.nome}</Text>
                </View>
                   <View style={styles.infoRow}>
                  <Icon name="numeric" size={14} type='material-community' color="#6c757d" />
                  <Text style={styles.infoText}>Apartamento: {vaga.apartamento}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="calendar" type="font-awesome" size={14} color="#6c757d" />
                  <Text style={styles.infoText}>Publicado em: {formatarData(vaga.criadoEm)}</Text>
                </View>
              </View>
              
    <TouchableOpacity 
  style={styles.contactButton}
  onPress={() => openWhatsApp(vaga.telefone)} // Mude para vaga.telefone
  activeOpacity={0.7}
>
        <MaterialCommunityIcons name="whatsapp" size={24} color="white" />
        <Text style={styles.contactButtonText}>WhatsApp</Text>
      </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    fontSize: 22,
  },
  subtitle: {
    color: '#FFF',
    opacity: 0.9,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#FFF',
    opacity: 0.8,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F98A1',
  },
  valorContainer: {
    backgroundColor: '#0F98A1',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  valorText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  observacoesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  observacoesText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25D366',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  contactButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F98A1',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default VagasDisponiveis;