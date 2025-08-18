import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Icon, Avatar, Divider } from '@rneui/base';
import GradientLayout from '../../../../../src/Utils/gradiente';

const LojasCondominio = () => {
  // Dados mockados das lojas (substituir pelos dados reais)
  const lojas = [
    {
      id: '1',
      nome: 'Padaria Pão Dourado',
      telefone: '(11) 3456-7890',
      descricao: 'Pães frescos, bolos e salgados. Entrega no condomínio.',
      categoria: 'Alimentação',
    },
    {
      id: '2',
      nome: 'Limpeza Express',
      telefone: '(11) 98765-4321',
      descricao: 'Serviços de limpeza residencial e lavagem de roupas.',
      categoria: 'Serviços',
    },
    {
      id: '3',
      nome: 'Academia Fit',
      telefone: '(11) 3344-5566',
      descricao: 'Academia completa com personal trainer. Desconto para moradores.',
      categoria: 'Bem-estar',
    },
    {
      id: '4',
      nome: 'Informática Total',
      telefone: '(11) 2233-4455',
      descricao: 'Assistência técnica e venda de equipamentos.',
      categoria: 'Tecnologia',
    },
  ];

  const getIconByCategory = (category) => {
    switch (category) {
      case 'Alimentação':
        return 'food';
      case 'Serviços':
        return 'handyman';
      case 'Bem-estar':
        return 'fitness-center';
      case 'Tecnologia':
        return 'computer';
      default:
        return 'store';
    }
  };

  const renderItem = ({ item }) => (
    <Card containerStyle={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Avatar
            size={60}
            rounded
            icon={{
              name: getIconByCategory(item.categoria),
              type: 'material',
              color: '#800080',
            }}
            containerStyle={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.lojaNome}>{item.nome}</Text>
            <Text style={styles.lojaCategoria}>{item.categoria}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Icon name="phone" type="material" size={20} color="#800080" />
            <Text style={styles.infoText}>{item.telefone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="info" type="material" size={20} color="#800080" />
            <Text style={styles.infoText}>{item.descricao}</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <GradientLayout scrollEnabled={false} >
      <View style={styles.content}>
        <Text h3 style={styles.title}>Lojas do Condomínio</Text>
        
        <FlatList
          data={lojas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 15,
    padding: 15,
    margin: 0,
    marginBottom: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#f0e6ff',
    borderWidth: 2,
    borderColor: '#800080',
  },
  headerText: {
    marginLeft: 15,
    flex: 1,
  },
  lojaNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lojaCategoria: {
    fontSize: 14,
    color: '#800080',
    fontStyle: 'italic',
  },
  divider: {
    backgroundColor: '#800080',
    marginVertical: 10,
    height: 1,
  },
  infoContainer: {
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
});

export default LojasCondominio;