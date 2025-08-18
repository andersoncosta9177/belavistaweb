import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { Ionicons } from '@expo/vector-icons';
import { formatDateWithTime } from '../../../../../Utils/hourBrazil';

// Ícone de notificação
const BellIcon = () => <Text style={styles.icon}>🔔</Text>;

function Notificacoes() {
  const [alertas, setAlertas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Formatação de data


  // Busca alertas no Firebase
  const fetchAlertas = () => {
    setRefreshing(true);
    const alertasRef = ref(db, 'DadosBelaVista/DadosPortaria/Alertas');

    onValue(alertasRef, (snapshot) => {
      const data = snapshot.val();
      const alertasArray = [];

      if (data) {
        Object.keys(data).forEach((key) => {
          alertasArray.push({
            id: key,
            title: data[key].tipo === 'predefinido' ? 'Alerta do Condomínio' : 'Alerta Personalizado',
            message: data[key].mensagem,
            date: formatDateWithTime(data[key].dataEnvio),
            concluido: data[key].concluido || false,
            read: false
          });
        });
      }

      setAlertas(alertasArray.reverse());
      setRefreshing(false);
    });
  };

  useEffect(() => {
    fetchAlertas();
    
    return () => {
      const alertasRef = ref(db, 'DadosBelaVista/DadosPortaria/Alertas');
      off(alertasRef);
    };
  }, []);

  const markAsRead = (id) => {
    setAlertas(alertas.map(item => 
      item.id === id ? {...item, read: true} : item
    ));
  };

  return (
    <GradientLayout style={styles.container} scrollEnabled={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificações</Text>
      </View>

      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.notificationCard, 
              !item.read && styles.unreadCard,
              item.concluido && styles.concluidoCard
            ]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <BellIcon />
            </View>
            <View style={styles.textContainer}>
              <Text style={[
                styles.notificationTitle,
                item.concluido && styles.concluidoText
              ]}>
                {item.title}
              </Text>
              <Text style={[
                styles.notificationMessage,
                item.concluido && styles.concluidoMessage
              ]}>
                {item.message}
              </Text>
              <View style={styles.dateRow}>
                <Text style={[
                  styles.notificationDate,
                  item.concluido && styles.concluidoDate
                ]}>
                  {item.date}
                </Text>
                {item.concluido && (
                  <Text style={styles.concluidoBadge}> • Concluído</Text>
                )}
              </View>
            </View>
            {!item.read && !item.concluido && (
              <View style={styles.unreadBadge} />
            )}
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchAlertas}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#f5f5f5" />
            <Text style={styles.emptyText}>Nenhuma notificação por aqui</Text>
            <Text style={styles.emptySubtext}>Quando houver novidades, elas aparecerão aqui</Text>
          </View>
        }
        contentContainerStyle={alertas.length === 0 && styles.flatListEmpty}
      />
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f5f5',
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(252, 227, 9, 0.9)',
  },
  concluidoCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    color: '#f5f5f5',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  concluidoText: {
    color: '#E8F5E9',
  },
  notificationMessage: {
    fontSize: 12,
    color: 'rgba(252, 227, 9, 0.9)',
    marginBottom: 4,
    lineHeight: 20,
  },
  concluidoMessage: {
    color: '#C8E6C9',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  concluidoDate: {
    color: '#81C784',
  },
  concluidoBadge: {
    color: '#4CAF50',
    fontSize: 12,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C63FF',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F6F6F6',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#F9F9F9',
    textAlign: 'center',
    lineHeight: 20,
  },
  flatListEmpty: {
    flex: 1,
  },
});

export default Notificacoes;