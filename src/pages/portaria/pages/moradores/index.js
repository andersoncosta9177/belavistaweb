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
} from "react-native";
import { Avatar, Text, Card, Icon, Badge, Divider } from "@rneui/themed";
import { ref, onValue } from "firebase/database";
import { db } from "../../../../database/firebaseConfig";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GradientLayout from "../../../../../src/Utils/gradiente";
import { Link } from "expo-router";

const { width } = Dimensions.get("window");
// const NUM_COLUMNS = 2;

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

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <Card containerStyle={styles.card}>
        <View style={styles.cardHeader}>
          {item.avatar ? (
            <Avatar
              size={50}
              rounded
              source={{ uri: item.avatar }}
              containerStyle={styles.avatar}
            />
          ) : (
            <Avatar
              size={50}
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
            <Text style={styles.apartamento}>Apto {item.apartamento}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openMoradorDetails(item)}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#F5F5F5"
            />
            <Text style={styles.actionButtonText}>Detalhes</Text>
          </TouchableOpacity>

          <Link href={{
  pathname: '/src/pages/portaria/pages/mensagens/',
  params: { id: item.id }
}} asChild>
  <TouchableOpacity style={styles.actionButton}>
    <MaterialCommunityIcons name="message-text" size={20} color="#F5F5F5" />
    <Text style={styles.actionButtonText}>Mensagem</Text>
  </TouchableOpacity>
</Link>
        </View>
      </Card>
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
      <FlatList
        data={filteredMoradores}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        // numColumns={NUM_COLUMNS}
        // columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text  style={styles.headerTitle}>
                Moradores
              </Text>
              <Badge
                value={moradores.length}
                status="primary"
                badgeStyle={styles.countBadge}
                textStyle={styles.badgeText}
              />
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar por nome ou apartamento"
              placeholderTextColor="#f5f5f5"
              value={search}
              onChangeText={setSearch}
            />
          </>
        }
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
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" type="material" color="#0F98A1" size={24} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {selectedMorador && (
                <>
                  <View style={styles.modalHeader}>
                    {selectedMorador.avatar ? (
                      <Avatar
                        size={80}
                        rounded
                        source={{ uri: selectedMorador.avatar }}
                        containerStyle={styles.modalAvatar}
                      />
                    ) : (
                      <Avatar
                        size={80}
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
                    <Text style={styles.modalApartamento}>
                      Apartamento {selectedMorador.apartamento}
                    </Text>
                  </View>

                  <Divider style={styles.modalDivider} />

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>
                      Informações de Contato
                    </Text>
                    <View style={styles.infoItem}>
                      <Icon
                        name="phone"
                        type="material-community"
                        size={20}
                        color="#0F98A1"
                      />
                      <Text style={styles.infoText}>{staticData.telefone}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Icon
                        name="phone-alert"
                        type="material-community"
                        size={20}
                        color="#0F98A1"
                      />
                      <Text style={styles.infoText}>
                        {staticData.emergencia}
                      </Text>
                    </View>
                  </View>

                  <Divider style={styles.sectionDivider} />

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Outros Moradores</Text>
                    {staticData.moradores.map((morador, index) => (
                      <View key={index} style={styles.infoItem}>
                        <Icon
                          name="account"
                          type="material-community"
                          size={20}
                          color="#0F98A1"
                        />
                        <Text style={styles.infoText}>{morador}</Text>
                      </View>
                    ))}
                  </View>

                  <Divider style={styles.sectionDivider} />

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>
                      Veículos Cadastrados
                    </Text>
                    {staticData.veiculos.map((veiculo, index) => (
                      <View key={index} style={styles.infoItem}>
                        <Icon
                          name="car"
                          type="material-community"
                          size={20}
                          color="#0F98A1"
                        />
                        <Text style={styles.infoText}>{veiculo}</Text>
                      </View>
                    ))}
                  </View>

                  <Divider style={styles.sectionDivider} />

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Observações</Text>
                    <View style={styles.infoItem}>
                      <Icon
                        name="note-text"
                        type="material-community"
                        size={20}
                        color="#0F98A1"
                      />
                      <Text style={styles.infoText}>
                        {staticData.observacoes}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(15, 152, 161, 0.2)",
    marginBottom: 10,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  searchInput: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 7,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    color: "#f5f5f5",
    fontSize: 13,
    width: "94%",
    marginHorizontal: "3%",
  },
  headerTitle: {
    color: "#f5f5f5",
    fontWeight: "600",
    fontSize: 18,
    marginRight: 10,
  },
  countBadge: {
    backgroundColor: "#0F98A1",
    height: 25,
    minWidth: 25,
    borderRadius: 12.5,
    borderWidth: 0,
  },
  cardContainer: {
    width: "100%",
    padding: 5,
  },
  card: {
    borderRadius: 10,
    marginHorizontal: '2%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    with: '96%',
    padding: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 5,
  },
  avatar: {
    marginRight: 0,
    marginBottom: 5,
    borderWidth: 0,
  },
  headerText: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  nome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F5F5F5",
    marginBottom: 2,
    textAlign: "center",
  },
  apartamento: {
    fontSize: 12,
    color: "#F5F5F5",
    fontWeight: "500",
    textAlign: "center",
  },
  divider: {
    marginVertical: 8,
    backgroundColor: "#F9F9F9",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  actionButton: {
    alignItems: "center",
    padding: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: "45%",
  },
  actionButtonText: {
    fontSize: 9,
    color: "#F5F5F5",
    marginTop: 2,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#F5F5F5",
    marginTop: 15,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#F5F5F5",
    marginTop: 15,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  modalScroll: {
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 15,
  },
  modalAvatar: {
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#F5F5F5",
  },
  modalNome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  modalApartamento: {
    fontSize: 16,
    color: "#0F98A1",
    fontWeight: "500",
    textAlign: "center",
  },
  modalDivider: {
    marginVertical: 10,
    backgroundColor: "#0F98A1",
    height: 1,
  },
  sectionDivider: {
    marginVertical: 15,
    backgroundColor: "#E0E0E0",
    height: 1,
  },
  infoSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    paddingLeft: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
    flex: 1,
  },
});

export default PerfilMorador;
