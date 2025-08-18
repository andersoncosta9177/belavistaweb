import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Card, Divider, Icon } from "@rneui/themed";
import { auth, db } from "../../../../../database/firebaseConfig";
import { ref, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import FormateDate from "../../../../../../src/Utils/formateDate";
import GradientLayout from "../../../../../../src/Utils/gradiente";

function EncomendasEntreguesMoradores() {
  const [encomendas, setEncomendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(
          db,
          `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`
        );
        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              setUserData(userData);
              buscarEncomendas(userData.apartamento);
            } else {
              setLoading(false);
            }
          })
          .catch((error) => {
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
    const encomendasRef = ref(
      db,
      "DadosBelaVista/DadosMoradores/encomendas/EncomendasEntregues"
    );

    get(encomendasRef)
      .then((snapshot) => {
        const encomendasData = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const encomenda = childSnapshot.val();
            if (encomenda.apartamento === apartamento) {
              encomendasData.push({
                id: childSnapshot.key,
                nomeMorador: encomenda.nomeMorador || "Não informado",
                recebedor: encomenda.recebedor || "Não informado",
                apartamento: encomenda.apartamento || "Não informado",
                horarioEntrega: encomenda.horarioEntrega || "Não informado",
                numeroRastreamento:
                  encomenda.numeroRastreamento || "Não informado",
                dataRegistro: encomenda.dataRegistro || "Não informado",
                nomePorteiroRecebedor:
                  encomenda.nomePorteiroRecebedor || "Não informado",
                nomePorteiroEntregador:
                  encomenda.nomePorteiroEntregador || "Não informado",
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
      <View style={styles.itemRow}>
        <View style={styles.labelContainer}>
          <Icon name="user" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.label}>Morador:</Text>
        </View>
        <Text style={styles.value}>{item.nomeMorador}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.itemRow}>
        <View style={styles.labelContainer}>
          <Icon name="user-check" type="feather" size={16} color="#f5f5f5" />
          <Text style={styles.label}>Recebido por:</Text>
        </View>
        <Text style={styles.value}>{item.recebedor}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.itemRow}>
        <View style={styles.labelContainer}>
          <Icon name="building" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.label}>Apartamento:</Text>
        </View>
        <Text style={styles.value}>{item.apartamento}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.itemRow}>
        <View style={styles.labelContainer}>
          <Icon name="barcode" type="font-awesome" size={16} color="#f5f5f5" />
          <Text style={styles.label}>Código:</Text>
        </View>
        <Text style={styles.value}>{item.numeroRastreamento}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.itemRow}>
        <View style={styles.labelContainer}>
          <Icon
            name="truck-delivery"
            type="material-community"
            size={16}
            color="#f5f5f5"
          />
          <Text style={styles.label}>Recebido em:</Text>
        </View>
        <Text style={styles.value}>{FormateDate(item.dataRegistro)}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.itemRow}>
        <View style={styles.labelContainer}>
          <Icon
            name="user-tie"
            type="font-awesome-5"
            size={16}
            color="#f5f5f5"
          />
          <Text style={styles.label}>Porteiro recebedor:</Text>
        </View>
        <Text style={styles.value}>{item.nomePorteiroRecebedor}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.itemRow}>
        <View style={styles.labelContainer}>
          <Icon
            name="calendar-check"
            type="material-community"
            size={16}
            color="#f5f5f5"
          />

          <Text style={styles.label}>Entrega em:</Text>
        </View>
        <Text style={styles.value}>{FormateDate(item.horarioEntrega)}</Text>
      </View>
      <Divider style={styles.divider} />

      <View style={styles.itemRow}>
        <View style={styles.labelContainer}>
        <Icon
            name="user-tie"
            type="font-awesome-5"
            size={16}
            color="#f5f5f5"
          />
          <Text style={styles.label}>Porteiro entregador:</Text>
        </View>
        <Text style={styles.value}>{item.nomePorteiroEntregador}</Text>
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
      <Text style={styles.title}>
        Encomendas entregues: {encomendas.length}
      </Text>

      {encomendas.length === 0 ? (
        <Card containerStyle={styles.emptyCard}>
          <Icon
            name="package-variant"
            type="material-community"
            size={40}
            color="#0F98A1"
          />
          <Text style={styles.emptyText}>
            Nenhuma encomenda entregue encontrada
          </Text>
        </Card>
      ) : (
        <FlatList
          data={encomendas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "500",
    fontSize: 17,
    color: "#f5f5f5",
  },
  card: {
    borderRadius: 10,
    marginHorizontal: "2%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: "96%",
    padding: 12,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontWeight: "bold",
    color: "#f5f5f5",
    fontSize: 12,
    marginLeft: 8,
  },
  value: {
    color: "#f5f5f5",
    fontSize: 12,
    flex: 1,
    textAlign: "right",
  },
  divider: {
    marginVertical: 5,
    backgroundColor: "rgba(245, 245, 245, 0.3)",
  },
  emptyCard: {
    borderRadius: 10,
    marginHorizontal: "2%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: "96%",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    textAlign: "center",
    color: "#f5f5f5",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default EncomendasEntreguesMoradores;
