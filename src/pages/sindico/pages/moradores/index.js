import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
  Linking,
  Alert,
  Platform
} from "react-native";
import { Avatar, Text, Card, Icon, Badge, Divider } from "@rneui/themed";
import { ref, onValue } from "firebase/database";
import { db } from "../../../../database/firebaseConfig";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import GradientLayout from "../../../../Utils/gradiente";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get("window");

const PerfilMorador = () => {
  const [loading, setLoading] = useState(true);
  const [moradores, setMoradores] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMorador, setSelectedMorador] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  // Dados estáticos de exemplo para o modal
  const staticData = {
    telefone: "(11) 98765-4321",
    moradores: ["Maria Silva", "João Silva", "Pedro Silva (filho)"],
    veiculos: ["ABC-1234 (Toyota Corolla)", "XYZ-5678 (Honda Civic)"],
    observacoes: "Entregas devem ser deixadas na portaria",
    emergencia: "(11) 91234-5678 (Carlos - irmão)",
  };

  const buscarMoradores = () => {
    const moradoresRef = ref(db, "DadosBelaVista/usuarios/usuarioMorador");
    onValue(moradoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listaMoradores = Object.keys(data).map((id) => ({
          id: id,
          nome: data[id].nome || "Não informado",
          apartamento: data[id].apartamento || "Não informado",
          telefone: data[id].telefone || "Não informado",
          avatar: data[id].fotoPerfil || null,
        }));
        setMoradores(listaMoradores);
      } else {
        setMoradores([]);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    buscarMoradores();
  }, []);

  const filteredMoradores = moradores.filter(
    (morador) =>
      morador.nome.toLowerCase().includes(search.toLowerCase()) ||
      morador.apartamento.toLowerCase().includes(search.toLowerCase())
  );

  const openMoradorDetails = (morador) => {
    setSelectedMorador(morador);
    setModalVisible(true);
  };

  const handleWhatsAppPress = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === "Não informado") {
      Alert.alert("Atenção", "Número de telefone não disponível");
      return;
    }
    
    // Remove caracteres não numéricos
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanNumber}`;
    
    Linking.openURL(url).catch(err => {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp");
      console.error("Erro ao abrir WhatsApp:", err);
    });
  };

  const handleCallPress = (phoneNumber) => {
    if (!phoneNumber || phoneNumber === "Não informado") {
      Alert.alert("Atenção", "Número de telefone não disponível");
      return;
    }
    
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(err => {
      Alert.alert("Erro", "Não foi possível realizar a chamada");
      console.error("Erro ao chamar:", err);
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['rgba(15, 152, 161, 0.3)', 'rgba(11, 29, 81, 0.5)']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          {item.avatar ? (
            <Avatar
              size={60}
              rounded
              source={{ uri: item.avatar }}
              containerStyle={styles.avatar}
            />
          ) : (
            <Avatar
              size={60}
              rounded
              icon={{
                name: "account",
                type: "material-community",
                color: "#fff",
              }}
              containerStyle={[styles.avatar, { backgroundColor: "#0F98A1" }]}
            />
          )}
          <View style={styles.headerText}>
            <Text style={styles.nome} numberOfLines={1}>
              {item.nome}
            </Text>
            <View style={styles.apartamentoContainer}>
              <MaterialCommunityIcons name="home" size={16} color="#32b5beff" />
              <Text style={styles.apartamento}>Apto {item.apartamento}</Text>
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.detailsButton]}
            onPress={() => openMoradorDetails(item)}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#FFF"
            />
            <Text style={styles.actionButtonText}>Detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.whatsappButton]}
            onPress={() => handleWhatsAppPress(item.telefone)}
          >
            <FontAwesome name="whatsapp" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <GradientLayout style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F98A1" />
        <Text style={styles.loadingText}>Carregando moradores...</Text>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout style={styles.container} scrollEnabled={false}>
      <View style={styles.headerContainer}>
        <Text h4 style={styles.headerTitle}>
           Moradores
        </Text>
        <Badge
          value={moradores.length}
          status="primary"
          badgeStyle={styles.countBadge}
          textStyle={styles.badgeText}
        />
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={20} 
          color="#f5f5f5" 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar por nome ou apartamento..."
          placeholderTextColor="rgba(245,245,245,0.7)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredMoradores}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="account-multiple"
              size={50}
              color="#EDE9D5"
            />
            <Text style={styles.emptyText}>Nenhum morador encontrado</Text>
          </View>
        }
      />

      {/* Modal de Detalhes do Morador */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#0F98A1', '#0B1D51']}
              style={styles.modalGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" type="material" color="#FFF" size={24} />
              </TouchableOpacity>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {selectedMorador && (
                  <>
                    <View style={styles.modalHeader}>
                      {selectedMorador.avatar ? (
                        <Avatar
                          size={100}
                          rounded
                          source={{ uri: selectedMorador.avatar }}
                          containerStyle={styles.modalAvatar}
                        />
                      ) : (
                        <Avatar
                          size={100}
                          rounded
                          icon={{
                            name: "account",
                            type: "material-community",
                            color: "#fff",
                          }}
                          containerStyle={[
                            styles.modalAvatar,
                            { backgroundColor: "#0F98A1" },
                          ]}
                        />
                      )}
                      <Text style={styles.modalNome}>{selectedMorador.nome}</Text>
                      <View style={styles.modalApartamentoContainer}>
                        <MaterialCommunityIcons name="home" size={20} color="#FFF" />
                        <Text style={styles.modalApartamento}>
                          Apartamento {selectedMorador.apartamento}
                        </Text>
                      </View>
                    </View>

                    <Divider style={styles.modalDivider} />

                    <View style={styles.infoSection}>
                      <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="phone" size={20} color="#FFF" />
                        <Text style={styles.sectionTitle}>
                          Informações de Contato
                        </Text>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                          <MaterialCommunityIcons name="phone-outline" size={20} color="#0F98A1" />
                        </View>
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Telefone Principal</Text>
                          <View style={styles.phoneActions}>
                            <Text style={styles.infoText}>{staticData.telefone}</Text>
                            <TouchableOpacity 
                              style={styles.callButton}
                              onPress={() => handleCallPress(staticData.telefone)}
                            >
                              <MaterialCommunityIcons name="phone" size={16} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                          <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#0F98A1" />
                        </View>
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Contato de Emergência</Text>
                          <View style={styles.phoneActions}>
                            <Text style={styles.infoText}>{staticData.emergencia}</Text>
                            <TouchableOpacity 
                              style={styles.callButton}
                              onPress={() => handleCallPress(staticData.emergencia.replace(/[^0-9]/g, ''))}
                            >
                              <MaterialCommunityIcons name="phone" size={16} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>

                    <Divider style={styles.sectionDivider} />

                    <View style={styles.infoSection}>
                      <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="account-group" size={20} color="#FFF" />
                        <Text style={styles.sectionTitle}>Outros Moradores</Text>
                      </View>
                      {staticData.moradores.map((morador, index) => (
                        <View key={index} style={styles.infoItem}>
                          <View style={styles.infoIcon}>
                            <MaterialCommunityIcons name="account-outline" size={20} color="#0F98A1" />
                          </View>
                          <Text style={styles.infoText}>{morador}</Text>
                        </View>
                      ))}
                    </View>

                    <Divider style={styles.sectionDivider} />

                    <View style={styles.infoSection}>
                      <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="car" size={20} color="#FFF" />
                        <Text style={styles.sectionTitle}>Veículos Cadastrados</Text>
                      </View>
                      {staticData.veiculos.map((veiculo, index) => (
                        <View key={index} style={styles.infoItem}>
                          <View style={styles.infoIcon}>
                            <MaterialCommunityIcons name="car-outline" size={20} color="#0F98A1" />
                          </View>
                          <Text style={styles.infoText}>{veiculo}</Text>
                        </View>
                      ))}
                    </View>

                    <Divider style={styles.sectionDivider} />

                    <View style={styles.infoSection}>
                      <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="note-text-outline" size={20} color="#FFF" />
                        <Text style={styles.sectionTitle}>Observações</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <View style={styles.infoIcon}>
                          <MaterialCommunityIcons name="note-outline" size={20} color="#0F98A1" />
                        </View>
                        <Text style={styles.infoText}>{staticData.observacoes}</Text>
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    marginBottom: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  headerTitle: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 20,
    marginRight: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  searchContainer: {
   flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 25, // Adicionei borda arredondada para combinar com o design
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 45,
    width: "94%",
    marginHorizontal: "3%",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#f5f5f5",
    fontSize: 14,
    paddingVertical: 0,
  },
  countBadge: {
    backgroundColor: "#0B1D51",
    height: 28,
    minWidth: 28,
    borderRadius: 14,
    borderWidth: 0,
  },
  cardContainer: {
   width: "94%",
    marginHorizontal: "3%",
    marginVertical: 8, // Espaçamento vertical reduzido
  },
  cardGradient: {
   borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    padding: 15, 
    width: "100%", 
  },
  cardHeader: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  headerText: {
    alignItems: "center",
  },
  nome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
    textAlign: "center",
  },
  apartamentoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  apartamento: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
    marginLeft: 5,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    height: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 20,
    width: "45%",
  },
  detailsButton: {
    backgroundColor: 'rgba(15, 152, 161, 0.7)',
  },
  whatsappButton: {
    backgroundColor: 'rgba(37, 211, 102, 0.7)',
  },
  actionButtonText: {
    fontSize: 12,
    color: "#FFF",
    marginLeft: 5,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#EDE9D5",
    marginTop: 15,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#EDE9D5",
    marginTop: 15,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  // Estilos do Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "85%",
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 5,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalAvatar: {
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  modalNome: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 5,
  },
  modalApartamentoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: 5,
  },
  modalApartamento: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "500",
    marginLeft: 5,
  },
  modalDivider: {
    marginVertical: 15,
    backgroundColor: "rgba(255,255,255,0.3)",
    height: 1,
  },
  sectionDivider: {
    marginVertical: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    height: 1,
  },
  infoSection: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: '500',
  },
  phoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  callButton: {
    backgroundColor: '#0F98A1',
    borderRadius: 15,
    padding: 5,
    marginLeft: 10,
  },
});

export default PerfilMorador;