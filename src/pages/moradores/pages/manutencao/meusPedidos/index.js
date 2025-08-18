import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Avatar,
  Icon,
  Badge,
  Divider,
  useTheme
} from '@rneui/themed';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { getAuth } from 'firebase/auth';
import { formatDateWithTime } from '../../../../../Utils/hourBrazil';

const ListaPedidosManutencao = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apartamento, setApartamento] = useState('');
  const { theme } = useTheme();

  // Buscar dados do usuário logado e seu apartamento
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log("Nenhum usuário logado");
      setLoading(false);
      return;
    }

    // Buscar dados do usuário para obter o apartamento
    const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setApartamento(userData.apartamento || '');
      } else {
        console.log("Dados do usuário não encontrados");
        setLoading(false);
      }
    }).catch((error) => {
      console.error("Erro ao buscar dados do usuário:", error);
      setLoading(false);
    });
  }, []);

  // Buscar pedidos quando o apartamento estiver disponível
  useEffect(() => {
    if (!apartamento) return;

    const pedidosRef = ref(db, 'DadosBelaVista/DadosGerais/Manutencoes');
    const unsubscribe = onValue(pedidosRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Converter objeto em array e filtrar por apartamento
          const pedidosArray = [];
          
          // Percorre todos os pedidos
          Object.keys(data).forEach(pedidoId => {
            const pedido = data[pedidoId];
            
            // Verifica se o pedido pertence ao apartamento do usuário
            if (pedido.apartamento === apartamento) {
              pedidosArray.push({
                id: pedidoId,
                ...pedido
              });
            }
          });

          // Ordenar por data (mais recente primeiro)
          pedidosArray.sort((a, b) => new Date(b.data) - new Date(a.data));
          setPedidos(pedidosArray);
        } else {
          setPedidos([]);
        }
      } catch (error) {
        console.error("Erro ao processar dados:", error);
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Erro ao ler dados:", error);
      setLoading(false);
      setPedidos([]);
    });

    return () => unsubscribe();
  }, [apartamento]);

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
        <Text style={styles.titulo}>Título: {item.titulo}</Text>
        <Text style={styles.descricao}>Descrição: {item.descricao}</Text>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Icon name="calendar" type="material-community" size={16} color="#f6f6f6" />
            <Text style={styles.footerText}>
              Solicitado em: {formatDateWithTime(item.data)}
            </Text>
          </View>

          {isConcluido && (
            <View style={styles.footerRow}>
              <Icon name="check-circle" type="material-community" size={16} color="#4CAF50" />
              <Text style={styles.footerText}>
                Concluído em: {item.dataConclusao ? new Date(item.dataConclusao).toLocaleDateString('pt-BR') : 'Data não disponível'}
              </Text>
            </View>
          )}
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
        <Text style={styles.headerTitle}>Meus Pedidos de Manutenção</Text>
        <Badge
          value={pedidos.length}
          status="primary"
          badgeStyle={styles.countBadge}
          textStyle={styles.badgeText}
        />
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="tools" type="material-community" size={50} color="#f6f6f6" />
          <Text style={styles.emptyText}>
            {loading ? 'Carregando...' : 'Nenhum pedido de manutenção encontrado'}
          </Text>
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
// Estilos permanecem os mesmos
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: '500',
    fontSize: 18,
  },
  countBadge: {
    backgroundColor: '#6EC207',
    height: 30,
    minWidth: 30,
    borderRadius: 15,
    marginLeft: 10,
    borderWidth: 0,
  },
  card: {
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    overflow: 'visible',
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
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f6f6f6',
    marginBottom: 5,
  },
  badge: {
    height: 25,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#f6f6f6',
  },
  descricao: {
    fontSize: 14,
    color: '#f6f6f6',
    lineHeight: 20,
    marginBottom: 12,
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
    color: '#f6f6f6',
    marginLeft: 8,
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
    color: '#f6f6f6',
    marginTop: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default ListaPedidosManutencao;