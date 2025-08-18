import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Switch } from 'react-native';
import GradientLayout from '../../../../../src/Utils/gradiente';
import { db } from '../../../../database/firebaseConfig';
import { ref, onValue, update } from 'firebase/database';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const codigo = await AsyncStorage.getItem('codigo');
      setCurrentUser(codigo);
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const colaboradoresRef = ref(db, 'DadosBelaVista/RegistroFuncionario/Tokens');
    
    const unsubscribe = onValue(colaboradoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const colaboradoresArray = Object.keys(data).map(key => ({
          id: key,
          nome: data[key].nome || 'Nome não disponível',
          funcao: data[key].funcao || 'Função não definida',
          emServico: data[key].emServico || false,
          isCurrentUser: key === currentUser
        })).filter(colab => 
          colab.funcao.toLowerCase() === 'zelador' || 
          colab.funcao.toLowerCase() === 'porteiro'
        );
        
        // Ordena para colocar o usuário atual primeiro
        colaboradoresArray.sort((a, b) => b.isCurrentUser - a.isCurrentUser);
        setColaboradores(colaboradoresArray);
      } else {
        setColaboradores([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleServico = async (id) => {
    try {
      const updates = {};
      
      // Primeiro desativa todos os outros porteiros
      colaboradores.forEach(colab => {
        updates[`DadosBelaVista/RegistroFuncionario/Tokens/${colab.id}/emServico`] = false;
      });
      
      // Ativa apenas o selecionado
      updates[`DadosBelaVista/RegistroFuncionario/Tokens/${id}/emServico`] = true;
      
      await update(ref(db), updates);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status");
    }
  };

  const getIconByFunction = (funcao) => {
    switch(funcao.toLowerCase()) {
      case 'porteiro':
        return <FontAwesome5 name="user-tie" size={28} color="#f5f5f5" />;
      case 'zelador':
        return <MaterialCommunityIcons name="tools" size={28} color="#f6f6f6" />;
      default:
        return <FontAwesome5 name="user-circle" size={28} color="#f6f6f6" />;
    }
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.card,
      item.isCurrentUser && styles.currentUserCard
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          {getIconByFunction(item.funcao)}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.funcao}>{item.funcao}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={[
          styles.statusContainer,
          item.emServico ? styles.emServico : styles.foraServico
        ]}>
          <Text style={styles.statusText}>
            {item.emServico ? 'Em serviço' : 'Fora de serviço'}
          </Text>
        </View>
        
        {item.isCurrentUser && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {item.emServico ? 'Em serviço' : 'Fora de serviço'}
            </Text>
            <Switch
              value={item.emServico}
              onValueChange={() => toggleServico(item.id)}
              trackColor={{ false: '#767577', true: '#10B981' }}
              thumbColor={item.emServico ? '#f5f5f5' : '#f5f5f5'}
            />
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <GradientLayout style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </GradientLayout>
    );
  }

  return (
    <GradientLayout style={styles.container} scrollEnabled={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Colaboradores</Text>
        <Text style={styles.headerSubtitle}>Porteiros e Zeladores</Text>
      </View>

      {colaboradores.length > 0 ? (
        <FlatList
          data={colaboradores}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-group" size={50} color="#CBD5E1" />
          <Text style={styles.emptyText}>Nenhum colaborador cadastrado</Text>
        </View>
      )}
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: '100%',
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentUserCard: {
    borderColor: '#4CC9FE',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  nome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  funcao: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  statusContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  emServico: {
    backgroundColor: '#10B981',
  },
  foraServico: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default Colaboradores;