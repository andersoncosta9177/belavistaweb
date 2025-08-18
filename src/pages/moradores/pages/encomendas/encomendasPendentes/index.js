import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { 
  Text, 
  Card, 
  Divider, 
  Icon 
} from '@rneui/themed';
import { auth, db } from '../../../../../database/firebaseConfig';
import { ref, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import formatDate from '../../../../../../src/Utils/formateDate';
import GradientLayout from '../../../../../../src/Utils/gradiente';

function InfoEncomendasMoradores() {
  const [encomendas, setEncomendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserData(userData);
            buscarEncomendas(userData.apartamento);
          } else {
            setLoading(false);
          }
        }).catch((error) => {
          console.error("Erro ao buscar dados do usuário:", error);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const buscarEncomendas = (apartamento) => {
    const encomendasRef = ref(db, 'DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes');
    
    get(encomendasRef)
      .then((snapshot) => {
        const encomendasData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const encomenda = childSnapshot.val();
            if (encomenda.apartamento === apartamento) {
              encomendasData.push({
                id: childSnapshot.key,
                nomeMorador: encomenda.nomeMorador || 'Não informado',
                apartamento: encomenda.apartamento || 'Não informado',
                numeroRastreamento: encomenda.numeroRastreamento || 'Não informado',
                dataRegistro: encomenda.dataRegistro || 'Não informado',
                nomePorteiroRecebedor: encomenda.nomePorteiroRecebedor || 'Não informado'
              });
            }
          });
        }
        setEncomendas(encomendasData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar encomendas:", error);
        setLoading(false);
      });
  };

  const renderItem = ({ item }) => (
    <Card containerStyle={styles.card}>
      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="user" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Morador:</Text>
        </View>
        <Text style={styles.cardValue}>{item.nomeMorador}</Text>
      </View>

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="building" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Apartamento:</Text>
        </View>
        <Text style={styles.cardValue}>{item.apartamento}</Text>
      </View>

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="barcode" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Código:</Text>
        </View>
        <Text style={styles.cardValue}>{item.numeroRastreamento}</Text>
      </View>

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="calendar" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Registrado em:</Text>
        </View>
        <Text style={styles.cardValue}>{formatDate(item.dataRegistro)}</Text>
      </View>

      <View style={styles.cardItem}>
        <View style={styles.labelContainer}>
          <Icon name="id-card" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.cardLabel}>Recebido por:</Text>
        </View>
        <Text style={styles.cardValue}>{item.nomePorteiroRecebedor}</Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <GradientLayout style={styles.container}>
        <ActivityIndicator size="large" color="#0F98A1" />
      </GradientLayout>
    );
  }

  return (
    <GradientLayout style={styles.container} scrollEnabled={false}>
      <Text style={styles.title}>Notificações de Encomendas</Text>
      
      {encomendas.length === 0 ? (
        <Card containerStyle={styles.emptyCard}>
          <Icon 
            name="package-variant-closed" 
            type="material-community" 
            size={40} 
            color="#0F98A1" 
          />
          <Text style={styles.emptyText}>Nenhuma encomenda pendente encontrada</Text>
        </Card>
      ) : (
        <>
          <Text style={styles.subtitle}>{`Há ${encomendas.length} encomendas pendentes`}</Text>
          <FlatList
            data={encomendas}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
    color: '#f5f5f5',
    fontSize: 17,
  },
  subtitle: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    backgroundColor: '#F39C12',
    width: '94%',
    marginHorizontal: '3%',
    borderRadius: 5,
    padding: 3,
    fontWeight: '500',
    marginVertical: 10,
  },
  listContainer: {
    paddingBottom: 10,
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
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 0.3,
    borderColor: '#f5f5f5',
    borderRadius: 12,
    padding: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLabel: {
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#f5f5f5',
    fontSize: 12,
  },
  cardValue: {
    color: '#f5f5f5',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  emptyCard: {
    borderRadius: 10,
    marginHorizontal: '2%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: '96%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#f5f5f5',
  },
});

export default InfoEncomendasMoradores;