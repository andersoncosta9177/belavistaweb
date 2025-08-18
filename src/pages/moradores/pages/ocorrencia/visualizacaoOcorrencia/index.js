import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Card, Icon } from '@rneui/base';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { db } from '../../../../../database/firebaseConfig';
import { ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const VisualizacaoOcorrenciaMorador = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    uid: '',
    nome: '',
    apartamento: ''
  });

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      setUserData(prev => ({...prev, uid: user.uid}));
      fetchUserData(user.uid);
    } else {
      setError('Usuário não autenticado');
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = {
          uid,
          nome: snapshot.val().nome || '',
          apartamento: snapshot.val().apartamento || ''
        };
        setUserData(userData);
        fetchOcorrencias(userData.apartamento);
      } else {
        setError('Dados do usuário não encontrados');
        setLoading(false);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      setError('Erro ao carregar dados do usuário');
      setLoading(false);
    }
  };

  const fetchComentarios = async (ocorrenciaId) => {
    try {
      const comentariosRef = ref(db, `DadosBelaVista/DadosMoradores/ocorrencia/${ocorrenciaId}/${ocorrenciaId}/comentarios`);
      const snapshot = await get(comentariosRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
      return [];
    }
  };

  const fetchOcorrencias = async (apartamento) => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      const ocorrenciasRef = ref(db, 'DadosBelaVista/DadosMoradores/ocorrencia');
      const snapshot = await get(ocorrenciasRef);

      if (snapshot.exists()) {
        const ocorrenciasData = snapshot.val();
        const ocorrenciasArray = await Promise.all(
          Object.keys(ocorrenciasData)
            .filter(key => ocorrenciasData[key].apartamento === apartamento)
            .map(async key => {
              const comentarios = await fetchComentarios(key);
              return {
                id: key,
                ...ocorrenciasData[key],
                dataFormatada: formatDate(ocorrenciasData[key].dataRegistro),
                comentarios: comentarios
              };
            })
        );
        
        // Ordena por data (mais recente primeiro)
        ocorrenciasArray.sort((a, b) => b.dataRegistro - a.dataRegistro);
        
        setOcorrencias(ocorrenciasArray);
        setError(null);
      } else {
        setError('Nenhuma ocorrência encontrada');
        setOcorrencias([]);
      }
    } catch (err) {
      console.error('Erro ao buscar ocorrências:', err);
      setError('Erro ao carregar ocorrências');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    try {
      const date = new Date(Number(timestamp));
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return 'Data inválida';
    }
  };

  const onRefresh = () => {
    if (userData.apartamento) {
      fetchOcorrencias(userData.apartamento);
    }
  };

  const formatStatus = (status) => {
    switch(status) {
      case 'Pendente': return ' Pendente';
      case 'Resolvido': return 'Resolvido';
      case 'Em andamento': return 'Em andamento';
      case 'Lido': return 'Lido';
      default: return status;
    }
  };

  if (loading) {
    return (
      <GradientLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F98A1" />
          <Text style={styles.loadingText}>Carregando ocorrências...</Text>
        </View>
      </GradientLayout>
    );
  }

  if (error) {
    return (
      <GradientLayout>
        <View style={styles.emptyContainer}>
          <Icon 
            name="alert-circle-outline" 
            type="material-community" 
            size={48} 
            color="rgba(255,255,255,0.5)" 
          />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Icon 
              name="refresh" 
              type="material-community" 
              size={24} 
              color="#0F98A1" 
            />
            <Text style={styles.refreshText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F98A1']}
            tintColor="#0F98A1"
          />
        }
      >
        <Text style={styles.sectionTitle}>Minhas ocorrências</Text>

        {ocorrencias.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon 
              name="check-circle-outline" 
              type="material-community" 
              size={48} 
              color="rgba(255,255,255,0.5)" 
            />
            <Text style={styles.emptyText}>Nenhuma ocorrência registrada para o apartamento {userData.apartamento}</Text>
          </View>
        ) : (
          ocorrencias.map((ocorrencia) => (
            <TouchableOpacity 
              key={ocorrencia.id} 
              onPress={() => setExpandedCard(expandedCard === ocorrencia.id ? null : ocorrencia.id)}
              activeOpacity={0.8}
            >
              <Card containerStyle={[
                styles.card,
                expandedCard === ocorrencia.id && styles.cardExpanded,
                ocorrencia.status === 'Resolvido' && styles.cardResolvido,
                ocorrencia.status === 'Lido' && styles.cardLido
              ]}>
                <View style={styles.header}>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                      {ocorrencia.titulo || 'Sem título'}
                    </Text>
                    <Text style={styles.statusText}>
                      {formatStatus(ocorrencia.status || 'Pendente')}
                    </Text>
                  </View>
                  <Icon
                    name={expandedCard === ocorrencia.id ? "chevron-up" : "chevron-down"}
                    type="material-community"
                    size={24}
                    color="#A9C52F"
                  />
                </View>

                {expandedCard === ocorrencia.id && (
                  <>
                    <Card.Divider style={styles.divider} />
                    <View style={styles.content}>
                      <View style={styles.infoRow}>
                        <Icon name="calendar" type="font-awesome" size={16} color="#f1f1f1" />
                        <Text style={styles.infoText}>
                          Registrado em: {ocorrencia.dataFormatada}
                        </Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Icon name="home" type="font-awesome" size={16} color="#f1f1f1" />
                        <Text style={styles.infoText}>
                          Apartamento: {ocorrencia.apartamento || userData.apartamento || 'Não informado'}
                        </Text>
                      </View>
                      
                      <View style={styles.descContainer}>
                        <Text style={styles.descLabel}>Descrição:</Text>
                        <Text style={styles.descText}>
                          {ocorrencia.descricao || 'Sem descrição'}
                        </Text>
                      </View>

                      {/* Seção de comentários do síndico */}
                      {ocorrencia.comentarios?.length > 0 && (
                        <View style={styles.comentariosContainer}>
                          <Text style={styles.comentariosTitle}>Resposta do Síndico:</Text>
                          {ocorrencia.comentarios.map((comentario, index) => (
                            <View key={index} style={styles.comentarioItem}>
                              <Text style={styles.comentarioTexto}>{comentario.texto}</Text>
                              <Text style={styles.comentarioData}>
                                {formatDate(comentario.data)} • {comentario.autor}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </>
                )}
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {      
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: '96%',
    marginHorizontal: '2%',
    padding: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardExpanded: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardResolvido: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CD964',
  },
  cardLido: {
    borderLeftWidth: 5,
    borderLeftColor: '#0F98A1',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    color: "#B6F500",
    marginTop: 3,
    fontWeight: 'bold',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 5,
  },
  content: {
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 10,
    flex: 1,
  },
  descContainer: {
    marginTop: 10,
  },
  descLabel: {
    fontSize: 14,
    color: '#FFD63A',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    textAlign: 'justify',
  },
  comentariosContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
  },
  comentariosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD63A',
    marginBottom: 8,
  },
  comentarioItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  comentarioTexto: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
  },
  comentarioData: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  refreshText: {
    color: '#0F98A1',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default VisualizacaoOcorrenciaMorador;