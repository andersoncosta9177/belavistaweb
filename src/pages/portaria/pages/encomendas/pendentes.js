import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Text as RNText
} from "react-native";
import {
  Card,
  Text,
  Input,
  Button,
  Icon,
  useTheme,
} from "@rneui/themed";
import { getDatabase, ref, get, remove, set } from "firebase/database";
import { getAuth } from "firebase/auth";
import { db } from "../../../../../src/database/firebaseConfig";
import {formatDateWithTime} from "../../../../../src/Utils/hourBrazil";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientLayout from "../../../../../src/Utils/gradiente";


function EncomendasPendentes() {
  const { theme } = useTheme();
  const [encomendas, setEncomendas] = useState([]);
  const [filteredEncomendas, setFilteredEncomendas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [recebedor, setRecebedor] = useState("");
  const [selectedEncomendaId, setSelectedEncomendaId] = useState("");
  const [nomePorteiroEntregador, setNomePorteiroEntregador] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Buscar o nome do porteiro
  useEffect(() => {
    const fetchNome = async () => {
      try {
        const auth = getAuth();
        const usuarioId = auth.currentUser?.uid;

        if (!usuarioId) {
          console.log("Usuário não autenticado");
          setNomePorteiroEntregador("Usuário não autenticado");
          return;
        }

        const nomeRef = ref(
          db,
          `dadosBelaVista/usuarios/usuarioPortaria/${usuarioId}/nome`
        );
        const snapshot = await get(nomeRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setNomePorteiroEntregador(data);
        } else {
          console.log("Dados não encontrados");
          setNomePorteiroEntregador("Dados não encontrados");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firebase:", error);
        setNomePorteiroEntregador("Erro ao carregar nome");
      }
    };

    fetchNome();
  }, []);

  // Buscar todas as encomendas
  useEffect(() => {
    const fetchEncomendas = async () => {
      setLoading(true);
      const db = getDatabase();
      const encomendasRef = ref(db, "DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes");

      try {
        const snapshot = await get(encomendasRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const encomendasList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            nomePorteiroRecebedor: data[key].nomePorteiroRecebedor || "",
          }));
          setEncomendas(encomendasList);
          setFilteredEncomendas(encomendasList);
        } else {
          console.log("Nenhuma encomenda encontrada.");
        }
      } catch (error) {
        console.error("Erro ao buscar encomendas: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEncomendas();
  }, []);

  // Função para filtrar encomendas
  useEffect(() => {
    if (search) {
      const filtered = encomendas.filter(
        (item) =>
          item.apartamento.toLowerCase().includes(search.toLowerCase()) ||
          item.nomeMorador.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredEncomendas(filtered);
    } else {
      setFilteredEncomendas(encomendas);
    }
  }, [search, encomendas]);

  const handleEntregar = (id) => {
    setSelectedEncomendaId(id);
    setModalVisible(true);
  };

  const handleConfirmarEntrega = async () => {
    const db = getDatabase();
    const encomendaRef = ref(
      db,
      `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes/${selectedEncomendaId}`
    );
    const encomendaEntregueRef = ref(
      db,
      `DadosBelaVista/DadosMoradores/encomendas/EncomendasEntregues/${selectedEncomendaId}`
    );
  
    try {
      const codigoPorteiro = await AsyncStorage.getItem('codigo');
  
      if (!codigoPorteiro) {
        alert("Código do porteiro não encontrado. Faça login novamente.");
        return;
      }
  
      const nomeRef = ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigoPorteiro}/nome`);
      const snapshotNome = await get(nomeRef);
  
      if (!snapshotNome.exists()) {
        alert("Nome do porteiro não encontrado no banco de dados.");
        return;
      }
  
      const nomePorteiroEntregador = snapshotNome.val();
  
      const snapshotEncomenda = await get(encomendaRef);
      if (snapshotEncomenda.exists()) {
        const encomendaData = snapshotEncomenda.val();
  
        if (recebedor.trim() !== "") {
          encomendaData.recebedor = recebedor;
        } else {
          alert("O nome do recebedor não foi fornecido.");
          return;
        }
  
        encomendaData.horarioEntrega = new Date().toISOString(),
        encomendaData.nomePorteiroEntregador = nomePorteiroEntregador;
  
        await set(encomendaEntregueRef, encomendaData);
        await remove(encomendaRef);
  
        setEncomendas((prevEncomendas) =>
          prevEncomendas.filter((item) => item.id !== selectedEncomendaId)
        );
  
        setModalVisible(false);
        setRecebedor("");
        alert("Encomenda entregue com sucesso!");
      } else {
        alert("Encomenda não encontrada.");
      }
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error);
      alert("Erro ao confirmar entrega.");
    }
  };
  const renderItem = ({ item }) => (
    <Card containerStyle={styles.card}>
      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="user" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Morador:</Text>
        </View>
        <Text style={styles.cardValue}>{item.nomeMorador}</Text>
      </View>
  
      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="building" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Apartamento:</Text>
        </View>
        <Text style={styles.cardValue}>{item.apartamento}</Text>
      </View>
  
      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="barcode" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Código:</Text>
        </View>
        <Text style={styles.cardValue}>{item.numeroRastreamento}</Text>
      </View>
  
      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="calendar" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Registrado em:</Text>
        </View>
        <Text style={styles.cardValue}>{formatDateWithTime(item.dataRegistro)}</Text>
      </View>
  
      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="id-card" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Recebido por:</Text>
        </View>
        <Text style={styles.cardValue}>{item.nomePorteiroRecebedor}</Text>
      </View>
  
      <Button
        title=" Entregar"
        onPress={() => handleEntregar(item.id)}
        buttonStyle={styles.deliverButton}
        containerStyle={styles.buttonContainer}
        icon={<Feather name="truck" size={16} color="white" />}
        iconContainerStyle={{ marginRight: 5 }}
      />
    </Card>
  );


  return (
    <GradientLayout style={styles.container} scrollEnabled={false}>
      <Text style={styles.title}>Encomendas Pendentes</Text>
      
      <Input
        placeholder="Pesquisar por apartamento ou nome"
        leftIcon={<Icon name="search" type="font-awesome" size={20} color="#86939e" />}
        containerStyle={styles.searchInput}
        inputContainerStyle={{ borderBottomWidth: 0 }}
        onChangeText={(text) => setSearch(text)}
        value={search}
      />
      
      <Text style={styles.subtitle}>{`Há ${encomendas.length} encomendas pendentes`}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f5f5f5" />
      ) : filteredEncomendas.length === 0 ? (
        <Text style={styles.noEncomendasText}>
          Não há encomendas pendentes
        </Text>
      ) : (
        <FlatList
          data={filteredEncomendas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
      <View style={styles.modalContainer}>
  <Card containerStyle={styles.modalCard}>
    <Card.Title style={styles.modalTitle}>Confirmar Entrega</Card.Title>
    <Card.Divider />
    <Text style={styles.modalText}>Quem está recebendo?</Text>
    
    <Input
      placeholder="Nome do recebedor"
      leftIcon={<Icon name="user" type="font-awesome" size={16} color="#f5f5f5" />}
      value={recebedor}
      onChangeText={setRecebedor}
      containerStyle={styles.modalInput}
      inputContainerStyle={{ borderBottomWidth: 0 }}
      placeholderTextColor={'#f5f5f5'}
      inputStyle={{ color: '#f6f6f6' }} // Cor do texto digitado
    />

    <Button
      title="Confirmar Entrega"
      onPress={handleConfirmarEntrega}
      buttonStyle={[styles.modalButton, styles.confirmButton]}
      titleStyle={styles.buttonTitle}
      disabled={!recebedor.trim()}
      disabledStyle={styles.disabledButton}
    />
    
    <Button
      title="Cancelar"
      onPress={() => setModalVisible(false)}
      buttonStyle={[styles.modalButton, styles.cancelButton]}
      titleStyle={[styles.buttonTitle, { color: '#fff' }]}
      type="outline"
    />
  </Card>
</View>
      </Modal>
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
    color: '#f5f5f5',
    fontSize: 17,
  },
  subtitle: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    backgroundColor: '#F39C12',
    width: '94%',
    marginHorizontal: '3%',
    borderRadius: 5,
    padding: 3,
    fontWeight: '500',
    marginVertical: 10,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
    width: '94%',
    marginHorizontal: '3%',
  },
  listContainer: {
    paddingBottom: 10,
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
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 0.3,
    borderColor: '#f5f5f5',
    borderRadius: 12,
    padding: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLabel: {
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#f5f5f5',
    fontSize: 12,
  },
  cardValue: {
    color: '#f5f5f5',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  deliverButton: {
    backgroundColor: '#0F98A1',
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  buttonContainer: {
    marginTop: 10,
  },
  noEncomendasText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    borderRadius: 10,
    backgroundColor: '#8e5e30',
    borderWidth: 0,

  },
  modalInput: {
    marginBottom: 20,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    color: '#f5f5f5',
    width: '96%',
    marginHorizontal: '2%',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 10,
    marginVertical: 5,
    width: '96%',
    marginHorizontal: '2%',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F39C12',
    borderWidth: 0,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  modalTitle: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#f5f5f5',
    fontSize: 16,
  },
  modalButtonContainer: {
    marginTop: 10,
  },
});

export default EncomendasPendentes;