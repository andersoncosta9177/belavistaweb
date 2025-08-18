import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import GradientLayout from '../../../../Utils/gradiente';
import { db } from '../../../../database/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { MaterialCommunityIcons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';

function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colaboradoresRef = ref(db, 'DadosBelaVista/RegistroFuncionario/Tokens');
    
    const unsubscribe = onValue(colaboradoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const colaboradoresArray = Object.keys(data).map(idFuncionario => {
          const funcionario = data[idFuncionario];
          return {
            id: idFuncionario,
            nome: funcionario.nome || 'Nome não disponível',
            funcao: funcionario.funcao || 'Função não definida',
            telefone: funcionario.telefone || 'Telefone não disponível',
            emServico: funcionario.emServico || false,
          };
        }).filter(colab => 
          colab.funcao.toLowerCase().includes('porteir') || 
          colab.funcao.toLowerCase().includes('zelador')
        );
        setColaboradores(colaboradoresArray);
      } else {
        setColaboradores([]);
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const toggleServico = (id) => {
    setColaboradores(colaboradores.map(colab => 
      colab.id === id ? {...colab, emServico: !colab.emServico} : colab
    ));
  };

  const openWhatsApp = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const phone = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
    const url = `https://wa.me/${phone}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Não é possível abrir o WhatsApp");
      }
    });
  };

  const getIconByFunction = (funcao) => {
    switch(funcao.toLowerCase()) {
      case 'porteiro':
        return <FontAwesome5 name="user-tie" size={28} color="#f5f5f5" />;
      case 'zelador':
        return <MaterialCommunityIcons name="tools" size={28} color="#f6f6f6" />;
      default:
        return <FontAwesome name="user-circle" size={28} color="#f6f6f6" />;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {getIconByFunction(item.funcao)}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
        <Text style={styles.funcao}>{item.funcao}</Text>
      </View>
      
      <View style={[
        styles.statusContainer,
        item.emServico ? styles.emServico : styles.foraServico
      ]}>
        <Text style={styles.statusText}>
          {item.emServico ? 'Em serviço' : 'Fora de serviço'}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.whatsappButton}
        onPress={() => openWhatsApp(item.telefone)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="whatsapp" size={24} color="white" />
        <Text style={styles.whatsappText}>WhatsApp</Text>
      </TouchableOpacity>
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
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    width: '100%',
  },
  nome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  funcao: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  statusContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
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
  whatsappButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  whatsappText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Colaboradores;