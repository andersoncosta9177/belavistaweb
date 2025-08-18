import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { 
  Text, 
  SearchBar, 
  Card, 
  Divider, 
  Icon, 
  Avatar, 
  Badge,
  BottomSheet,
  ListItem
} from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import GradientLayout from '../../../../Utils/gradiente';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

const PrestadoresServicos = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [prestadores, setPrestadores] = useState([]);

  // Filtros disponíveis
  const filters = ['Todos', 'Pintores', 'Eletricistas', 'Encanadores', 'Diaristas', 'Marceneiros'];

  // Dados de exemplo (substitua pela sua fonte de dados real)
  useEffect(() => {
    const dadosExemplo = [
      {
        id: 1,
        nome: 'Carlos Pinturas',
        categoria: 'Pintores',
        avaliacao: 4.8,
        servicosRealizados: 124,
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        descricao: 'Especialista em pintura residencial e comercial com 10 anos de experiência.',
        telefone: '(11) 98765-4321',
        endereco: 'Zona Norte - São Paulo'
      },
      {
        id: 2,
        nome: 'Eletro Silva',
        categoria: 'Eletricistas',
        avaliacao: 4.9,
        servicosRealizados: 89,
        foto: 'https://randomuser.me/api/portraits/men/44.jpg',
        descricao: 'Instalações elétricas residenciais e industriais, padrão CEMIG.',
        telefone: '(11) 91234-5678',
        endereco: 'Zona Leste - São Paulo'
      },
      {
        id: 3,
        nome: 'Hidráulica Moderna',
        categoria: 'Encanadores',
        avaliacao: 4.7,
        servicosRealizados: 156,
        foto: 'https://randomuser.me/api/portraits/men/67.jpg',
        descricao: 'Resolução de vazamentos, instalações hidráulicas e reformas.',
        telefone: '(11) 99876-5432',
        endereco: 'Centro - São Paulo'
      },
      {
        id: 4,
        nome: 'Maria Limpeza',
        categoria: 'Diaristas',
        avaliacao: 4.9,
        servicosRealizados: 210,
        foto: 'https://randomuser.me/api/portraits/women/63.jpg',
        descricao: 'Limpeza residencial e comercial, organização de ambientes.',
        telefone: '(11) 94567-8901',
        endereco: 'Zona Sul - São Paulo'
      },
      {
        id: 5,
        nome: 'Móveis Sob Medida',
        categoria: 'Marceneiros',
        avaliacao: 4.6,
        servicosRealizados: 72,
        foto: 'https://randomuser.me/api/portraits/men/22.jpg',
        descricao: 'Marcenaria fina e móveis planejados com design exclusivo.',
        telefone: '(11) 92345-6789',
        endereco: 'Zona Oeste - São Paulo'
      },
    ];
    setPrestadores(dadosExemplo);
  }, []);

  // Filtrar prestadores
  const filteredPrestadores = prestadores.filter(prestador => {
    const matchesSearch = prestador.nome.toLowerCase().includes(search.toLowerCase()) || 
                          prestador.descricao.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'Todos' || prestador.categoria === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Obter ícone por categoria
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Pintores':
        return <MaterialIcons name="format-paint" size={24} color="#fff" />;
      case 'Eletricistas':
        return <MaterialIcons name="electrical-services" size={24} color="#fff" />;
      case 'Encanadores':
        return <MaterialCommunityIcons name="pipe" size={24} color="#fff" />;
      case 'Diaristas':
        return <MaterialCommunityIcons name="broom" size={24} color="#fff" />;
      case 'Marceneiros':
        return <MaterialCommunityIcons name="hammer" size={24} color="#fff" />;
      default:
        return <FontAwesome name="user" size={24} color="#fff" />;
    }
  };

  return (
    <GradientLayout
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text h3 style={styles.headerTitle}>Prestadores de Serviços</Text>
        <Text style={styles.headerSubtitle}>Encontre os melhores profissionais</Text>
      </View>

      {/* Barra de pesquisa e filtros */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar prestadores..."
          onChangeText={setSearch}
          value={search}
          lightTheme
          round
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchInputContainer}
          inputStyle={styles.searchInput}
          searchIcon={<MaterialIcons name="search" size={24} color="#666" />}
          clearIcon={<MaterialIcons name="close" size={24} color="#666" />}
        />
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setIsFilterVisible(true)}
        >
          <MaterialIcons name="filter-list" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filtro ativo */}
      <View style={styles.activeFilterContainer}>
        <Text style={styles.activeFilterText}>Categoria: </Text>
        <Badge
          value={activeFilter}
          status="primary"
          badgeStyle={styles.badge}
          textStyle={styles.badgeText}
        />
      </View>

      {/* Lista de prestadores */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredPrestadores.length > 0 ? (
          filteredPrestadores.map((prestador) => (
            <Card key={prestador.id} containerStyle={styles.card}>
              <LinearGradient
                 colors={['#474E93', '#B771E5']} // Azul claro para azul mais claro
                 start={{ x: 0, y: 0 }}
                 end={{ x: 1, y: 1 }}
                 style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <Avatar
                    size={70}
                    rounded
                    source={{ uri: prestador.foto }}
                    containerStyle={styles.avatar}
                  />
                  <View style={styles.cardHeaderInfo}>
                    <Text h4 style={styles.cardTitle}>{prestador.nome}</Text>
                    <View style={styles.categoryBadge}>
                      {getCategoryIcon(prestador.categoria)}
                      <Text style={styles.categoryText}>{prestador.categoria}</Text>
                    </View>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <Text style={styles.cardDescription}>{prestador.descricao}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={20} color="#FFD700" />
                    <Text style={styles.ratingText}>{prestador.avaliacao}</Text>
                    <Text style={styles.servicesText}>({prestador.servicosRealizados} serviços)</Text>
                  </View>

                  <View style={styles.infoContainer}>
                    <MaterialIcons name="location-on" size={16} color="#fff" />
                    <Text style={styles.infoText}>{prestador.endereco}</Text>
                  </View>

                  <View style={styles.infoContainer}>
                    <MaterialIcons name="phone" size={16} color="#fff" />
                    <Text style={styles.infoText}>{prestador.telefone}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.contactButton}>
                  <Text style={styles.contactButtonText}>Entrar em Contato</Text>
                  <MaterialIcons name="send" size={20} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={50} color="#fff" />
            <Text style={styles.emptyText}>Nenhum prestador encontrado</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sheet de Filtros */}
      <BottomSheet isVisible={isFilterVisible} modalProps={{}}>
        <View style={styles.filterSheet}>
          <Text h4 style={styles.filterTitle}>Filtrar por Categoria</Text>
          <Divider style={styles.sheetDivider} />
          
          {filters.map((filter, i) => (
            <ListItem
              key={i}
              containerStyle={[
                styles.filterItem,
                activeFilter === filter && styles.activeFilterItem
              ]}
              onPress={() => {
                setActiveFilter(filter);
                setIsFilterVisible(false);
              }}
            >
              <ListItem.Content>
                <ListItem.Title style={styles.filterItemText}>
                  {filter}
                </ListItem.Title>
              </ListItem.Content>
              {activeFilter === filter && (
                <Icon name="check" type="material" color="#4568DC" />
              )}
            </ListItem>
          ))}
          
          <TouchableOpacity
            style={styles.closeFilterButton}
            onPress={() => setIsFilterVisible(false)}
          >
            <Text style={styles.closeFilterText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#ddd',
    fontSize: 16,
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 45,
  },
  searchInput: {
    color: '#333',
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 8,
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  activeFilterText: {
    color: '#fff',
    fontSize: 16,
  },
  badge: {
    backgroundColor: '#4568DC',
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  card: {
    borderRadius: 15,
    padding: 0,
    borderWidth: 0,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
    height: 1,
  },
  cardDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    color: '#fff',
    marginLeft: 5,
    marginRight: 10,
    fontWeight: 'bold',
  },
  servicesText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 13,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 15,
    textAlign: 'center',
  },
  filterSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  filterTitle: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  sheetDivider: {
    marginBottom: 15,
  },
  filterItem: {
    borderRadius: 10,
    marginBottom: 5,
  },
  activeFilterItem: {
    backgroundColor: 'rgba(69, 104, 220, 0.1)',
  },
  filterItemText: {
    fontSize: 16,
  },
  closeFilterButton: {
    backgroundColor: '#4568DC',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  closeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PrestadoresServicos;