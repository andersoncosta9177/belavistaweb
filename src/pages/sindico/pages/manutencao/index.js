import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Switch,
  Avatar,
  Icon,
  Badge,
  Divider,
  useTheme
} from '@rneui/themed';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { db } from '../../../../database/firebaseConfig';
import GradientLayout from '../../../../../src/Utils/gradiente';
import { formatDateWithTime } from '../../../../../src/Utils/hourBrazil';
const ListaPedidosManutencao = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const pedidosRef = ref(db, 'DadosBelaVista/DadosGerais/Manutencoes');
    const unsubscribe = onValue(pedidosRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Dados recebidos:", data); // Para debug
      if (data) {
        const todosPedidos = [];
        Object.keys(data).forEach((pedidoId) => {
          todosPedidos.push({
            id: pedidoId,
            userId: data[pedidoId].userId, // Garanta que cada pedido tem userId
            ...data[pedidoId]
          });
        });
        setPedidos(todosPedidos);
      } else {
        setPedidos([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleSwitch = (pedidoId, userId, novoStatus) => {
    const pedidoRef = ref(db, `DadosBelaVista/DadosGerais/Manutencoes/${pedidoId}`);
    const dadosAtualizados = {
      status: novoStatus,
      ...(novoStatus && { dataConclusao: new Date().toISOString() })
    };

    update(pedidoRef, dadosAtualizados)
      .then(() => {
        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido.id === pedidoId
              ? { ...pedido, status: novoStatus, dataConclusao: novoStatus ? new Date().toISOString() : null }
              : pedido
          )
        );
      })
      .catch((error) => {
        console.error('Erro ao atualizar o status:', error);
        Alert.alert('Erro', 'Não foi possível atualizar o status');
      });
  };

  const renderItem = ({ item }) => {
    const isConcluido = item.status === true;
    const statusColor = isConcluido ? '#4CAF50' : '#FF5252';
    const statusText = isConcluido ? 'CONCLUÍDO' : 'PENDENTE';

    return (
      <Card containerStyle={styles.card}>
        <View style={styles.cardHeader}>
          <Avatar
            size={40}
            rounded
            icon={{ name: "tools", type: "material-community", color: "#fff" }}
            containerStyle={[styles.avatar, { backgroundColor: statusColor }]}
          />
          <View style={styles.headerTextContainer}>
            
          
            <Badge
              value={statusText}
              status={isConcluido ? "success" : "error"}
              badgeStyle={styles.badge}
              textStyle={styles.badgeText}
            />
          </View>
        </View>

        <Divider style={styles.divider} />
        <Text style={styles.titulo}>{item.titulo}</Text>



        <Text style={styles.descricao}>{item.descricao}</Text>
        <Divider style={styles.divider} />


        <View style={styles.footer}>
              <View style={styles.footerRow}>
            <Icon name="account" type="material-community" size={16} color="#f5f5f5" />

            
              <Text style={styles.footerText}>Nome: {item.nomeMorador}</Text>
          </View>
             <View style={styles.footerRow}>
            <Icon name="home" type="material-community" size={16} color="#f5f5f5" />

            
            <Text style={styles.footerText}>Apartamento: {item.apartamento}</Text>
          </View>
          <View style={styles.footerRow}>
            <Icon name="calendar" type="material-community" size={16} color="#f5f5f5" />
            <Text style={styles.footerText}>
              Solicitado em: {formatDateWithTime(item.data)}
            </Text>
          </View>
        

          {isConcluido && (
            <View style={styles.footerRow}>
              <Icon name="check-circle" type="material-community" size={16} color="#4CAF50" />
              <Text style={styles.footerText}>
                Concluído em: {formatDateWithTime(item.dataConclusao)}
              </Text>
            </View>
          )}

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {isConcluido ? 'Marcar como pendente' : 'Marcar como concluído'}
            </Text>
            <Switch
              value={isConcluido}
              onValueChange={(value) => toggleSwitch(item.id, item.userId, value)}
              color={statusColor}
            />
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
      </View>
    );
  }

  return (
    <GradientLayout style={styles.container} scrollEnabled={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pedidos de Manutenção</Text>
        <Badge
          value={pedidos.length}
          status="primary"
          badgeStyle={styles.countBadge}
          textStyle={styles.badgeText}
        />
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="tools" type="material-community" size={50} color="#f5f5f5" />
          <Text style={styles.emptyText}>Nenhum pedido de manutenção</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
    marginVertical: 10
  },
  headerTitle: {
    color: '#f5f5f5',
    fontWeight: '600',
    fontSize: 18,
  },
  countBadge: {
    backgroundColor: 'green',
    height: 30,
    minWidth: 30,
    borderRadius: 15,
    marginLeft: 10,
    borderWidth: 0,
  },
  card: {
    borderRadius: 10,
    marginHorizontal: '2%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: '96%',
    padding: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  avatar: {
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD63A',
    marginBottom: 10,
    textAlign: 'center'
  },
  badge: {
    height: 25,
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 0
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#817e7eff',
  },
  descricao: {
    fontSize: 14,
    color: '#f5f5f5',
    lineHeight: 20,
    marginBottom: 12,
    left: 10,
    fontStyle: 'italic'
    
  },
  footer: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#f5f5f5',
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#9e9c9cff',
  },
  switchLabel: {
    fontSize: 14,
    color: '#f5f5f5',
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
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default ListaPedidosManutencao;