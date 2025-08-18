import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { Text, Card, Icon, Button } from '@rneui/base';
import { db } from '../../../../../database/firebaseConfig';
import { ref, onValue, off, update } from 'firebase/database';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { Link } from 'expo-router';

const ListaItensPerdidos = ({ navigation }) => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const itensRef = ref(db, 'DadosBelaVista/DadosGerais/objetosPerdidos');
    
    const fetchData = onValue(itensRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const itensArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setItens(itensArray.reverse()); // Ordena do mais recente para o mais antigo
        } else {
          setItens([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar itens:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('Erro na leitura:', error);
      setLoading(false);
    });

    return () => off(itensRef, 'value', fetchData);
  }, []);

  const handleToggleStatus = async (itemId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'pendente' ? 'encontrado' : 'pendente';
      const itemRef = ref(db, `DadosBelaVista/DadosGerais/objetosPerdidos/${itemId}`);
      
      await update(itemRef, { status: newStatus });
      
      // Atualiza o estado local para refletir a mudança imediatamente
      setItens(prevItens => 
        prevItens.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status do item');
    }
  };

  const renderItem = ({ item }) => (
    <Card containerStyle={styles.cardItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.titulo}</Text>
        <View style={styles.statusContainer}>
          <Switch
            value={item.status === 'encontrado'}
            onValueChange={() => handleToggleStatus(item.id, item.status)}
            trackColor={{ false: '#FFC107', true: '#4CAF50' }}
            thumbColor="#fff"
          />
          <Text style={[
            styles.statusText,
            { color: item.status === 'encontrado' ? '#4CAF50' : '#FFC107' }
          ]}>
            {item.status === 'encontrado' ? 'Encontrado' : 'Pendente'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.itemDescription} numberOfLines={3}>
        {item.descricao}
      </Text>
      
      <View style={styles.itemFooter}>
        <Icon name="calendar" type="material-community" size={16} color="#f0f0f0" />
        <Text style={styles.itemDate}>
          {new Date(item.dataCadastro).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </Card>
  );

  return (
    <GradientLayout scrollEnabled={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Itens Perdidos</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#800080" />
          </View>
        ) : itens.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="emoticon-sad-outline" type="material-community" size={50} color="#f9f9f9" />
            <Text style={styles.emptyText}>Nenhum item cadastrado</Text>
         
          </View>
        ) : (
          <FlatList
            data={itens}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      <Link asChild href="/src/pages/portaria/pages/objetosPerdidos/cadastroItensPerdidos">
        <TouchableOpacity style={styles.addButton}>
          <Icon name="plus" type="material-community" color="white" size={24} />
        </TouchableOpacity>
      </Link>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#4568DC',
    borderRadius: 50,
    width: 60,
    height: 60,
    bottom: 30,
    right: 30,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardItem: {
    margin: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    width: "96%",
    marginHorizontal: "2%",
    marginBottom: 10,
    borderRadius: 12,
    paddingVertical: 7
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#ee9b01ff',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  itemDescription: {
    color: '#f9f9f9',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  itemDate: {
    color: '#f0f0f0',
    marginLeft: 5,
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ListaItensPerdidos;