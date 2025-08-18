import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Card, Icon, Badge, Avatar } from '@rneui/themed';
import { onValue, ref, update } from 'firebase/database';
import { db } from '../../../../database/firebaseConfig';
import GradientLayout from '../../../../../src/Utils/gradiente';

const { width } = Dimensions.get('window');

const AutorizacaoVisitantes = () => {
  const [visitantes, setVisitantes] = useState([]);

  useEffect(() => {
    const visitantesRef = ref(db, 'DadosBelaVista/DadosMoradores/visitantes');

    const unsubscribe = onValue(visitantesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, valor]) => ({
          id,
          nome: valor.nome,
          documento: valor.documento,
          data: valor.data || '', // Data formatada (dd/mm/aaaa)
          horario: valor.horario || '', // Hora formatada (hh:mm)
          timestamp: valor.timestamp || '', // Timestamp completo
          autorizado: valor.autorizado || false,
          observacoes: valor.observacoes || ''
        }));
        setVisitantes(lista.reverse());
      } else {
        setVisitantes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAutorizar = (id) => {
    const visitanteRef = ref(db, `DadosBelaVista/DadosMoradores/visitantes/${id}`);
    update(visitanteRef, { 
      autorizado: true,
      autorizadoEm: new Date().toISOString() 
    })
      .then(() => console.log(`Visitante ${id} autorizado com sucesso.`))
      .catch((err) => console.error('Erro ao autorizar visitante:', err));
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    
    // Se já estiver no formato hh:mm
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // Se for um timestamp ISO
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return '--:--';
      
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '--:--';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    
    // Se já estiver no formato dd/mm/aaaa
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    // Se for um timestamp ISO
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--/--/----';
      
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return '--/--/----';
    }
  };


  return (
    <GradientLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Avatar
            size={60}
            rounded
            icon={{ name: 'user-check', type: 'font-awesome-5', color: '#fff' }}
            containerStyle={styles.avatar}
            overlayContainerStyle={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          />
          <Text style={styles.title}>Autorização de Visitantes</Text>
          <Text style={styles.subtitle}>Gerencie as solicitações de acesso</Text>
        </View>

        {visitantes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="user-times"
              type="font-awesome-5"
              size={40}
              color="rgba(255,255,255,0.5)"
            />
            <Text style={styles.emptyText}>Nenhum visitante pendente</Text>
          </View>
        ) : (
          visitantes.map((visitante) => (
            <Card
              key={visitante.id}
              containerStyle={[
                styles.card,
                visitante.autorizado && styles.cardAutorizado
              ]}
              wrapperStyle={styles.cardWrapper}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {visitante.nome || 'Visitante'}
                  </Text>
                  <Text style={styles.cardSubtitle}>Documento: {visitante.documento}</Text>
                </View>
                {visitante.autorizado ? (
                  <Badge
                    value="AUTORIZADO"
                    status="success"
                    badgeStyle={styles.badgeSuccess}
                    textStyle={styles.badgeText}
                  />
                ) : (
                  <Badge
                    value="PENDENTE"
                    status="warning"
                    badgeStyle={styles.badgeWarning}
                    textStyle={styles.badgeText}
                  />
                )}
              </View>

              <View style={styles.cardContent}>
                <View style={styles.infoContainer}>
                  <View style={styles.infoItem}>
                    <Icon
                      name="calendar-alt"
                      type="font-awesome-5"
                      size={14}
                      color="#f6f6f6"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoLabel}>Data: </Text>
                    <Text style={styles.infoValue}>{formatDate(visitante.data)}</Text>
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.infoItem}>
                    <Icon
                      name="clock"
                      type="font-awesome-5"
                      size={14}
                      color="#f6f6f6"
                      style={styles.infoIcon}
                    />
                    <Text style={styles.infoLabel}>Hora: </Text>
                    <Text style={styles.infoValue}>{formatTime(visitante.horario)}</Text>
                  </View>
                </View>

                {visitante.observacoes && (
                  <View style={styles.observacoesContainer}>
                    <View style={styles.observacoesHeader}>
                      <Icon
                        name="sticky-note"
                        type="font-awesome-5"
                        size={14}
                        color="#f6f6f6"
                        style={styles.observacoesIcon}
                      />
                      <Text style={styles.observacoesLabel}>Observações:</Text>
                    </View>
                    <Text style={styles.observacoesText}>{visitante.observacoes}</Text>
                  </View>
                )}
              </View>

              {!visitante.autorizado && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleAutorizar(visitante.id)}
                >
                  <Text style={styles.buttonText}>AUTORIZAR ACESSO</Text>
                  <Icon
                    name="check-circle"
                    type="font-awesome"
                    size={20}
                    color="#FFF"
                    style={styles.buttonIcon}
                  />
                </TouchableOpacity>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </GradientLayout>
  );
};




const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
    paddingTop: 10,
  },
  avatar: {
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 15,
  },
  card: {
    borderRadius: 10,
    marginHorizontal: '2%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: '96%',
    paddingVertical: 20,
    overflow: 'hidden',
  },
  cardAutorizado: {
    borderRadius: 10,
    marginHorizontal: '2%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: '96%',
    overflow: 'hidden',
  },
  cardWrapper: {
    padding: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f6f6f6',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#f6f6f6',
    marginTop: 3,
  },
  cardContent: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    width: '100%',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 10,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: '#f5f5f5',
    marginRight: 2,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f5f5f5',
  },
  observacoesContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  observacoesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  observacoesIcon: {
    marginRight: 6,
  },
  observacoesLabel: {
    fontSize: 12,
    color: '#f5f5f5',
    fontWeight: '500',
  },
  observacoesText: {
    fontSize: 13,
    color: '#f5f5f5',
    lineHeight: 18,
  },
  badgeSuccess: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    height: 25,
    borderWidth: 0
  },
  badgeWarning: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    height: 25,
    borderWidth:0
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 7,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    marginRight: 10,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 5,
  },
});

export default AutorizacaoVisitantes;