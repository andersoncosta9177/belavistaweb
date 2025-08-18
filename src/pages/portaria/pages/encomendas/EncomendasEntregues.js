import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";
import { 
  Text, 
  Input, 
  Card, 
  Divider,
  Icon 
} from '@rneui/themed';
import GradientLayout from "../../../../../src/Utils/gradiente";
import {formatDateWithTime} from "../../../../../src/Utils/hourBrazil";

function EncomendasEntregues() {
  const [encomendas, setEncomendas] = useState([]);
  const [filteredEncomendas, setFilteredEncomendas] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEncomendas = async () => {
      const db = getDatabase();
      const encomendasRef = ref(db, "DadosBelaVista/DadosMoradores/encomendas/EncomendasEntregues");

      try {
        const snapshot = await get(encomendasRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const encomendasList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          // Ordenar por data de entrega (mais recente primeiro)
          const sortedEncomendas = encomendasList.sort((a, b) => 
            new Date(b.horarioEntrega) - new Date(a.horarioEntrega)
          );
          setEncomendas(sortedEncomendas);
          setFilteredEncomendas(sortedEncomendas);
        } else {
          console.log("Nenhuma encomenda entregue encontrada.");
        }
      } catch (error) {
        console.error("Erro ao buscar encomendas entregues: ", error);
      }
    };

    fetchEncomendas();
  }, []);

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

  const renderItem = ({ item }) => (
    <Card containerStyle={styles.card}>
      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="user" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Morador:</Text>
        </View>
        <Text style={styles.cardValue}>{item.nomeMorador}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="user-check" type="font-awesome-5" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Recebido por:</Text>
        </View>
        <Text style={styles.cardValue}>{item.recebedor}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="home" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Apartamento:</Text>
        </View>
        <Text style={styles.cardValue}>{item.apartamento}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="barcode" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Código:</Text>
        </View>
        <Text style={styles.cardValue}>{item.numeroRastreamento}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="calendar-sync-outline" type="material-community" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Recebido em:</Text>
        </View>
        <Text style={styles.cardValue}>{formatDateWithTime(item.dataRegistro)}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="user-tie" type="font-awesome-5" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Porteiro recebedor:</Text>
        </View>
        <Text style={styles.cardValue}>{item.nomePorteiroRecebedor}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="calendar-check-o" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Entrega em:</Text>
        </View>
        <Text style={styles.cardValue}>{formatDateWithTime(item.horarioEntrega)}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="user-tie" type="font-awesome-5" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Porteiro entregador:</Text>
        </View>
        <Text style={styles.cardValue}>{item.nomePorteiroEntregador}</Text>
      </View>
    </Card>
  );

  return (
    <GradientLayout style={styles.container} scrollEnabled={false}>
      <Text style={styles.title}>
        Encomendas entregues: {filteredEncomendas.length}
      </Text>

      <Input
        placeholder="Pesquisar por apartamento ou nome"
        value={search}
        onChangeText={setSearch}
        inputContainerStyle={styles.inputContainer}
        inputStyle={styles.inputText}
        leftIcon={{ type: 'material-community', name: 'magnify', color: '#f6f6f6' }}
        containerStyle={styles.inputWrapper}
        placeholderTextColor="#f6f6f6"
      />
      

      {filteredEncomendas.length === 0 ? (
        <Text style={styles.emptyText}>
          Não há encomendas entregues
        </Text>
      ) : (
        <FlatList
          data={filteredEncomendas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    textAlign: 'center',
    marginVertical: 15,
    fontWeight: '500',
    fontSize: 17,
    color: '#f5f5f5',
  },
  inputWrapper: {
    paddingHorizontal: 10,
  },
  inputContainer: {
    borderBottomWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
    width: '96%',
    marginHorizontal: '2%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  inputText: {
    color: '#f5f5f5',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLabel: {
    fontWeight: 'bold',
    color: '#f5f5f5',
    fontSize: 12,
    marginLeft: 8,
  },
  cardValue: {
    color: '#f5f5f5',
    fontSize: 12,
  },
  divider: {
    marginVertical: 5,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#F5F5F5',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default EncomendasEntregues;