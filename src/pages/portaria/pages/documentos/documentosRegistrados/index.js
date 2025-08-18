import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl, 
  Platform
} from 'react-native';
import { Card, Icon, SearchBar, Tab } from '@rneui/themed';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { getDatabase, ref, onValue, off, query, orderByChild } from 'firebase/database';
import {formatDateWithTime} from '../../../../../../src/Utils/hourBrazil';
const ListaProtocolos = () => {
  const [protocolos, setProtocolos] = useState([]);
  const [filteredProtocolos, setFilteredProtocolos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    carregarProtocolos();
    
    return () => {
      const db = getDatabase();
      off(ref(db, 'DadosBelaVista/administracao/protocolos'));
    };
  }, []);

  useEffect(() => {
    filtrarProtocolos();
  }, [search, protocolos, activeTab]);

  const carregarProtocolos = () => {
    setRefreshing(true);
    const db = getDatabase();
    const protocolosRef = query(
      ref(db, 'DadosBelaVista/administracao/protocolos'),
      orderByChild('timestamp')
    );

    onValue(protocolosRef, (snapshot) => {
      const data = snapshot.val();
      const protocolosArray = [];

      if (data) {
        Object.keys(data).forEach(key => {
          protocolosArray.push({
            id: key,
            ...data[key]
          });
        });
        
        // Ordena por timestamp (do mais recente para o mais antigo)
        protocolosArray.sort((a, b) => b.timestamp - a.timestamp);
      }

      setProtocolos(protocolosArray);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Erro ao carregar protocolos:', error);
      setLoading(false);
      setRefreshing(false);
    });
  };

  const filtrarProtocolos = () => {
    let resultado = protocolos.filter(protocolo => {
      // Filtro por tab (entrada/saída)
      if (activeTab === 0 && protocolo.tipo !== 'entrada') return false;
      if (activeTab === 1 && protocolo.tipo !== 'saida') return false;
      
      // Filtro por busca
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          protocolo.departamento.toLowerCase().includes(searchLower) ||
          protocolo.responsavel.toLowerCase().includes(searchLower) ||
          (protocolo.documento && protocolo.documento.toLowerCase().includes(searchLower)) ||
          protocolo.porteiro.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    setFilteredProtocolos(resultado);
  };


  const onRefresh = () => {
    carregarProtocolos();
  };

  return (
    <GradientLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Documentos Protocolados</Text>
        <Text style={styles.subtitle}>Registros de entrada e saída</Text>
      </View>

      <SearchBar
        placeholder="Buscar por departamento, responsável..."
        onChangeText={setSearch}
        value={search}
        platform={Platform.OS === 'ios' ? 'ios' : 'android'}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
      />

  <View style={styles.tabContainer}>
  <Tab
    value={activeTab}
    onChange={setActiveTab}
    indicatorStyle={{ 
      backgroundColor: '#0F98A1', 
      height: 3,
      width: '90%', // Ajuste da largura do indicador
      alignSelf: 'center' // Centraliza o indicador
    }}
    containerStyle={styles.tabStyle} // Novo estilo para o container do Tab
    variant="primary"
  >
    <Tab.Item
      containerStyle={styles.tabItemContainer} // Estilo para cada item
      title="Entradas"
      titleStyle={{ 
        fontSize: 14, 
        color: activeTab === 0 ? '#B6F500' : '#f9f9f9',
        paddingHorizontal: 0 // Remove padding interno
      }}
      icon={{ 
        name: 'file-import', 
        type: 'material-community', 
        color: activeTab === 0 ? '#B6F500' : '#f9f9f9',
        size: 20 // Tamanho reduzido do ícone
      }}
    />
    <Tab.Item
      containerStyle={styles.tabItemContainer}
      title="Saídas"
      titleStyle={{ 
        fontSize: 14, 
        color: activeTab === 1 ? '#B6F500' : '#f9f9f9',
        paddingHorizontal: 0
      }}
      icon={{ 
        name: 'file-export', 
        type: 'material-community', 
        color: activeTab === 1 ? '#B6F500' : '#f9f9f9',
        size: 20
      }}
    />
  </Tab>
</View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F98A1" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0F98A1']}
            />
          }
        >
          {filteredProtocolos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon
                name="file-document-outline"
                type="material-community"
                size={50}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.emptyText}>
                {search ? 'Nenhum resultado encontrado' : 'Nenhum protocolo registrado'}
              </Text>
            </View>
          ) : (
            filteredProtocolos.map((protocolo) => (
              <Card key={protocolo.id} containerStyle={[
                styles.card,
                protocolo.tipo === 'entrada' ? styles.cardEntrada : styles.cardSaida
              ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Icon
                      name={protocolo.tipo === 'entrada' ? 'file-import' : 'file-export'}
                      type="material-community"
                      size={24}
                      color={protocolo.tipo === 'entrada' ? '#05e5f5ff' : '#e74c3c'}
                    />
                    <Text style={styles.cardTitle}>
                      {protocolo.departamento}
                    </Text>
                  </View>
                  <Text style={styles.cardDate}>
                    {formatDateWithTime(protocolo.timestamp)}
                  </Text>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    <Icon name="account" type="material-community" size={18} color="#F9F9F9" />
                    <Text style={styles.cardText}>
                      {protocolo.tipo === 'entrada' ? 'Recebido por: ' : 'Entregue para: '}
                      <Text style={styles.cardTextBold}>{protocolo.responsavel}</Text>
                    </Text>
                  </View>

                  {protocolo.documento && (
                    <View style={styles.cardRow}>
                      <Icon name="file-document" type="material-community" size={18} color="#F9F9F9" />
                      <Text style={styles.cardText}>
                        Documento: <Text style={styles.cardTextBold}>{protocolo.documento}</Text>
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardRow}>
                    <Icon name="shield-account" type="material-community" size={18} color="#F9F9F9" />
                    <Text style={styles.cardText}>
                      Porteiro: <Text style={styles.cardTextBold}>{protocolo.nomePorteiro}</Text>
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  header: {
    // padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
    width: '96%',
    marginHorizontal: '2%',
  },
    
  tabContainer: {
    alignSelf: 'center',
     width: '94%',
    marginHorizontal: '3%',
    borderWidth: 0

    
  },
  tabStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    // width: '100%',
  },
  tabItemContainer: {
    paddingHorizontal: 0, // Remove padding interno
    backgroundColor: 'transparent',
    width: '50%', // Cada item ocupa metade
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderBottomWidth: 0,
  },
  searchInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    height: 50,
    width: '96%',
    marginHorizontal: '2%',
  },
  searchInput: {
    color: '#2c3e50',
    fontSize: 16,
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
    padding: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  card: {
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
       borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  cardEntrada: {

    marginHorizontal: '2%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    with: '96%',
    padding: 12,
    overflow: 'hidden',
      borderLeftColor: '#F68537',
    borderLeftWidth: 3,
  },
  cardSaida: {
   borderRadius: 10,
    marginHorizontal: '2%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    with: '96%',
    padding: 12,
    overflow: 'hidden',
    borderLeftColor: '#F68537',
    borderLeftWidth: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    paddingBottom: 10,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
       color: '#05e5f5ff',

  },
  cardDate: {
    fontSize: 12,
    color: '#05e5f5ff',
  },
  cardContent: {
    marginTop: 5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  cardText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#F9F9F9',
  },
  cardTextBold: {
    fontWeight: 'bold',
    color: '#F9F9F9',
  },
});

export default ListaProtocolos;