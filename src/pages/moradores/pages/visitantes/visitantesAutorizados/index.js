import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Card, Icon, Badge, Avatar } from '@rneui/themed';
import { onValue, ref } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import GradientLayout from '../../../../../../src/Utils/gradiente';

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
        nome: valor.nome || 'Visitante',
        documento: valor.documento || 'Não informado',
        data: valor.data || '',  // Já está no formato dd/mm/aaaa
        horario: valor.horario || '',  // Já está no formato hh:mm
        autorizado: valor.autorizado || false,
        observacoes: valor.observacoes || '',
        autorizadoPor: valor.autorizadoPor || null,
        autorizadoEm: valor.autorizadoEm || null,
        emVisita: valor.emVisita || false,
        morador: valor.morador || null
      }));
      setVisitantes(lista.reverse());
    } else {
      setVisitantes([]);
    }
  });

  return () => unsubscribe();
}, []);

  const formatDate = (dateString) => {
    if (!dateString || dateString === '') return '--/--/----';
    // Verifica se a data já está no formato dd/mm/aaaa
    if (dateString.includes('/')) return dateString;
    
    // Se for um timestamp do Firebase ou ISO string
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '--/--/----';
      
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return '--/--/----';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === '') return '--:--';
    // Verifica se já está no formato hh:mm
    if (timeString.includes(':')) return timeString;
    
    // Se for um timestamp do Firebase ou ISO string
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

  const formatDateTime = (isoString) => {
    if (!isoString) return '--/--/---- --:--';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '--/--/---- --:--';
      
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '--/--/---- --:--';
    }
  };

  const getStatusBadge = (visitante) => {
    if (visitante.emVisita) {
      return (
        <Badge
          value="EM VISITA"
          status="primary"
          badgeStyle={styles.badgeVisita}
          textStyle={styles.badgeText}
        />
      );
    } else if (visitante.autorizado) {
      return (
        <Badge
          value="AUTORIZADO"
          status="success"
          badgeStyle={styles.badgeSuccess}
          textStyle={styles.badgeText}
        />
      );
    } else {
      return (
        <Badge
          value="AGUARDANDO"
          status="warning"
          badgeStyle={styles.badgeWarning}
          textStyle={styles.badgeText}
        />
      );
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
          <Text style={styles.title}>Meus Visitantes</Text>
          <Text style={styles.subtitle}>Histórico de solicitações de acesso</Text>
        </View>

        {visitantes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="user-times"
              type="font-awesome-5"
              size={40}
              color="rgba(255,255,255,0.5)"
            />
            <Text style={styles.emptyText}>Nenhum visitante registrado</Text>
          </View>
        ) : (
          visitantes.map((visitante) => (
            <Card
              key={visitante.id}
              containerStyle={[
                styles.card,
                visitante.autorizado && styles.cardAutorizado,
                visitante.emVisita && styles.cardEmVisita
              ]}
              wrapperStyle={styles.cardWrapper}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {visitante.nome}
                  </Text>
                  <Text style={styles.cardSubtitle}>Documento: {visitante.documento}</Text>
                </View>
                {getStatusBadge(visitante)}
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
                    <Text style={styles.infoLabel}>Horário: </Text>
                    <Text style={styles.infoValue}>{formatTime(visitante.horario || visitante.data)}</Text>
                  </View>
                </View>

                {visitante.autorizadoPor && (
                  <View style={styles.responsavelContainer}>
                    <View style={styles.responsavelHeader}>
                      <Icon
                        name="user-tie"
                        type="font-awesome-5"
                        size={14}
                        color="#f6f6f6"
                        style={styles.responsavelIcon}
                      />
                      <Text style={styles.responsavelLabel}>Autorizado por:</Text>
                    </View>
                    <Text style={styles.responsavelText}>
                      {visitante.autorizadoPor.nome} (Apto {visitante.autorizadoPor.apartamento})
                    </Text>
                    {visitante.autorizadoEm && (
                      <Text style={styles.responsavelDate}>
                        Em {formatDateTime(visitante.autorizadoEm)}
                      </Text>
                    )}
                  </View>
                )}

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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: '96%',
    padding: 12,
    overflow: 'hidden',
  },
  cardAutorizado: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  cardEmVisita: {
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
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
    borderBottomColor: 'rgba(245,245,245,0.1)',
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
  responsavelContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  responsavelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  responsavelIcon: {
    marginRight: 6,
  },
  responsavelLabel: {
    fontSize: 12,
    color: '#f5f5f5',
    fontWeight: '500',
  },
  responsavelText: {
    fontSize: 13,
    color: '#f5f5f5',
    lineHeight: 18,
  },
  responsavelDate: {
    fontSize: 12,
    color: 'rgba(245,245,245,0.7)',
    marginTop: 3,
    fontStyle: 'italic',
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
  },
  badgeVisita: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    height: 25,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default AutorizacaoVisitantes;